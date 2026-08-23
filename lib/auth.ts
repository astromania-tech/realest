"use client";

import { createClient } from "@/lib/supabase/client";
import { createServiceClient } from "@/lib/supabase/service";
import type { User } from "@supabase/supabase-js";

// Auth utility types
export interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
}

// const createClient = createServiceClient;

export interface PasswordValidation {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

export interface UserProfile {
  id: string;
  /** Role of the user — sourced from public.users.role (user_role enum) */
  user_type: "user" | "owner" | "agent" | "admin";
  full_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): PasswordValidation {
  return {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };
}

/**
 * Check if password meets all requirements
 */
export function isPasswordValid(password: string): boolean {
  const validation = validatePassword(password);
  return Object.values(validation).every(Boolean);
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser(): Promise<AuthResponse> {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, user: user || undefined };
  } catch (err) {
    return { success: false, error: "Failed to get current user" };
  }
}

/**
 * Get user profile with type information
 */
export async function getUserProfile(
  userId: string,
): Promise<{ success: boolean; profile?: UserProfile; error?: string }> {
  try {
    const supabase = createClient();

    // Single query to public.users — role is the single source of truth
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id, email, phone, full_name, avatar_url, role")
      .eq("id", userId)
      .single();

    if (userError || !userData) {
      return { success: false, error: userError?.message ?? "User not found" };
    }

    const profileData: UserProfile = {
      id: userId,
      user_type: userData.role as UserProfile["user_type"],
      full_name: userData.full_name || "",
      email: userData.email || "",
      phone: userData.phone ?? undefined,
      avatar_url: userData.avatar_url ?? undefined,
    };

    return { success: true, profile: profileData };
  } catch (err) {
    return { success: false, error: "Failed to get user profile" };
  }
}

/**
 * Sign in with email and password
 */
export async function signInWithPassword(
  email: string,
  password: string,
): Promise<AuthResponse> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, user: data.user };
  } catch (err) {
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Sign up with email and password
 */
export async function signUpWithPassword(
  email: string,
  password: string,
  fullName?: string,
  userType?: "user" | "owner" | "agent",
): Promise<AuthResponse> {
  try {
    if (!isPasswordValid(password)) {
      return {
        success: false,
        error: `Weak password: \n
        Use at least 8 characters, including uppercase, lowercase, number, and special character.`,
      };
    }

    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, fullName, userType }),
    });

    const result = await response.json();

    if (!response.ok) {
      return { success: false, error: result.error || "Signup failed" };
    }

    return { success: true, user: result.user };
  } catch (err) {
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Send hybrid password reset (OTP + Link) email
 * Provides users with both OTP code entry and direct reset link options
 */
export async function sendHybridPasswordReset(
  email: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      return { success: false, error: data.error || "Failed to send reset email" };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: "Failed to send hybrid password reset" };
  }
}

/**
 * Send password reset email (legacy function)
 */
export async function sendPasswordResetEmail(
  email: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: "Failed to send reset email" };
  }
}

/**
 * Reset password with new password
 */
export async function resetPassword(
  newPassword: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!isPasswordValid(newPassword)) {
      return {
        success: false,
        error: "Password does not meet security requirements",
      };
    }

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: "Failed to reset password" };
  }
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: "Failed to sign out" };
  }
}

/**
 * Send OTP for magic-link login (passwordless sign-in for existing, confirmed users).
 * NOT for signup verification — use resendEmailVerification() for that.
 */
export async function sendOTP(
  email: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: "Failed to send OTP" };
  }
}

/**
 * Verify OTP code
 */
export async function verifyOTP(
  email: string,
  token: string,
): Promise<AuthResponse> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, user: data.user || undefined };
  } catch (err) {
    return { success: false, error: "Failed to verify OTP" };
  }
}

/**
 * Verify email using token hash from a Supabase-generated email link.
 * type: "signup" — for confirming a new account's email address (default)
 * type: "email"  — for magic-link login tokens
 */
export async function verifyEmail(
  tokenHash: string,
  type: "signup" | "email" = "signup",
): Promise<AuthResponse> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.auth.verifyOtp({
      token: tokenHash,
      email: "", // Supabase requires email for verifyOtp, but it's not actually used for token verification in this context
      type,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, user: data.user || undefined };
  } catch (err) {
    return { success: false, error: "Failed to verify email" };
  }
}

/**
 * Resend email verification
 */
export async function resendEmailVerification(
  email: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(
      `/api/auth/signup?email=${encodeURIComponent(email.trim().toLowerCase())}`,
    );
    const data = await response.json();
    if (!response.ok) return { success: false, error: data.error || 'Failed to resend' };
    return { success: true };
  } catch {
    return { success: false, error: 'Failed to resend verification email' };
  }
}

/**
 * Get redirect URL based on user type
 */
export function getRedirectUrl(userType?: string): string {
  switch (userType) {
    case "owner":
    case "agent":
      return "/onboarding";
    case "admin":
      return "/admin";
    case "user":
    default:
      return "/profile";
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const { success, user } = await getCurrentUser();
  return success && !!user;
}

/**
 * Check if user has specific role
 */
export async function hasRole(
  requiredRole: "user" | "owner" | "agent" | "admin",
): Promise<boolean> {
  try {
    const { success, user } = await getCurrentUser();
    if (!success || !user) return false;

    const { success: profileSuccess, profile } = await getUserProfile(user.id);
    if (!profileSuccess || !profile) return false;

    return profile.user_type === requiredRole;
  } catch {
    return false;
  }
}

/**
 * Format auth error messages for better UX
 */
export function formatAuthError(error: string): string {
  const errorMappings: Record<string, string> = {
    "Invalid login credentials": "Invalid email or password",
    "Email not confirmed": "Email not verified. Check your inbox",
    "Too many requests": "Too many attempts. Wait a few minutes",
    "User not found": "No account found for this email",
    "Invalid email": "Enter valid email",
    "Password is too short": "Password needs 8+ characters",
    "Signup is disabled": "Signups temporarily disabled",
    "Email already registered": "Email already in use. Sign in instead"
  };

  return errorMappings[error] || error;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Handle password reset session initialization from URL parameters
 */
export async function handlePasswordResetSession(
  searchParams: URLSearchParams,
): Promise<{
  success: boolean;
  error?: string;
  redirectTo?: string;
  redirectDelay?: number;
}> {
  try {
    const accessToken = searchParams.get("access_token");
    const refreshToken = searchParams.get("refresh_token");
    const code = searchParams.get("code");
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    console.log("Reset password params:", {
      accessToken,
      refreshToken,
      code,
      error,
    });

    // Handle error responses from Supabase
    if (error) {
      console.error("Auth error:", error, errorDescription);
      return {
        success: false,
        error:
          errorDescription ||
          "Invalid reset link. Please request a new password reset.",
        redirectTo: "/forgot-password",
        redirectDelay: 5000,
      };
    }

    // Check for PKCE code parameter (modern Supabase flow)
    if (code) {
      try {
        const supabase = createClient();
        const { data, error: exchangeError } =
          await supabase.auth.exchangeCodeForSession(code);

        if (exchangeError) {
          console.error("Code exchange error:", exchangeError);
          return {
            success: false,
            error:
              "Invalid or expired reset link. Please request a new password reset.",
            redirectTo: "/forgot-password",
            redirectDelay: 5000,
          };
        } else if (data.session) {
          console.log("Successfully exchanged code for session");
          return { success: true };
        }
      } catch (err) {
        console.error("Error exchanging code:", err);
        return {
          success: false,
          error: "Failed to initialize password reset. Please try again.",
          redirectTo: "/forgot-password",
          redirectDelay: 3000,
        };
      }
      return { success: false };
    }

    // Legacy flow: If we have access token and refresh token, set the session
    if (accessToken && refreshToken) {
      try {
        const supabase = createClient();
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (sessionError) {
          console.error("Session error:", sessionError);
          return {
            success: false,
            error:
              "Invalid or expired reset link. Please request a new password reset.",
            redirectTo: "/forgot-password",
            redirectDelay: 5000,
          };
        } else {
          // Successfully set session
          return { success: true };
        }
      } catch (err) {
        console.error("Error setting session:", err);
        return {
          success: false,
          error: "Failed to initialize password reset. Please try again.",
          redirectTo: "/forgot-password",
          redirectDelay: 3000,
        };
      }
    }

    // No URL tokens — check if there is already an active session (e.g. the
    // user arrived here after entering their OTP code, which sets session
    // cookies server-side without adding tokens to the URL).
    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session) {
        console.log("handlePasswordResetSession: existing session found, allowing reset");
        return { success: true };
      }
    } catch {
      // fall through to the error below
    }

    return {
      success: false,
      error:
        "No reset token found. Please check your email link or request a new password reset.",
      redirectTo: "/forgot-password",
      redirectDelay: 3000,
    };
  } catch (err) {
    console.error("Unexpected error in handlePasswordResetSession:", err);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
      redirectTo: "/forgot-password",
      redirectDelay: 3000,
    };
  }
}

/**
 * Generate secure session timeout
 */
export function getSessionTimeout(): number {
  // 24 hours in seconds
  return 24 * 60 * 60;
}
