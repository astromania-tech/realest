import {
  inviteSetupBlocked,
  inviteSetupCompletedPatch,
  INVITE_SETUP_USED_MESSAGE,
  readInviteSetupStatus,
  type InviteSetupStatus,
} from "@/lib/auth/invite-setup";

export type CompleteInviteSetupInput = {
  userId: string;
  password: string;
  userMetadata: unknown;
};

export type CompleteInviteSetupDecision =
  | { ok: true; status: InviteSetupStatus }
  | { ok: false; error: string; status: 400 | 403 };

/** Pure gate: only pending invites may set a password through this path. */
export function completeInviteSetupAllowed(
  input: Pick<CompleteInviteSetupInput, "password" | "userMetadata"> & {
    passwordValid: boolean;
  },
): CompleteInviteSetupDecision {
  if (!input.passwordValid) {
    return {
      ok: false,
      error: "Password does not meet security requirements.",
      status: 400,
    };
  }
  const status = readInviteSetupStatus(input.userMetadata);
  if (inviteSetupBlocked(status)) {
    return { ok: false, error: INVITE_SETUP_USED_MESSAGE, status: 403 };
  }
  if (status !== "pending") {
    return {
      ok: false,
      error: "This page is only for pending staff invitations.",
      status: 403,
    };
  }
  return { ok: true, status };
}

export function inviteSetupCompletedMetadata(
  existingMetadata: Record<string, unknown> | null | undefined,
  now = new Date(),
): Record<string, unknown> {
  return {
    ...(existingMetadata ?? {}),
    ...inviteSetupCompletedPatch(now),
  };
}
