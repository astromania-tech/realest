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
import {
  signInWithPassword,
  formatAuthError,
} from "@/lib/auth";
import { Eye, EyeOff, Mail, Lock, CheckCircle, AlertCircle } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const verified = searchParams.get("verified");
    const reset = searchParams.get("reset");

    if (verified === "true") {
      setSuccessMessage("Email verification complete! Sign in to continue.");
    } else if (reset === "true") {
      setSuccessMessage(
        "Password reset successful. Please sign in.",
      );
    }
  }, [searchParams]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError("");
    if (successMessage) setSuccessMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await signInWithPassword(
        formData.email,
        formData.password,
      );

      if (!response.success) {
        setError(
          formatAuthError(response.error || "An unexpected error occurred"),
        );
        return;
      }

      if (response.user) {
        const userType =
          response.user.app_metadata?.role || response.user.user_metadata?.user_type;

        if (userType === "owner" || userType === "agent") {
          const supabase = (await import("@/lib/supabase/client")).createClient();
          const tableName = userType === "owner" ? "owners" : "agents";

          const { data: onboardingComplete } = await supabase
            .from(tableName)
            .select("id")
            .eq("profile_id", response.user.id)
            .single();

          if (!onboardingComplete) {
            router.push("/onboarding");
            router.refresh();
            return;
          }
        }

        if (userType === "owner") {
          router.push("/owner");
        } else if (userType === "admin") {
          router.push("/admin");
        } else if (userType === "agent") {
          router.push("/agent");
        } else {
          router.push("/profile");
        }
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription>Sign in to your RealEST account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
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
                  className="pl-10"
                  required
                />
              </div>
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
                  placeholder="Enter your password"
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
            </div>

            {successMessage && (
              <div className="text-sm text-success bg-success-50 border border-success-200 rounded-md p-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                {successMessage}
              </div>
            )}

            {error && (
              <div className="flex justify-center items-center gap-2 mt-2 p-3 ">
                <AlertCircle className="w-4 h-4 text-orange-600 dark:text-orange-400 mt-0.5 shrink-0" />
                <div className="text-xs text-orange-800 dark:text-orange-200">
                  <p className="font-medium">
                    {error}
                  </p>
                </div>
              </div>
            )}

            <Button
              type="submit"
              variant="default"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="text-center space-y-2">
            <div className="text-sm text-muted-foreground">
              <Link href="/forgot-password" className="hover:underline">
                Forgot your password?
              </Link>
            </div>
            <div className="text-sm">
              Don't have an account?{" "}
              <Link href="/register" className="font-medium">
                Sign up
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function LoginPageFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription>Sign in to your RealEST account</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginPageFallback />}>
      <LoginForm />
    </Suspense>
  );
}
