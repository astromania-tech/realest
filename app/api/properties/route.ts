// realest/app/api/properties/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient, getAuthUser } from "@/lib/supabase/server";
import { prisma, Prisma } from "@/lib/prisma";
import { z } from "zod";
import { propertyListingSchema, propertyDraftSchema, propertyDetailsSchema } from "@/lib/validations/property";
import type { OpenApiMetadata } from "@/lib/openapi/route-metadata";
import { zodToSchema } from "@/lib/openapi/zod-to-schema";

const searchQuerySchema = z.object({
  query: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  property_type: z.string().optional(),
  listing_type: z.enum(["for_rent", "for_sale", "for_lease", "short_let"]).optional(),
  min_price: z.number().optional(),
  max_price: z.number().optional(),
  bedrooms: z.number().optional(),
  bathrooms: z.number().optional(),
  nepa_status: z.string().optional(),
  has_bq: z.boolean().optional(),
  gated_community: z.boolean().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(20),
});

/**
 * OpenAPI metadata for GET /api/properties
 * Documented endpoint: Search & list properties with filters
 */
export const openApiGET: OpenApiMetadata = {
  method: 'get',
  summary: 'Search and list properties',
  description: 'Search properties by location, type, price, and other filters. Returns paginated results.',
  tags: ['Properties'],
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
      description: 'Filter by Nigerian state',
    },
    {
      name: 'city',
      in: 'query',
      schema: { type: 'string' },
      description: 'Filter by city',
    },
    {
      name: 'property_type',
      in: 'query',
      schema: { type: 'string', enum: ['house', 'apartment', 'land', 'commercial', 'event_center', 'hotel', 'shop', 'office', 'duplex', 'bungalow', 'flat', 'self_contained', 'mini_flat', 'room_and_parlor', 'single_room', 'penthouse', 'terrace', 'detached_house', 'warehouse', 'showroom', 'restaurant', 'residential_land', 'commercial_land', 'mixed_use_land', 'farmland'] },
      description: 'Filter by property type',
    },
    {
      name: 'listing_type',
      in: 'query',
      schema: { type: 'string', enum: ['for_rent', 'for_sale', 'for_lease', 'short_let'] },
      description: 'Filter by listing type',
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
      description: 'Minimum number of bedrooms',
    },
    {
      name: 'bathrooms',
      in: 'query',
      schema: { type: 'integer', minimum: 0 },
      description: 'Minimum number of bathrooms',
    },
    {
      name: 'nepa_status',
      in: 'query',
      schema: { type: 'string' },
      description: 'NEPA/electricity status',
    },
    {
      name: 'has_bq',
      in: 'query',
      schema: { type: 'boolean' },
      description: 'Has Boys Quarters (BQ)',
    },
    {
      name: 'gated_community',
      in: 'query',
      schema: { type: 'boolean' },
      description: 'Is in gated community',
    },
    {
      name: 'page',
      in: 'query',
      schema: { type: 'integer', minimum: 1, default: 1 },
      description: 'Page number for pagination',
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
      description: 'Properties list with pagination',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              properties: {
                type: 'array',
                items: {
                  $ref: '#/components/schemas/PropertyListing',
                },
              },
              pagination: {
                type: 'object',
                properties: {
                  page: { type: 'integer' },
                  limit: { type: 'integer' },
                  total: { type: 'integer' },
                  pages: { type: 'integer' },
                },
              },
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

// GET /api/properties - List properties with search and filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const searchData = {
      query: searchParams.get("query") || undefined,
      state: searchParams.get("state") || undefined,
      city: searchParams.get("city") || undefined,
      property_type: searchParams.get("property_type") || undefined,
      listing_type: (searchParams.get("listing_type") as "for_rent" | "for_sale" | "for_lease" | "short_let") || undefined,
      min_price: searchParams.get("min_price") ? parseFloat(searchParams.get("min_price")!) : undefined,
      max_price: searchParams.get("max_price") ? parseFloat(searchParams.get("max_price")!) : undefined,
      bedrooms: searchParams.get("bedrooms") ? parseInt(searchParams.get("bedrooms")!) : undefined,
      bathrooms: searchParams.get("bathrooms") ? parseInt(searchParams.get("bathrooms")!) : undefined,
      nepa_status: searchParams.get("nepa_status") || undefined,
      has_bq: searchParams.get("has_bq") === "true" ? true : searchParams.get("has_bq") === "false" ? false : undefined,
      gated_community: searchParams.get("gated_community") === "true" ? true : undefined,
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "20"),
    };

    const validatedSearch = searchQuerySchema.parse(searchData);
    const skip = (validatedSearch.page - 1) * validatedSearch.limit;

    // Build Prisma where clause — only status:live for public search
    const where: Prisma.propertiesWhereInput = { status: "live" };

    if (validatedSearch.state) where.state = { contains: validatedSearch.state, mode: "insensitive" };
    if (validatedSearch.city) where.city = { contains: validatedSearch.city, mode: "insensitive" };
    if (validatedSearch.property_type) where.property_type = validatedSearch.property_type;
    if (validatedSearch.listing_type) where.listing_type = validatedSearch.listing_type;
    if (validatedSearch.bedrooms !== undefined) where.bedrooms = { gte: validatedSearch.bedrooms };
    if (validatedSearch.bathrooms !== undefined) where.bathrooms = { gte: validatedSearch.bathrooms };
    if (validatedSearch.min_price !== undefined || validatedSearch.max_price !== undefined) {
      where.price = {};
      if (validatedSearch.min_price !== undefined) where.price = { ...where.price as object, gte: validatedSearch.min_price };
      if (validatedSearch.max_price !== undefined) where.price = { ...where.price as object, lte: validatedSearch.max_price };
    }
    if (validatedSearch.query) {
      where.OR = [
        { title: { contains: validatedSearch.query, mode: "insensitive" } },
        { description: { contains: validatedSearch.query, mode: "insensitive" } },
        { address: { contains: validatedSearch.query, mode: "insensitive" } },
      ];
    }

    const [properties, total] = await Promise.all([
      prisma.properties.findMany({
        where,
        include: {
          property_details: true,
          property_media: { take: 1 },
          owners: { include: { profiles: { select: { full_name: true, avatar_url: true, phone: true } } } },
        },
        orderBy: { created_at: "desc" },
        skip,
        take: validatedSearch.limit,
      }),
      prisma.properties.count({ where }),
    ]);

    return NextResponse.json({
      properties,
      pagination: {
        page: validatedSearch.page,
        limit: validatedSearch.limit,
        total,
        pages: Math.ceil(total / validatedSearch.limit),
      },
    });
  } catch (error) {
    console.error("Properties API error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid search parameters", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * OpenAPI metadata for POST /api/properties
 * Documented endpoint: Create new property listing
 */
export const openApiPOST: OpenApiMetadata = {
  method: 'post',
  summary: 'Create new property listing',
  description: 'Create a new property listing. Requires owner or agent role. Drafts stay editable; submitted listings are automatically queued for ML validation.',
  tags: ['Properties'],
  security: [{ bearerAuth: [] }],
  requestBody: {
    required: true,
    description: 'Property details for creation',
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/PropertyListing',
          'x-source': '@/lib/validations/property.ts → propertyListingSchema',
        },
      },
    },
  },
  responses: {
    '201': {
      description: 'Property created successfully',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              property: { $ref: '#/components/schemas/Property' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    '400': {
      description: 'Invalid property data or validation error',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/Error' },
        },
      },
    },
    '401': {
      description: 'Unauthorized - authentication required',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/Error' },
        },
      },
    },
    '403': {
      description: 'Forbidden - user role insufficient',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/Error' },
        },
      },
    },
    '409': {
      description: 'Conflict - duplicate property detected',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              error: { type: 'string' },
              message: { type: 'string' },
              duplicates: { type: 'array' },
            },
          },
        },
      },
    },
  },
}

// POST /api/properties - Create new property
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await getAuthUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Role check via Prisma
    const userRow = await prisma.users.findUnique({ where: { id: user.id }, select: { role: true } });
    if (!userRow || !["owner", "agent"].includes(userRow.role ?? "")) {
      return NextResponse.json(
        { error: "Only agents and property owners can create listings" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const isDraft = body.status === "draft";
    const validatedData = isDraft ? propertyDraftSchema.parse(body) : propertyListingSchema.parse(body);
    const nextStatus = isDraft ? "draft" : "pending_ml_validation";

    // Duplicate check (skip for drafts)
    if (!isDraft) {
      const [byAddress, byCoords] = await Promise.all([
        prisma.properties.findFirst({
          where: { address: validatedData.address, NOT: { status: "draft" } },
          select: { id: true, address: true, latitude: true, longitude: true },
        }),
        prisma.properties.findFirst({
          where: {
            status: "live",
            latitude: validatedData.latitude as any,
            longitude: validatedData.longitude as any,
          },
          select: { id: true, address: true, latitude: true, longitude: true },
        }),
      ]);

      const existingProperties = [byAddress, byCoords].filter(Boolean);
      if (existingProperties.length > 0) {
        return NextResponse.json(
          {
            error: "A property with this address or location already exists",
            duplicates: existingProperties,
            message: "Please verify this is a unique property or contact support if you believe this is an error.",
          },
          { status: 409 },
        );
      }
    }

    // For agents, look up agents.id; for owners, upsert owner record (owner_id now → owners.id)
    let agentId: string | null = null;
    let ownerId: string | null = null;
    if (userRow.role === "agent") {
      const agentRecord = await prisma.agents.findFirst({
        where: { profile_id: user.id },
        select: { id: true },
      });

      if (!agentRecord) {
        return NextResponse.json(
          { error: "Agent record not found. Please contact support." },
          { status: 400 },
        );
      }
      agentId = agentRecord.id;
    } else if (userRow.role === "owner") {
      const ownerRec = await prisma.owners.upsert({
        where: { profile_id: user.id },
        create: { profile_id: user.id },
        update: {},
        select: { id: true },
      });
      ownerId = ownerRec.id;
    }

    // Create property
    const property = await prisma.properties.create({
      data: {
        owner_id: ownerId,
        agent_id: agentId,
        title: validatedData.title,
        description: validatedData.description,
        price: validatedData.price,
        price_frequency: validatedData.price_frequency,
        property_type: validatedData.property_type,
        listing_type: validatedData.listing_type,
        address: validatedData.address,
        city: validatedData.city,
        state: validatedData.state,
        postal_code: validatedData.postal_code,
        country: validatedData.country,
        latitude: validatedData.latitude as any,
        longitude: validatedData.longitude as any,
        bedrooms: validatedData.bedrooms,
        bathrooms: validatedData.bathrooms,
        square_feet: validatedData.square_feet,
        year_built: validatedData.year_built,
        status: nextStatus,
        listing_source: userRow.role === "agent" ? "agent" : "owner",
      },
    });

    // Create property details
    const validatedPropertyDetails = propertyDetailsSchema.parse(body);
    try {
      await prisma.property_details.create({
        data: {
          property_id: property.id,
          parking_spaces: validatedPropertyDetails.parking_spaces ?? null,
          has_pool: validatedPropertyDetails.has_pool ?? null,
          has_garage: validatedPropertyDetails.has_garage ?? null,
          has_garden: validatedPropertyDetails.has_garden ?? null,
          heating_type: validatedPropertyDetails.heating_type ?? null,
          cooling_type: validatedPropertyDetails.cooling_type ?? null,
          flooring_type: validatedPropertyDetails.flooring_type ?? null,
          roof_type: validatedPropertyDetails.roof_type ?? null,
          foundation_type: validatedPropertyDetails.foundation_type ?? null,
          amenities: (validatedPropertyDetails.amenities as any) ?? {},
          features: (validatedPropertyDetails.features as any) ?? {},
        },
      });
    } catch (detailsError) {
      console.error("Property details creation error:", detailsError);
    }

    return NextResponse.json(
      {
        property,
        message: isDraft
          ? "Draft saved successfully. Add photos and documents to complete your listing."
          : "Property created successfully and queued for ML validation before human vetting.",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Property creation API error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid property data", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
