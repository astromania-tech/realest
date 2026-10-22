import type { StaffRole } from "@/lib/auth/roles";

/** Desk ML / duplicate / badge decisions — not field team members. */
export function canMakeDeskDecision(role: StaffRole): boolean {
  return role === "admin" || role === "reviewer";
}

/** Assign a field visit officer. */
export function canAssignFieldVisit(role: StaffRole): boolean {
  return role === "admin" || role === "supervisor" || role === "reviewer";
}

/** Flag issue / request correction / registry confirm at desk. */
export function canRunDeskVettingSupport(role: StaffRole): boolean {
  return role === "admin" || role === "reviewer";
}

export type VettingStaffAction =
  | "approve"
  | "reject"
  | "schedule"
  | "flag_issue"
  | "assign"
  | "check_in"
  | "request_correction"
  | "confirm_registry";

/**
 * Role gate for vetting actions. check_in is allowed for any staff;
 * the route still requires the caller to be the assigned officer.
 */
export function vettingActionAllowed(
  role: StaffRole,
  action: VettingStaffAction,
): boolean {
  switch (action) {
    case "assign":
      return canAssignFieldVisit(role);
    case "check_in":
      return true;
    case "approve":
    case "reject":
    case "schedule":
    case "flag_issue":
    case "request_correction":
    case "confirm_registry":
      return canMakeDeskDecision(role);
    default:
      return false;
  }
}
