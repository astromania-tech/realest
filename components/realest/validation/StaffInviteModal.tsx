"use client";

import { useState, type ChangeEvent } from "react";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BrandModalShell } from "@/components/realest/BrandModalShell";
import { StaffLocationFields } from "@/components/admin/StaffLocationFields";
import {
  INVITABLE_STAFF_ROLES,
  STAFF_ROLE_LABELS,
  type InvitableStaffRole,
} from "@/lib/auth/staff-invite";
import { CONNECT_CONTROL_CLASS, CONNECT_INPUT_CLASS } from "@/lib/styles/connect-form";

export function StaffInviteModal({
  isOpen,
  onClose,
  onInvited,
}: {
  isOpen: boolean;
  onClose: () => void;
  onInvited?: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<InvitableStaffRole>("team_member");
  const [state, setState] = useState("");
  const [lga, setLga] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [setupLink, setSetupLink] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    setSetupLink("");
    try {
      const res = await fetch("/api/admin/staff-invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          full_name: fullName,
          role,
          state,
          lga,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Failed to invite staff");
      const modeLabel = data.mode === "promoted" ? "promoted and notified" : "invited";
      setSuccess(
        `${fullName} was ${modeLabel} as ${STAFF_ROLE_LABELS[role]} in ${lga}, ${state}.`,
      );
      if (typeof data.setup_link === "string" && data.setup_link) {
        setSetupLink(data.setup_link);
      }
      setEmail("");
      setFullName("");
      setRole("team_member");
      setState("");
      setLga("");
      onInvited?.();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <BrandModalShell
      isOpen={isOpen}
      onClose={onClose}
      titleId="staff-invite-modal-title"
      descriptionId="staff-invite-modal-desc"
      maxWidthClass="max-w-lg"
      closeDisabled={loading}
    >
      <div className="space-y-5">
        <div className="text-center">
          <div className="mx-auto mb-3 inline-flex h-14 w-14 items-center justify-center rounded-md bg-linear-to-tl from-primary/20 to-accent/20">
            <UserPlus className="h-7 w-7 text-accent/80" />
          </div>
          <h2
            id="staff-invite-modal-title"
            className="text-2xl font-bold bg-linear-to-l from-primary to-accent bg-clip-text text-transparent"
          >
            Invite staff
          </h2>
          <p id="staff-invite-modal-desc" className="mt-1.5 text-sm text-muted-foreground">
            Include operating state and LGA so assignment can match property location.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium" htmlFor="modal-staff-name">
              Full name
            </label>
            <Input
              id="modal-staff-name"
              className={CONNECT_INPUT_CLASS}
              value={fullName}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setFullName(e.target.value)}
              required
              autoComplete="name"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium" htmlFor="modal-staff-email">
              Email
            </label>
            <Input
              id="modal-staff-email"
              type="email"
              className={CONNECT_INPUT_CLASS}
              value={email}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              required
              autoComplete="email"
              inputMode="email"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium" htmlFor="modal-staff-role">
              Role
            </label>
            <select
              id="modal-staff-role"
              className={CONNECT_CONTROL_CLASS}
              value={role}
              onChange={(e) => setRole(e.target.value as InvitableStaffRole)}
              required
            >
              {INVITABLE_STAFF_ROLES.map((value) => (
                <option key={value} value={value}>
                  {STAFF_ROLE_LABELS[value]}
                </option>
              ))}
            </select>
          </div>

          <StaffLocationFields
            state={state}
            lga={lga}
            onStateChange={setState}
            onLgaChange={setLga}
            idPrefix="modal-staff"
          />

          {error ? (
            <p className="break-words rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </p>
          ) : null}
          {success ? (
            <p className="break-words rounded-lg border border-success/30 bg-success/10 p-3 text-sm text-foreground">
              {success}
            </p>
          ) : null}
          {setupLink ? (
            <div className="space-y-2 rounded-lg border border-border bg-muted/40 p-3 text-sm">
              <p className="font-medium">Local setup link (email skipped)</p>
              <a
                href={setupLink}
                className="block break-all text-primary underline-offset-2 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {setupLink}
              </a>
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Button type="button" variant="outline" size="lg" className="w-full" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? "Sending…" : "Send invitation"}
            </Button>
          </div>
        </form>
      </div>
    </BrandModalShell>
  );
}
