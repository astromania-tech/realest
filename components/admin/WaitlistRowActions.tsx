"use client";

/**
 * WaitlistRowActions — per-row actions for the waitlist management page.
 * Two actions:
 *   1. Send individual email  — pick a template → POST /api/admin/waitlist/[id]/email
 *   2. Delete subscriber      — confirm → DELETE /api/admin/waitlist/[id]
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Mail, Trash2, Loader2, CheckCircle } from "lucide-react";

// ── Waitlist-relevant templates ───────────────────────────────────────────────
const WAITLIST_TEMPLATES = [
  {
    name: "WaitlistConfirmationEmail",
    label: "Waitlist Confirmation",
    description: "Confirms their spot with queue position",
    category: "platform",
  },
  {
    name: "FrontierReengagementEmail",
    label: "Frontier Re-engagement",
    description: "Win-back email for inactive waitlist members",
    category: "marketing",
  },
  {
    name: "WaitlistMilestoneEmail",
    label: "Waitlist Milestone",
    description: "Celebrates a waitlist size milestone",
    category: "marketing",
  },
  {
    name: "LaunchWindowEmail",
    label: "Launch Window",
    description: "Announces the upcoming platform launch",
    category: "marketing",
  },
  {
    name: "SystemUpdateEmail",
    label: "System Update",
    description: "Product update or changelog announcement",
    category: "marketing",
  },
  {
    name: "LaunchEveEmail",
    label: "Launch Eve",
    description: "Final email before platform launch",
    category: "marketing",
  },
  {
    name: "ReferralInviteEmail",
    label: "Referral Invite",
    description: "Referral chain invite email",
    category: "marketing",
  },
  {
    name: "WeeklyDigestEmail",
    label: "Weekly Digest",
    description: "Weekly summary of new listings and activity",
    category: "marketing",
  },
];

// ── Types ─────────────────────────────────────────────────────────────────────
interface WaitlistSubscriber {
  id: string;
  email: string;
  first_name: string;
  last_name?: string | null;
}

interface Props {
  subscriber: WaitlistSubscriber;
}

// ── Component ─────────────────────────────────────────────────────────────────
export function WaitlistRowActions({ subscriber }: Props) {
  const router = useRouter();

  const [sendOpen, setSendOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const displayName = [subscriber.first_name, subscriber.last_name]
    .filter(Boolean)
    .join(" ");

  const openSend = () => {
    setSelectedTemplate(null);
    setError(null);
    setSuccess(false);
    setSendOpen(true);
  };

  const openDelete = () => {
    setError(null);
    setDeleteOpen(true);
  };

  const handleSendEmail = async () => {
    if (!selectedTemplate) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/waitlist/${subscriber.id}/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ template_name: selectedTemplate }),
      });
      const json = await res.json();
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => setSendOpen(false), 1800);
      } else {
        setError(json.error ?? "Failed to send email");
      }
    } catch {
      setError("Network error");
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/waitlist/${subscriber.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDeleteOpen(false);
        router.refresh();
      } else {
        const json = await res.json();
        setError(json.error ?? "Failed to delete subscriber");
      }
    } catch {
      setError("Network error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={openSend}
          title={`Send email to ${subscriber.email}`}
        >
          <Mail className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="text-destructive hover:text-destructive"
          onClick={openDelete}
          title="Remove from waitlist"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {/* ── Send Email Dialog ── */}
      <Dialog open={sendOpen} onOpenChange={setSendOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Send Email to {displayName || subscriber.email}</DialogTitle>
            <p className="text-sm text-muted-foreground">{subscriber.email}</p>
          </DialogHeader>

          {success ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <CheckCircle className="w-10 h-10 text-green-600" />
              <p className="font-medium">Email sent successfully!</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Select an email template to send. Subscriber data
                (name, email) is automatically injected.
              </p>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {WAITLIST_TEMPLATES.map((tpl) => (
                  <div
                    key={tpl.name}
                    role="button"
                    onClick={() => setSelectedTemplate(tpl.name)}
                    className={`cursor-pointer rounded-md border p-3 transition-colors ${
                      selectedTemplate === tpl.name
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium">{tpl.label}</p>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {tpl.category}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {tpl.description}
                    </p>
                  </div>
                ))}
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
            </>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSendOpen(false)}>
              {success ? "Close" : "Cancel"}
            </Button>
            {!success && (
              <Button
                onClick={handleSendEmail}
                disabled={!selectedTemplate || sending}
              >
                {sending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Mail className="w-4 h-4 mr-2" />
                )}
                Send Email
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm Dialog ── */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove from Waitlist</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Remove{" "}
            <strong>{displayName || subscriber.email}</strong> (
            {displayName ? subscriber.email : ""}) from the waitlist?
            This cannot be undone.
          </p>
          {error && <p className="text-sm text-destructive mt-2">{error}</p>}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting && (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              )}
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
