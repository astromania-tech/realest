import { prisma } from "@/lib/prisma";
import { publicListingWhere } from "@/lib/listings/public-listing";

export type MarketplaceListingType = "for_sale" | "for_rent";

export type MarketplaceListingCard = {
  id: string;
  title: string;
  price: number;
  address: string;
  city: string;
  bedrooms: number | null;
  bathrooms: number | null;
  square_feet: number | null;
  listing_type: string;
  property_type: string;
  verification_status: string;
  thumbnailUrl: string | null;
};

/**
 * Narrow public card payload for /buy and /rent feature grids.
 */
export async function loadMarketplaceListings(input: {
  listingType: MarketplaceListingType;
  take?: number;
}): Promise<MarketplaceListingCard[]> {
  const take = Math.max(1, Math.min(input.take ?? 12, 24));

  const rows = await prisma.properties.findMany({
    where: {
      ...publicListingWhere,
      listing_type: input.listingType,
      listing_source: { not: "agent" },
    },
    select: {
      id: true,
      title: true,
      price: true,
      address: true,
      city: true,
      bedrooms: true,
      bathrooms: true,
      square_feet: true,
      listing_type: true,
      property_type: true,
      verification_status: true,
      property_media: {
        where: { is_featured: true },
        orderBy: { display_order: "asc" },
        take: 1,
        select: { media_url: true },
      },
    },
    orderBy: { created_at: "desc" },
    take,
  });

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    price: row.price ? Number(row.price) : 0,
    address: row.address,
    city: row.city,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms ? Number(row.bathrooms) : null,
    square_feet: row.square_feet,
    listing_type: row.listing_type,
    property_type: row.property_type,
    verification_status: row.verification_status,
    thumbnailUrl: row.property_media[0]?.media_url ?? null,
  }));
}
