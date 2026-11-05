/**
 * Public waitlist email lookup projection.
 * Existence + status only — no name, persona, referral, or queue fields.
 */
export type PublicWaitlistLookup = {
  exists: boolean;
  status?: string | null;
};

export function publicWaitlistLookupProjection(input: {
  exists: boolean;
  status?: string | null;
}): PublicWaitlistLookup {
  if (!input.exists) return { exists: false };
  return {
    exists: true,
    status: input.status ?? null,
  };
}
