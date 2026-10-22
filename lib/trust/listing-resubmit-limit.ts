/** After repeated rejects, slow down non-draft listing submits. */

export const LISTING_SUBMIT_BUCKET = "listing_submit";
export const LISTING_SUBMIT_LIMIT = 5;
export const LISTING_SUBMIT_WINDOW_MS = 24 * 60 * 60 * 1000;

export const LISTING_REJECT_COOLDOWN_MAX = 3;
export const LISTING_REJECT_COOLDOWN_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

export function listingRejectCooldownAllows(
  rejectedInWindow: number,
  max = LISTING_REJECT_COOLDOWN_MAX,
): { ok: true } | { ok: false; error: string; code: "reject_cooldown" } {
  if (rejectedInWindow >= max) {
    return {
      ok: false,
      code: "reject_cooldown",
      error:
        "Too many rejected listings recently. Review feedback on your dashboard before submitting again.",
    };
  }
  return { ok: true };
}

export function listingSubmitRateMessage(): string {
  return "You have submitted too many listings recently. Try again later.";
}

export function rejectCooldownSince(now: Date = new Date()): Date {
  return new Date(now.getTime() - LISTING_REJECT_COOLDOWN_WINDOW_MS);
}
