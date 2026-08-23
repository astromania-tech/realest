"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui";
import { Mail, RefreshCw, CheckCircle, ArrowLeft } from "lucide-react";
import { resendEmailVerification } from "@/lib/auth";

function SignUpSuccessContent() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) setEmail(decodeURIComponent(emailParam));
  }, [searchParams]);

  // Cooldown timer to prevent resend spam
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setInterval(() => setCooldown((s) => s - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [cooldown]);

  const handleResend = async () => {
    if (!email || isResending || cooldown > 0) return;
    setIsResending(true);
    setResendError("");
    setResendSuccess(false);

    try {
      const result = await resendEmailVerification(email);
      if (result.success) {
        setResendSuccess(true);
        setCooldown(60);
      } else {
        setResendError(result.error || "Failed to resend. Please try again.");
      }
    } catch {
      setResendError("An unexpected error occurred.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Mail className="w-8 h-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Check Your Email</CardTitle>
          <CardDescription>
            Your account has been created — one step left
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-muted/50 border border-border rounded-lg p-4 space-y-3">
            <p className="text-sm text-center text-muted-foreground">
              We sent an activation link to
            </p>
            {email && (
              <p className="text-sm font-semibold text-center text-foreground break-all">
                {email}
              </p>
            )}
            <p className="text-sm text-muted-foreground text-center">
              Click the link in that email to activate your account and access
              your dashboard. The link expires in <strong>24 hours</strong>.
            </p>
          </div>

          {/* Resend section */}
          <div className="space-y-3">
            {resendSuccess && (
              <div className="flex items-center gap-2 text-sm text-success bg-success/10 border border-success/20 rounded-md p-3">
                <CheckCircle className="w-4 h-4 shrink-0" />
                Activation email resent. Please check your inbox and spam
                folder.
              </div>
            )}
            {resendError && (
              <div className="text-sm text-danger bg-danger-50 border border-danger-200 rounded-md p-3">
                {resendError}
              </div>
            )}

            <Button
              variant="outline"
              className="w-full"
              onClick={handleResend}
              disabled={isResending || cooldown > 0 || !email}
            >
              {isResending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : cooldown > 0 ? (
                `Resend in ${cooldown}s`
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Resend activation email
                </>
              )}
            </Button>
          </div>

          <div className="space-y-2 pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              Wrong email address?{" "}
              <Link href="/register" className="underline hover:text-foreground">
                Register again
              </Link>
            </p>
            <div className="text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Already verified? Sign in
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SuccessFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function SignUpSuccessPage() {
  return (
    <Suspense fallback={<SuccessFallback />}>
      <SignUpSuccessContent />
    </Suspense>
  );
}
