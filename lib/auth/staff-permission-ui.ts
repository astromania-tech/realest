/** Default copy when a staff API refuses an action for role reasons. */
export const STAFF_PERMISSION_DENIED_MESSAGE =
  "You don't have permission to perform this operation. Ask a desk reviewer or admin if you need this done.";

export function isStaffPermissionDenied(status: number): boolean {
  return status === 403;
}

export function staffPermissionDeniedMessage(
  body: { error?: unknown } | null | undefined,
): string {
  const fromApi =
    body && typeof body.error === "string" && body.error.trim()
      ? body.error.trim()
      : "";
  return fromApi || STAFF_PERMISSION_DENIED_MESSAGE;
}
