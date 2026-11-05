/** Owner My Listings cards. Status values are the property row, not the old mock labels. */

export type OwnerListingCard = {
  id: string;
  title: string;
  address: string;
  city: string;
  property_type: string;
  listing_type: string;
  price_frequency: string | null;
  price: number;
  status: string;
  verification_status: string;
  inquiries: number;
  images_count: number;
  documents_count: number;
};

export const OWNER_LISTING_FILTERS = [
  { key: "all", label: "All listings" },
  { key: "live", label: "Live" },
  { key: "review", label: "In review" },
  { key: "draft", label: "Drafts" },
  { key: "rejected", label: "Rejected" },
] as const;

export type OwnerListingFilter = (typeof OWNER_LISTING_FILTERS)[number]["key"];

const REVIEW_STATUSES = new Set(["pending_ml_validation", "pending_vetting"]);

export function ownerListingMatchesFilter(status: string, filter: string): boolean {
  if (filter === "all") return true;
  if (filter === "review") return REVIEW_STATUSES.has(status);
  return status === filter;
}

export function ownerListingStatusLabel(status: string): string {
  switch (status) {
    case "live":
      return "Live";
    case "pending_ml_validation":
      return "Document check";
    case "pending_vetting":
      return "Vetting";
    case "draft":
      return "Draft";
    case "rejected":
      return "Rejected";
    case "unlisted":
      return "Unlisted";
    default:
      return status;
  }
}

export function ownerListingPriceSuffix(
  listingType: string,
  frequency: string | null,
): string {
  if (frequency === "monthly") return "/month";
  if (frequency === "annual") return "/year";
  if (frequency === "nightly") return "/night";
  if (frequency === "sale" || listingType === "for_sale" || listingType === "sale") {
    return "";
  }
  if (listingType === "for_rent" || listingType === "rent") return "/year";
  return "";
}

export function toOwnerListingCard(row: {
  id: string;
  title: string;
  address: string;
  city: string;
  property_type: string;
  listing_type: string;
  price_frequency: string | null;
  price: { toString(): string } | number | string;
  status: string;
  verification_status: string;
  _count: {
    inquiries: number;
    property_media: number;
    property_documents: number;
  };
}): OwnerListingCard {
  return {
    id: row.id,
    title: row.title,
    address: row.address,
    city: row.city,
    property_type: row.property_type,
    listing_type: row.listing_type,
    price_frequency: row.price_frequency,
    price: Number(row.price),
    status: row.status,
    verification_status: row.verification_status,
    inquiries: row._count.inquiries,
    images_count: row._count.property_media,
    documents_count: row._count.property_documents,
  };
}
