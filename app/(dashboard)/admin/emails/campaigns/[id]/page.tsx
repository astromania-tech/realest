"use client";

/**
 * /admin/emails/campaigns/[id] — Campaign detail + send/cancel controls
 */

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowLeft,
  Send,
  Loader2,
  MailCheck,
  XCircle,
  Clock,
  RefreshCw,
  Users,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Campaign {
  id: string;
  name: string;
  template_name: string;
  subject: string;
  audience_type: string;
  audience_id: string | null;
  audience_filter: Record<string, unknown> | null;
  send_mode: string;
  status: string;
  template_props: Record<string, unknown> | null;
  scheduled_at: string | null;
  sent_at: string | null;
  total_recipients: number | null;
  sent_count: number | null;
  failed_count: number | null;
  resend_id: string | null;
  created_at: string | null;
  updated_at: string | null;
  profiles: { full_name: string | null; email: string | null } | null;
}

const STATUS_BADGE: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  draft:      "secondary",
  scheduled:  "outline",
  sending:    "default",
  sent:       "default",
  failed:     "destructive",
  cancelled:  "secondary",
};

function formatDate(d: string | null | undefined) {
  if (!d) return "—";
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(d));
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recipients, setRecipients] = useState<{
    type: "db_segment" | "resend_audience";
    total: number;
    recipients: { email: string; firstName: string; fullName: string }[];
    filter?: Record<string, unknown>;
    audienceId?: string;
    note?: string;
  } | null>(null);
  const [recipientsLoading, setRecipientsLoading] = useState(false);
  const [showAllRecipients, setShowAllRecipients] = useState(false);

  const fetchCampaign = async () => {
    try {
      const res = await fetch(`/api/admin/emails/campaigns/${id}`);
      const json = await res.json();
      if (res.ok) {
        setCampaign(json.campaign);
      } else {
        setError(json.error ?? "Failed to load campaign");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const fetchRecipients = async () => {
    setRecipientsLoading(true);
    try {
      const res = await fetch(`/api/admin/emails/campaigns/${id}/recipients`);
      if (res.ok) setRecipients(await res.json());
    } catch {
      // non-critical
    } finally {
      setRecipientsLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaign();
    fetchRecipients();
  }, [id]);

  // Poll while sending
  useEffect(() => {
    if (campaign?.status !== "sending") return;
    const timer = setInterval(fetchCampaign, 3000);
    return () => clearInterval(timer);
  }, [campaign?.status]);

  const handleSend = async () => {
    setSending(true);
    setError(null);
    const res = await fetch(`/api/admin/emails/campaigns/${id}/send`, {
      method: "POST",
    });
    const json = await res.json();
    if (res.ok) {
      setCampaign(json.campaign);
    } else {
      setError(json.error ?? "Send failed");
    }
    setSending(false);
  };

  const handleDelete = async () => {
    if (!confirm("Delete this draft campaign? This cannot be undone.")) return;
    const res = await fetch(`/api/admin/emails/campaigns/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      router.push("/admin/emails/campaigns");
    } else {
      const json = await res.json();
      setError(json.error ?? "Delete failed");
    }
  };

  // ── Render states ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        Loading campaign…
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="text-center py-24 text-muted-foreground">
        <p className="font-medium">Campaign not found</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/admin/emails/campaigns">Back to Campaigns</Link>
        </Button>
      </div>
    );
  }

  const isDraft = campaign.status === "draft" || campaign.status === "scheduled";
  const isSending = campaign.status === "sending";

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/emails/campaigns">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Campaigns
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">{campaign.name}</h1>
        <Badge variant={STATUS_BADGE[campaign.status] ?? "secondary"}>
          {campaign.status}
          {isSending && (
            <Loader2 className="w-3 h-3 ml-1 animate-spin inline-block" />
          )}
        </Badge>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      {/* Stats (sent campaigns) */}
      {campaign.status === "sent" && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center gap-2">
                <MailCheck className="w-6 h-6 text-green-600" />
                <div>
                  <p className="text-xl font-bold">
                    {campaign.sent_count?.toLocaleString() ?? "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">Delivered</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center gap-2">
                <XCircle className="w-6 h-6 text-destructive" />
                <div>
                  <p className="text-xl font-bold">
                    {campaign.failed_count?.toLocaleString() ?? "0"}
                  </p>
                  <p className="text-xs text-muted-foreground">Failed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center gap-2">
                <Clock className="w-6 h-6 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{formatDate(campaign.sent_at)}</p>
                  <p className="text-xs text-muted-foreground">Sent At</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Details card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Campaign Details</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            {(
              [
                ["Template", campaign.template_name],
                ["Subject", campaign.subject],
                ["Audience Type", campaign.audience_type],
                [
                  "Audience",
                  campaign.audience_type === "resend_audience"
                    ? campaign.audience_id ?? "—"
                    : campaign.audience_filter
                    ? JSON.stringify(campaign.audience_filter)
                    : "All",
                ],
                ["Send Mode", campaign.send_mode],
                ["Resend ID", campaign.resend_id ?? "—"],
                ["Created By", campaign.profiles?.full_name ?? campaign.profiles?.email ?? "—"],
                ["Created At", formatDate(campaign.created_at)],
                ["Updated At", formatDate(campaign.updated_at)],
              ] as [string, string][]
            ).map(([label, value]) => (
              <div key={label}>
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="font-medium break-all">{value}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>

      {/* Template props */}
      {campaign.template_props &&
        Object.keys(campaign.template_props).length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-base">Template Props</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs font-mono bg-muted rounded-md p-3 overflow-x-auto">
                {JSON.stringify(campaign.template_props, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}

      {/* Email Preview */}
      {campaign.template_name && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Email Preview
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-hidden rounded-b-lg">
            <iframe
              src={`/api/admin/emails/campaigns/${id}/preview`}
              className="w-full border-0"
              style={{ height: "620px" }}
              title="Email Preview"
            />
          </CardContent>
        </Card>
      )}

      {/* Recipients */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="w-4 h-4" />
            Recipients
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recipientsLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading recipients…
            </div>
          ) : recipients ? (
            recipients.type === "resend_audience" ? (
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-muted-foreground">Audience ID: </span>
                  <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
                    {recipients.audienceId}
                  </code>
                </p>
                {campaign.total_recipients != null && (
                  <p>
                    <span className="text-muted-foreground">Total recipients: </span>
                    <strong>{campaign.total_recipients.toLocaleString()}</strong>
                  </p>
                )}
                {recipients.note && (
                  <p className="text-muted-foreground">{recipients.note}</p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {recipients.total.toLocaleString()}{" "}
                  recipient{recipients.total !== 1 ? "s" : ""}
                  {recipients.filter &&
                  Object.keys(recipients.filter).length > 0 ? (
                    <>
                      {" · filter: "}
                      <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
                        {JSON.stringify(recipients.filter)}
                      </code>
                    </>
                  ) : (
                    " · all users"
                  )}
                </p>
                <div className="rounded-md border divide-y text-sm">
                  {(
                    showAllRecipients
                      ? recipients.recipients
                      : recipients.recipients.slice(0, 10)
                  ).map((r) => (
                    <div
                      key={r.email}
                      className="flex items-center justify-between px-3 py-2"
                    >
                      <span className="font-medium">
                        {r.fullName || r.firstName || "Unknown"}
                      </span>
                      <span className="text-muted-foreground">{r.email}</span>
                    </div>
                  ))}
                </div>
                {recipients.recipients.length > 10 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAllRecipients(!showAllRecipients)}
                  >
                    {showAllRecipients
                      ? "Show less"
                      : `Show all ${recipients.total.toLocaleString()} recipients`}
                  </Button>
                )}
              </div>
            )
          ) : (
            <p className="text-sm text-muted-foreground">
              No recipient data available.
            </p>
          )}
          {(campaign.failed_count ?? 0) > 0 && (
            <p className="text-xs text-muted-foreground mt-4 border-t pt-3">
              ⚠ {campaign.failed_count!.toLocaleString()} delivery failure
              {campaign.failed_count !== 1 ? "s" : ""} recorded. Individual
              failed addresses are not tracked — only total failure counts are
              stored.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3 flex-wrap">
        {isDraft && (
          <>
            <Button
              onClick={handleSend}
              disabled={sending}
            >
              {sending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Send Now
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={sending}
            >
              Delete Draft
            </Button>
          </>
        )}
        {isSending && (
          <Button variant="outline" onClick={fetchCampaign}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Status
          </Button>
        )}
        {campaign.status === "failed" && (
          <Button onClick={handleSend} disabled={sending}>
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Retry Send
          </Button>
        )}
      </div>
    </div>
  );
}
