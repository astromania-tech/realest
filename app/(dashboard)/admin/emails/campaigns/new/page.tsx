"use client";

/**
 * /admin/emails/campaigns/new — Campaign creator (3-step wizard)
 *
 * Step 1: Select template
 * Step 2: Pick audience + send mode
 * Step 3: Configure subject, template props JSON, optional schedule
 */

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Check, Send, Save, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

interface TemplateOption {
  name: string;
  label: string;
  category: string;
  description: string;
  subject: string;
}

interface AudienceOption {
  id: string;
  name: string;
  type: "resend_audience" | "db_segment";
  contactCount: number;
  audienceId?: string;
  filter?: Record<string, unknown>;
}

// Static template list (mirrors preview-registry without importing server-only deps)
const TEMPLATES: TemplateOption[] = [
  { name: "WelcomeEmail",                label: "Welcome",                       category: "platform",   description: "First email after account creation",                     subject: "Welcome to RealEST, {{firstName}}!" },
  { name: "WaitlistConfirmationEmail",   label: "Waitlist Confirmation",         category: "platform",   description: "Confirms waitlist spot",                                  subject: "You're on the RealEST waitlist" },
  { name: "OnboardingReminderEmail",     label: "Onboarding Reminder",           category: "platform",   description: "Nudges users to complete profile",                        subject: "{{firstName}}, finish setting up your RealEST account" },
  { name: "PasswordResetEmail",          label: "Password Reset",                category: "platform",   description: "Delivers magic link to reset password",                   subject: "Reset your password" },
  { name: "PasswordChangedEmail",        label: "Password Changed",              category: "platform",   description: "Confirms a successful password change",                   subject: "Your RealEST password has been changed" },
  { name: "SubAdminInvitationEmail",     label: "Sub-Admin Invitation",          category: "platform",   description: "Invites a new sub-admin",                                 subject: "You've been invited to join the RealEST admin team" },
  { name: "ListingLiveEmail",            label: "Listing Live",                  category: "listing",    description: "Listing is now published",                                subject: "Your listing is live!" },
  { name: "ListingSubmissionEmail",      label: "Listing Submitted",             category: "listing",    description: "Acknowledges new property submission",                    subject: "Listing submission received" },
  { name: "ListingRejectedEmail",        label: "Listing Rejected",              category: "listing",    description: "Notifies owner of rejection with reasons",                subject: "Action required on your listing" },
  { name: "ListingRenewalEmail",         label: "Listing Renewal",               category: "financial",  description: "Reminds owner of upcoming listing expiry",                subject: "Your listing is expiring soon" },
  { name: "MLValidationPassedEmail",     label: "ML Validation Passed",          category: "listing",    description: "ML check passed — no issues",                             subject: "Listing validated" },
  { name: "MLValidationActionEmail",     label: "ML Validation — Action",        category: "listing",    description: "ML flagged an issue — review required",                   subject: "Action required on your listing" },
  { name: "VettingAppointmentEmail",     label: "Vetting Appointment",           category: "listing",    description: "Schedules an in-person vetting visit",                    subject: "Your vetting appointment" },
  { name: "InquirySentEmail",            label: "Inquiry Sent",                  category: "engagement", description: "Confirms a new tenant inquiry",                           subject: "Your inquiry was received" },
  { name: "ViewingReminderEmail",        label: "Viewing Reminder",              category: "engagement", description: "Reminds tenant of upcoming property viewing",             subject: "Your viewing is tomorrow" },
  { name: "PriceDropAlertEmail",         label: "Price Drop Alert",              category: "engagement", description: "Notifies saved-search users of a price drop",             subject: "Price drop on a property you saved" },
  { name: "InvoiceEmail",                label: "Invoice",                       category: "financial",  description: "Invoice for listing fee",                                 subject: "Your RealEST invoice" },
  { name: "PaymentReceiptEmail",         label: "Payment Receipt",               category: "financial",  description: "Confirms a successful payment",                           subject: "Payment confirmed" },
  { name: "PaymentFailedEmail",          label: "Payment Failed",                category: "financial",  description: "Notifies owner of a failed payment",                      subject: "Payment failed — action needed" },
  { name: "LoginAlertEmail",             label: "Login Alert",                   category: "security",   description: "Alerts user of a new login from unknown device",          subject: "New sign-in to your RealEST account" },
  { name: "VettingTaskEmail",            label: "Vetting Task",                  category: "security",   description: "Assigns a vetting task to an agent",                      subject: "New vetting task assigned" },
  { name: "FrontierReengagementEmail",   label: "Frontier Reengagement",         category: "marketing",  description: "Win-back series for inactive waitlist members",            subject: "{{firstName}}, why we've been quiet (and why it's good news for you)" },
  { name: "AuthorityGeotagEmail",        label: "Authority — Geotag",            category: "marketing",  description: "Location-authority positioning email",                    subject: "If you can't navigate to it, it doesn't exist on RealEST" },
  { name: "AuthorityBootsGroundEmail",   label: "Authority — Boots on Ground",   category: "marketing",  description: "Physical vetting proof-of-concept email",                 subject: "We visited 50 properties this week. Only 12 made the cut." },
  { name: "LaunchWindowEmail",           label: "Launch Window",                 category: "marketing",  description: "Announces the launch period to waitlist",                 subject: "{{firstName}}, we're taking a few more weeks — here's why (and your reward for waiting)" },
  { name: "SystemUpdateEmail",           label: "System Update",                 category: "marketing",  description: "Product update / changelog announcement",                 subject: "RealEST System Notice: [Update Title]" },
  { name: "WaitlistMilestoneEmail",      label: "Waitlist Milestone",            category: "marketing",  description: "Celebrates a waitlist size milestone",                    subject: "We just hit 1,000 users! Here's what we're building for you" },
  { name: "AgentVsLandlordEmail",        label: "Agent vs Landlord",             category: "marketing",  description: "Educational email on agent vs direct listing",            subject: "{{firstName}}, the agent fee structure that actually works for you" },
  { name: "PropertyCategoriesEmail",     label: "Property Categories",           category: "marketing",  description: "Showcases available property types / BQ etc.",            subject: "{{firstName}}, not just houses: 7 property types you'll find on RealEST" },
  { name: "LaunchEveEmail",              label: "Launch Eve",                    category: "marketing",  description: "Final email before platform launch",                      subject: "{{firstName}}, tomorrow — your early access opens" },
  { name: "ReferralInviteEmail",         label: "Referral Invite",               category: "marketing",  description: "Referral chain invite email",                             subject: "{{firstName}}, you've earned it — share RealEST and claim your reward" },
  { name: "WeeklyDigestEmail",           label: "Weekly Digest",                 category: "marketing",  description: "Weekly summary of new listings + platform activity",      subject: "Your RealEST weekly digest" },
];

const CATEGORY_COLORS: Record<string, string> = {
  platform:   "bg-blue-100 text-blue-700",
  listing:    "bg-emerald-100 text-emerald-700",
  engagement: "bg-amber-100 text-amber-700",
  financial:  "bg-purple-100 text-purple-700",
  security:   "bg-red-100 text-red-700",
  marketing:  "bg-lime-100 text-lime-800",
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function NewCampaignPage() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateOption | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Step 2
  const [audiences, setAudiences] = useState<AudienceOption[]>([]);
  const [audiencesLoading, setAudiencesLoading] = useState(false);
  const [selectedAudience, setSelectedAudience] = useState<AudienceOption | null>(null);
  const [sendMode, setSendMode] = useState<"broadcast" | "batch">("batch");

  // Step 3
  const [campaignName, setCampaignName] = useState("");
  const [subject, setSubject] = useState("");
  const [propsJson, setPropsJson] = useState("{}");
  const [propsJsonError, setPropsJsonError] = useState<string | null>(null);
  const [sendNow, setSendNow] = useState(false);

  // Load audiences on step 2
  useEffect(() => {
    if (step !== 2) return;
    setAudiencesLoading(true);
    fetch("/api/admin/emails/audiences")
      .then((r) => r.json())
      .then((data) => {
        const list: AudienceOption[] = [
          ...data.resendAudiences.map((a: { id: string; name: string; contactCount: number }) => ({
            id: `resend_${a.id}`,
            name: a.name,
            type: "resend_audience" as const,
            contactCount: a.contactCount,
            audienceId: a.id,
          })),
          ...data.dbSegments.map((s: { id: string; name: string; contactCount: number; filter: Record<string, unknown> }) => ({
            id: `db_${s.id}`,
            name: s.name,
            type: "db_segment" as const,
            contactCount: s.contactCount,
            filter: s.filter,
          })),
        ];
        setAudiences(list);
        setAudiencesLoading(false);
      })
      .catch(() => setAudiencesLoading(false));
  }, [step]);

  // Pre-fill subject from template
  useEffect(() => {
    if (selectedTemplate && !subject) {
      setSubject(selectedTemplate.subject);
    }
    if (selectedTemplate && !campaignName) {
      setCampaignName(selectedTemplate.label);
    }
  }, [selectedTemplate]);

  // Auto-detect send mode based on audience type
  useEffect(() => {
    if (!selectedAudience) return;
    setSendMode(selectedAudience.type === "resend_audience" ? "broadcast" : "batch");
  }, [selectedAudience]);

  const validatePropsJson = useCallback((val: string) => {
    try {
      JSON.parse(val);
      setPropsJsonError(null);
      return true;
    } catch {
      setPropsJsonError("Invalid JSON");
      return false;
    }
  }, []);

  const handleCreate = async (andSend: boolean) => {
    if (!validatePropsJson(propsJson)) return;
    if (!selectedTemplate || !selectedAudience) return;

    setLoading(true);
    setError(null);

    const body = {
      name: campaignName,
      template_name: selectedTemplate.name,
      subject,
      audience_type: selectedAudience.type,
      audience_id: selectedAudience.audienceId ?? null,
      audience_filter: selectedAudience.filter ?? null,
      send_mode: sendMode,
      template_props: JSON.parse(propsJson),
    };

    try {
      const res = await fetch("/api/admin/emails/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? "Failed to create campaign");
        setLoading(false);
        return;
      }

      const campaignId: string = json.campaign.id;

      if (andSend) {
        const sendRes = await fetch(
          `/api/admin/emails/campaigns/${campaignId}/send`,
          { method: "POST" },
        );
        const sendJson = await sendRes.json();
        if (!sendRes.ok) {
          setError(sendJson.error ?? "Campaign created but send failed");
          setLoading(false);
          router.push(`/admin/emails/campaigns/${campaignId}`);
          return;
        }
      }

      router.push(`/admin/emails/campaigns/${campaignId}`);
    } catch {
      setError("Network error — please try again");
      setLoading(false);
    }
  };

  // ── Step 1: Template selection ─────────────────────────────────────────────
  const filteredTemplates =
    categoryFilter === "all"
      ? TEMPLATES
      : TEMPLATES.filter((t) => t.category === categoryFilter);

  const categories = ["all", ...Array.from(new Set(TEMPLATES.map((t) => t.category)))];

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/emails/campaigns">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Campaigns
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">New Campaign</h1>
      </div>

      {/* Step progress */}
      <div className="flex items-center gap-2 mb-8 text-sm">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold",
                s < step
                  ? "bg-primary text-primary-foreground"
                  : s === step
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {s < step ? <Check className="w-3.5 h-3.5" /> : s}
            </div>
            <span className={s === step ? "font-medium" : "text-muted-foreground"}>
              {s === 1 ? "Select Template" : s === 2 ? "Choose Audience" : "Configure & Send"}
            </span>
            {s < 3 && <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />}
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      {/* ── Step 1 ─────────────────────────────────────────────────────────── */}
      {step === 1 && (
        <div>
          {/* Category filter */}
          <div className="flex flex-wrap gap-2 mb-4">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium transition-colors capitalize border",
                  categoryFilter === cat
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted text-muted-foreground border-transparent hover:border-input",
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredTemplates.map((t) => (
              <button
                key={t.name}
                onClick={() => setSelectedTemplate(t)}
                className={cn(
                  "text-left p-4 rounded-lg border transition-all",
                  selectedTemplate?.name === t.name
                    ? "border-primary ring-1 ring-primary bg-primary/5"
                    : "border-border hover:border-primary/50 bg-card",
                )}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="font-medium text-sm">{t.label}</span>
                  <Badge
                    className={cn(
                      "text-xs shrink-0",
                      CATEGORY_COLORS[t.category] ?? "bg-muted text-muted-foreground",
                    )}
                    variant="secondary"
                  >
                    {t.category}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{t.description}</p>
              </button>
            ))}
          </div>

          <div className="flex justify-end mt-6">
            <Button
              onClick={() => setStep(2)}
              disabled={!selectedTemplate}
            >
              Next: Choose Audience
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* ── Step 2 ─────────────────────────────────────────────────────────── */}
      {step === 2 && (
        <div>
          {audiencesLoading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Loading audiences…
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                Select who will receive this campaign. Resend-managed audiences use
                the Broadcasts API (includes unsubscribe management). DB segments use
                direct batch sending.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {audiences.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setSelectedAudience(a)}
                    className={cn(
                      "text-left p-4 rounded-lg border transition-all",
                      selectedAudience?.id === a.id
                        ? "border-primary ring-1 ring-primary bg-primary/5"
                        : "border-border hover:border-primary/50 bg-card",
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{a.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {a.type === "resend_audience" ? "Resend" : "DB Segment"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {a.contactCount.toLocaleString()} contacts
                    </p>
                  </button>
                ))}
              </div>

              {selectedAudience && (
                <div className="mt-4 p-4 rounded-lg border bg-muted/30">
                  <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 block">
                    Send Mode
                  </Label>
                  <div className="flex gap-3">
                    {(["batch", "broadcast"] as const).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setSendMode(mode)}
                        disabled={selectedAudience.type === "resend_audience" && mode === "batch"}
                        className={cn(
                          "flex-1 p-3 rounded-md border text-sm transition-all",
                          sendMode === mode
                            ? "border-primary ring-1 ring-primary bg-primary/5 font-medium"
                            : "border-border bg-card text-muted-foreground hover:border-primary/50",
                          selectedAudience.type === "resend_audience" && mode === "batch"
                            ? "opacity-40 cursor-not-allowed"
                            : "",
                        )}
                      >
                        <div className="font-medium capitalize">{mode}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {mode === "broadcast"
                            ? "Resend Broadcasts API — recommended for Resend audiences"
                            : "Batch API — sends to each recipient individually, max 100/req"}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={() => setStep(1)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              onClick={() => setStep(3)}
              disabled={!selectedAudience}
            >
              Next: Configure
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* ── Step 3 ─────────────────────────────────────────────────────────── */}
      {step === 3 && (
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Campaign Details</CardTitle>
              <CardDescription>
                Template: <strong>{selectedTemplate?.label}</strong> &middot; Audience:{" "}
                <strong>{selectedAudience?.name}</strong> (
                {selectedAudience?.contactCount.toLocaleString()} contacts)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="campaign-name">Campaign Name</Label>
                <Input
                  id="campaign-name"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  placeholder="e.g. April Newsletter"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="subject">Email Subject</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Your email subject line"
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Use <code className="font-mono">{"{{firstName}}"}</code>,{" "}
                  <code className="font-mono">{"{{fullName}}"}</code>, or{" "}
                  <code className="font-mono">{"{{email}}"}</code> for per-recipient
                  personalisation (batch sends only).
                </p>
              </div>
              <div>
                <Label htmlFor="props-json">
                  Template Props{" "}
                  <span className="text-muted-foreground font-normal">(JSON)</span>
                </Label>
                <textarea
                  id="props-json"
                  value={propsJson}
                  onChange={(e) => {
                    setPropsJson(e.target.value);
                    validatePropsJson(e.target.value);
                  }}
                  rows={8}
                  className={cn(
                    "mt-1 w-full rounded-md border px-3 py-2 text-sm font-mono bg-background resize-y focus:outline-none focus:ring-2 focus:ring-ring",
                    propsJsonError ? "border-destructive" : "border-input",
                  )}
                  placeholder='{}'
                />
                {propsJsonError && (
                  <p className="text-xs text-destructive mt-1">{propsJsonError}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  These props are passed directly to the template component. Use{" "}
                  <code className="font-mono">{"{}"}</code> for templates that use
                  default/environment values.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={() => setStep(2)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={loading || !campaignName || !subject}
                onClick={() => handleCreate(false)}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Draft
              </Button>
              <Button
                disabled={loading || !campaignName || !subject}
                onClick={() => handleCreate(true)}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Send Now
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
