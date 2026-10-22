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
import { Input } from "@/components/ui/input";
import { validatePassword as checkPasswordRules } from "@/lib/auth/password-rules";
import {
  Eye,
  EyeOff,
  Lock,
  CheckCircle,
  Shield,
  RefreshCw,
} from "lucide-react";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

  // Check for auth parameters in URL and handle session
  useEffect(() => {
    const initializeSession = async () => {
      const { handlePasswordResetSession } = await import("@/lib/auth");
      const result = await handlePasswordResetSession(searchParams);

      if (!result.success) {
        setSessionReady(false);
        setError(result.error || "Failed to initialize password reset");
        if (result.redirectTo && result.redirectDelay) {
          setTimeout(() => {
            router.push(result.redirectTo!);
          }, result.redirectDelay);
        }
      } else {
        setSessionReady(true);
        setError("");
      }
    };

    initializeSession();
  }, [searchParams, router]);

  const applyPasswordValidation = (password: string) => {
    const validation = checkPasswordRules(password);
    setPasswordValidation(validation);
    return Object.values(validation).every(Boolean);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === "password") {
      applyPasswordValidation(value);
    }
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (!applyPasswordValidation(formData.password)) {
      setError("Password does not meet security requirements");
      setIsLoading(false);
      return;
    }

    try {
      // Server route reads recovery session cookies and calls updateUser.
      // Client-side updateUser often has no hydrated session after OTP verify.
      const res = await fetch("/api/auth/complete-password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: formData.password }),
      });
      const data = (await res.json()) as {
        success?: boolean;
        error?: string;
      };

      if (!res.ok || !data.success) {
        const message =
          data.error || "Failed to update password. Please try again.";
        console.error("Password update error:", message);

        if (
          res.status === 401 ||
          /session|expired|unauthorized/i.test(message)
        ) {
          setError(
            "Your reset session has expired. Please request a new password reset.",
          );
          setTimeout(() => {
            router.push("/forgot-password");
          }, 3000);
        } else {
          setError(message);
        }
        return;
      }

      setIsSuccess(true);
      setTimeout(() => {
        router.push("/login?reset=true");
      }, 3000);
    } catch (err) {
      console.error("Password reset error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const isPasswordValid = Object.values(passwordValidation).every(Boolean);
  const canSubmit =
    sessionReady &&
    Boolean(formData.password) &&
    Boolean(formData.confirmPassword) &&
    isPasswordValid &&
    formData.password === formData.confirmPassword;

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="w-16 h-16 text-success" />
            </div>
            <CardTitle className="text-2xl font-bold">
              Password Reset Complete
            </CardTitle>
            <CardDescription>
              Your password has been successfully updated
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Redirecting to login...
              </p>
            </div>

            <div className="space-y-3">
              <Button asChild variant="default" className="w-full">
                <Link href="/login">Sign In Now</Link>
              </Button>
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
          <div className="flex justify-center mb-4">
            <Shield className="w-12 h-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Reset Password
          </CardTitle>
          <CardDescription>
            Set new password for your RealEST Connect account
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a new password"
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Password Validation */}
              {formData.password && (
                <div className="bg-muted p-3 rounded-lg space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    Password Requirements:
                  </p>
                  <div className="grid grid-cols-1 gap-1 text-xs">
                    <div
                      className={`flex items-center gap-2 ${passwordValidation.minLength ? "text-success" : "text-muted-foreground"}`}
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${passwordValidation.minLength ? "bg-success" : "bg-muted-foreground"}`}
                      />
                      At least 8 characters
                    </div>
                    <div
                      className={`flex items-center gap-2 ${passwordValidation.hasUppercase ? "text-success" : "text-muted-foreground"}`}
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${passwordValidation.hasUppercase ? "bg-success" : "bg-muted-foreground"}`}
                      />
                      One uppercase letter
                    </div>
                    <div
                      className={`flex items-center gap-2 ${passwordValidation.hasLowercase ? "text-success" : "text-muted-foreground"}`}
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${passwordValidation.hasLowercase ? "bg-success" : "bg-muted-foreground"}`}
                      />
                      One lowercase letter
                    </div>
                    <div
                      className={`flex items-center gap-2 ${passwordValidation.hasNumber ? "text-success" : "text-muted-foreground"}`}
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${passwordValidation.hasNumber ? "bg-success" : "bg-muted-foreground"}`}
                      />
                      One number
                    </div>
                    <div
                      className={`flex items-center gap-2 ${passwordValidation.hasSpecialChar ? "text-success" : "text-muted-foreground"}`}
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${passwordValidation.hasSpecialChar ? "bg-success" : "bg-muted-foreground"}`}
                      />
                      One special character
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your new password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleInputChange("confirmPassword", e.target.value)
                  }
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Password Match Indicator */}
              {formData.confirmPassword && (
                <div
                  className={`text-xs flex items-center gap-2 ${
                    formData.password === formData.confirmPassword
                      ? "text-success"
                      : "text-danger"
                  }`}
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${
                      formData.password === formData.confirmPassword
                        ? "bg-success"
                        : "bg-danger"
                    }`}
                  />
                  {formData.password === formData.confirmPassword
                    ? "Passwords match"
                    : "Passwords do not match"}
                </div>
              )}
            </div>

            {error && (
              <div className="text-sm text-danger bg-danger-50 border border-danger-200 rounded-md p-3">
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="default"
              className="w-full"
              disabled={isLoading || !canSubmit}
            >
              {isLoading ? "Updating Password..." : "Update Password"}
            </Button>
          </form>

          <div className="text-center">
            <div className="text-sm">
              Remember your password?{" "}
              <Link href="/login" className="font-medium hover:underline">
                Sign in
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <RefreshCw className="w-12 h-12 text-primary animate-spin" />
              </div>
              <CardTitle className="text-2xl font-bold">
                Loading Reset Form
              </CardTitle>
              <CardDescription>
                Please wait while we prepare your password reset form
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
