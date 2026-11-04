"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  ArrowRight,
  Loader2,
  Home,
  Building,
  Users,
} from "lucide-react";
import { useEmailValidation } from "@/lib/hooks/useEmailValidation";

type UserType = "buyer" | "owner" | "agent" | "";

const USER_TYPES: { value: UserType; label: string; description: string; icon: typeof Home }[] = [
  {
    value: "buyer",
    label: "Property Seeker",
    description: "Looking to buy or rent a verified property",
    icon: Home,
  },
  {
    value: "owner",
    label: "Property Owner",
    description: "I want to list and sell or rent my property",
    icon: Building,
  },
  {
    value: "agent",
    label: "Agent / Broker",
    description: "I represent multiple properties and clients",
    icon: Users,
  },
];

const PERKS = [
  "Skip the regular queue — priority access at launch",
  "3 free premium listings for owners (first month)",
  "Exclusive founder tier pricing, locked for life",
  "Direct feedback line to the product team",
];

export default function EarlyAccessPage() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    userType: "" as UserType,
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ position?: number; totalCount?: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const emailValidation = useEmailValidation(form.email, { debounceMs: 500, minLength: 3 });

  const set = (k: keyof typeof form, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.firstName || !form.email) {
      setError("First name and email are required.");
      return;
    }
    // Block submit without hitting the API if this email is already on the list
    if (!emailValidation.isAvailable) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email.trim().toLowerCase(),
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim() || undefined,
          source: `early_access_${form.userType || "general"}`,
        }),
      });
      const json = await res.json();
      if (res.ok || json.isExistingUser) {
        setResult({ position: json.data?.position, totalCount: json.data?.totalCount });
      } else {
        setError(json.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (result !== null) {
    return (
      <div className="min-h-screen bg-background">
        <section className="py-32 px-4 text-center">
          <div className="container mx-auto max-w-md">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-9 h-9 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-3">You&apos;re in!</h1>
            {result.position ? (
              <p className="text-muted-foreground mb-2">
                You&apos;re{" "}
                <strong className="text-foreground">#{result.position}</strong>{" "}
                on the early access list
                {result.totalCount
                  ? ` out of ${result.totalCount.toLocaleString()} people.`
                  : "."}
              </p>
            ) : (
              <p className="text-muted-foreground mb-2">
                We&apos;ve got your spot. We&apos;ll reach out when access opens.
              </p>
            )}
            <p className="text-sm text-muted-foreground mb-8">
              Watch your inbox — we&apos;ll send launch details and your
              exclusive perks once we&apos;re live.
            </p>
            <Button asChild variant="outline">
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="py-20 px-4 bg-muted/30 border-b border-border">
        <div className="container mx-auto max-w-2xl text-center">
          <Badge className="mb-4 uppercase tracking-widest text-xs">
            Early Access
          </Badge>
          <h1 className="text-4xl font-bold mb-4">
            Be among the first to use RealEST
          </h1>
          <p className="text-muted-foreground text-lg">
            Reserve your spot before we open to the public. Early members get
            exclusive perks and priority access at launch.
          </p>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl grid md:grid-cols-2 gap-12 items-start">
          {/* Form */}
          <div>
            <h2 className="text-xl font-bold mb-6">Reserve your spot</h2>

            {/* User type picker */}
            <p className="text-sm font-medium mb-3 text-muted-foreground">
              I am a…
            </p>
            <div className="grid grid-cols-1 gap-2 mb-6">
              {USER_TYPES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => set("userType", t.value)}
                  className={`flex items-center gap-4 p-4 rounded-lg border text-left transition-colors ${
                    form.userType === t.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted/50"
                  }`}
                >
                  <t.icon
                    className={`w-5 h-5 shrink-0 ${
                      form.userType === t.value
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  />
                  <div>
                    <p className="font-medium text-sm">{t.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            <div className="space-y-3">
              <div className="flex gap-3">
                <Input
                  placeholder="First name *"
                  value={form.firstName}
                  onChange={(e) => set("firstName", e.target.value)}
                />
                <Input
                  placeholder="Last name"
                  value={form.lastName}
                  onChange={(e) => set("lastName", e.target.value)}
                />
              </div>
              <Input
                type="email"
                placeholder="Email address *"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
            </div>

            {/* Already on list — show inline rather than submitting */}
            {!emailValidation.isAvailable && emailValidation.userInfo && (
              <div className="mt-3 flex items-start gap-1 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2.5 text-sm">
                <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span>
                  <strong>{emailValidation.userInfo.firstName}</strong>, you&apos;re already on the waitlist
                  {emailValidation.userInfo.position ? (
                    <> at position <strong>#{emailValidation.userInfo.position}</strong></>
                  ) : null}.
                  {" "}<Link href="/refer" className="text-primary underline underline-offset-2">Refer a friend to move up.</Link>
                </span>
              </div>
            )}

            {error && (
              <p className="mt-3 text-sm text-destructive">{error}</p>
            )}

            <Button
              className="w-full mt-5"
              size="lg"
              onClick={handleSubmit}
              disabled={loading || !emailValidation.isAvailable || emailValidation.isLoading}
            >
              {loading || emailValidation.isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <ArrowRight className="w-4 h-4 mr-2" />
              )}
              {!emailValidation.isAvailable ? "Already on the list" : "Reserve My Spot"}
            </Button>
            <p className="text-xs text-muted-foreground mt-3 text-center">
              No spam. Unsubscribe anytime.
            </p>
          </div>

          {/* Perks */}
          <div className="bg-muted/30 rounded-xl border border-border p-6">
            <h3 className="font-semibold mb-5">What early members get</h3>
            <ul className="space-y-4">
              {PERKS.map((p) => (
                <li key={p} className="flex items-start gap-3 text-sm">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 pt-6 border-t border-border text-center">
              <p className="text-xs text-muted-foreground">
                Already on the waitlist?{" "}
                <Link href="/waitlist" className="text-primary hover:underline">
                  Check your position
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
