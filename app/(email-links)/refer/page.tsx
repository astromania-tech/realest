"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  CheckCircle,
  Copy,
  Gift,
  Info,
  Link2,
  Mail,
  Send,
  Share2,
  Users,
} from "lucide-react";
import { XIcon, FacebookIcon, LinkedInIcon, WhatsAppIcon } from "@/lib/utils/icon";
import WaitlistModal from "@/components/shared/WaitlistModal";
import { useEmailValidation, useEmailCheck, formatWaitlistMessage } from '@/lib/hooks/useEmailValidation';

type Milestone = {
  count: number;
  key: string;
  label: string;
  description: string;
};

type ResolvedInviter = {
  firstName: string;
  referralCode: string;
  referralCount?: number;
  currentMilestone?: Milestone | null;
  nextMilestone?: Milestone | null;
  waitlistReward?: string | null;
  shareUrl: string;
};

const SOCIAL_STEPS: Array<{ label: string; threshold: number }> = [
  { label: "Early sneak peek", threshold: 3 },
  { label: "Move up waitlist", threshold: 5 },
  { label: "Early access", threshold: 10 },
  { label: "RealEST Insider Badge", threshold: 20 },
  { label: "VIP launch access", threshold: 50 },
  { label: "RealEST Ambassador", threshold: 100 },
];

function ReferContent() {
  const params = useSearchParams();
  const ref = params.get("ref")?.trim().toUpperCase() ?? "";

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [joined, setJoined] = useState(false);
  const [copied, setCopied] = useState(false);
  const [resolveError, setResolveError] = useState<string | null>(null);
  const [isResolving, setIsResolving] = useState(false);
  const [inviter, setInviter] = useState<ResolvedInviter | null>(null);

  const [inviteeName, setInviteeName] = useState("");
  const [inviteeEmail, setInviteeEmail] = useState("");
  const [inviteSending, setInviteSending] = useState(false);
  const [inviteFeedback, setInviteFeedback] = useState<string | null>(null);

    // Validates invitee email in real-time as user types
  const inviteeValidation = useEmailValidation(inviteeEmail, { debounceMs: 500, minLength: 3 });
  const { checkEmail, isLoading: isCheckingJoin } = useEmailCheck();

  useEffect(() => {
    if (ref) {
      sessionStorage.setItem("referralCode", ref);
    }
  }, [ref]);

  useEffect(() => {
    if (!ref) {
      setInviter(null);
      setResolveError(null);
      return;
    }

    const resolve = async () => {
      setIsResolving(true);
      setResolveError(null);
      try {
        const response = await fetch(`/api/referral/resolve?code=${encodeURIComponent(ref)}`);
        const data = await response.json();
        if (!response.ok || !data?.ok) {
          setResolveError(data?.error ?? "Could not verify referral code.");
          setInviter(null);
          return;
        }
        setInviter(data.inviter as ResolvedInviter);
      } catch {
        setResolveError("Could not verify referral code.");
        setInviter(null);
      } finally {
        setIsResolving(false);
      }
    };

    resolve();
  }, [ref]);

  const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://realest.ng";
  const shareUrl = inviter?.shareUrl ?? (ref ? `${appBaseUrl}/refer?ref=${encodeURIComponent(ref)}` : "");

  const socialLinks = useMemo(() => {
    const encodedUrl = encodeURIComponent(shareUrl || "https://realest.ng/refer");
    const text = encodeURIComponent("Join RealEST early using my referral link. Verified properties, no fake listings.");
    return {
      x: `https://x.com/intent/tweet?text=${text}&url=${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      whatsapp: `https://wa.me/?text=${text}%20${encodedUrl}`,
    };
  }, [shareUrl]);

  const handleCopyLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteeEmail || !(inviter?.referralCode ?? ref)) {
      setInviteFeedback("Please provide an email and a valid referral code.");
      return;
    }

    setInviteSending(true);
    setInviteFeedback(null);
    try {
      const response = await fetch("/api/referral/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inviteeEmail: inviteeEmail.trim().toLowerCase(),
          inviteeName: inviteeName.trim(),
          referralCode: inviter?.referralCode ?? ref,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data?.ok) {
        setInviteFeedback(data?.error ?? "Unable to send invite.");
        return;
      }
      setInviteFeedback("Invite sent successfully.");
      setInviteeName("");
      setInviteeEmail("");
    } catch {
      setInviteFeedback("Unable to send invite.");
    } finally {
      setInviteSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <section className="py-20 px-4 text-white" style={{ backgroundColor: "#07402F" }}>
        <div className="container mx-auto max-w-4xl text-center">
          <Badge className="mb-4 uppercase tracking-widest text-xs border-white/30 bg-white/10 text-white">
            Referral Hub
          </Badge>

          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Share RealEST. Track Your Referral Progress.
          </h1>

          {ref ? (
            <div className="space-y-2">
              <p className="text-white/90 text-lg">
                {isResolving
                  ? "Verifying referral code..."
                  : inviter
                    ? `${inviter.firstName} invited you to join early.`
                    : resolveError
                      ? "Invalid referral code. Please check your link."
                      : "You opened a referral link."}
              </p>
              <p className="text-white/80 text-sm">
                Referral code: <span className="font-mono font-bold">{inviter?.referralCode ?? ref}</span>
              </p>
              {resolveError ? <p className="text-red-200 text-sm font-semibold">{resolveError}</p> : null}
            </div>
          ) : (
            <p className="text-white/85 text-lg max-w-2xl mx-auto">
              Invite anyone. Every valid referral moves you toward launch rewards and status milestones.
            </p>
          )}

          <div className="mt-8">
            {joined ? (
              <p className="inline-flex items-center gap-2 px-5 py-3 rounded-lg font-semibold text-sm" style={{ backgroundColor: "#ADF434", color: "#07402F" }}>
                <CheckCircle className="w-4 h-4" /> You're on the waitlist.
              </p>
            ) : (
              <Button size="lg" className="font-semibold" style={{ backgroundColor: "#ADF434", color: "#07402F" }} onClick={() => setIsModalOpen(true)}>
                Join & Get My Referral Link <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Only show share/invite/reward sections if inviter is valid and no resolveError */}
      {inviter && !resolveError && (
        <>
          <section className="py-14 px-4">
            <div className="container mx-auto max-w-5xl space-y-8 md:space-y-0 md:grid md:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
                <div className="flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-semibold">Share your referral link</h2>
                </div>

                <div className="rounded-xl border border-border bg-muted/30 p-3 flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-muted-foreground" />
                  <code className="text-xs sm:text-sm truncate flex-1">{shareUrl || "Join the waitlist to generate your referral link"}</code>
                  <Button size="sm" variant="outline" onClick={handleCopyLink} disabled={!shareUrl}>
                    <Copy className="w-4 h-4 mr-1" /> {copied ? "Copied" : "Copy"}
                  </Button>
                </div>

                <div className="grid grid-cols-2 text-sm md:text-xs sm:grid-cols-4 md:grid-cols-2 gap-2">
                  <a href={socialLinks.x} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border py-2 px-5 md:hover:text-primary/80 hover:bg-muted/50">
                    <XIcon size={15} /> 
                  </a>
                  <a href={socialLinks.facebook} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border py-2 px-5 md:hover:text-primary/80 hover:bg-muted/50">
                    <FacebookIcon size={15} /> Facebook
                  </a>
                  <a href={socialLinks.linkedin} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border py-2 px-5 md:hover:text-primary/80 hover:bg-muted/50">
                    <LinkedInIcon size={15} /> LinkedIn
                  </a>
                  <a href={socialLinks.whatsapp} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border py-2 px-5 md:hover:text-primary/80 hover:bg-muted/50">
                    <WhatsAppIcon size={15} /> WhatsApp
                  </a>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
                <div className="flex items-center gap-2">
                  <Send className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-semibold">Invite by email</h2>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-muted-foreground">Name</label>
                    <input
                      value={inviteeName}
                      onChange={(e) => setInviteeName(e.target.value)}
                      placeholder="Adaeze"
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Email</label>
                    <input
                      type="email"
                      value={inviteeEmail}
                      onChange={(e) => setInviteeEmail(e.target.value)}
                      placeholder="friend@example.com"
                      className={`mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm ${
                        inviteeValidation.isValid && !inviteeValidation.isAvailable
                          ? 'border-orange-400 focus:ring-orange-200/50'
                          : 'border-border'
                      }`}
                    />

                    {/* Already on waitlist — bounce with position info */}
                    {inviteeValidation.isValid && !inviteeValidation.isAvailable && inviteeValidation.userInfo && (
                      <div className="mt-2 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                        <div className="flex items-start gap-2">
                          <Info className="w-4 h-4 text-orange-600 dark:text-orange-400 mt-0.5 shrink-0" />
                          <div className="text-xs">
                            <div className="font-medium text-orange-800 dark:text-orange-200">
                              {formatWaitlistMessage(inviteeValidation.userInfo).title}
                            </div>
                            <div className="text-orange-700 dark:text-orange-300 mt-0.5">
                              {formatWaitlistMessage(inviteeValidation.userInfo).description}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <Button
                    onClick={handleInvite}
                    disabled={
                      inviteSending ||
                      !(inviter?.referralCode ?? ref) ||
                      inviteeValidation.isLoading ||
                      (inviteeValidation.isValid && !inviteeValidation.isAvailable) // ← block if already on list
                    }
                    className="w-full"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    {
                      inviteSending ? "Sending invite..." 
                      : (inviteeValidation.isValid && !inviteeValidation.isAvailable)
                        ? "Already on waitlist"
                        : "Send Invite"
                    }
                  </Button>
                  {inviteFeedback && (
                    <p className={`text-sm text-center ${inviteFeedback.includes("success") ? "text-green-600" : "text-red-600"}`}>
                      {inviteFeedback}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="pb-16 px-4">
            <div className="container mx-auto max-w-5xl rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Gift className="w-5 h-5 text-primary" />
                <h3 className="text-xl font-semibold">Referral reward ladder</h3>
              </div>
              <div className="grid md:grid-cols-3 gap-3">
                {SOCIAL_STEPS.map((step) => {
                  const reached = (inviter?.referralCount ?? 0) >= step.threshold;
                  return (
                    <div key={step.threshold} className={`rounded-xl border p-3 ${reached ? "border-primary bg-primary/10" : "border-border"}`}>
                      <p className="text-xs text-muted-foreground">{step.threshold} referrals</p>
                      <p className="font-medium">{step.label}</p>
                    </div>
                  );
                })}
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Current referrals: <span className="font-semibold text-foreground">{inviter?.referralCount ?? 0}</span>
              </p>
            </div>
          </section>
        </>
      )}

      <WaitlistModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        referralCode={ref || undefined}
        onSuccess={() => setJoined(true)}
      />
    </div>
  );
}

export default function ReferPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-muted-foreground text-sm">Loading...</div>
        </div>
      }
    >
      <ReferContent />
    </Suspense>
  );
}
