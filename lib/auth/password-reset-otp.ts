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
