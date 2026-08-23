// realest/app/api/admin/properties/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient, getAuthUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import type { OpenApiMetadata } from "@/lib/openapi/route-metadata";
import { propertyDetailsSchema, propertyListingSchema } from "@/lib/validations/property";

const REALEST_CONNECT_LISTINGS_EMAIL = process.env.REALEST_CONNECT_LISTINGS_EMAIL ?? "listing@realest.ng";
const REALEST_CONNECT_LISTINGS_NAME = process.env.REALEST_CONNECT_LISTINGS_NAME ?? "RealEST Connect Listings";
const REALEST_CONNECT_LISTINGS_LICENSE = process.env.REALEST_CONNECT_LISTINGS_LICENSE ?? "REAL-EST-CONNECT-LISTINGS";

const validatePropertySchema = z.object({
  status: z.enum(["live", "rejected"]),
  rejection_reason: z.string().optional(),
  admin_notes: z.string().optional(),
});

const vetPropertySchema = z.object({
  vetting_status: z.enum(["approved", "rejected"]),
  vetting_notes: z.string().optional(),
  rejection_reason: z.string().optional(),
});

export const openApiGET: OpenApiMetadata = {
  method: 'get',
  summary: 'List admin review properties',
  description: 'Get properties waiting for admin review or in a specific status.',
  tags: ['Admin'],
  security: [{ bearerAuth: [] }],
  parameters: [{ name: 'status', in: 'query', schema: { type: 'string' } }],
  responses: {
    '200': { description: 'Properties loaded successfully' },
    '401': { description: 'Unauthorized' },
    '403': { description: 'Admin access required' },
  },
}

export const openApiPUT: OpenApiMetadata = {
  method: 'put',
  summary: 'Validate admin property review',
  description: 'Approve a property for vetting or reject it from the admin queue.',
  tags: ['Admin'],
  security: [{ bearerAuth: [] }],
  parameters: [{ name: 'property_id', in: 'query', schema: { type: 'string' }, required: true }],
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['status'],
          properties: {
            status: { type: 'string', enum: ['live', 'rejected'] },
            rejection_reason: { type: 'string' },
            admin_notes: { type: 'string' },
          },
        },
      },
    },
  },
  responses: {
    '200': { description: 'Property updated successfully' },
    '400': { description: 'Property ID is required or invalid data' },
    '401': { description: 'Unauthorized' },
    '403': { description: 'Admin access required' },
  },
}

export const openApiPOST: OpenApiMetadata = {
  method: 'post',
  summary: 'Create admin property listing',
  description: 'Create a property from the admin console and link it to the internal RealEST Connect listings account.',
  tags: ['Admin'],
  security: [{ bearerAuth: [] }],
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/PropertyListing',
        },
      },
    },
  },
  responses: {
    '201': { description: 'Property created successfully' },
    '400': { description: 'Invalid property data' },
    '401': { description: 'Unauthorized' },
    '403': { description: 'Admin access required' },
  },
}

async function resolveInternalListingsAccount() {
  const existingUser = await prisma.users.findUnique({
    where: { email: REALEST_CONNECT_LISTINGS_EMAIL },
    select: { id: true, email: true, role: true },
  });

  let userId = existingUser?.id;

  if (!userId) {
    userId = crypto.randomUUID();
    await prisma.users.upsert({
      where: { email: REALEST_CONNECT_LISTINGS_EMAIL },
      create: {
        id: userId,
        email: REALEST_CONNECT_LISTINGS_EMAIL,
        full_name: REALEST_CONNECT_LISTINGS_NAME,
        role: 'agent',
        metadata: {
          source: 'admin-listing-path',
          internal_account: true,
        },
      },
      update: {
        role: 'agent', // Ensure role is agent if it somehow changed
        metadata: {
          source: 'admin-listing-path',
          internal_account: true,
        },
      },
    });
  }

  await prisma.profiles.upsert({
    where: { id: userId as string },
    create: {
      id: userId as string,
      email: REALEST_CONNECT_LISTINGS_EMAIL,
      full_name: REALEST_CONNECT_LISTINGS_NAME,
    },
    update: {
      full_name: REALEST_CONNECT_LISTINGS_NAME, // Update name if it changed
    },
  });

  const agent = await prisma.agents.upsert({
    where: { profile_id: userId },
    create: {
      profile_id: userId,
      license_number: REALEST_CONNECT_LISTINGS_LICENSE,
      agency_name: REALEST_CONNECT_LISTINGS_NAME,
      specialization: ['property-listings'],
      verified: true,
    },
    update: {}, // Ensure agent is verified
    select: { id: true }, // Select the ID of the agent
  });

  return agent.id;
}

// GET /api/admin/properties - Get properties needing admin review
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await getAuthUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminRow = await prisma.users.findUnique({ where: { id: user.id }, select: { role: true } });
    if (!adminRow || adminRow.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "pending_ml_validation";

    const properties = await prisma.properties.findMany({
      where: { status },
      include: {
        property_details: true,
        property_media: true,
        property_documents: true,
        owners: { include: { profiles: { select: { full_name: true, avatar_url: true, phone: true } } } },
      },
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json({ properties });
  } catch (error) {
    console.error("Admin properties API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/admin/properties - Create a property under the internal RealEST Connect listings account
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await getAuthUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminRow = await prisma.users.findUnique({ where: { id: user.id }, select: { role: true } });
    if (!adminRow || adminRow.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = propertyListingSchema.parse(body);
    const validatedPropertyDetails = propertyDetailsSchema.parse(body);
    const internalAgentId = await resolveInternalListingsAccount();

    const property = await prisma.properties.create({
      data: {
        owner_id: null,
        agent_id: internalAgentId,
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
        status: validatedData.status,
        verification_status: validatedData.verification_status,
        listing_source: 'agent',
      },
    });

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
    }).catch((error) => {
      console.error('Admin property details creation error:', error);
    });

    await prisma.admin_audit_log.create({
      data: {
        actor_id: user.id,
        action: 'admin_property_create',
        target_id: property.id,
        metadata: {
          internal_account: REALEST_CONNECT_LISTINGS_EMAIL,
          agent_id: internalAgentId,
          status: validatedData.status,
          listing_source: 'agent',
        },
      },
    });

    return NextResponse.json(
      {
        property,
        linked_account: {
          email: REALEST_CONNECT_LISTINGS_EMAIL,
          name: REALEST_CONNECT_LISTINGS_NAME,
          agent_id: internalAgentId,
        },
        message: 'Property created under the RealEST Connect listings account',
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Admin property creation API error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid property data', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/admin/properties - Validate property (approve for vetting or reject)
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await getAuthUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminRow = await prisma.users.findUnique({ where: { id: user.id }, select: { role: true } });
    if (!adminRow || adminRow.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get("property_id");

    if (!propertyId) {
      return NextResponse.json({ error: "Property ID is required" }, { status: 400 });
    }

    const body = await request.json();
    const validatedData = validatePropertySchema.parse(body);

    const updatedProperty = await prisma.properties.update({
      where: { id: propertyId },
      data: {
        status: validatedData.status === "live" ? "pending_vetting" : "rejected",
        updated_at: new Date(),
      },
    });

    // TODO: Send notification to property owner

    return NextResponse.json({
      property: updatedProperty,
      message: `Property ${validatedData.status === "live" ? "approved for vetting" : "rejected"}`,
    });
  } catch (error) {
    console.error("Property validation API error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid validation data", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
