/**
 * Password-reset OTP helpers (deterministic).
 *
 * Forgot-password stores Supabase generateLink `hashed_token` in an HttpOnly
 * cookie, derives a 6-digit code for the email, then exchanges the full hash
 * via verifyOtp({ token_hash, type: "recovery" }).
 *
 * Using `token` + empty email is wrong: GoTrue treats that as an email OTP,
 * not a token-hash exchange.
 */

export type RecoveryVerifyOtpParams = {
  token_hash: string;
  type: "recovery";
};

export const RESET_OTP_TTL_SECONDS = 15 * 60;
export const RESET_EMAIL_RESEND_COOLDOWN_SECONDS = 60;
export const RESET_OTP_EXPIRES_AT_STORAGE_KEY = "realest.resetOtpExpiresAt";

/** Absolute expiry time used to keep the reset countdown stable across reloads. */
export function resetOtpExpiresAt(nowMs: number = Date.now()): number {
  return nowMs + RESET_OTP_TTL_SECONDS * 1_000;
}

/** Seconds remaining until a reset code expires. */
export function resetOtpSecondsRemaining(
  expiresAtMs: number,
  nowMs: number = Date.now(),
): number {
  if (!Number.isFinite(expiresAtMs)) return 0;
  return Math.max(0, Math.ceil((expiresAtMs - nowMs) / 1_000));
}

/** Seconds remaining before the reset email can be requested again. */
export function resetOtpResendSecondsRemaining(timeLeft: number): number {
  const resendAvailableAt =
    RESET_OTP_TTL_SECONDS - RESET_EMAIL_RESEND_COOLDOWN_SECONDS;
  return Math.max(0, timeLeft - resendAvailableAt);
}

/** Normalize emails the same way signup and waitlist do. */
export function normalizeResetEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Params for supabase.auth.verifyOtp after the 6-digit code matches.
 * Must use token_hash — not token + email.
 */
export function recoveryVerifyOtpParams(
  tokenHash: string,
): RecoveryVerifyOtpParams {
  return {
    token_hash: tokenHash,
    type: "recovery",
  };
}

/** True when the submitted 6-digit code matches the derived OTP for the hash. */
export function resetOtpMatches(
  code: string,
  storedHash: string,
  derive: (hash: string) => string,
): boolean {
  return code === derive(storedHash);
}
