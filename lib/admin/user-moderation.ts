/**
 * Admin user moderation — maps actions onto schema fields that exist.
 * State lives on users.is_active. Reason/notes live in admin_audit_log only.
 */

export type ModerationAction = "suspend" | "unsuspend" | "ban" | "unban";

export function nextIsActive(
  action: ModerationAction,
  _currentIsActive: boolean,
): boolean {
  return action === "unsuspend" || action === "unban";
}

export function shouldUnlistNonLiveProperties(action: ModerationAction): boolean {
  return action === "suspend" || action === "ban";
}
