import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireStaff } from "@/lib/auth/require-staff";
import {
  assignTeamLeader,
  confirmFieldTeam,
  listRankedStaffForProperty,
  readFieldTeam,
} from "@/lib/trust/field-team-store";
import { canAssignTeamLeader, canConfirmFieldTeam } from "@/lib/trust/field-team";

const assignSchema = z.object({
  action: z.literal("assign_leader"),
  team_leader_id: z.string().uuid(),
  visit_day: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  brief: z.string().max(2000).optional().nullable(),
  force_geo_override: z.boolean().optional(),
});

const confirmSchema = z.object({
  action: z.literal("confirm_team"),
  member_ids: z.array(z.string().uuid()).default([]),
  check_in_officer_id: z.string().uuid(),
  force_geo_override: z.boolean().optional(),
});

const bodySchema = z.discriminatedUnion("action", [assignSchema, confirmSchema]);

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const staff = await requireStaff();
  if (!staff.ok) {
    return NextResponse.json({ error: staff.error }, { status: staff.status });
  }

  const { id } = await context.params;
  const team = await readFieldTeam(id);

  let leaders: Awaited<ReturnType<typeof listRankedStaffForProperty>> | null = null;
  let members: Awaited<ReturnType<typeof listRankedStaffForProperty>> | null = null;
  try {
    if (canAssignTeamLeader(staff.role) || canConfirmFieldTeam(staff.role)) {
      leaders = await listRankedStaffForProperty({ propertyId: id, kinds: "leaders" });
    }
    if (canConfirmFieldTeam(staff.role)) {
      members = await listRankedStaffForProperty({ propertyId: id, kinds: "members" });
    }
  } catch {
    return NextResponse.json({ error: "Property not found." }, { status: 404 });
  }

  const property = leaders?.property ?? members?.property ?? null;

  return NextResponse.json({
    team,
    property,
    leaders: leaders?.candidates ?? [],
    members: members?.candidates ?? [],
    recommendedLeaderIds: leaders?.recommendedIds ?? [],
    recommendedMemberIds: members?.recommendedIds ?? [],
    capabilities: {
      assignLeader: canAssignTeamLeader(staff.role),
      confirmTeam: canConfirmFieldTeam(staff.role),
      isAssignedLeader: team?.teamLeaderId === staff.userId,
      canForceGeoOverride: staff.role === "admin",
    },
  });
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const staff = await requireStaff();
  if (!staff.ok) {
    return NextResponse.json({ error: staff.error }, { status: staff.status });
  }

  const { id } = await context.params;
  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid field team request." }, { status: 400 });
  }

  if (parsed.data.action === "assign_leader") {
    const result = await assignTeamLeader({
      propertyId: id,
      actorId: staff.userId,
      actorRole: staff.role,
      teamLeaderId: parsed.data.team_leader_id,
      visitDay: parsed.data.visit_day,
      brief: parsed.data.brief,
      forceGeoOverride: parsed.data.force_geo_override,
    });
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    return NextResponse.json({ success: true, team: result.team });
  }

  const result = await confirmFieldTeam({
    propertyId: id,
    actorId: staff.userId,
    actorRole: staff.role,
    memberIds: parsed.data.member_ids,
    checkInOfficerId: parsed.data.check_in_officer_id,
    forceGeoOverride: parsed.data.force_geo_override,
  });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ success: true, team: result.team });
}
