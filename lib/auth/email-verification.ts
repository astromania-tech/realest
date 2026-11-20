import type { User } from "@supabase/supabase-js";

export type VerificationFailureKind = "expired" | "invalid" | "unavailable" | "missing";

export type VerificationAuthApi = {
  initialize: () => Promise<{ error: { message: string } | null }>;
  verifyOtp: (params: {
    token: string;
    email: string;
    type: "signup" | "email";
  }) => Promise<{
    data: { user: User | null };
    error: { message: string } | null;
  }>;
  getSession: () => Promise<{
    data: { session: { user: User } | null };
    error: { message: string } | null;
  }>;
};

export type EmailVerificationResult =
  | { status: "verified"; user: User }
  | { status: "failed"; kind: VerificationFailureKind };

export function verificationFailureKind(
  message: string | null | undefined,
): VerificationFailureKind {
  const normalized = message?.toLowerCase() ?? "";
  if (normalized.includes("expired") || normalized.includes("not found")) {
    return "expired";
  }
  if (
    normalized.includes("invalid") ||
    normalized.includes("wrong") ||
    normalized.includes("already used")
  ) {
    return "invalid";
  }
  return "unavailable";
}

export function verificationFailureMessage(
  kind: VerificationFailureKind,
  surface: "link" | "code",
): string {
  if (kind === "missing") {
    return "No verification link was found. Open the complete link from your email or request a new one.";
  }

  if (surface === "code") {
    switch (kind) {
      case "expired":
        return "Your code has expired. Request a new one below.";
      case "invalid":
        return "That code is incorrect. Check the email and try again.";
      default:
        return "We couldn't verify that code right now. Please try again.";
    }
  }

  switch (kind) {
    case "expired":
      return "This verification link has expired. Request a new email to verify your address.";
    case "invalid":
      return "This verification link is invalid or has already been used. Request a new verification email.";
    default:
      return "We couldn't verify this email right now. Please try again or request a new verification email.";
  }
}

/**
 * Verify a token link directly or read the session produced by Supabase's
 * automatic PKCE callback handling for a ?code= link. initialize() returns
 * callback errors that constructor auto-initialization otherwise only logs.
 * The code is exchanged once by Supabase; callers must not exchange it again.
 */
export async function verifyEmailLink(
  auth: VerificationAuthApi,
  params: {
    token: string | null;
    code: string | null;
    type: "signup" | "email";
  },
): Promise<EmailVerificationResult> {
  if (params.token) {
    try {
      const { data, error } = await auth.verifyOtp({
        token: params.token,
        email: "",
        type: params.type,
      });

      if (error) {
        return { status: "failed", kind: verificationFailureKind(error.message) };
      }

      if (data.user?.email_confirmed_at) {
        return { status: "verified", user: data.user };
      }
      return { status: "failed", kind: "invalid" };
    } catch (error) {
      return {
        status: "failed",
        kind: verificationFailureKind(error instanceof Error ? error.message : ""),
      };
    }
  }

  if (params.code) {
    try {
      const { error: initializationError } = await auth.initialize();
      if (initializationError) {
        return {
          status: "failed",
          kind: verificationFailureKind(initializationError.message),
        };
      }

      const { data, error } = await auth.getSession();
      if (error) {
        return { status: "failed", kind: verificationFailureKind(error.message) };
      }

      if (data.session?.user.email_confirmed_at) {
        return { status: "verified", user: data.session.user };
      }
      return { status: "failed", kind: "invalid" };
    } catch (error) {
      return {
        status: "failed",
        kind: verificationFailureKind(error instanceof Error ? error.message : ""),
      };
    }
  }

  return { status: "failed", kind: "missing" };
}

export function verificationDestinationForUser(user?: User | null): string {
  if (!user?.id) return "/login?verified=true";

  // user_metadata is user-editable; only server-managed metadata may choose a
  // role-specific destination. Middleware will resolve the database role for
  // verified users sent through the login fallback.
  const role = user.app_metadata?.role;
  if (!role) return "/login?verified=true";
  switch (role) {
    case "owner":
    case "agent":
      return "/onboarding";
    case "admin":
      return "/admin";
    default:
      return "/profile";
  }
}
