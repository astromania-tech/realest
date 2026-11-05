import { lagosToday } from "@/lib/trust/assignment";
import { officerGeoAllowed } from "@/lib/trust/officer-ops";

export const FIELD_STAFF_ROLES = ["supervisor", "team_leader", "team_member"] as const;
export const DESK_STAFF_ROLES = ["admin", "reviewer", "supervisor"] as const;
export const TEAM_BUILDER_ROLES = ["admin", "supervisor", "team_leader"] as const;
export const LEADER_CANDIDATE_ROLES = ["team_leader", "admin", "supervisor"] as const;
export const MEMBER_CANDIDATE_ROLES = ["team_member", "team_leader", "admin", "supervisor", "reviewer"] as const;

export function canAssignTeamLeader(role: string | null | undefined): boolean {
  return role === "admin" || role === "supervisor" || role === "reviewer";
}

export function canConfirmFieldTeam(role: string | null | undefined): boolean {
  return role === "admin" || role === "supervisor" || role === "team_leader";
}

export function isFieldTeamMemberRole(role: string | null | undefined): boolean {
  return (
    role === "team_member" ||
    role === "team_leader" ||
    role === "admin" ||
    role === "supervisor" ||
    role === "reviewer"
  );
}

export function assignTeamLeaderAllowed(input: {
  actorRole: string;
  leaderRole: string;
  leaderActive: boolean;
  visitDay: string;
  today?: string;
  propertyState?: string | null;
  leaderState?: string | null;
  forceGeoOverride?: boolean;
}): { ok: true } | { ok: false; error: string; status: 400 | 403 } {
  if (!canAssignTeamLeader(input.actorRole)) {
    return { ok: false, error: "Only a supervisor, reviewer, or admin can assign a team leader.", status: 403 };
  }
  if (!input.leaderActive) {
    return { ok: false, error: "Choose an active team leader.", status: 400 };
  }
  if (!LEADER_CANDIDATE_ROLES.includes(input.leaderRole as (typeof LEADER_CANDIDATE_ROLES)[number])) {
    return { ok: false, error: "That user cannot lead a field team.", status: 400 };
  }
  const today = input.today ?? lagosToday();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.visitDay) || input.visitDay < today) {
    return { ok: false, error: "Choose a visit day that is today or later.", status: 400 };
  }
  if (input.propertyState !== undefined) {
    const geo = officerGeoAllowed({
      propertyState: input.propertyState ?? null,
      officerState: input.leaderState ?? null,
      actorRole: input.actorRole,
      forceOverride: Boolean(input.forceGeoOverride),
    });
    if (!geo.ok) return geo;
  }
  return { ok: true };
}

export function confirmFieldTeamAllowed(input: {
  actorRole: string;
  actorId: string;
  teamLeaderId: string;
  memberIds: string[];
  checkInOfficerId: string;
  memberRoles: Record<string, { role: string; is_active: boolean; state?: string | null }>;
  propertyState?: string | null;
  forceGeoOverride?: boolean;
}): { ok: true; memberIds: string[] } | { ok: false; error: string; status: 400 | 403 } {
  if (!canConfirmFieldTeam(input.actorRole)) {
    return { ok: false, error: "Only the team leader, supervisor, or admin can confirm this team.", status: 403 };
  }
  if (input.actorRole === "team_leader" && input.actorId !== input.teamLeaderId) {
    return { ok: false, error: "Only the assigned team leader can confirm this team.", status: 403 };
  }

  const unique = Array.from(new Set([input.teamLeaderId, ...input.memberIds, input.checkInOfficerId]));
  if (unique.length < 1) {
    return { ok: false, error: "Add at least the check-in officer.", status: 400 };
  }
  if (!unique.includes(input.checkInOfficerId)) {
    return { ok: false, error: "The check-in officer must be on the team.", status: 400 };
  }

  for (const userId of unique) {
    const row = input.memberRoles[userId];
    if (!row || !row.is_active) {
      return { ok: false, error: "Every team member must be an active staff user.", status: 400 };
    }
    if (!isFieldTeamMemberRole(row.role)) {
      return { ok: false, error: "A selected person cannot join a field team.", status: 400 };
    }
    if (input.propertyState !== undefined) {
      const geo = officerGeoAllowed({
        propertyState: input.propertyState ?? null,
        officerState: row.state ?? null,
        actorRole: input.actorRole,
        forceOverride: Boolean(input.forceGeoOverride),
      });
      if (!geo.ok) return geo;
    }
  }

  return { ok: true, memberIds: unique };
}
