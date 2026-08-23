// realest/app/api/search/properties/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma, Prisma } from "@/lib/prisma";
import { z } from "zod";
import type { OpenApiMetadata } from "@/lib/openapi/route-metadata";

const searchSchema = z.object({
  query: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  property_type: z.string().optional(),
  // DB stores: for_sale | for_rent | for_lease | short_let
  listing_type: z.enum(["for_sale", "for_rent", "for_lease", "short_let"]).optional(),
  min_price: z.number().optional(),
  max_price: z.number().optional(),
  bedrooms: z.number().optional(),
  bathrooms: z.number().optional(),
  nepa_status: z.string().optional(),
  has_bq: z.boolean().optional(),
  gated_community: z.boolean().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  radius: z.number().default(10), // km
  sort_by: z.enum(["newest", "oldest", "price_asc", "price_desc"]).default("newest"),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(20),
});

/**
 * OpenAPI metadata for GET /api/search/properties
 * Documented endpoint: Advanced property search with geospatial support
 */
export const openApiGET: OpenApiMetadata = {
  method: 'get',
  summary: 'Advanced property search',
  description: 'Search verified, live properties with support for text search, filters, sorting, and geospatial queries. Results limited to verified properties.',
  tags: ['Properties', 'Search'],
  parameters: [
    {
      name: 'query',
      in: 'query',
      schema: { type: 'string' },
      description: 'Search query (title, description, or address)',
    },
    {
      name: 'state',
      in: 'query',
      schema: { type: 'string' },
      description: 'Nigerian state',
    },
    {
      name: 'city',
      in: 'query',
      schema: { type: 'string' },
      description: 'City name',
    },
    {
      name: 'property_type',
      in: 'query',
      schema: { type: 'string' },
      description: 'Property type',
    },
    {
      name: 'listing_type',
      in: 'query',
      schema: { type: 'string', enum: ['for_sale', 'for_rent', 'for_lease', 'short_let'] },
      description: 'Listing type',
    },
    {
      name: 'min_price',
      in: 'query',
      schema: { type: 'number' },
      description: 'Minimum price (Naira)',
    },
    {
      name: 'max_price',
      in: 'query',
      schema: { type: 'number' },
      description: 'Maximum price (Naira)',
    },
    {
      name: 'bedrooms',
      in: 'query',
      schema: { type: 'integer', minimum: 0 },
      description: 'Number of bedrooms',
    },
    {
      name: 'bathrooms',
      in: 'query',
      schema: { type: 'integer', minimum: 0 },
      description: 'Minimum number of bathrooms',
    },
    {
      name: 'latitude',
      in: 'query',
      schema: { type: 'number' },
      description: 'Latitude for geospatial search',
    },
    {
      name: 'longitude',
      in: 'query',
      schema: { type: 'number' },
      description: 'Longitude for geospatial search',
    },
    {
      name: 'radius',
      in: 'query',
      schema: { type: 'number', default: 10 },
      description: 'Search radius in kilometers (used with lat/long)',
    },
    {
      name: 'sort_by',
      in: 'query',
      schema: { type: 'string', enum: ['newest', 'oldest', 'price_asc', 'price_desc'], default: 'newest' },
      description: 'Sort order',
    },
    {
      name: 'page',
      in: 'query',
      schema: { type: 'integer', minimum: 1, default: 1 },
      description: 'Page number',
    },
    {
      name: 'limit',
      in: 'query',
      schema: { type: 'integer', minimum: 1, maximum: 50, default: 20 },
      description: 'Results per page',
    },
  ],
  responses: {
    '200': {
      description: 'Search results with pagination',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              properties: {
                type: 'array',
                items: { $ref: '#/components/schemas/Property' },
              },
              pagination: { type: 'object' },
            },
          },
        },
      },
    },
    '400': {
      description: 'Invalid search parameters',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/Error' },
        },
      },
    },
    '500': {
      description: 'Server error',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/Error' },
        },
      },
    },
  },
}

// GET /api/search/properties - Advanced property search
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse search parameters
    const searchData = {
      query: searchParams.get("query") || undefined,
      state: searchParams.get("state") || undefined,
      city: searchParams.get("city") || undefined,
      property_type: searchParams.get("property_type") || undefined,
      listing_type: (searchParams.get("listing_type") as "for_sale" | "for_rent" | "for_lease" | "short_let") || undefined,
      min_price: searchParams.get("min_price") ? parseFloat(searchParams.get("min_price")!) : undefined,
      max_price: searchParams.get("max_price") ? parseFloat(searchParams.get("max_price")!) : undefined,
      bedrooms: searchParams.get("bedrooms") ? parseInt(searchParams.get("bedrooms")!) : undefined,
      bathrooms: searchParams.get("bathrooms") ? parseInt(searchParams.get("bathrooms")!) : undefined,
      nepa_status: searchParams.get("nepa_status") || undefined,
      has_bq: searchParams.get("has_bq") === "true" ? true : searchParams.get("has_bq") === "false" ? false : undefined,
      gated_community: searchParams.get("gated_community") === "true" ? true : undefined,
      latitude: searchParams.get("latitude") ? parseFloat(searchParams.get("latitude")!) : undefined,
      longitude: searchParams.get("longitude") ? parseFloat(searchParams.get("longitude")!) : undefined,
      radius: parseFloat(searchParams.get("radius") || "10"),
      sort_by: (searchParams.get("sort_by") as "newest" | "oldest" | "price_asc" | "price_desc") || "newest",
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "20"),
    };

    const validatedSearch = searchSchema.parse(searchData);

    const where: Prisma.propertiesWhereInput = {
      verification_status: "verified",
      status: "live",
    };

    if (validatedSearch.state) {
      where.state = { contains: validatedSearch.state, mode: "insensitive" };
    }
    if (validatedSearch.city) {
      where.city = { contains: validatedSearch.city, mode: "insensitive" };
    }
    if (validatedSearch.property_type) {
      where.property_type = validatedSearch.property_type;
    }
    if (validatedSearch.listing_type) {
      where.listing_type = validatedSearch.listing_type;
    }
    if (validatedSearch.min_price !== undefined) {
      where.price = { ...(where.price as object), gte: validatedSearch.min_price };
    }
    if (validatedSearch.max_price !== undefined) {
      where.price = { ...(where.price as object), lte: validatedSearch.max_price };
    }
    if (validatedSearch.bedrooms !== undefined) {
      where.bedrooms = validatedSearch.bedrooms;
    }
    if (validatedSearch.bathrooms !== undefined) {
      where.bathrooms = { gte: validatedSearch.bathrooms };
    }
    if (validatedSearch.query) {
      where.OR = [
        { title: { contains: validatedSearch.query, mode: "insensitive" } },
        { description: { contains: validatedSearch.query, mode: "insensitive" } },
        { address: { contains: validatedSearch.query, mode: "insensitive" } },
      ];
    }

    // Bounding-box geo filter when coordinates provided
    if (validatedSearch.latitude && validatedSearch.longitude) {
      const deg = validatedSearch.radius / 111.32;
      where.latitude = {
        gte: validatedSearch.latitude - deg,
        lte: validatedSearch.latitude + deg,
      } as Prisma.DecimalFilter<"properties">;
      where.longitude = {
        gte: validatedSearch.longitude - deg,
        lte: validatedSearch.longitude + deg,
      } as Prisma.DecimalFilter<"properties">;
    }

    // Sort order
    let orderBy: Prisma.propertiesOrderByWithRelationInput = { created_at: "desc" };
    if (validatedSearch.sort_by === "oldest") orderBy = { created_at: "asc" };
    else if (validatedSearch.sort_by === "price_asc") orderBy = { price: "asc" };
    else if (validatedSearch.sort_by === "price_desc") orderBy = { price: "desc" };

    const skip = (validatedSearch.page - 1) * validatedSearch.limit;

    const [rawProperties, total] = await Promise.all([
      prisma.properties.findMany({
        where,
        include: {
          property_details: true,
          property_media: { take: 1, orderBy: { is_featured: "desc" } },
          owners: { include: { profiles: { select: { full_name: true, avatar_url: true, phone: true } } } },
          agents: { include: { profiles: { select: { full_name: true, avatar_url: true, phone: true } } } },
        },
        orderBy,
        skip,
        take: validatedSearch.limit,
      }),
      prisma.properties.count({ where }),
    ]);

    // Normalize response — flatten nested relations and field name differences
    const properties = rawProperties.map((p) => {
      const media = p.property_media[0] ?? null;
      const details = p.property_details[0] ?? null;
      let metadata: Record<string, any> = {};
      if (details?.metadata) {
        try {
          metadata = typeof details.metadata === "string"
            ? JSON.parse(details.metadata)
            : (details.metadata as any);
        } catch {}
      }

      return {
        id: p.id,
        title: p.title,
        description: p.description,
        price: parseFloat(p.price?.toString() ?? "0"),
        price_frequency: p.price_frequency,
        listing_type: p.listing_type,
        listing_source: p.listing_source,
        property_type: p.property_type,
        address: p.address,
        city: p.city,
        state: p.state,
        country: p.country,
        latitude: p.latitude ? parseFloat(p.latitude.toString()) : null,
        longitude: p.longitude ? parseFloat(p.longitude.toString()) : null,
        bedrooms: p.bedrooms,
        bathrooms: p.bathrooms,
        square_feet: p.square_feet,
        status: p.status,
        verification_status: p.verification_status,
        created_at: p.created_at?.toISOString() ?? null,
        // First media item as thumbnail
        thumbnail: media ? { url: media.media_url, type: media.media_type } : null,
        // Nigerian infra — stored in property_details.metadata JSON
        has_bq: metadata.has_bq ?? false,
        nepa_status: (metadata.nepa_status as string) ?? null,
        water_source: (metadata.water_source as string) ?? null,
        security_type: Array.isArray(metadata.security_type) ? (metadata.security_type as string[]) : [],
        // Lister info (flattened)
        owner: p.owners ? {
          id: p.owners.id,
          full_name: p.owners.profiles?.full_name ?? null,
          avatar_url: p.owners.profiles?.avatar_url ?? null,
          phone: p.owners.profiles?.phone ?? null,
        } : null,
        agent: p.agents ? {
          id: p.agents.id,
          full_name: p.agents.profiles?.full_name ?? null,
          avatar_url: p.agents.profiles?.avatar_url ?? null,
          phone: p.agents.profiles?.phone ?? null,
        } : null,
      };
    });

    return NextResponse.json({
      properties,
      pagination: {
        page: validatedSearch.page,
        limit: validatedSearch.limit,
        total,
        pages: Math.ceil(total / validatedSearch.limit),
      },
      search_criteria: validatedSearch,
    });
  } catch (error) {
    console.error("Search API error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid search parameters", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
