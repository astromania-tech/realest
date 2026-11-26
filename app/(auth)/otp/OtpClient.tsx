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
import {
  verificationFailureKind,
  verificationFailureMessage,
} from "@/lib/auth/email-verification";
import {
  resetOtpExpiresAt,
  resetOtpResendSecondsRemaining,
  resetOtpSecondsRemaining,
  RESET_OTP_EXPIRES_AT_STORAGE_KEY,
  RESET_OTP_TTL_SECONDS,
} from "@/lib/auth/password-reset-otp";
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
  const [timeLeft, setTimeLeft] = useState(RESET_OTP_TTL_SECONDS);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const resendLockRef = useRef(false);
  const expiresAtRef = useRef<number | null>(null);

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

  // Keep reset expiry aligned with the request across reloads and backgrounding.
  // Signup email OTP lifetime is configured by Supabase and isn't the reset TTL.
  useEffect(() => {
    if (otpType !== "reset") {
      expiresAtRef.current = null;
      return;
    }

    let expiresAt: number | null = null;
    try {
      const storedExpiry = Number(
        window.localStorage.getItem(RESET_OTP_EXPIRES_AT_STORAGE_KEY),
      );
      if (Number.isFinite(storedExpiry) && storedExpiry > 0) {
        expiresAt = storedExpiry;
      }
    } catch {
      // Storage can be disabled; use a local display fallback for this page view.
    }

    if (expiresAt === null) {
      expiresAt = resetOtpExpiresAt();
      try {
        window.localStorage.setItem(
          RESET_OTP_EXPIRES_AT_STORAGE_KEY,
          String(expiresAt),
        );
      } catch {
        // The countdown still works until this page is closed.
      }
    }

    expiresAtRef.current = expiresAt;
    const syncTimeLeft = () => {
      if (expiresAtRef.current === null) return;
      const remaining = resetOtpSecondsRemaining(expiresAtRef.current);
      setTimeLeft(remaining);
      if (remaining === 0) setIsExpired(true);
    };

    syncTimeLeft();
    const timer = window.setInterval(syncTimeLeft, 1_000);
    document.addEventListener("visibilitychange", syncTimeLeft);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", syncTimeLeft);
    };
  }, [otpType]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const resendCountdown =
    otpType === "reset"
      ? resetOtpResendSecondsRemaining(timeLeft)
      : Math.max(0, timeLeft - 240);

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
          const failureKind = verificationFailureKind(data.error);
          if (failureKind === "expired") {
            setIsExpired(true);
            setTimeLeft(0); // unlock the resend button immediately
          }
          setError(verificationFailureMessage(failureKind, "code"));
          setOtp(["", "", "", "", "", ""]);
          inputRefs.current[0]?.focus();
          return;
        }

        // Session cookies are now set — go to reset-password
        try {
          window.localStorage.removeItem(RESET_OTP_EXPIRES_AT_STORAGE_KEY);
        } catch {
          // The verified session is authoritative; stale display state is harmless.
        }
        setIsSuccess(true);
        setTimeout(() => router.push("/reset-password"), 1500);
        return;
      }

      // --- Signup email OTP path (legacy / fallback) ---
      const verifyResponse = await verifyOTP(email, otpCode);

      if (!verifyResponse.success) {
        const failureKind = verificationFailureKind(verifyResponse.error);
        if (failureKind === "expired") {
          setIsExpired(true);
          setTimeLeft(0);
        }
        setError(verificationFailureMessage(failureKind, "code"));
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
    } catch {
      setError(verificationFailureMessage("unavailable", "code"));
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendLockRef.current || isResending) return;
    resendLockRef.current = true;
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
        if (otpType === "reset") {
          const expiresAt = resetOtpExpiresAt();
          expiresAtRef.current = expiresAt;
          try {
            window.localStorage.setItem(
              RESET_OTP_EXPIRES_AT_STORAGE_KEY,
              String(expiresAt),
            );
          } catch {
            // The countdown still works until this page is closed.
          }
        }
        setTimeLeft(RESET_OTP_TTL_SECONDS);
        setIsExpired(false);
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    } catch {
      setError("Failed to resend code. Please try again.");
    } finally {
      setIsResending(false);
      resendLockRef.current = false;
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
                  ? "Enter the 6-digit code from your reset email. It expires after 15 minutes; you can request a new code once a minute."
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

              {otpType === "reset" && (
                <div className="text-center text-sm text-muted-foreground">
                  {timeLeft > 0 ? (
                    <span>Code expires in {formatTime(timeLeft)}</span>
                  ) : (
                    <span className="text-danger flex items-center justify-center gap-1">
                      <AlertTriangle className="w-4 h-4" />
                      Code expired
                    </span>
                  )}
                </div>
              )}
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
              disabled={isResending || resendCountdown > 0}
            >
              {isResending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : resendCountdown > 0 ? (
                `Resend in ${formatTime(resendCountdown)}`
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
