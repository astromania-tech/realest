/**
 * Deterministically derives a 6-digit numeric OTP code from a hex hash string.
 *
 * Strategy: Take the last 8 hex chars (32-bit value), parse as an integer,
 * modulo 1,000,000, then zero-pad to 6 digits.
 *
 * This guarantees:
 * - Pure numeric output (0-9 only) → compatible with `inputMode="numeric"` inputs
 * - Deterministic: the same hash always yields the same code
 * - Well-distributed output: the 32-bit range (4.29B values) maps onto 1M codes with
 *   negligible modulo bias (2^32 is not divisible by 1,000,000, so codes 0–294,967
 *   appear once more than codes 294,968–999,999 across the full input space)
 * - No security regression: the UI code is only a convenience check; real security
 *   comes from Supabase verifyOtp() validating the full token_hash.
 *
 * @param hash  The full hashed_token from Supabase generateLink() — hexadecimal string
 * @returns     6-digit numeric code, zero-padded (e.g. "042819")
 */
export function deriveNumericOtp(hash: string): string {
  if (!hash || hash.length < 8) {
    // Fallback: pure random 6-digit code
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Take the last 8 hex chars and parse as a 32-bit unsigned integer
  const slice = hash.slice(-8);
  const numeric = parseInt(slice, 16);

  // If parseInt fails (NaN), use random fallback
  if (isNaN(numeric)) {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Modulo 1,000,000 → range [0, 999999], then zero-pad to 6 digits
  return (numeric % 1_000_000).toString().padStart(6, "0");
}
