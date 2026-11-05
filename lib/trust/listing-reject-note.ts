/** Minimum length so owners get a real “why”, not a one-word shrug. */
export const LISTING_REJECT_NOTE_MIN = 12;

/**
 * Desk, field, and duplicate rejects all need a staff note.
 * Full note stays in audit; a scrubbed form goes to owner/agent email + inbox.
 */
export function listingRejectNoteAllowed(
  notes: string | undefined | null,
  options?: { label?: string; minLength?: number },
): { ok: true; note: string } | { ok: false; error: string } {
  const label = options?.label ?? "reject this listing";
  const minLength = options?.minLength ?? LISTING_REJECT_NOTE_MIN;
  const note = notes?.trim() ?? "";
  if (!note) {
    return {
      ok: false,
      error: `A short note is required to ${label}. The owner and agent will see a safe version of it.`,
    };
  }
  if (note.length < minLength) {
    return {
      ok: false,
      error: `Add a bit more detail (at least ${minLength} characters) so the owner understands why.`,
    };
  }
  return { ok: true, note };
}
