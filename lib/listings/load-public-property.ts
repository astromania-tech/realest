import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { publicListingWhere, publicPersonCard } from "@/lib/listings/public-listing";
import { publicVisitRecord } from "@/lib/trust/visit";
import { readStoredVisit } from "@/lib/trust/visit-store";

export type PublicListingSource = "owner" | "agent";

export type PublicPropertyDetail = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  price_frequency: string | null;
  listing_type: string;
  listing_source: string | null;
  address: string;
  city: string;
  state: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  property_type: string;
  status: string;
  verification_status: string;
  created_at: Date | null;
  nepa_status: string | null;
  water_source: string | null;
  internet_type: string | null;
  security_type: string[];
  has_bq: boolean;
  property_details: {
    bedrooms: number | null;
    bathrooms: number | null;
    square_feet: number | null;
    lot_size: number | null;
    year_built: number | null;
    parking_spaces: number | null;
    furnished: boolean | null;
    pets_allowed: boolean | null;
    amenities: string[] | null;
    utilities_included: string[] | null;
    has_generator: boolean | null;
    has_pool: boolean | null;
    has_gym: boolean | null;
  } | null;
  property_media: Array<{
    id: string;
    media_type: string;
    file_url: string;
    file_name: string;
    is_primary: boolean;
  }>;
  owner: { id: string; full_name: string | null; avatar_url: string | null } | null;
  agent: {
    id: string;
    license_number: string | null;
    agency_name: string;
    specialization: string[] | null;
    verified: boolean;
    rating: number | null;
    agent_profile: { id: string; full_name: string | null; avatar_url: string | null } | null;
  } | null;
  visit_record: {
    visitedAt: string | null;
    checked: string[];
    statement: string;
  } | null;
};

/**
 * Shared public listing payload for /property and /listing pages + public API.
 * Wrapped in React.cache so generateMetadata + page share one DB round-trip.
 */
export const loadPublicPropertyDetail = cache(
  async (
    propertyId: string,
    source: PublicListingSource,
  ): Promise<PublicPropertyDetail | null> => {
    const isAgent = source === "agent";

    const property = await prisma.properties.findFirst({
      where: {
        id: propertyId,
        ...publicListingWhere,
        listing_source: isAgent ? "agent" : { not: "agent" },
      },
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        price_frequency: true,
        listing_type: true,
        listing_source: true,
        property_type: true,
        address: true,
        city: true,
        state: true,
        country: true,
        latitude: true,
        longitude: true,
        bedrooms: true,
        bathrooms: true,
        square_feet: true,
        year_built: true,
        status: true,
        verification_status: true,
        created_at: true,
        property_details: {
          select: {
            metadata: true,
            features: true,
            amenities: true,
            parking_spaces: true,
            has_pool: true,
          },
          take: 1,
        },
        property_media: {
          select: {
            id: true,
            media_type: true,
            media_url: true,
            file_name: true,
            display_order: true,
            is_featured: true,
          },
          orderBy: { display_order: "asc" },
          take: 24,
        },
        owners: {
          select: {
            id: true,
            profiles: {
              select: { id: true, full_name: true, avatar_url: true },
            },
          },
        },
        agents: {
          select: {
            id: true,
            license_number: true,
            agency_name: true,
            specialization: true,
            verified: true,
            rating: true,
            profiles: {
              select: { id: true, full_name: true, avatar_url: true },
            },
          },
        },
      },
    });

    if (!property) return null;

    const details = property.property_details?.[0] ?? null;
    const meta = (details?.metadata as Record<string, unknown>) ?? {};
    const features = (details?.features as Record<string, unknown>) ?? {};
    const amenitiesRaw = details?.amenities;

    const listingTypeMap: Record<string, string> = {
      for_rent: "rent",
      for_sale: "sale",
      for_lease: "lease",
    };
    const normalisedListingType =
      listingTypeMap[property.listing_type as string] ?? property.listing_type;

    const visit = await readStoredVisit(property.id);
    const visitRecord = publicVisitRecord({
      verified: property.verification_status === "verified",
      checkedInAt: visit.checkedInAt,
      voidedAt: visit.voidedAt,
      photoPath: visit.photoPath,
      distanceMeters: visit.distanceMeters,
    });

    return {
      id: property.id,
      title: property.title,
      description: property.description,
      price: property.price ? Number(property.price) : 0,
      price_frequency: property.price_frequency,
      listing_type: normalisedListingType,
      listing_source: property.listing_source,
      address: property.address,
      city: property.city,
      state: property.state,
      country: property.country,
      latitude: property.latitude ? Number(property.latitude) : null,
      longitude: property.longitude ? Number(property.longitude) : null,
      property_type: property.property_type,
      status: property.status,
      verification_status: property.verification_status,
      created_at: property.created_at,
      nepa_status: (meta.nepa_status as string) ?? null,
      water_source: (meta.water_source as string) ?? null,
      internet_type: (meta.internet_type as string) ?? null,
      security_type: (meta.security_type as string[]) ?? [],
      has_bq: (meta.has_bq as boolean) ?? false,
      property_details: details
        ? {
            bedrooms: property.bedrooms,
            bathrooms: property.bathrooms ? Number(property.bathrooms) : null,
            square_feet: property.square_feet ? Number(property.square_feet) : null,
            lot_size: (meta.lot_size as number) ?? null,
            year_built: property.year_built,
            parking_spaces: details.parking_spaces,
            furnished: (features.furnished as boolean) ?? null,
            pets_allowed: (features.pets_allowed as boolean) ?? null,
            amenities: Array.isArray(amenitiesRaw)
              ? (amenitiesRaw as string[])
              : amenitiesRaw && typeof amenitiesRaw === "object"
                ? Object.keys(amenitiesRaw as object)
                : null,
            utilities_included: (meta.utilities_included as string[]) ?? null,
            has_generator: (meta.has_generator as boolean) ?? false,
            has_pool: details.has_pool ?? false,
            has_gym: (meta.has_gym as boolean) ?? false,
          }
        : null,
      property_media: property.property_media.map((m) => ({
        id: m.id,
        media_type: m.media_type,
        file_url: m.media_url,
        file_name: m.file_name,
        is_primary: m.is_featured ?? false,
      })),
      owner:
        !isAgent && property.owners?.profiles
          ? publicPersonCard(property.owners.profiles)
          : null,
      agent:
        isAgent && property.agents
          ? {
              id: property.agents.id,
              license_number: property.agents.license_number,
              agency_name: property.agents.agency_name ?? "",
              specialization: property.agents.specialization,
              verified: property.agents.verified ?? false,
              rating: property.agents.rating ? Number(property.agents.rating) : null,
              agent_profile: publicPersonCard(property.agents.profiles),
            }
          : null,
      visit_record: visitRecord,
    };
  },
);

export function publicPropertyMetadataFields(property: PublicPropertyDetail) {
  return {
    title: property.title,
    description: property.description,
    city: property.city,
    state: property.state,
    property_type: property.property_type,
    listing_type: property.listing_type,
    bedrooms: property.property_details?.bedrooms ?? null,
    bathrooms: property.property_details?.bathrooms ?? null,
    ogImageUrl: property.property_media.find((m) => m.is_primary)?.file_url
      ?? property.property_media[0]?.file_url
      ?? undefined,
    agentName:
      property.agent?.agency_name ||
      property.agent?.agent_profile?.full_name ||
      null,
  };
}
