"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Button, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "@/components/ui";
import { Input } from "@/components/ui/input";
import { signUpWithPassword } from "@/lib/auth";
import {
  normalizeSignupEmail,
  signupApiFieldError,
  validateSignupFields,
  type SignupFieldErrors,
} from "@/lib/auth/signup-form-validation";
import {
  submitSignupWithBestEffortWaitlist,
  type WaitlistContextResponse,
} from "@/lib/auth/signup-waitlist-preflight";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Building,
  Users,
  Briefcase,
  AlertCircle,
  BadgeCheck,
} from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1); // 1: Role selection, 2: Account details
  const [formData, setFormData] = useState({
    userType: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<SignupFieldErrors>({});
  const [refCode, setRefCode] = useState<string | undefined>();
  const [waitlistContext, setWaitlistContext] = useState<WaitlistContextResponse | null>(null);

  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get('ref');
    const fromStorage = sessionStorage.getItem('referralCode');
    const code = (fromUrl || fromStorage)?.trim().toUpperCase() || undefined;
    if (code) setRefCode(code);
  }, []);

  const handleInputChange = (
    field: "email" | "password" | "confirmPassword",
    value: string,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({
      ...prev,
      [field]: undefined,
      ...(field === "password" || field === "confirmPassword"
        ? { confirmPassword: undefined }
        : {}),
    }));
    if (error) setError("");
  };

  const handleRoleSelect = (userType: string) => {
    sessionStorage.setItem("realest-signup-role", userType);
    setFormData((prev) => ({ ...prev, userType }));
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setError("");
    setFieldErrors({});

    const email = normalizeSignupEmail(formData.email);
    const validationErrors = validateSignupFields({ ...formData, email });
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }

    const chosenRole =
      formData.userType || sessionStorage.getItem("realest-signup-role") || "";
    if (chosenRole !== "user" && chosenRole !== "owner" && chosenRole !== "agent") {
      setError("Choose an account type");
      setStep(1);
      return;
    }

    setIsLoading(true);
    try {
      // This public lookup only decorates the form. The signup API resolves
      // candidate_role server-side before creating the Auth account.
      const response = await submitSignupWithBestEffortWaitlist({
        email,
        onWaitlistContext: setWaitlistContext,
        signup: () =>
          signUpWithPassword(
            email,
            formData.password,
            "", // fullname handled in onboarding
            chosenRole,
          ),
      });

      if (!response.success) {
        const fieldError = signupApiFieldError(response.error);
        if (fieldError) {
          setFieldErrors((prev) => ({
            ...prev,
            [fieldError.field]: fieldError.message,
          }));
        } else {
          setError(response.error || "An unexpected error occurred");
        }
        return;
      }

      if (!response.user) {
        setError("We could not finish creating your account. Please try again.");
        return;
      }

      // Waitlist context is synced inside POST /api/auth/signup (no open client race).
      if (refCode) {
        fetch('/api/auth/attribute-referral', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, refCode }),
        }).catch(() => {});
        sessionStorage.removeItem('referralCode');
      }
      const emailQuery = encodeURIComponent(email);
      if (response.localConfirmed) {
        router.push(`/login?local=1&email=${emailQuery}`);
      } else {
        const sent = response.emailSent === false ? "&sent=0" : "";
        router.push(`/success?email=${emailQuery}${sent}`);
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Join RealEST</CardTitle>
            <CardDescription>
              Choose your account type to get started
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-4">
              <button
                onClick={() => handleRoleSelect("user")}
                className="w-full p-4 border rounded-lg hover:bg-muted transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <Users className="w-6 h-6 text-primary" />
                  <div>
                    <div className="font-medium">Buyer or Renter</div>
                    <div className="text-sm text-muted-foreground">
                      Find and inquire about properties
                    </div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleRoleSelect("owner")}
                className="w-full p-4 border rounded-lg hover:bg-muted transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <Building className="w-6 h-6 text-primary" />
                  <div>
                    <div className="font-medium">Property Owner</div>
                    <div className="text-sm text-muted-foreground">
                      List and manage your properties
                    </div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleRoleSelect("agent")}
                className="w-full p-4 border rounded-lg hover:bg-muted transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <Briefcase className="w-6 h-6 text-primary" />
                  <div>
                    <div className="font-medium">Real Estate Agent</div>
                    <div className="text-sm text-muted-foreground">
                      List and manage client properties
                    </div>
                  </div>
                </div>
              </button>
            </div>

            <div className="text-center">
              <div className="text-sm">
                Already have an account?{" "}
                <Link href="/login" className="font-medium">
                  Sign in
                </Link>
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
          <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
          <CardDescription>
            {formData.userType === "owner"
              ? "Property Owner account"
              : formData.userType === "agent"
                ? "Agent account"
                : formData.userType === "user"
                  ? "Buyer or renter account"
                  : "Fill in your details to complete registration"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {waitlistContext?.exists ? (
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm text-foreground">
              <div className="mb-1 flex items-center gap-2 font-medium">
                <BadgeCheck className="h-4 w-4 text-primary" />
                Waitlist email recognized
              </div>
              <p className="text-muted-foreground">
                This email is on the waitlist. Your waitlist persona will set the
                account type when signup completes — the choice above is a fallback
                if no waitlist row applies.
              </p>
            </div>
          ) : null}

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
            noValidate
            aria-busy={isLoading}
          >
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={
                    fieldErrors.email
                      ? "pl-10 border-destructive focus-visible:ring-destructive/25"
                      : "pl-10"
                  }
                  required
                  autoComplete="email"
                  autoCapitalize="none"
                  aria-invalid={Boolean(fieldErrors.email)}
                  aria-describedby={fieldErrors.email ? "email-error" : undefined}
                  disabled={isLoading}
                />
              </div>
              {fieldErrors.email && (
                <p id="email-error" className="text-sm text-destructive" role="alert">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  className={
                    fieldErrors.password
                      ? "pl-10 pr-10 border-destructive focus-visible:ring-destructive/25"
                      : "pl-10 pr-10"
                  }
                  required
                  autoComplete="new-password"
                  aria-invalid={Boolean(fieldErrors.password)}
                  aria-describedby={
                    fieldErrors.password ? "password-error" : "password-help"
                  }
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {fieldErrors.password ? (
                <p id="password-error" className="text-sm text-destructive" role="alert">
                  {fieldErrors.password}
                </p>
              ) : (
                <p id="password-help" className="text-xs text-muted-foreground">
                  Use at least 8 characters, including uppercase, lowercase, a number, and a symbol.
                </p>
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
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleInputChange("confirmPassword", e.target.value)
                  }
                  className={
                    fieldErrors.confirmPassword
                      ? "pl-10 border-destructive focus-visible:ring-destructive/25"
                      : "pl-10"
                  }
                  required
                  autoComplete="new-password"
                  aria-invalid={Boolean(fieldErrors.confirmPassword)}
                  aria-describedby={
                    fieldErrors.confirmPassword
                      ? "confirm-password-error"
                      : undefined
                  }
                  disabled={isLoading}
                />
              </div>
              {fieldErrors.confirmPassword && (
                <p
                  id="confirm-password-error"
                  className="text-sm text-destructive"
                  role="alert"
                >
                  {fieldErrors.confirmPassword}
                </p>
              )}
            </div>

            {error && (
              <div
                className="flex justify-center items-center gap-2 mt-2 p-3"
                role="alert"
                aria-live="assertive"
              >
                <AlertCircle className="w-4 h-4 text-orange-600 dark:text-orange-400 mt-0.5 shrink-0" />
                <div className="text-xs text-orange-800 dark:text-orange-200">
                  <p className="font-medium">
                    {error}
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className="flex-1"
                disabled={isLoading}
              >
                Back
              </Button>
              <Button
                type="submit"
                variant="default"
                className="flex-1"
                disabled={isLoading}
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </div>
          </form>

          <div className="text-center">
            <div className="text-sm">
              Already have an account?{" "}
              <Link href="/login" className="font-medium">
                Sign in
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
