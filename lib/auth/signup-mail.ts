/**
 * Where a signup or resend link returns after Supabase verifies it.
 * The host comes from NEXT_PUBLIC_SITE_URL, then NEXT_PUBLIC_APP_URL.
 * There is no built-in production host.
 */
export function signupVerifyRedirect(env?: {
  NEXT_PUBLIC_SITE_URL?: string;
  NEXT_PUBLIC_APP_URL?: string;
}): string {
  const source = env ?? {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  };
  const raw = (source.NEXT_PUBLIC_SITE_URL || source.NEXT_PUBLIC_APP_URL || "").trim();
  if (!raw) {
    throw new Error("NEXT_PUBLIC_SITE_URL is not set");
  }
  let base = raw.replace(/\/$/, "");
  base = base.replace("://localhost:", "://127.0.0.1:");
  return `${base}/verify`;
}
