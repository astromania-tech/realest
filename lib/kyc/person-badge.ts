import { YOUVERIFY_PROVIDER, type ListingKycRow } from "@/lib/kyc/types";

export type PersonBadge = "verified" | "pending" | "rejected" | "none";

export type PersonKycRow = ListingKycRow & {
  rejection_reason?: string | null;
};

/**
 * The person badge is the Youverify row for that owner or agent.
 * An approved row is a matched identity. It is not a verified listing.
 */
export function personBadgeFromKyc(role: "owner" | "agent", rows: PersonKycRow[]): PersonBadge {
  const mine = rows.filter((row) => row.user_type === role && row.kyc_provider === YOUVERIFY_PROVIDER);
  if (mine.some((row) => row.status === "approved")) return "verified";
  if (mine.some((row) => row.status === "pending")) return "pending";
  if (mine.some((row) => row.status === "rejected")) return "rejected";
  return "none";
}

export function personKycReason(role: "owner" | "agent", rows: PersonKycRow[]): string | null {
  if (personBadgeFromKyc(role, rows) === "verified") return null;
  const rejected = rows.find(
    (row) =>
      row.user_type === role &&
      row.kyc_provider === YOUVERIFY_PROVIDER &&
      row.status === "rejected" &&
      row.rejection_reason,
  );
  return rejected?.rejection_reason ?? null;
}

export function personKycMessage(badge: PersonBadge, reason: string | null): string {
  if (badge === "verified") return "Youverify matched this identity. This badge is for the person, not a listing.";
  if (badge === "pending") return "Youverify is still checking this identity.";
  if (reason === "not_found") return "Youverify did not find this record.";
  if (reason === "company_not_active") return "Youverify found the company, and it is not active.";
  if (reason === "verification_failed") return "Youverify could not complete this check.";
  if (badge === "rejected") return "Youverify did not approve this identity.";
  return "";
}
