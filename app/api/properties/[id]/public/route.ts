import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import type { OpenApiMetadata } from "@/lib/openapi/route-metadata";

const propertyIdSchema = z.string().uuid("Invalid property ID");

/**
 * OpenAPI metadata for GET /api/properties/{id}/public
 * Retrieve public property or listing details
 */
export const openApiGET: OpenApiMetadata = {
  method: "get",
  summary: "Get public property details",
  description: "Retrieve public property or listing details. Public view is available only for published (live) properties. Can retrieve owner-listed properties or agent-created listings via source parameter.",
  tags: ["Properties"],
  parameters: [
    {
      name: "id",
      in: "path",
      required: true,
      schema: { type: "string", format: "uuid" },
      description: "Property ID",
    },
    {
      name: "source",
      in: "query",
      schema: { type: "string", enum: ["owner", "agent"], default: "owner" },
      description: "Property source: owner-listed or agent-created",
    },
  ],
  responses: {
    "200": {
      description: "Public property details with all media and owner/agent info",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              id: { type: "string", format: "uuid" },
              title: { type: "string" },
              description: { type: "string" },
              price: { type: "number" },
              state: { type: "string" },
              city: { type: "string" },
              bedrooms: { type: "integer" },
              bathrooms: { type: "integer" },
              media: { type: "array", items: { type: "object" } },
              owner: { type: "object" },
              agent: { type: "object" },
            },
          },
        },
      },
    },
    "404": { description: "Property not found or not published" },
  },
};

/**
 * GET /api/properties/[id]/public
 *
 * Public property/listing detail endpoint used by:
 *   - /property/[id]  → ?source=owner  (properties listed by owners)
 *   - /listing/[id]   → ?source=agent  (listings created by agents)
 *
 * Query params:
 *   source = "owner" (default) | "agent"
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const propertyIdResult = propertyIdSchema.safeParse(id);
    if (!propertyIdResult.success) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }
    const propertyId = propertyIdResult.data;
    const url = new URL(request.url);
    const source = url.searchParams.get("source") ?? "owner";
    const isAgent = source === "agent";

    const property = await prisma.properties.findFirst({
      where: {
        id: propertyId,
        status: "live",
        listing_source: isAgent ? "agent" : { not: "agent" },
      },
      include: {
        // property_details is one-to-many; take first row
        property_details: true,
        property_media: {
          select: {
            id: true,
            media_type: true,
            media_url: true,   // actual column name in DB
            file_name: true,
            display_order: true,
            is_featured: true, // actual column name (mapped → is_primary in response)
          },
          orderBy: { display_order: "asc" },
        },
        // Always include both, use only what's relevant
        owners: {
          include: {
            profiles: {
              select: { id: true, full_name: true, email: true, avatar_url: true, phone: true },
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
              select: { id: true, full_name: true, email: true, phone: true, avatar_url: true },
            },
          },
        },
      },
    });

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    // property_details is an array (one-to-many relation)
    const details = property.property_details?.[0] ?? null;
    const meta = (details?.metadata as Record<string, unknown>) ?? {};
    const features = (details?.features as Record<string, unknown>) ?? {};
    const amenitiesRaw = details?.amenities;

    // Normalise listing_type values (DB stores "for_rent", pages expect "rent" etc.)
    const listingTypeMap: Record<string, string> = {
      for_rent: "rent",
      for_sale: "sale",
      for_lease: "lease",
    };
    const normalisedListingType =
      listingTypeMap[property.listing_type as string] ?? property.listing_type;

    const formattedProperty = {
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

      // Nigerian market fields — stored in property_details.metadata
      nepa_status: (meta.nepa_status as string) ?? null,
      water_source: (meta.water_source as string) ?? null,
      internet_type: (meta.internet_type as string) ?? null,
      security_type: (meta.security_type as string[]) ?? [],
      has_bq: (meta.has_bq as boolean) ?? false,

      // Flattened property_details matching the page's expected shape
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

      // Media — mapped to field names expected by both pages
      property_media: property.property_media.map((m: { id: string; media_type: string; media_url: string; file_name: string; display_order: number | null; is_featured: boolean | null }) => ({
        id: m.id,
        media_type: m.media_type,
        file_url: m.media_url,       // pages expect file_url
        file_name: m.file_name,
        is_primary: m.is_featured ?? false, // pages expect is_primary
      })),

      // Owner info (populated only for owner-source listings)
      owner: !isAgent && property.owners?.profiles
        ? {
            id: property.owners.profiles.id,
            full_name: property.owners.profiles.full_name,
            email: property.owners.profiles.email,
            phone: property.owners.profiles.phone,
            avatar_url: property.owners.profiles.avatar_url,
          }
        : null,

      // Agent info (populated only for agent-source listings)
      agent:
        isAgent && property.agents
          ? {
              id: property.agents.id,
              license_number: property.agents.license_number,
              agency_name: property.agents.agency_name ?? "",
              specialization: property.agents.specialization,
              verified: property.agents.verified ?? false,
              rating: property.agents.rating ? Number(property.agents.rating) : null,
              agent_profile: {
                id: property.agents.profiles.id,
                full_name: property.agents.profiles.full_name,
                email: property.agents.profiles.email,
                phone: property.agents.profiles.phone,
                avatar_url: property.agents.profiles.avatar_url,
              },
            }
          : null,
    };

    return NextResponse.json({ data: formattedProperty });
  } catch (error) {
    console.error("Public property API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
