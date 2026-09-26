/**
 * Admin user moderation — maps actions onto schema fields that exist.
 * State lives on users.is_active. Reason/notes live in admin_audit_log only.
 */

export type ModerationAction = "suspend" | "unsuspend" | "ban" | "unban";

/**
 * Next users.is_active value after a moderation action.
 * suspend/ban → false (idempotent if already inactive).
 * unsuspend/unban → true (idempotent if already active).
 */
export function nextIsActive(
  action: ModerationAction,
  currentIsActive: boolean,
): boolean {
  if (action === "unsuspend" || action === "unban") {
    return true;
  }
  if (action === "suspend" || action === "ban") {
    return false;
  }
  return currentIsActive;
}

export function shouldUnlistNonLiveProperties(action: ModerationAction): boolean {
  return action === "suspend" || action === "ban";
}
