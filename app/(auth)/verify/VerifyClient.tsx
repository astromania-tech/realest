"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Button, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "@/components/ui";
import {
  getCurrentUser,
  resendEmailVerification,
} from "@/lib/auth";
import { CheckCircle, Mail, AlertCircle, RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isResending, setIsResending] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<
    "verifying" | "success" | "error" | "expired"
  >("verifying");
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const handleEmailVerification = async () => {
      try {
        const supabase = createClient();
        const searchParams = new URLSearchParams(window.location.search);

        const tokenFromQuery = searchParams.get("token");
        const code = searchParams.get("code");
        const type = (searchParams.get("type") ?? "signup") as "signup" | "email";

        // ✅ NEW: read tokens from the fragment (#...)
        const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
        const access_token = hashParams.get("access_token");
        const refresh_token = hashParams.get("refresh_token");

        if (access_token && refresh_token) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });

          if (sessionError) throw sessionError;

          const userResponse = await getCurrentUser();
          if (userResponse.success && userResponse.user) {
            await redirectToDestination(userResponse.user);
            return;
          }
        }

        if (tokenFromQuery) {
          const { data, error: verifyError } = await supabase.auth.verifyOtp({
            token: tokenFromQuery,
            email: "",
            type,
          });

          if (verifyError) {
            if (verifyError.message.toLowerCase().includes("expired")) {
              setVerificationStatus("expired");
            } else {
              setVerificationStatus("error");
              setError(verifyError.message);
            }
            return;
          }

          if (data.user?.email) setEmail(data.user.email);
          await redirectToDestination(data.user);
          return;
        }

        // ...keep your existing code for `code` and the fallback
      } catch {
        setVerificationStatus("error");
        setError("An unexpected error occurred during verification.");
      } finally {
        setIsLoading(false);
      }
    };

    handleEmailVerification();
  }, [searchParams]);

  // useEffect(() => {
  //   const handleEmailVerification = async () => {
  //     try {
  //       const supabase = createClient();

  //       // Supabase sends either:
  //       //   token_hash + type=signup  (direct OTP verification)
  //       //   code                      (PKCE code exchange flow)
  //       const tokenHash = searchParams.get("token");
  //       const code = searchParams.get("code");
  //       const type = (searchParams.get("type") ?? "signup") as
  //         | "signup"
  //         | "email";

  //       if (tokenHash) {
  //         // Standard Supabase email-link flow
  //         const { data, error: verifyError } = await supabase.auth.verifyOtp({
  //           token: tokenHash,
  //           email: "", // Supabase requires email for verifyOtp, but it's not actually used for token verification in this context
  //           type,
  //         });

  //         if (verifyError) {
  //           if (verifyError.message.toLowerCase().includes("expired")) {
  //             setVerificationStatus("expired");
  //           } else {
  //             setVerificationStatus("error");
  //             setError(verifyError.message);
  //           }
  //           return;
  //         }

  //         if (data.user?.email) setEmail(data.user.email);
  //         await redirectToDestination(data.user?.id);
  //         return;
  //       }

  //       if (code) {
  //         // PKCE flow — exchange code for session
  //         const { data, error: exchangeError } =
  //           await supabase.auth.exchangeCodeForSession(code);

  //         if (exchangeError) {
  //           setVerificationStatus("error");
  //           setError(exchangeError.message);
  //           return;
  //         }

  //         if (data.user?.email) setEmail(data.user.email);
  //         await redirectToDestination(data.user?.id);
  //         return;
  //       }

  //       // No token in URL — check if user is already confirmed
  //       const userResponse = await getCurrentUser();
  //       if (userResponse.success && userResponse.user?.email_confirmed_at) {
  //         if (userResponse.user.email) setEmail(userResponse.user.email);
  //         await redirectToDestination(userResponse.user.id);
  //       } else {
  //         if (userResponse.user?.email) setEmail(userResponse.user.email);
  //         setVerificationStatus("error");
  //         setError(
  //           "No verification token found. Please check your email for the activation link.",
  //         );
  //       }
  //     } catch {
  //       setVerificationStatus("error");
  //       setError("An unexpected error occurred during verification.");
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   handleEmailVerification();
  // }, [searchParams, router]);

  /** Determine the correct destination after successful email verification */
  async function redirectToDestination(
    verifiedUser?: Awaited<ReturnType<typeof getCurrentUser>>["user"] | null,
  ) {
    setVerificationStatus("success");

    if (!verifiedUser?.id) {
      // Fallback — no user id, go to login
      setTimeout(() => router.push("/login?verified=true"), 2000);
      return;
    }

    const userType =
      verifiedUser.app_metadata?.role || verifiedUser.user_metadata?.user_type;

    if (!userType) {
      setTimeout(() => router.push("/login?verified=true"), 2000);
      return;
    }

    setTimeout(() => {
      switch (userType) {
        case "owner":
        case "agent":
          router.push("/onboarding");
          break;
        case "admin":
          router.push("/admin");
          break;
        default:
          router.push("/profile");
      }
    }, 2000);
  }

  const handleResendVerification = async () => {
    if (!email) {
      setError("No email address found. Please sign up again.");
      return;
    }

    setIsResending(true);
    setError("");

    try {
      const resendResponse = await resendEmailVerification(email);

      if (!resendResponse.success) {
        setError(resendResponse.error || "Failed to resend verification email");
      } else {
        setError("");
        setVerificationStatus("error");
        // Reset to show "check your email" hint
        setError(
          "A new verification email has been sent. Please check your inbox.",
        );
      }
    } catch {
      setError("Failed to resend verification email. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <RefreshCw className="w-12 h-12 text-primary animate-spin" />
            </div>
            <CardTitle className="text-2xl font-bold">
              Verifying Your Email
            </CardTitle>
            <CardDescription>
              Please wait while we verify your email address
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (verificationStatus === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="w-16 h-16 text-success" />
            </div>
            <CardTitle className="text-2xl font-bold">
              Email Verified!
            </CardTitle>
            <CardDescription>
              Your email has been successfully verified
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <div className="bg-success-50 border border-success-200 p-4 rounded-lg">
                <p className="text-sm text-success-700">
                  Welcome to RealEST! Your account is now active. Redirecting
                  you to your dashboard…
                </p>
              </div>

              <p className="text-sm text-muted-foreground">
                Taking a moment longer? Click below.
              </p>
            </div>

            <div className="space-y-3">
              <Button asChild variant="default" className="w-full">
                <Link href="/profile">Continue to Dashboard</Link>
              </Button>

              <div className="text-center">
                <Link
                  href="/"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Back to Homepage
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (verificationStatus === "expired") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <AlertCircle className="w-12 h-12 text-warning" />
            </div>
            <CardTitle className="text-2xl font-bold">Link Expired</CardTitle>
            <CardDescription>
              Your verification link has expired
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <div className="bg-warning-50 border border-warning-200 p-4 rounded-lg">
                <p className="text-sm text-warning-700">
                  The verification link you clicked has expired. Please request
                  a new one to verify your email.
                </p>
              </div>

              {email && (
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-sm">
                    <span className="text-muted-foreground">Email:</span>{" "}
                    <span className="font-medium">{email}</span>
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleResendVerification}
                variant="default"
                className="w-full"
                disabled={isResending || !email}
              >
                {isResending ? "Sending..." : "Resend Verification Email"}
              </Button>

              <div className="text-center space-y-2">
                <Link
                  href="/register"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Sign up with different email
                </Link>
                <br />
                <Link
                  href="/login"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Back to Sign In
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertCircle className="w-12 h-12 text-danger" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Verification Failed
          </CardTitle>
          <CardDescription>
            There was a problem verifying your email
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <div className="text-sm text-danger bg-danger-50 border border-danger-200 rounded-md p-3">
              {error}
            </div>
          )}

          {email && (
            <div className="text-center space-y-4">
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm">
                  <span className="text-muted-foreground">Email:</span>{" "}
                  <span className="font-medium">{email}</span>
                </p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {email && (
              <Button
                onClick={handleResendVerification}
                variant="default"
                className="w-full"
                disabled={isResending}
              >
                {isResending ? "Sending..." : "Resend Verification Email"}
              </Button>
            )}

            <div className="text-center space-y-2">
              <Link
                href="/register"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Sign up again
              </Link>
              <br />
              <Link
                href="/login"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Back to Sign In
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function VerifyEmailFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <RefreshCw className="w-12 h-12 text-primary animate-spin" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Loading Verification
          </CardTitle>
          <CardDescription>
            Please wait while we prepare your email verification
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailFallback />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
