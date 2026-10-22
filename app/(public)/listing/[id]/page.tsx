/**
 * Listing Detail Page — Server Component wrapper
 *
 * Loads the public payload once (shared with generateMetadata via React.cache)
 * and passes it into the client island so the browser does not re-fetch.
 */
import type { Metadata } from "next";
import {
  loadPublicPropertyDetail,
  publicPropertyMetadataFields,
} from "@/lib/listings/load-public-property";
import ListingDetailsPage from "./ListingDetailClient";

type PageProps = { params: Promise<{ id: string }> };

const LISTING_TYPE_LABEL: Record<string, string> = {
  for_sale: "For Sale",
  sale: "For Sale",
  for_rent: "For Rent",
  rent: "For Rent",
  for_lease: "For Lease",
  lease: "For Lease",
  short_let: "Short Let",
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const listing = await loadPublicPropertyDetail(id, "agent");

  if (!listing) {
    return {
      title: "Listing Not Found | RealEST",
      description: "This agent listing is no longer available on RealEST.",
      robots: { index: false },
    };
  }

  const fields = publicPropertyMetadataFields(listing);
  const location = [fields.city, fields.state].filter(Boolean).join(", ");

  const typeLabel = (fields.property_type ?? "Property")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  const beds = fields.bedrooms;
  const baths = fields.bathrooms ? Number(fields.bathrooms) : null;
  const specParts = [
    beds ? `${beds}-Bed` : null,
    baths ? `${baths}-Bath` : null,
    typeLabel,
  ]
    .filter(Boolean)
    .join(" ");

  const listingLabel = LISTING_TYPE_LABEL[fields.listing_type ?? ""] ?? "";
  const agentName = fields.agentName;

  const baseTitle =
    fields.title ?? `${specParts}${location ? " in " + location : ""}`;
  const title = `${baseTitle}${listingLabel ? " · " + listingLabel : ""} | RealEST`;

  const description = fields.description
    ? fields.description.slice(0, 155)
    : `Verified ${specParts.toLowerCase()}${location ? " in " + location : ""} listed by ${agentName ?? "a verified agent"} on RealEST.`;

  const ogImageUrl = fields.ogImageUrl;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://realest.ng/listing/${id}`,
      siteName: "RealEST Connect",
      type: "website",
      locale: "en_NG",
      ...(ogImageUrl && {
        images: [{ url: ogImageUrl, width: 1200, height: 630, alt: baseTitle }],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(ogImageUrl && { images: [ogImageUrl] }),
    },
  };
}

export default async function ListingPage({ params }: PageProps) {
  const { id } = await params;
  const initialProperty = await loadPublicPropertyDetail(id, "agent");
  return <ListingDetailsPage initialProperty={initialProperty} propertyId={id} />;
}
