"use client";

import { useState, type ChangeEvent } from "react";
import { Card, Button } from "@heroui/react";
import { useRouter } from "next/navigation";
import {
  INVITABLE_STAFF_ROLES,
  STAFF_ROLE_LABELS,
  type InvitableStaffRole,
} from "@/lib/auth/staff-invite";
import { StaffLocationFields } from "@/components/admin/StaffLocationFields";

export function StaffInviteForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<InvitableStaffRole>("team_member");
  const [state, setState] = useState("");
  const [lga, setLga] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

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
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to invite staff");
      }

      const modeLabel = data.mode === "promoted" ? "promoted and notified" : "invited";
      setSuccess(
        `${fullName} was ${modeLabel} as ${STAFF_ROLE_LABELS[role]} in ${lga}, ${state}.`,
      );
      setEmail("");
      setFullName("");
      setRole("team_member");
      setState("");
      setLga("");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="p-4 sm:p-6">
      <form onSubmit={handleSubmit} className="min-w-0 space-y-4">
        <div className="min-w-0">
          <label className="mb-1 block text-sm font-medium" htmlFor="staff-full-name">
            Full name
          </label>
          <input
            id="staff-full-name"
            className="w-full min-w-0 rounded-md border border-[var(--border)] bg-background px-3 py-2.5 text-base sm:py-2 sm:text-sm"
            value={fullName}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setFullName(e.target.value)}
            placeholder="Chioma Adeyemi"
            required
            autoComplete="name"
          />
        </div>

        <div className="min-w-0">
          <label className="mb-1 block text-sm font-medium" htmlFor="staff-email">
            Email
          </label>
          <input
            id="staff-email"
            className="w-full min-w-0 rounded-md border border-[var(--border)] bg-background px-3 py-2.5 text-base sm:py-2 sm:text-sm"
            type="email"
            value={email}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            placeholder="chioma@example.ng"
            required
            autoComplete="email"
            inputMode="email"
          />
        </div>

        <div className="min-w-0">
          <label className="mb-1 block text-sm font-medium" htmlFor="staff-role">
            Role
          </label>
          <select
            id="staff-role"
            className="w-full min-w-0 rounded-md border border-[var(--border)] bg-background px-3 py-2.5 text-base sm:py-2 sm:text-sm"
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
          idPrefix="staff-form"
        />

        {error ? (
          <div className="break-words rounded-md border border-danger-200 bg-danger-50 p-3 text-sm text-danger">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="break-words rounded-md border border-success-200 bg-success-50 p-3 text-sm text-success">
            {success}
          </div>
        ) : null}

        <Button className="w-full sm:w-auto" variant="secondary" type="submit" isDisabled={loading}>
          {loading ? "Sending invitation…" : "Send invitation"}
        </Button>
      </form>
    </Card>
  );
}
