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
  CardContent,
} from "@/components/ui";
import { Input } from "@/components/ui/input";
import { getCurrentUser, resetPassword } from "@/lib/auth";
import {
  Eye,
  EyeOff,
  Lock,
  CheckCircle,
  ShieldCheck,
} from "lucide-react";

const RULES = [
  { key: "minLength", label: "At least 8 characters" },
  { key: "hasUppercase", label: "One uppercase letter" },
  { key: "hasLowercase", label: "One lowercase letter" },
  { key: "hasNumber", label: "One number" },
  { key: "hasSpecialChar", label: "One special character" },
] as const;

function SetupPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isLoading, setIsLoading] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [formError, setFormError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({ password: "", confirmPassword: "" });
  const [validation, setValidation] = useState({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

  useEffect(() => {
    (async () => {
      const { handlePasswordResetSession } = await import("@/lib/auth");
      const result = await handlePasswordResetSession(searchParams);
      if (!result.success) {
        setSessionError(result.error ?? "Your invite link is invalid or has expired.");
      }
    })();
  }, [searchParams]);

  const validatePassword = (password: string) => {
    const next = {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
    };
    setValidation(next);
    return Object.values(next).every(Boolean);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((f) => ({ ...f, [field]: value }));
    if (field === "password") validatePassword(value);
    if (formError) setFormError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFormError("");

    if (formData.password !== formData.confirmPassword) {
      setFormError("Passwords do not match.");
      setIsLoading(false);
      return;
    }
    if (!validatePassword(formData.password)) {
      setFormError("Password does not meet the security requirements.");
      setIsLoading(false);
      return;
    }

    try {
      const userResponse = await getCurrentUser();
      if (!userResponse.success || !userResponse.user) {
        setFormError("Session expired. Please request a new invite link.");
        setIsLoading(false);
        return;
      }

      const result = await resetPassword(formData.password);
      if (!result.success) {
        setFormError(result.error ?? "Failed to set password. Please try again.");
        setIsLoading(false);
        return;
      }

      setIsSuccess(true);
      setTimeout(() => router.push("/admin"), 3000);
    } catch {
      setFormError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const isPasswordValid = Object.values(validation).every(Boolean);
  const canSubmit =
    formData.password &&
    formData.confirmPassword &&
    isPasswordValid &&
    formData.password === formData.confirmPassword;

  // Success state
  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <CheckCircle className="w-16 h-16 text-success" />
            </div>
            <CardTitle className="text-2xl font-bold">
              Account Ready!
            </CardTitle>
            <CardDescription>
              Welcome to RealEST. Redirecting you to the admin panel…
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/admin">Go to Admin Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Session error / bad invite link
  if (sessionError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <ShieldCheck className="w-12 h-12 text-destructive" />
            </div>
            <CardTitle className="text-2xl font-bold">
              Invite Link Expired
            </CardTitle>
            <CardDescription className="text-destructive">
              {sessionError}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              The invite link may have expired or already been used. Please
              contact your RealEST administrator to request a new invitation.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/">Back to Home</Link>
            </Button>
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
            <ShieldCheck className="w-12 h-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Set Up Your Account
          </CardTitle>
          <CardDescription>
            Create a secure password to activate your RealEST admin account.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* New password */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Password rules */}
            {formData.password.length > 0 && (
              <ul className="grid grid-cols-1 gap-1.5">
                {RULES.map((rule) => (
                  <li
                    key={rule.key}
                    className={`flex items-center gap-2 text-xs ${
                      validation[rule.key] ? "text-success" : "text-muted-foreground"
                    }`}
                  >
                    <CheckCircle
                      className={`w-3.5 h-3.5 ${
                        validation[rule.key] ? "text-success" : "text-muted-foreground/40"
                      }`}
                    />
                    {rule.label}
                  </li>
                ))}
              </ul>
            )}

            {/* Confirm password */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleChange("confirmPassword", e.target.value)
                  }
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {formError && (
              <p className="text-sm text-destructive">{formError}</p>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={!canSubmit || isLoading}
            >
              {isLoading ? "Setting up your account…" : "Activate My Account"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SetupPasswordClient() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <ShieldCheck className="w-8 h-8 text-muted-foreground animate-pulse" />
        </div>
      }
    >
      <SetupPasswordContent />
    </Suspense>
  );
}
