import { prisma } from "@/lib/prisma";
import { nextCaseState } from "@/lib/trust/case";
import { openDeskCase, setCaseState, readStoredVisit } from "@/lib/trust/visit-store";
import { notifyStaff, notifyStaffMany } from "@/lib/notifications/staff-notify";
import {
  assignTeamLeaderAllowed,
  confirmFieldTeamAllowed,
} from "@/lib/trust/field-team";
import {
  pickAutoRecommendedOfficerIds,
  rankOfficersForProperty,
  readStaffOpsLocation,
  type OfficerCandidate,
} from "@/lib/trust/officer-ops";

export type FieldTeamView = {
  propertyId: string;
  teamLeaderId: string;
  teamLeaderName: string | null;
  checkInOfficerId: string;
  checkInOfficerName: string | null;
  visitDay: string;
  assignedBy: string;
  brief: string | null;
  confirmedAt: string | null;
  memberIds: string[];
  members: Array<{ id: string; full_name: string | null; role: string }>;
};

type TeamRow = {
  property_id: string;
  team_leader_id: string;
  check_in_officer_id: string;
  visit_day: Date;
  assigned_by: string;
  brief: string | null;
  confirmed_at: Date | null;
  leader_name: string | null;
  officer_name: string | null;
};

function dayString(value: Date | string): string {
  if (typeof value === "string") return value.slice(0, 10);
  return value.toISOString().slice(0, 10);
}

export async function readFieldTeam(propertyId: string): Promise<FieldTeamView | null> {
  const teams = await prisma.$queryRaw<TeamRow[]>`
    select
      t.property_id::text as property_id,
      t.team_leader_id::text as team_leader_id,
      t.check_in_officer_id::text as check_in_officer_id,
      t.visit_day,
      t.assigned_by::text as assigned_by,
      t.brief,
      t.confirmed_at,
      l.full_name as leader_name,
      o.full_name as officer_name
    from public.property_field_teams t
    left join public.users l on l.id = t.team_leader_id
    left join public.users o on o.id = t.check_in_officer_id
    where t.property_id = ${propertyId}::uuid
  `;
  const team = teams[0];
  if (!team) return null;

  const members = await prisma.$queryRaw<
    Array<{ id: string; full_name: string | null; role: string }>
  >`
    select u.id::text as id, u.full_name, u.role::text as role
    from public.property_field_team_members m
    join public.users u on u.id = m.user_id
    where m.property_id = ${propertyId}::uuid
    order by u.full_name asc nulls last
  `;

  return {
    propertyId: team.property_id,
    teamLeaderId: team.team_leader_id,
    teamLeaderName: team.leader_name,
    checkInOfficerId: team.check_in_officer_id,
    checkInOfficerName: team.officer_name,
    visitDay: dayString(team.visit_day),
    assignedBy: team.assigned_by,
    brief: team.brief,
    confirmedAt: team.confirmed_at ? team.confirmed_at.toISOString() : null,
    memberIds: members.map((m) => m.id),
    members,
  };
}

export async function listFieldOpsQueue(limit = 40): Promise<
  Array<{
    id: string;
    title: string;
    address: string;
    city: string;
    visitDay: string | null;
    teamLeaderName: string | null;
    confirmed: boolean;
    officerName: string | null;
  }>
> {
  const rows = await prisma.$queryRaw<
    Array<{
      id: string;
      title: string;
      address: string;
      city: string;
      visit_day: Date | null;
      leader_name: string | null;
      confirmed_at: Date | null;
      officer_name: string | null;
    }>
  >`
    select
      p.id::text as id,
      p.title,
      p.address,
      p.city,
      coalesce(t.visit_day, p.vetting_visit_on) as visit_day,
      l.full_name as leader_name,
      t.confirmed_at,
      o.full_name as officer_name
    from public.properties p
    left join public.property_field_teams t on t.property_id = p.id
    left join public.users l on l.id = t.team_leader_id
    left join public.users o on o.id = coalesce(t.check_in_officer_id, p.vetting_officer_id)
    where p.status = 'pending_vetting'
    order by coalesce(t.visit_day, p.vetting_visit_on) asc nulls last, p.updated_at desc
    limit ${limit}
  `;
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    address: row.address,
    city: row.city,
    visitDay: row.visit_day ? dayString(row.visit_day) : null,
    teamLeaderName: row.leader_name,
    confirmed: Boolean(row.confirmed_at),
    officerName: row.officer_name,
  }));
}

async function openVisitCountsByUser(): Promise<Map<string, number>> {
  const rows = await prisma.$queryRaw<Array<{ user_id: string; open_count: bigint | number }>>`
    with open_props as (
      select p.id
      from public.properties p
      left join public.property_visit_checks c on c.property_id = p.id
      where p.status = 'pending_vetting'
        and c.checked_in_at is null
    ),
    involved as (
      select o.id as property_id, p.vetting_officer_id as user_id
      from open_props o
      join public.properties p on p.id = o.id
      where p.vetting_officer_id is not null
      union
      select o.id, t.team_leader_id
      from open_props o
      join public.property_field_teams t on t.property_id = o.id
      union
      select o.id, m.user_id
      from open_props o
      join public.property_field_team_members m on m.property_id = o.id
    )
    select user_id::text as user_id, count(distinct property_id)::int as open_count
    from involved
    where user_id is not null
    group by user_id
  `;
  const map = new Map<string, number>();
  for (const row of rows) {
    map.set(row.user_id, Number(row.open_count));
  }
  return map;
}

export async function listStaffCandidates(kinds: "leaders" | "members") {
  const roles =
    kinds === "leaders"
      ? (["team_leader", "admin", "supervisor"] as const)
      : (["team_member", "team_leader", "admin", "supervisor", "reviewer"] as const);
  return prisma.users.findMany({
    where: {
      role: { in: [...roles] },
      is_active: true,
      deleted_at: null,
    },
    select: {
      id: true,
      full_name: true,
      role: true,
      ops_state: true,
      ops_lga: true,
      ops_state_code: true,
    },
    orderBy: { full_name: "asc" },
  });
}

export async function listRankedStaffForProperty(input: {
  propertyId: string;
  kinds: "leaders" | "members";
}): Promise<{
  property: { id: string; title: string; city: string; state: string | null };
  candidates: OfficerCandidate[];
  recommendedIds: string[];
}> {
  const property = await prisma.properties.findUnique({
    where: { id: input.propertyId },
    select: { id: true, title: true, city: true, state: true },
  });
  if (!property) {
    throw new Error("Property not found");
  }

  const [users, openLoads] = await Promise.all([
    listStaffCandidates(input.kinds),
    openVisitCountsByUser(),
  ]);

  const officers = users.map((user) => {
    const ops = readStaffOpsLocation(user);
    return {
      id: user.id,
      full_name: user.full_name,
      role: user.role,
      state: ops?.state ?? null,
      lga: ops?.lga ?? null,
      openVisits: openLoads.get(user.id) ?? 0,
    };
  });

  const candidates = rankOfficersForProperty({
    propertyState: property.state,
    propertyCity: property.city,
    officers,
  });

  return {
    property: {
      id: property.id,
      title: property.title,
      city: property.city,
      state: property.state,
    },
    candidates,
    recommendedIds: pickAutoRecommendedOfficerIds(candidates, 3),
  };
}

export async function assignTeamLeader(input: {
  propertyId: string;
  actorId: string;
  actorRole: string;
  teamLeaderId: string;
  visitDay: string;
  brief?: string | null;
  forceGeoOverride?: boolean;
}): Promise<{ ok: true; team: FieldTeamView } | { ok: false; error: string; status: number }> {
  const leader = await prisma.users.findUnique({
    where: { id: input.teamLeaderId },
    select: {
      role: true,
      is_active: true,
      full_name: true,
      ops_state: true,
      ops_lga: true,
      ops_state_code: true,
    },
  });
  if (!leader) {
    return { ok: false, error: "Choose a team leader.", status: 400 };
  }

  const property = await prisma.properties.findUnique({
    where: { id: input.propertyId },
    select: { id: true, status: true, title: true, state: true, city: true },
  });
  if (!property || property.status !== "pending_vetting") {
    return { ok: false, error: "Property not found or not eligible for field work.", status: 404 };
  }

  const leaderOps = readStaffOpsLocation(leader);
  const gate = assignTeamLeaderAllowed({
    actorRole: input.actorRole,
    leaderRole: leader.role,
    leaderActive: Boolean(leader.is_active),
    visitDay: input.visitDay,
    propertyState: property.state,
    leaderState: leaderOps?.state ?? null,
    forceGeoOverride: input.forceGeoOverride,
  });
  if (!gate.ok) return gate;

  const brief = input.brief?.trim() || null;

  await prisma.$executeRaw`
    insert into public.property_field_teams (
      property_id, team_leader_id, check_in_officer_id, visit_day, assigned_by, brief, confirmed_at, created_at, updated_at
    ) values (
      ${input.propertyId}::uuid,
      ${input.teamLeaderId}::uuid,
      ${input.teamLeaderId}::uuid,
      ${input.visitDay}::date,
      ${input.actorId}::uuid,
      ${brief},
      null,
      now(),
      now()
    )
    on conflict (property_id) do update set
      team_leader_id = excluded.team_leader_id,
      check_in_officer_id = excluded.team_leader_id,
      visit_day = excluded.visit_day,
      assigned_by = excluded.assigned_by,
      brief = excluded.brief,
      confirmed_at = null,
      updated_at = now()
  `;

  await prisma.$executeRaw`
    delete from public.property_field_team_members
    where property_id = ${input.propertyId}::uuid
  `;
  await prisma.$executeRaw`
    insert into public.property_field_team_members (property_id, user_id)
    values (${input.propertyId}::uuid, ${input.teamLeaderId}::uuid)
    on conflict do nothing
  `;

  await prisma.$executeRaw`
    update public.properties
    set vetting_visit_on = ${input.visitDay}::date,
        vetting_officer_id = null,
        updated_at = now()
    where id = ${input.propertyId}::uuid
      and status = 'pending_vetting'
  `;

  await openDeskCase(input.propertyId);

  await prisma.admin_audit_log.create({
    data: {
      actor_id: input.actorId,
      action: "assign_field_team_leader",
      target_id: input.propertyId,
      metadata: {
        team_leader_id: input.teamLeaderId,
        visit_day: input.visitDay,
        brief,
      },
    },
  });

  await notifyStaff({
    userId: input.teamLeaderId,
    type: "field_team_leader",
    title: "You lead a field visit",
    message: `Build the team for "${property.title}" on ${input.visitDay}.`,
    href: `/admin/validation/cases/${input.propertyId}`,
    propertyId: input.propertyId,
  });

  const team = await readFieldTeam(input.propertyId);
  if (!team) return { ok: false, error: "Team could not be loaded.", status: 500 };
  return { ok: true, team };
}

export async function confirmFieldTeam(input: {
  propertyId: string;
  actorId: string;
  actorRole: string;
  memberIds: string[];
  checkInOfficerId: string;
  forceGeoOverride?: boolean;
}): Promise<{ ok: true; team: FieldTeamView } | { ok: false; error: string; status: number }> {
  const existing = await readFieldTeam(input.propertyId);
  if (!existing) {
    return { ok: false, error: "Assign a team leader first.", status: 400 };
  }

  const property = await prisma.properties.findUnique({
    where: { id: input.propertyId },
    select: { id: true, status: true, title: true, state: true },
  });
  if (!property || property.status !== "pending_vetting") {
    return { ok: false, error: "Property not found or not eligible for field work.", status: 404 };
  }

  const candidateIds = Array.from(
    new Set([existing.teamLeaderId, ...input.memberIds, input.checkInOfficerId]),
  );
  const users = await prisma.users.findMany({
    where: { id: { in: candidateIds } },
    select: {
      id: true,
      role: true,
      is_active: true,
      ops_state: true,
      ops_lga: true,
      ops_state_code: true,
    },
  });
  const memberRoles: Record<string, { role: string; is_active: boolean; state: string | null }> = {};
  for (const row of users) {
    const ops = readStaffOpsLocation(row);
    memberRoles[row.id] = {
      role: row.role,
      is_active: Boolean(row.is_active),
      state: ops?.state ?? null,
    };
  }

  const gate = confirmFieldTeamAllowed({
    actorRole: input.actorRole,
    actorId: input.actorId,
    teamLeaderId: existing.teamLeaderId,
    memberIds: input.memberIds,
    checkInOfficerId: input.checkInOfficerId,
    memberRoles,
    propertyState: property.state,
    forceGeoOverride: input.forceGeoOverride,
  });
  if (!gate.ok) return gate;

  await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`
      update public.property_field_teams
      set check_in_officer_id = ${input.checkInOfficerId}::uuid,
          confirmed_at = now(),
          updated_at = now()
      where property_id = ${input.propertyId}::uuid
    `;
    await tx.$executeRaw`
      delete from public.property_field_team_members
      where property_id = ${input.propertyId}::uuid
    `;
    for (const userId of gate.memberIds) {
      await tx.$executeRaw`
        insert into public.property_field_team_members (property_id, user_id)
        values (${input.propertyId}::uuid, ${userId}::uuid)
      `;
    }
    await tx.$executeRaw`
      update public.properties
      set vetting_officer_id = ${input.checkInOfficerId}::uuid,
          vetting_visit_on = ${existing.visitDay}::date,
          updated_at = now()
      where id = ${input.propertyId}::uuid
        and status = 'pending_vetting'
    `;
  });

  await openDeskCase(input.propertyId);
  const opened = await readStoredVisit(input.propertyId);
  await setCaseState(input.propertyId, nextCaseState(opened.caseState, "assign"));

  await prisma.admin_audit_log.create({
    data: {
      actor_id: input.actorId,
      action: "confirm_field_team",
      target_id: input.propertyId,
      metadata: {
        team_leader_id: existing.teamLeaderId,
        check_in_officer_id: input.checkInOfficerId,
        member_ids: gate.memberIds,
        visit_day: existing.visitDay,
      },
    },
  });

  const notifyTargets = gate.memberIds.filter((id) => id !== input.actorId);
  await notifyStaffMany(
    notifyTargets.map((userId) => ({
      userId,
      type: userId === input.checkInOfficerId ? "field_check_in_officer" : "field_team_member",
      title:
        userId === input.checkInOfficerId
          ? "You check in at the pin"
          : "You are on a field visit",
      message:
        userId === input.checkInOfficerId
          ? `You are the check-in officer for "${property.title}" on ${existing.visitDay}.`
          : `Join the field team for "${property.title}" on ${existing.visitDay}.`,
      href:
        userId === input.checkInOfficerId
          ? `/field/visit/${input.propertyId}`
          : `/admin/validation/cases/${input.propertyId}`,
      propertyId: input.propertyId,
    })),
  );

  const team = await readFieldTeam(input.propertyId);
  if (!team) return { ok: false, error: "Team could not be loaded.", status: 500 };
  return { ok: true, team };
}

/** Visits where the user is check-in officer or a confirmed team member. */
export async function listMyFieldAssignments(userId: string): Promise<
  Array<{ id: string; title: string; address: string; city: string; visitDay: string | null; roleOnTeam: string }>
> {
  const rows = await prisma.$queryRaw<
    Array<{
      id: string;
      title: string;
      address: string;
      city: string;
      visit_day: Date | null;
      role_on_team: string;
    }>
  >`
    select distinct on (p.id)
      p.id::text as id,
      p.title,
      p.address,
      p.city,
      coalesce(t.visit_day, p.vetting_visit_on) as visit_day,
      case
        when t.check_in_officer_id = ${userId}::uuid or p.vetting_officer_id = ${userId}::uuid then 'check_in'
        when t.team_leader_id = ${userId}::uuid then 'leader'
        else 'member'
      end as role_on_team
    from public.properties p
    left join public.property_field_teams t on t.property_id = p.id
    left join public.property_field_team_members m on m.property_id = p.id and m.user_id = ${userId}::uuid
    where p.status = 'pending_vetting'
      and (
        p.vetting_officer_id = ${userId}::uuid
        or t.team_leader_id = ${userId}::uuid
        or m.user_id is not null
      )
    order by p.id, coalesce(t.visit_day, p.vetting_visit_on) asc nulls last
  `;
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    address: row.address,
    city: row.city,
    visitDay: row.visit_day ? dayString(row.visit_day) : null,
    roleOnTeam: row.role_on_team,
  }));
}
