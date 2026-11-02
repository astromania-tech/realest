/**
 * Ban sets deleted_at. That account cannot keep a session.
 * Suspension only flips is_active, and staff tools already refuse it.
 */
export function accountSignInClosed(row: {
  deleted_at?: Date | string | null;
} | null | undefined): boolean {
  if (!row) return false;
  return Boolean(row.deleted_at);
}
