/**
 * interpolateSubject
 *
 * Replaces `{{variable}}` placeholders in a subject string with recipient
 * data.  Used uniformly across:
 *   - campaign batch sends   (lib/emailBulkSender.ts — per-recipient)
 *   - single waitlist sends  (api/admin/waitlist/[id]/email)
 *   - direct emailService sends (via template .subject() which already has
 *     data, so interpolation there is a no-op safety net)
 *
 * Supported tokens (case-insensitive):
 *   {{firstName}}  — recipient's first name
 *   {{fullName}}   — recipient's full name
 *   {{email}}      — recipient's email address
 *
 * Unknown tokens are left unchanged so typos are visible in the sent subject.
 *
 * @example
 *   interpolateSubject('{{firstName}}, we built this for you', { firstName: 'Tunde' })
 *   // → "Tunde, we built this for you"
 */
export function interpolateSubject(
  subject: string,
  data: { firstName?: string; fullName?: string; email?: string },
): string {
  return subject.replace(/\{\{(\w+)\}\}/g, (_match, key: string) => {
    const lower = key.toLowerCase() as keyof typeof data;
    return data[lower] ?? _match; // leave placeholder intact if value missing
  });
}
