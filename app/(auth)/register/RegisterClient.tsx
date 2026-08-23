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

type CandidateRole = "user" | "owner" | "agent";

interface WaitlistContextResponse {
  exists?: boolean;
  persona?: string;
  candidateRole?: CandidateRole | null;
  waitlistReward?: string | null;
}

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
  const [refCode, setRefCode] = useState<string | undefined>();
  const [waitlistContext, setWaitlistContext] = useState<WaitlistContextResponse | null>(null);

  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get('ref');
    const fromStorage = sessionStorage.getItem('referralCode');
    const code = (fromUrl || fromStorage)?.trim().toUpperCase() || undefined;
    if (code) setRefCode(code);
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError("");
  };

  const handleRoleSelect = (userType: string) => {
    setFormData((prev) => ({ ...prev, userType }));
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
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

    try {
      let effectiveUserType = formData.userType as CandidateRole;

      const waitlistLookup = await fetch(
        `/api/waitlist?email=${encodeURIComponent(formData.email.trim())}`,
      );

      if (waitlistLookup.ok) {
        const waitlistData = (await waitlistLookup.json()) as WaitlistContextResponse;
        setWaitlistContext(waitlistData);
        if (waitlistData.exists && waitlistData.candidateRole) {
          effectiveUserType = waitlistData.candidateRole;
        }
      }

      const response = await signUpWithPassword(
        formData.email,
        formData.password,
        "", // fullname handled in onboarding
        effectiveUserType,
      );

      if (!response.success) {
        setError(response.error || "An unexpected error occurred");
        return;
      }

      if (response.user) {
        fetch('/api/auth/sync-waitlist-context', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email }),
        }).catch(() => {});

        if (refCode) {
          fetch('/api/auth/attribute-referral', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: formData.email, refCode }),
          }).catch(() => {});
          sessionStorage.removeItem('referralCode');
        }
        router.push(`/success?email=${encodeURIComponent(formData.email)}`);
      }
    } catch (err) {
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
            Fill in your details to complete registration
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {waitlistContext?.exists && waitlistContext.candidateRole ? (
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm text-foreground">
              <div className="mb-1 flex items-center gap-2 font-medium">
                <BadgeCheck className="h-4 w-4 text-primary" />
                Waitlist role detected
              </div>
              <p className="text-muted-foreground">
                Your waitlist persona will activate the <strong>{waitlistContext.candidateRole}</strong> account flow after signup.
              </p>
              {waitlistContext.waitlistReward ? (
                <p className="mt-2 text-muted-foreground">{waitlistContext.waitlistReward}</p>
              ) : null}
            </div>
          ) : null}

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
                  placeholder="Create a password"
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
                  className="pl-10"
                  required
                />
              </div>
            </div>

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

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className="flex-1"
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
