/**
 * Property Detail Page — Server Component wrapper
 *
 * Exports `generateMetadata` for dynamic per-property SEO/OG metadata,
 * then delegates all interactive rendering to the Client Component.
 *
 * Data source: Prisma (same client used by /api/properties/[id]/public)
 * Mirrors the owner-side public route — listing_source: { not: "agent" }
 */
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import PropertyDetailsPage from "./PropertyDetailClient";

type PageProps = { params: Promise<{ id: string }> };

const LISTING_TYPE_LABEL: Record<string, string> = {
  for_sale: "For Sale",
  for_rent: "For Rent",
  for_lease: "For Lease",
  short_let: "Short Let",
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;

  const property = await prisma.properties
    .findFirst({
      where: { id, status: "live", listing_source: { not: "agent" } },
      select: {
        title: true,
        description: true,
        city: true,
        state: true,
        property_type: true,
        listing_type: true,
        bedrooms: true,
        bathrooms: true,
        property_media: {
          where: { is_featured: true },
          orderBy: { display_order: "asc" },
          take: 1,
          select: { media_url: true },
        },
      },
    })
    .catch(() => null);

  if (!property) {
    return {
      title: "Property Not Found | RealEST",
      description: "This property listing is no longer available on RealEST.",
      robots: { index: false },
    };
  }

  const location = [property.city, property.state].filter(Boolean).join(", ");

  const typeLabel = (property.property_type ?? "Property")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  const beds = property.bedrooms;
  const baths = property.bathrooms ? Number(property.bathrooms) : null;
  const specParts = [
    beds ? `${beds}-Bed` : null,
    baths ? `${baths}-Bath` : null,
    typeLabel,
  ]
    .filter(Boolean)
    .join(" ");

  const listingLabel = LISTING_TYPE_LABEL[property.listing_type ?? ""] ?? "";
  const baseTitle =
    property.title ?? `${specParts}${location ? " in " + location : ""}`;
  const title = `${baseTitle}${listingLabel ? " · " + listingLabel : ""} | RealEST`;

  const description = property.description
    ? property.description.slice(0, 155)
    : `Verified ${specParts.toLowerCase()}${location ? " in " + location : ""} on RealEST. View photos, pricing and contact the owner directly.`;

  const ogImageUrl = property.property_media?.[0]?.media_url ?? undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://realest.ng/property/${id}`,
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

export default function PropertyPage() {
  return <PropertyDetailsPage />;
}
