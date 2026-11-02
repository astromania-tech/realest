import type { CaseDetailView } from "@/lib/trust/case-view";

export type CaseQueueScope = "all" | "led" | "none";
export type CaseDetailAccess = "full" | "visit" | "none";

const DESK = new Set(["admin", "reviewer", "supervisor"]);

/** Desk staff see every case. A team leader sees teams they lead. Members use My visits. */
export function caseQueueScope(role: string | null | undefined): CaseQueueScope {
  if (role && DESK.has(role)) return "all";
  if (role === "team_leader") return "led";
  return "none";
}

/** Field ops queue: desk sees every pending visit. A leader sees only their teams. */
export function fieldOpsQueueScope(role: string | null | undefined): CaseQueueScope {
  return caseQueueScope(role);
}

export function caseDetailAccess(input: {
  role: string | null | undefined;
  userId: string;
  teamLeaderId: string | null;
  memberIds: readonly string[];
  checkInOfficerId: string | null;
}): CaseDetailAccess {
  if (input.role && DESK.has(input.role)) return "full";
  const onTeam =
    input.teamLeaderId === input.userId ||
    input.memberIds.includes(input.userId) ||
    input.checkInOfficerId === input.userId;
  if (!onTeam) return "none";
  if (input.role === "team_leader" && input.teamLeaderId === input.userId) return "full";
  if (input.role === "team_member" || input.role === "team_leader") return "visit";
  return "none";
}

/** Roster and brief: desk, or someone already on that team. */
export function canReadFieldTeam(input: {
  role: string | null | undefined;
  userId: string;
  teamLeaderId: string | null;
  memberIds: readonly string[];
  checkInOfficerId: string | null;
}): boolean {
  if (!input.teamLeaderId && !input.checkInOfficerId && input.memberIds.length === 0) {
    return Boolean(input.role && DESK.has(input.role));
  }
  return caseDetailAccess(input) !== "none";
}

/** Visit staff get address, photos, and the brief. Listing documents stay on the desk. */
export function redactCaseDetailForVisit(detail: CaseDetailView): CaseDetailView {
  return {
    ...detail,
    description: null,
    ownerName: null,
    documents: [],
    findings: [],
    audit: [],
  };
}
