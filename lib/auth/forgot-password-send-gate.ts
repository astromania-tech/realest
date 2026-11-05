/**
 * Prevents duplicate password-reset emails from double-submits.
 *
 * Two layers:
 * 1. In-flight coalesce — simultaneous POSTs for the same email share one send.
 * 2. Cooldown — a successful send blocks another send for COOLDOWN_MS.
 */

export const FORGOT_PASSWORD_SEND_COOLDOWN_MS = 60_000;

const inFlight = new Map<string, Promise<unknown>>();
const lastSentAt = new Map<string, number>();

/** Test helper — clear process-local send state. */
export function resetForgotPasswordSendGateForTests(): void {
  inFlight.clear();
  lastSentAt.clear();
}

export function isForgotPasswordSendOnCooldown(
  email: string,
  now = Date.now(),
  cooldownMs = FORGOT_PASSWORD_SEND_COOLDOWN_MS,
): boolean {
  const last = lastSentAt.get(email);
  return last !== undefined && now - last < cooldownMs;
}

export function markForgotPasswordSent(
  email: string,
  now = Date.now(),
): void {
  lastSentAt.set(email, now);
}

/**
 * Run `fn` once per email while in flight. Concurrent callers await the same
 * promise. After settle, the entry is kept briefly so near-simultaneous retries
 * still coalesce, then removed.
 */
export async function coalesceForgotPasswordSend<T>(
  email: string,
  fn: () => Promise<T>,
): Promise<T> {
  const existing = inFlight.get(email);
  if (existing) {
    return existing as Promise<T>;
  }

  const promise = fn().finally(() => {
    setTimeout(() => {
      if (inFlight.get(email) === promise) {
        inFlight.delete(email);
      }
    }, 2_000);
  });

  inFlight.set(email, promise);
  return promise;
}
