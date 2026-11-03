/**
 * Public origin for a signup verification link.
 * Hosted sends skip localhost. Local sends keep 127.0.0.1 so local Supabase accepts the redirect.
 * There is no built-in production host.
 */

export type SignupMailEnv = {
  NEXT_PUBLIC_SITE_URL?: string;
  NEXT_PUBLIC_APP_URL?: string;
  NEXT_PUBLIC_SUPABASE_URL?: string;
  VERCEL_PROJECT_PRODUCTION_URL?: string;
  VERCEL_ENV?: string;
};

function envOrProcess(env?: SignupMailEnv): SignupMailEnv {
  return (
    env ?? {
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      VERCEL_PROJECT_PRODUCTION_URL: process.env.VERCEL_PROJECT_PRODUCTION_URL,
      VERCEL_ENV: process.env.VERCEL_ENV,
    }
  );
}

function isLocalHostname(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1" || hostname === "[::1]";
}

function parseOrigin(raw: string | undefined): URL | null {
  const value = (raw || "").trim();
  if (!value) return null;
  const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  try {
    return new URL(withProtocol);
  } catch {
    return null;
  }
}

function hosted(source: SignupMailEnv): boolean {
  return source.VERCEL_ENV === "production" || source.VERCEL_ENV === "preview";
}

/** Site origin with no trailing slash. Throws when a hosted send has no public host. */
export function publicSiteOrigin(env?: SignupMailEnv): string {
  const source = envOrProcess(env);
  const configured = [source.NEXT_PUBLIC_SITE_URL, source.NEXT_PUBLIC_APP_URL];
  for (const raw of configured) {
    const url = parseOrigin(raw);
    if (url && !isLocalHostname(url.hostname)) return url.origin;
  }
  const production = parseOrigin(source.VERCEL_PROJECT_PRODUCTION_URL);
  if (production && !isLocalHostname(production.hostname)) return production.origin;
  if (!hosted(source)) {
    for (const raw of configured) {
      const url = parseOrigin(raw);
      if (url && isLocalHostname(url.hostname)) {
        url.hostname = "127.0.0.1";
        return url.origin;
      }
    }
  }
  throw new Error("NEXT_PUBLIC_SITE_URL is not set");
}

export function signupVerifyRedirect(env?: SignupMailEnv): string {
  return `${publicSiteOrigin(env)}/verify`;
}

/** Signup link after the Auth user already exists. Supabase rejects that with email_exists. */
export function duplicateSignupMessage(
  error: { message?: string; code?: string } | null | undefined,
): string | null {
  if (!error) return null;
  const code = String(error.code || "");
  const message = String(error.message || "").toLowerCase();
  if (
    code === "email_exists" ||
    code === "user_already_exists" ||
    message.includes("already been registered") ||
    message.includes("already registered") ||
    message.includes("already exists")
  ) {
    return "An account with this email already exists. Sign in, or resend the verification email.";
  }
  return null;
}

/**
 * The URL written into the verification email.
 * Supabase puts redirectTo on action_link. A local Site URL also makes the link host localhost.
 */
export function verificationEmailLink(actionLink: string, env?: SignupMailEnv): string {
  const source = envOrProcess(env);
  const redirectTo = signupVerifyRedirect(source);
  let url: URL;
  try {
    url = new URL(actionLink);
  } catch {
    throw new Error("Signup verification link is not a URL");
  }
  if (url.searchParams.has("redirect_to")) {
    url.searchParams.set("redirect_to", redirectTo);
  }
  if (!isLocalHostname(url.hostname)) return url.toString();
  if (!hosted(source)) {
    url.hostname = "127.0.0.1";
    return url.toString();
  }

  const onSupabaseVerify = url.pathname.includes("/auth/v1/verify");
  const target = onSupabaseVerify ? parseOrigin(source.NEXT_PUBLIC_SUPABASE_URL) : new URL(redirectTo);
  if (!target || isLocalHostname(target.hostname)) {
    throw new Error(
      onSupabaseVerify ? "NEXT_PUBLIC_SUPABASE_URL is not a public host" : "NEXT_PUBLIC_SITE_URL is not set",
    );
  }
  url.protocol = target.protocol;
  url.hostname = target.hostname;
  url.port = target.port;
  return url.toString();
}
