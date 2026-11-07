/**
 * Local signup may skip the verification email.
 * Production, and any machine pointed at hosted Supabase, always sends it.
 */
export function localEmailConfirmAllowed(env: {
  nodeEnv?: string;
  supabaseUrl?: string | null;
} = {
  nodeEnv: process.env.NODE_ENV,
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
}): boolean {
  if (env.nodeEnv === "production") return false;
  const raw = env.supabaseUrl ?? "";
  try {
    const host = new URL(raw).hostname;
    return host === "localhost" || host === "127.0.0.1" || host === "::1";
  } catch {
    return false;
  }
}

export function alreadyRegisteredEmail(message: string): boolean {
  return /already been registered|already registered|email address already/i.test(message);
}

export const DUPLICATE_SIGNUP_MESSAGE =
  "An account with this email already exists. Sign in instead.";

export function duplicateSignupError(error: {
  message?: string;
  code?: string;
}): string | null {
  const code = (error.code || "").toLowerCase();
  if (code === "email_exists" || code === "user_already_exists") {
    return DUPLICATE_SIGNUP_MESSAGE;
  }
  if (error.message && alreadyRegisteredEmail(error.message)) {
    return DUPLICATE_SIGNUP_MESSAGE;
  }
  return null;
}
