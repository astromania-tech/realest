/**
 * One-shot staff/sub-admin invite password setup.
 * Issuing a link sets pending; setting the password sets completed.
 * Reopening the same recovery URL after completed is refused.
 */

export const INVITE_SETUP_KEY = "invite_setup";

export type InviteSetupStatus = "none" | "pending" | "completed";

export type InviteSetupRecord = {
  status: "pending" | "completed";
  issued_at?: string;
  completed_at?: string;
};

export function readInviteSetupStatus(userMetadata: unknown): InviteSetupStatus {
  if (!userMetadata || typeof userMetadata !== "object" || Array.isArray(userMetadata)) {
    return "none";
  }
  const raw = (userMetadata as Record<string, unknown>)[INVITE_SETUP_KEY];
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return "none";
  const status = (raw as Record<string, unknown>).status;
  if (status === "pending" || status === "completed") return status;
  return "none";
}

/** Completed invites cannot use the setup-password page again. */
export function inviteSetupBlocked(status: InviteSetupStatus): boolean {
  return status === "completed";
}

export function inviteSetupPendingPatch(now = new Date()): {
  [INVITE_SETUP_KEY]: InviteSetupRecord;
} {
  return {
    [INVITE_SETUP_KEY]: {
      status: "pending",
      issued_at: now.toISOString(),
    },
  };
}

export function inviteSetupCompletedPatch(now = new Date()): {
  [INVITE_SETUP_KEY]: InviteSetupRecord;
} {
  return {
    [INVITE_SETUP_KEY]: {
      status: "completed",
      completed_at: now.toISOString(),
    },
  };
}

export const INVITE_SETUP_USED_MESSAGE =
  "This invite link has already been used. Ask an admin to send a new invitation.";
