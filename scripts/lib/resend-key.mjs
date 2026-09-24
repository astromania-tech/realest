/**
 * Resend send gate. Same-input-same-output.
 *
 * Rule: a present RESEND_API_KEY always means send. Local skip is only when
 * the key is missing. Vercel production with the key is unchanged.
 *
 * Do not construct the Resend client at module load. Read the key at send
 * time so a keyless compile cannot freeze skip into production.
 */

export function isResendConfigured(env = process.env) {
  return Boolean(String(env.RESEND_API_KEY ?? "").trim());
}

/** @returns {"send" | "skip-local" | "missing-on-production"} */
export function resolveResendAction(env = process.env) {
  if (isResendConfigured(env)) return "send";
  if (env.VERCEL_ENV === "production") return "missing-on-production";
  return "skip-local";
}

export function resendSkipReason(env = process.env) {
  const action = resolveResendAction(env);
  if (action === "send") return null;
  if (action === "missing-on-production") {
    return "RESEND_API_KEY not configured";
  }
  return "RESEND_API_KEY not set — email sending skipped (local)";
}

export function resendApiKey(env = process.env) {
  if (!isResendConfigured(env)) return null;
  return String(env.RESEND_API_KEY).trim();
}

/** Admin notify: same key gate as other mail, then ADMIN_EMAIL. */
export function adminNotificationSkipReason(env = process.env) {
  const skip = resendSkipReason(env);
  if (skip) return skip;
  if (!String(env.ADMIN_EMAIL ?? "").trim()) {
    return "Admin notifications not configured";
  }
  return null;
}
