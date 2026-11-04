"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui";
import { Input } from "@/components/ui/input";
import { sendHybridPasswordReset } from "@/lib/auth";
import { cn, isValidEmailFormat } from "@/lib/utils";
import { Mail, ArrowLeft, AlertCircle, Loader2 } from "lucide-react";

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const emailValid = isValidEmailFormat(email);
  const showFormatError = touched && email.trim() !== "" && !emailValid;

  const canSubmit = emailValid && !isLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsLoading(true);
    setSubmitError("");

    try {
      const response = await sendHybridPasswordReset(email);

      if (!response.success) {
        setSubmitError(response.error || "Failed to send reset email");
        return;
      }

      // Redirect to OTP page for code entry
      router.push(`/otp?email=${encodeURIComponent(email)}&type=reset`);
    } catch {
      setSubmitError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Forgot Password?</CardTitle>
          <CardDescription>
            Enter your email address and we'll send a reset code if an account with that address exists.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (submitError) setSubmitError("");
                  }}
                  onBlur={() => setTouched(true)}
                  className={cn(
                    "pl-10 transition-colors",
                    showFormatError &&
                      "border-destructive focus-visible:ring-destructive/25",
                  )}
                  required
                  autoFocus
                />
              </div>
              {showFormatError && (
                <p className="flex items-center gap-1.5 text-xs text-destructive mt-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Enter a valid email address
                </p>
              )}
            </div>

            {submitError && (
              <div className="text-sm text-danger bg-danger-50 border border-danger-200 rounded-md p-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {submitError}
              </div>
            )}

            <Button
              type="submit"
              variant="default"
              className="w-full"
              disabled={!canSubmit}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending code…
                </>
              ) : (
                "Send Password Reset Code"
              )}
            </Button>
          </form>

          <div className="flex justify-center items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            <Link href="/login" className="text-sm font-medium hover:underline">
              Back to Sign In
            </Link>
          </div>

          <div className="text-center text-sm">
            Don't have an account?{" "}
            <Link href="/register" className="font-medium hover:underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}