import type { ListingKycRow } from "@/lib/kyc/types";
import { YOUVERIFY_PROVIDER } from "@/lib/kyc/types";

export const LISTING_KYC_ERROR =
  "Youverify identity approval is required before a listing can be saved.";

/**
 * Owner and agent drafts require a Youverify row with status approved.
 * Admin is not an identity subject on these routes.
 * Any other role, a missing row, or a non-approved row is 403.
 */
export function listingCreateAllowed(input: {
  role: string | null | undefined;
  rows: ListingKycRow[];
}): { ok: true } | { ok: false; status: 403; error: string } {
  if (input.role === "admin") return { ok: true };
  if (input.role !== "owner" && input.role !== "agent") {
    return { ok: false, status: 403, error: LISTING_KYC_ERROR };
  }
  const approved = input.rows.some(
    (row) =>
      row.user_type === input.role &&
      row.kyc_provider === YOUVERIFY_PROVIDER &&
      row.status === "approved",
  );
  if (!approved) return { ok: false, status: 403, error: LISTING_KYC_ERROR };
  return { ok: true };
}
