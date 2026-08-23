/**
 * Listing Detail Page — Server Component wrapper
 *
 * Exports `generateMetadata` for dynamic per-listing SEO/OG metadata,
 * then delegates all interactive rendering to the Client Component.
 *
 * Data source: Prisma (same client used by /api/properties/[id]/public)
 * Mirrors the agent-side public route — listing_source: "agent"
 */
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
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

  const listing = await prisma.properties
    .findFirst({
      where: { id, status: "live", listing_source: "agent" },
      select: {
        title: true,
        description: true,
        city: true,
        state: true,
        property_type: true,
        listing_type: true,
        bedrooms: true,
        bathrooms: true,
        agents: {
          select: {
            agency_name: true,
            profiles: { select: { full_name: true } },
          },
        },
        property_media: {
          where: { is_featured: true },
          orderBy: { display_order: "asc" },
          take: 1,
          select: { media_url: true },
        },
      },
    })
    .catch(() => null);

  if (!listing) {
    return {
      title: "Listing Not Found | RealEST",
      description: "This agent listing is no longer available on RealEST.",
      robots: { index: false },
    };
  }

  const location = [listing.city, listing.state].filter(Boolean).join(", ");

  const typeLabel = (listing.property_type ?? "Property")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  const beds = listing.bedrooms;
  const baths = listing.bathrooms ? Number(listing.bathrooms) : null;
  const specParts = [
    beds ? `${beds}-Bed` : null,
    baths ? `${baths}-Bath` : null,
    typeLabel,
  ]
    .filter(Boolean)
    .join(" ");

  const listingLabel = LISTING_TYPE_LABEL[listing.listing_type ?? ""] ?? "";
  const agentName =
    listing.agents?.agency_name ||
    listing.agents?.profiles?.full_name ||
    null;

  const baseTitle =
    listing.title ?? `${specParts}${location ? " in " + location : ""}`;
  const title = `${baseTitle}${listingLabel ? " · " + listingLabel : ""} | RealEST`;

  const description = listing.description
    ? listing.description.slice(0, 155)
    : `Verified ${specParts.toLowerCase()}${location ? " in " + location : ""} listed by ${agentName ?? "a verified agent"} on RealEST.`;

  const ogImageUrl = listing.property_media?.[0]?.media_url ?? undefined;

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

export default function ListingPage() {
  return <ListingDetailsPage />;
}
