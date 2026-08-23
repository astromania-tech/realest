"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui";
import {
  verifyOTP,
  getCurrentUser,
  getUserProfile,
  resendEmailVerification,
  sendHybridPasswordReset,
} from "@/lib/auth";
import { CheckCircle, Shield, RefreshCw, AlertTriangle, Clock, AlertCircle } from "lucide-react";

function OTPContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [email, setEmail] = useState("");
  // "reset" = password-reset OTP; anything else = signup email OTP (legacy)
  const otpType = (searchParams.get("type") ?? "email") as "email" | "reset";
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes in seconds — matches server-side token expiry
  const [isPaused, setIsPaused] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Initialize from URL params
  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) setEmail(emailParam);

    if (!emailParam) {
      // No email means nothing to verify — send back to appropriate page
      if (searchParams.get("type") === "reset") {
        router.push("/forgot-password");
      } else {
        router.push("/login");
      }
    }
  }, [searchParams, router]);

  // Auto-fill + auto-submit when a pre-filled code arrives via URL param
  // (e.g. user clicked the OTP code link in their reset email)
  useEffect(() => {
    const codeParam = searchParams.get("code");
    if (
      codeParam &&
      /^\d{6}$/.test(codeParam) &&
      searchParams.get("type") === "reset"
    ) {
      const digits = codeParam.split("");
      setOtp(digits);
      // Small delay so the input boxes render before we trigger verification
      const tid = setTimeout(() => handleVerifyOtp(codeParam), 400);
      return () => clearTimeout(tid);
    }
  }, []); // run once on mount — searchParams is stable

  // Pause timer when the user switches tabs or minimises the window
  useEffect(() => {
    const handleVisibility = () => setIsPaused(document.hidden);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  // Countdown timer — does not run while tab is hidden
  useEffect(() => {
    if (timeLeft <= 0 || isPaused) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isPaused]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleOtpChange = (index: number, value: string) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all fields are filled
    if (newOtp.every((digit) => digit !== "") && newOtp.join("").length === 6) {
      handleVerifyOtp(newOtp.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "");

    if (pastedData.length === 6) {
      const newOtp = pastedData.split("");
      setOtp(newOtp);
      setError("");
      handleVerifyOtp(pastedData);
    }
  };

  const handleVerifyOtp = async (otpCode: string) => {
    setIsLoading(true);
    setError("");

    try {
      // --- Password reset OTP path ---
      if (otpType === "reset") {
        const res = await fetch("/api/auth/verify-reset-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: otpCode }),
        });
        const data = await res.json();

        if (!data.success) {
          const isExpiredError =
            data.error?.toLowerCase().includes("expired") ||
            data.error?.toLowerCase().includes("not found");
          if (isExpiredError) {
            setIsExpired(true);
            setTimeLeft(0); // unlock the resend button immediately
          }
          setError(data.error || "Invalid code. Please try again.");
          setOtp(["", "", "", "", "", ""]);
          inputRefs.current[0]?.focus();
          return;
        }

        // Session cookies are now set — go to reset-password
        setIsSuccess(true);
        setTimeout(() => router.push("/reset-password"), 1500);
        return;
      }

      // --- Signup email OTP path (legacy / fallback) ---
      const verifyResponse = await verifyOTP(email, otpCode);

      if (!verifyResponse.success) {
        setError(verifyResponse.error || "Invalid OTP code");
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
        return;
      }

      setIsSuccess(true);

      // Get user profile to determine redirect destination.
      // Do NOT query the onboarding table here — the browser client may not yet
      // reflect the new session, causing a false "not complete" result that leads
      // to a chain redirect (OTP → /onboarding → /owner).
      // Instead redirect straight to the dashboard and let its layout enforce
      // the onboarding check server-side.
      const userResponse = await getCurrentUser();
      if (userResponse.success && userResponse.user) {
        const profileResponse = await getUserProfile(userResponse.user.id);

        if (profileResponse.success && profileResponse.profile) {
          const userType = profileResponse.profile.user_type;

          if (userType === "owner") {
            router.replace("/owner");
          } else if (userType === "admin") {
            router.replace("/admin");
          } else if (userType === "agent") {
            router.replace("/agent");
          } else {
            router.replace("/profile");
          }
        } else {
          router.replace("/profile");
        }
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsResending(true);
    setError("");

    try {
      let resendResponse: { success: boolean; error?: string };

      if (otpType === "reset") {
        // Re-trigger the forgot-password API to get a fresh code + cookie
        resendResponse = await sendHybridPasswordReset(email);
      } else {
        // Resend signup confirmation email via Supabase
        resendResponse = await resendEmailVerification(email);
      }

      if (!resendResponse.success) {
        setError(resendResponse.error || "Failed to resend code");
      } else {
        setTimeLeft(900);
        setIsExpired(false);
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    } catch {
      setError("Failed to resend code. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join("");
    if (otpCode.length === 6) {
      handleVerifyOtp(otpCode);
    } else {
      setError("Please enter the complete 6-digit code.");
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="w-16 h-16 text-success" />
            </div>
            <CardTitle className="text-2xl font-bold">
              {otpType === "reset" ? "Code Verified!" : "Verification Complete!"}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <div className="bg-success-50 p-4 rounded-lg">
                <p className="text-sm text-success-700">
                  {otpType === "reset"
                    ? "Proceed to set new password…"
                    : "Welcome to RealEST! Redirecting you to your dashboard…"}
                </p>
              </div>

              <div className="flex justify-center">
                <RefreshCw className="w-5 h-5 text-primary animate-spin" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {!isExpired && (
            <>
              <div className="flex justify-center mb-4">
                <Shield className="w-12 h-12 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold">
                {otpType === "reset" ? "Enter Reset Code" : "Verify Your Email"}
              </CardTitle>
              <CardDescription>
                {otpType === "reset"
                  ? "Enter the 6-digit code from your password reset email"
                  : "Enter the 6-digit code sent to"}{" "}
                {otpType !== "reset" && <span className="font-medium">{email}</span>}
              </CardDescription>
            </>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {/* ── Expired state: replace form with a clear call-to-action ── */}
          {isExpired ? (
            <div className="space-y-5">
              <div className="flex flex-col items-center gap-3 py-2 text-center">
                <div className="rounded-full bg-danger-50 border border-danger-200 p-4">
                  <Clock className="w-8 h-8 text-danger" />
                </div>
                <p className="text-sm font-medium text-danger">Your code has expired</p>
                  {error && (
                    <p className="text-sm text-muted-foreground">
                      {error}
                    </p>
                  )}
              </div>

              <Button
                onClick={handleResendOtp}
                variant="default"
                className="w-full"
                disabled={isResending}
              >
                {isResending ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Sending new code…
                  </>
                ) : (
                  "Request New Code"
                )}
              </Button>

              <div className="text-center pt-2 border-t border-border">
                <Link
                  href="/forgot-password"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Back to Forgot Password
                </Link>
              </div>
            </div>
          ) : (
          <>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* OTP Input */}
            <div className="space-y-4">
              <div className="flex justify-center gap-3" onPaste={handlePaste}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 text-center text-lg font-bold border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    disabled={isLoading}
                  />
                ))}
              </div>

              <div className="text-center text-sm text-muted-foreground">
                {timeLeft > 0 ? (
                  <span className={isPaused ? "text-muted-foreground/50" : ""}>
                    {isPaused ? "⏸ Timer paused" : `Code expires in ${formatTime(timeLeft)}`}
                  </span>
                ) : (
                  <span className="text-danger flex items-center justify-center gap-1">
                    <AlertTriangle className="w-4 h-4" />
                    Code expired
                  </span>
                )}
              </div>
            </div>

            {error && (
              <div className="text-xs flex justify-center items-center text-danger gap-2 mt-2 p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
                <AlertCircle className="w-4 h-4 text-orange-600 dark:text-orange-400 mt-0.5 shrink-0" />
                <div className="text-xs text-orange-800 dark:text-orange-200">
                  <p className="font-medium text-orange-700 dark:text-orange-300">
                    {error}
                  </p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              variant="default"
              className="w-full"
              disabled={isLoading || otp.join("").length !== 6}
            >
              {isLoading ? "Verifying..." : "Verify Code"}
            </Button>
          </form>

          {/* Resend Section */}
          <div className="text-center space-y-3">
            <div className="text-sm text-muted-foreground">
              Didn't receive the code?
            </div>

            <Button
              onClick={handleResendOtp}
              variant="ghost"
              size="sm"
              className="text-primary hover:bg-primary/10"
              disabled={isResending || timeLeft > 240} // Can resend after 1 minute
            >
              {isResending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : timeLeft > 240 ? (
                `Resend in ${formatTime(timeLeft - 240)}`
              ) : (
                "Resend Code"
              )}
            </Button>

            <div className="pt-4 border-t border-border">
              <Link
                href="/login"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Back to Sign In
              </Link>
            </div>
          </div>
          </>)}
        </CardContent>
      </Card>
    </div>
  );
}

function OTPFallback() {
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
            Please wait while we prepare your OTP verification
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

export default function OTPPage() {
  return (
    <Suspense fallback={<OTPFallback />}>
      <OTPContent />
    </Suspense>
  );
}
