/**
 * Search Page — Server Component wrapper
 *
 * Exports `generateMetadata` that constructs SEO-friendly titles and
 * descriptions from the active URL search parameters, enabling Google
 * to index distinct landing pages for each filter combination
 * (e.g. "3-Bed Apartments For Rent in Lagos | RealEST").
 *
 * No DB query needed — metadata is derived entirely from searchParams.
 */
import type { Metadata } from "next";
import SearchPageContent from "./SearchPageClient";

type SearchProps = { searchParams: Promise<Record<string, string>> };

const LISTING_TYPE_LABEL: Record<string, string> = {
  for_rent: "For Rent",
  for_sale: "For Sale",
  for_lease: "For Lease",
  short_let: "Short Let",
};

const PROPERTY_TYPE_LABEL: Record<string, string> = {
  house: "Houses",
  apartment: "Apartments",
  duplex: "Duplexes",
  land: "Land",
  commercial: "Commercial Properties",
  office: "Office Spaces",
  hotel: "Hotels",
  bungalow: "Bungalows",
  self_contained: "Self-Contained Flats",
};

export async function generateMetadata({ searchParams }: SearchProps): Promise<Metadata> {
  const sp = await searchParams;

  const query = sp.q || sp.query || "";
  const state = sp.state || "";
  const propertyType = sp.property_type || "";
  const listingType = sp.listing_type || "";
  const bedrooms = sp.bedrooms ? `${sp.bedrooms}-Bed` : "";

  // Build subject  e.g. "3-Bed Apartments"
  const typeStr =
    PROPERTY_TYPE_LABEL[propertyType] ||
    (propertyType
      ? propertyType.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
      : "");
  const subjectParts = [bedrooms, typeStr || "Properties"].filter(Boolean);
  const subject = subjectParts.join(" ");

  // Build qualifier e.g. "For Rent"
  const qualifier = LISTING_TYPE_LABEL[listingType] ?? "";

  // Build location string
  const locationStr = state ? ` in ${state}` : " in Nigeria";

  // Build query context
  const queryContext = query ? ` matching "${query}"` : "";

  const fullSubject = [subject, qualifier].filter(Boolean).join(" ");
  const title = `${fullSubject}${locationStr}${queryContext} | RealEST`;
  const description = `Browse verified ${fullSubject.toLowerCase()}${locationStr} on RealEST. All listings are geo-verified and vetted by our team. Find your next home today.`;

  const canonicalUrl = new URL("https://realest.ng/search");
  if (query) canonicalUrl.searchParams.set("q", query);
  if (state) canonicalUrl.searchParams.set("state", state);
  if (propertyType) canonicalUrl.searchParams.set("property_type", propertyType);
  if (listingType) canonicalUrl.searchParams.set("listing_type", listingType);
  if (bedrooms) canonicalUrl.searchParams.set("bedrooms", sp.bedrooms);

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl.toString() },
    openGraph: {
      title,
      description,
      url: canonicalUrl.toString(),
      siteName: "RealEST",
      type: "website",
      locale: "en_NG",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default function SearchPage() {
  return <SearchPageContent />;
}
