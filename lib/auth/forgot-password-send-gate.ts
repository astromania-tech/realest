/**
 * Prevents duplicate password-reset emails from double-submits.
 *
 * Two layers:
 * 1. In-flight coalesce — simultaneous POSTs on one instance share one send.
 * 2. Database cooldown — consumeRateLimit is shared across Vercel instances.
 */

import { consumeRateLimit } from "@/lib/http/rate-limit";
import { RESET_EMAIL_RESEND_COOLDOWN_SECONDS } from "./password-reset-otp";

export const FORGOT_PASSWORD_SEND_COOLDOWN_MS =
  RESET_EMAIL_RESEND_COOLDOWN_SECONDS * 1_000;
export const FORGOT_PASSWORD_SEND_BUCKET = "forgot-password";

const inFlight = new Map<string, Promise<unknown>>();

type RateConsume = (input: {
  bucket: string;
  subject: string;
  limit?: number;
  windowMs?: number;
  now?: Date;
}) => Promise<{ allowed: boolean }>;

/** Test helper — clear process-local in-flight state. */
export function resetForgotPasswordSendGateForTests(): void {
  inFlight.clear();
}

/**
 * One send per email per window, stored in api_rate_limits.
 * Returns false when this instance or any other already claimed the window.
 */
export async function claimForgotPasswordSend(
  email: string,
  now = new Date(),
  consume: RateConsume = consumeRateLimit,
): Promise<boolean> {
  const result = await consume({
    bucket: FORGOT_PASSWORD_SEND_BUCKET,
    subject: email,
    limit: 1,
    windowMs: FORGOT_PASSWORD_SEND_COOLDOWN_MS,
    now,
  });
  return result.allowed;
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
