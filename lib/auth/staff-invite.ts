/**
 * Admin-invitable Connect staff roles (not marketplace, not super-admin).
 * Super-admin stays on /admin/subadmins.
 */

import { resolveResendAction } from "@/lib/resend-key";

/** Production always emails. Locally (no RESEND_API_KEY) surface the link for testing. */
export function localStaffSetupLink(actionLink: string): string | undefined {
  if (resolveResendAction() !== "skip-local") return undefined;
  console.info(`[staff-invite] Local setup link (email skipped):\n${actionLink}`);
  return actionLink;
}

/** Where recovery links land after Supabase verify (invite password setup). */
export function staffInviteRedirectTo(
  env: { NEXT_PUBLIC_SITE_URL?: string; NEXT_PUBLIC_APP_URL?: string } = process.env,
): string {
  let base =
    env.NEXT_PUBLIC_SITE_URL ?? env.NEXT_PUBLIC_APP_URL ?? "http://127.0.0.1:3000";
  base = base.replace(/\/$/, "");
  // Local Supabase site_url is 127.0.0.1 — keep redirect host aligned.
  base = base.replace("://localhost:", "://127.0.0.1:");
  return `${base}/setup-password`;
}

export const INVITABLE_STAFF_ROLES = [
  "reviewer",
  "supervisor",
  "team_leader",
  "team_member",
] as const;

export type InvitableStaffRole = (typeof INVITABLE_STAFF_ROLES)[number];

export const STAFF_ROLE_LABELS: Record<InvitableStaffRole, string> = {
  reviewer: "Reviewer (desk)",
  supervisor: "Supervisor (field ops)",
  team_leader: "Team leader",
  team_member: "Team member (field)",
};

export const STAFF_ROLE_CAPABILITIES: Record<InvitableStaffRole, string[]> = {
  reviewer: [
    "Review verification cases and document findings",
    "Assign field team leaders for physical visits",
    "Decide after evidence and the pin check-in",
  ],
  supervisor: [
    "Run field operations for pending visits",
    "Assign team leaders per property case",
    "Confirm teams when needed",
  ],
  team_leader: [
    "Build the field team for assigned cases",
    "Designate who checks in at the pin",
    "Coordinate the visit day",
  ],
  team_member: [
    "Join confirmed field visits",
    "Check in at the pin when designated",
    "Record what you saw on site",
  ],
};

export function isInvitableStaffRole(role: string | null | undefined): role is InvitableStaffRole {
  return (
    role === "reviewer" ||
    role === "supervisor" ||
    role === "team_leader" ||
    role === "team_member"
  );
}

export function staffInviteInputAllowed(input: {
  email: string;
  fullName: string;
  role: string;
  state?: string;
  lga?: string;
  knownStateNames?: string[];
}):
  | {
      ok: true;
      email: string;
      fullName: string;
      role: InvitableStaffRole;
      state: string;
      lga: string;
    }
  | { ok: false; error: string } {
  const email = input.email.trim().toLowerCase();
  const fullName = input.fullName.trim();
  if (!email || !email.includes("@")) {
    return { ok: false, error: "Enter a valid email." };
  }
  if (fullName.length < 2) {
    return { ok: false, error: "Enter the person's full name." };
  }
  if (!isInvitableStaffRole(input.role)) {
    return { ok: false, error: "Choose a staff role (reviewer, supervisor, team leader, or team member)." };
  }
  const state = (input.state ?? "").trim();
  const lga = (input.lga ?? "").trim();
  if (!state) {
    return { ok: false, error: "Choose the officer's operating state." };
  }
  if (input.knownStateNames?.length) {
    const known = input.knownStateNames.some(
      (name) => name.trim().toLowerCase() === state.toLowerCase(),
    );
    if (!known) return { ok: false, error: "Choose a valid Nigerian state." };
  }
  if (lga.length < 2) {
    return { ok: false, error: "Enter the officer's LGA." };
  }
  return { ok: true, email, fullName, role: input.role, state, lga };
}

export function staffInviteHomePath(role: InvitableStaffRole): string {
  switch (role) {
    case "supervisor":
    case "team_leader":
      return "/admin/validation/field";
    case "team_member":
      return "/admin/validation/my-visits";
    case "reviewer":
    default:
      return "/admin/validation";
  }
}

/**
 * When the email already has a users row, decide create vs promote vs refuse.
 */
export function staffInviteExistingDecision(input: {
  existingRole: string;
  requestedRole: InvitableStaffRole;
}):
  | { action: "promote" }
  | { action: "noop"; error: string; status: 409 }
  | { action: "refuse_admin"; error: string; status: 409 } {
  if (input.existingRole === "admin") {
    return {
      action: "refuse_admin",
      error: "That account is already a super admin. Use Sub-Admins, not staff invite.",
      status: 409,
    };
  }
  if (input.existingRole === input.requestedRole) {
    return {
      action: "noop",
      error: "That person already has this staff role.",
      status: 409,
    };
  }
  return { action: "promote" };
}
