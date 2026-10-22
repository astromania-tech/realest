// realest/app/api/properties/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient, getAuthUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { isPublicListing, propertyForViewer } from "@/lib/listings/public-listing";
import { 
  propertyListingSchema, 
  propertyDetailsSchema 
} from "@/lib/validations/property";
import type { OpenApiMetadata } from "@/lib/openapi/route-metadata";

const propertyIdSchema = z.string().uuid("Invalid property ID");

/**
 * OpenAPI metadata for GET /api/properties/[id]
 * Documented endpoint: Get single property with full details
 */
export const openApiGET: OpenApiMetadata = {
  method: 'get',
  summary: 'Get property details',
  description: 'Public viewers receive a live, verified listing without documents, inquiries, email, or phone. The owner and an admin receive the full record.',
  tags: ['Properties'],
  parameters: [
    {
      name: 'id',
      in: 'path',
      required: true,
      schema: { type: 'string' },
      description: 'Property ID',
    },
  ],
  responses: {
    '200': {
      description: 'Property details retrieved successfully',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              property: { $ref: '#/components/schemas/PropertyDetails' },
            },
          },
        },
      },
    },
    '404': {
      description: 'Property not found or not accessible',
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

const ownerProfileSelect = {
  id: true,
  full_name: true,
  avatar_url: true,
  created_at: true,
} as const;

const mediaSelect = {
  select: {
    id: true,
    media_url: true,
    media_type: true,
    is_featured: true,
    display_order: true,
  },
  orderBy: { display_order: "asc" as const },
  take: 24,
};

// GET /api/properties/[id] - Get single property with full details
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

    const [{ data: { user } }, lite] = await Promise.all([
      getAuthUser(),
      prisma.properties.findUnique({
        where: { id: propertyId },
        select: {
          id: true,
          owner_id: true,
          status: true,
          verification_status: true,
        },
      }),
    ]);

    if (!lite) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    let isOwner = false;
    let isAdmin = false;
    if (user) {
      const [ownerRecord, userRow] = await Promise.all([
        prisma.owners.findUnique({
          where: { profile_id: user.id },
          select: { id: true },
        }),
        prisma.users.findUnique({
          where: { id: user.id },
          select: { role: true },
        }),
      ]);
      isOwner = ownerRecord !== null && lite.owner_id === ownerRecord.id;
      isAdmin = userRow?.role === "admin";
    }

    const privateViewer = isOwner || isAdmin;
    if (!privateViewer && !isPublicListing(lite)) {
      return NextResponse.json({ error: "Property not available" }, { status: 404 });
    }

    const property = await prisma.properties.findUnique({
      where: { id: propertyId },
      select: {
        id: true,
        owner_id: true,
        agent_id: true,
        title: true,
        description: true,
        price: true,
        price_frequency: true,
        property_type: true,
        listing_type: true,
        listing_source: true,
        address: true,
        city: true,
        state: true,
        country: true,
        postal_code: true,
        latitude: true,
        longitude: true,
        bedrooms: true,
        bathrooms: true,
        square_feet: true,
        year_built: true,
        status: true,
        verification_status: true,
        created_at: true,
        updated_at: true,
        property_details: true,
        property_media: mediaSelect,
        owners: {
          select: {
            id: true,
            profiles: {
              select: privateViewer
                ? { ...ownerProfileSelect, phone: true }
                : ownerProfileSelect,
            },
          },
        },
        ...(privateViewer
          ? {
              property_documents: {
                select: {
                  id: true,
                  document_type: true,
                  document_url: true,
                  file_name: true,
                  created_at: true,
                },
                take: 50,
              },
              inquiries: {
                select: {
                  id: true,
                  message: true,
                  status: true,
                  created_at: true,
                  profiles_inquiries_sender_idToprofiles: {
                    select: { full_name: true, avatar_url: true },
                  },
                },
                orderBy: { created_at: "desc" as const },
                take: 50,
              },
            }
          : {}),
      },
    });

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    return NextResponse.json({
      property: propertyForViewer(property, privateViewer ? "private" : "public"),
    });
  } catch (error) {
    console.error("Property API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Use partial schemas for updates (all fields optional)
const updatePropertySchema = propertyListingSchema.partial();
const updatePropertyDetailsSchema = propertyDetailsSchema.partial();

/**
 * OpenAPI metadata for PUT /api/properties/[id]
 * Documented endpoint: Update property
 */
export const openApiPUT: OpenApiMetadata = {
  method: 'put',
  summary: 'Update property details',
  description: 'Update property details before verification. Only available for draft or pending properties. Requires owner role.',
  tags: ['Properties'],
  security: [{ bearerAuth: [] }],
  parameters: [
    {
      name: 'id',
      in: 'path',
      required: true,
      schema: { type: 'string' },
      description: 'Property ID',
    },
  ],
  requestBody: {
    required: true,
    description: 'Updated property fields (all optional)',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            price: { type: 'number' },
            bedrooms: { type: 'integer' },
            bathrooms: { type: 'integer' },
          },
          'x-source': '@/lib/validations/property.ts → propertyListingSchema (partial)',
        },
      },
    },
  },
  responses: {
    '200': {
      description: 'Property updated successfully',
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
      description: 'Invalid data or property is already verified',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/Error' },
        },
      },
    },
    '401': {
      description: 'Unauthorized',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/Error' },
        },
      },
    },
    '404': {
      description: 'Property not found or access denied',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/Error' },
        },
      },
    },
  },
}

// PUT /api/properties/[id] - Update property (owner only, pre-verification)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    const propertyIdResult = propertyIdSchema.safeParse(id);
    if (!propertyIdResult.success) {
      return NextResponse.json({ error: "Property not found or access denied" }, { status: 404 });
    }
    const propertyId = propertyIdResult.data;

    const { data: { user }, error: authError } = await getAuthUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check ownership via Prisma
    const property = await prisma.properties.findUnique({
      where: { id: propertyId },
      select: { owner_id: true, agent_id: true, status: true, verification_status: true },
    });

    const ownerRecordPut = await prisma.owners.findUnique({ where: { profile_id: user.id }, select: { id: true } });
    if (!property || !ownerRecordPut || property.owner_id !== ownerRecordPut.id) {
      return NextResponse.json({ error: "Property not found or access denied" }, { status: 404 });
    }

    if (property.status === "live" || property.verification_status === "verified") {
      return NextResponse.json(
        { error: "Cannot update verified properties. Contact support." },
        { status: 400 },
      );
    }

    const body = await request.json();
    const validatedPropertyData = updatePropertySchema.parse(body);
    const validatedDetailsData = updatePropertyDetailsSchema.parse(body);

    // Update root property fields
    const propertyFields = Object.keys(validatedPropertyData).filter(key => !["images", "documents"].includes(key));
    let updatedProperty: any = property;
    if (propertyFields.length > 0) {
      updatedProperty = await prisma.properties.update({
        where: { id },
        data: { ...validatedPropertyData as any, updated_at: new Date() },
      });
    }

    // Update property details
    const detailsFields = Object.keys(validatedDetailsData);
    if (detailsFields.length > 0) {
      try {
        await prisma.property_details.updateMany({
          where: { property_id: propertyId },
          data: { ...validatedDetailsData as any, updated_at: new Date() },
        });
      } catch (detailsError) {
        console.error("Property details update error:", detailsError);
      }
    }

    return NextResponse.json({ property: updatedProperty, message: "Property updated successfully" });
  } catch (error) {
    console.error("Property update API error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid property data", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * OpenAPI metadata for DELETE /api/properties/[id]
 * Documented endpoint: Delete property
 */
export const openApiDELETE: OpenApiMetadata = {
  method: 'delete',
  summary: 'Delete property',
  description: 'Delete a property listing. Only available for draft properties. Requires owner role.',
  tags: ['Properties'],
  security: [{ bearerAuth: [] }],
  parameters: [
    {
      name: 'id',
      in: 'path',
      required: true,
      schema: { type: 'string' },
      description: 'Property ID',
    },
  ],
  responses: {
    '200': {
      description: 'Property deleted successfully',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              message: { type: 'string' },
            },
          },
        },
      },
    },
    '400': {
      description: 'Cannot delete published properties',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/Error' },
        },
      },
    },
    '401': {
      description: 'Unauthorized',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/Error' },
        },
      },
    },
    '404': {
      description: 'Property not found or access denied',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/Error' },
        },
      },
    },
  },
}

// DELETE /api/properties/[id] - Delete property (owner only, draft status)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    const propertyIdResult = propertyIdSchema.safeParse(id);
    if (!propertyIdResult.success) {
      return NextResponse.json({ error: "Property not found or access denied" }, { status: 404 });
    }
    const propertyId = propertyIdResult.data;

    const { data: { user }, error: authError } = await getAuthUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const property = await prisma.properties.findUnique({
      where: { id: propertyId },
      select: { owner_id: true, status: true },
    });

    const ownerRecordDel = await prisma.owners.findUnique({ where: { profile_id: user.id }, select: { id: true } });
    if (!property || !ownerRecordDel || property.owner_id !== ownerRecordDel.id) {
      return NextResponse.json({ error: "Property not found or access denied" }, { status: 404 });
    }

    if (property.status !== "draft") {
      return NextResponse.json({ error: "Cannot delete published properties" }, { status: 400 });
    }

    await prisma.properties.delete({ where: { id: propertyId } });

    return NextResponse.json({ message: "Property deleted successfully" });
  } catch (error) {
    console.error("Property deletion API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
