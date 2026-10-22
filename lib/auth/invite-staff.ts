import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { createServiceClient } from "@/lib/supabase/service";
import { createWithAuthDbCompensate } from "@/lib/auth/auth-db-compensate";
import { logAdminAction } from "@/lib/audit";
import { sendStaffInvitationEmail } from "@/lib/emailService";
import {
  staffInviteExistingDecision,
  staffInviteInputAllowed,
  type InvitableStaffRole,
} from "@/lib/auth/staff-invite";
import { NIGERIAN_STATES, getStateByName, getLGAsByState } from "@/lib/utils/nigerianLocations";

export function knownNigerianStateNames(): string[] {
  return NIGERIAN_STATES.map((state) => state.name);
}

export function lgasForStateName(stateName: string): string[] {
  const state = getStateByName(stateName);
  if (!state) return [];
  return getLGAsByState(state.code).map((lga) => lga.name);
}

export async function persistStaffInviteRecords(params: {
  userId: string;
  email: string;
  fullName: string;
  role: InvitableStaffRole;
  state: string;
  lga: string;
}) {
  const { userId, email, fullName, role, state, lga } = params;
  const stateCode = getStateByName(state)?.code ?? null;

  await prisma.$transaction([
    prisma.users.upsert({
      where: { id: userId },
      create: {
        id: userId,
        email,
        full_name: fullName,
        role,
        ops_state: state,
        ops_lga: lga,
        ops_state_code: stateCode,
      },
      update: {
        email,
        full_name: fullName,
        role,
        ops_state: state,
        ops_lga: lga,
        ops_state_code: stateCode,
      },
    }),
    prisma.profiles.upsert({
      where: { id: userId },
      create: {
        id: userId,
        email,
        full_name: fullName,
      },
      update: {
        email,
        full_name: fullName,
      },
    }),
  ]);
}

export type InviteStaffResult =
  | { ok: true; userId: string; mode: "created" | "promoted" }
  | { ok: false; error: string; status: 400 | 409 | 500 };

export async function inviteStaff(input: {
  actorId: string;
  actorName: string;
  email: string;
  fullName: string;
  role: string;
  state: string;
  lga: string;
}): Promise<InviteStaffResult> {
  const parsed = staffInviteInputAllowed({
    email: input.email,
    fullName: input.fullName,
    role: input.role,
    state: input.state,
    lga: input.lga,
    knownStateNames: knownNigerianStateNames(),
  });
  if (!parsed.ok) {
    return { ok: false, error: parsed.error, status: 400 };
  }

  const existing = await prisma.users.findFirst({
    where: { email: parsed.email, deleted_at: null },
    select: { id: true, role: true, full_name: true },
  });

  const service = createServiceClient();

  if (existing) {
    const decision = staffInviteExistingDecision({
      existingRole: existing.role,
      requestedRole: parsed.role,
    });
    if (decision.action !== "promote") {
      return { ok: false, error: decision.error, status: decision.status };
    }

    await persistStaffInviteRecords({
      userId: existing.id,
      email: parsed.email,
      fullName: parsed.fullName || existing.full_name || parsed.email,
      role: parsed.role,
      state: parsed.state,
      lga: parsed.lga,
    });

    const { data: resetData, error: resetError } = await service.auth.admin.generateLink({
      type: "recovery",
      email: parsed.email,
    });
    if (resetError || !resetData.properties?.action_link) {
      return { ok: false, error: "Role updated, but the invite link could not be generated.", status: 500 };
    }

    await sendStaffInvitationEmail({
      email: parsed.email,
      full_name: parsed.fullName,
      inviter_name: input.actorName,
      reset_link: resetData.properties.action_link,
      role: parsed.role,
      mode: "promoted",
    });

    await logAdminAction({
      actor_id: input.actorId,
      action: "invite_staff",
      target_id: existing.id,
      metadata: {
        email: parsed.email,
        full_name: parsed.fullName,
        role: parsed.role,
        mode: "promoted",
        previous_role: existing.role,
        state: parsed.state,
        lga: parsed.lga,
      },
    });

    return { ok: true, userId: existing.id, mode: "promoted" };
  }

  const securePassword = randomBytes(32).toString("hex");
  const provisioned = await createWithAuthDbCompensate({
    createAuthUser: async () => {
      const { data: created, error: authError } = await service.auth.admin.createUser({
        email: parsed.email,
        password: securePassword,
        email_confirm: true,
        user_metadata: {
          full_name: parsed.fullName,
          user_type: parsed.role,
          operating_state: parsed.state,
          operating_lga: parsed.lga,
        },
      });
      if (authError) throw new Error(authError.message);
      const id = created.user?.id;
      if (!id) throw new Error("User creation failed");
      return { userId: id };
    },
    persistDb: async (userId) => {
      await persistStaffInviteRecords({
        userId,
        email: parsed.email,
        fullName: parsed.fullName,
        role: parsed.role,
        state: parsed.state,
        lga: parsed.lga,
      });
    },
    deleteAuthUser: async (userId) => {
      const { error: deleteError } = await service.auth.admin.deleteUser(userId);
      if (deleteError) {
        console.error("[staff-invite] Auth rollback deleteUser failed:", deleteError);
        throw deleteError;
      }
    },
  });

  if (!provisioned.ok) {
    const message =
      provisioned.error === "auth_create_failed"
        ? "Failed to create the staff auth account."
        : "Failed to save the staff database records.";
    return { ok: false, error: message, status: 500 };
  }

  const { data: resetData, error: resetError } = await service.auth.admin.generateLink({
    type: "recovery",
    email: parsed.email,
  });
  if (resetError || !resetData.properties?.action_link) {
    return { ok: false, error: "Staff created, but the invite link could not be generated.", status: 500 };
  }

  await sendStaffInvitationEmail({
    email: parsed.email,
    full_name: parsed.fullName,
    inviter_name: input.actorName,
    reset_link: resetData.properties.action_link,
    role: parsed.role,
    mode: "created",
  });

  await logAdminAction({
    actor_id: input.actorId,
    action: "invite_staff",
    target_id: provisioned.userId,
    metadata: {
      email: parsed.email,
      full_name: parsed.fullName,
      role: parsed.role,
      mode: "created",
      state: parsed.state,
      lga: parsed.lga,
    },
  });

  return { ok: true, userId: provisioned.userId, mode: "created" };
}

export async function listInvitedStaff() {
  return prisma.users.findMany({
    where: {
      role: { in: ["reviewer", "supervisor", "team_leader", "team_member"] },
      deleted_at: null,
    },
    select: {
      id: true,
      full_name: true,
      email: true,
      role: true,
      created_at: true,
      is_active: true,
      ops_state: true,
      ops_lga: true,
      ops_state_code: true,
    },
    orderBy: { created_at: "desc" },
  });
}
