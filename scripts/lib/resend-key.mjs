/**
 * Resend is required on Vercel production. Local Docker / next dev can run
 * without the key: skip send, do not throw at import.
 */

export function isResendConfigured(env = process.env) {
  return Boolean(String(env.RESEND_API_KEY ?? "").trim());
}

export function resendSkipReason(env = process.env) {
  if (isResendConfigured(env)) return null;
  if (env.VERCEL_ENV === "production") {
    return "RESEND_API_KEY not configured";
  }
  return "RESEND_API_KEY not set — email sending skipped (local)";
}
