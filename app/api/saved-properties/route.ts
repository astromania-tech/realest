// realest/app/api/saved-properties/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient, getAuthUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import type { OpenApiMetadata } from "@/lib/openapi/route-metadata";

// Note: This assumes we add a 'saved_properties' table to the database
// Table structure:
// - id: uuid primary key
// - user_id: uuid (FK to profiles.id)
// - property_id: uuid (FK to properties.id)
// - created_at: timestamp

/**
 * OpenAPI metadata for GET /api/saved-properties
 * Documented endpoint: Get user's saved/favorite properties
 */
export const openApiGET: OpenApiMetadata = {
  method: 'get',
  summary: 'Get saved properties',
  description: 'Retrieve all properties saved/favorited by the authenticated user.',
  tags: ['Properties', 'User'],
  security: [{ bearerAuth: [] }],
  responses: {
    '200': {
      description: 'List of saved properties',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              saved_properties: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    user_id: { type: 'string' },
                    property_id: { type: 'string' },
                    created_at: { type: 'string', format: 'date-time' },
                    properties: { $ref: '#/components/schemas/Property' },
                  },
                },
              },
            },
          },
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

// GET /api/saved-properties - Get user's saved properties
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await getAuthUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get saved properties with full property details
    const savedProperties = await prisma.saved_properties.findMany({
      where: { user_id: user.id },
      include: {
        properties: {
          include: {
            property_details: true,
            property_media: true,
            owners: { include: { profiles: { select: { full_name: true, avatar_url: true } } } },
          },
        },
      },
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json({ saved_properties: savedProperties });
  } catch (error) {
    console.error("Saved properties API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * OpenAPI metadata for POST /api/saved-properties
 * Documented endpoint: Save property to favorites
 */
export const openApiPOST: OpenApiMetadata = {
  method: 'post',
  summary: 'Save property to favorites',
  description: 'Add a property to the authenticated user\'s saved properties list.',
  tags: ['Properties', 'User'],
  security: [{ bearerAuth: [] }],
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['property_id'],
          properties: {
            property_id: {
              type: 'string',
              description: 'ID of the property to save',
            },
          },
        },
      },
    },
  },
  responses: {
    '201': {
      description: 'Property saved successfully',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              saved_property: { type: 'object' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    '400': {
      description: 'Invalid request or property already saved',
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
      description: 'Property not found or not available',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/Error' },
        },
      },
    },
  },
}

// POST /api/saved-properties - Save a property to favorites
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await getAuthUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { property_id } = body;

    if (!property_id) {
      return NextResponse.json(
        { error: "Property ID is required" },
        { status: 400 }
      );
    }

    // Check if property exists and is live
    const property = await prisma.properties.findFirst({
      where: { id: property_id, status: "live" },
      select: { id: true },
    });

    if (!property) {
      return NextResponse.json(
        { error: "Property not found or not available" },
        { status: 404 }
      );
    }

    // Check if already saved (upsert or check unique constraint)
    const existing = await prisma.saved_properties.findFirst({
      where: { user_id: user.id, property_id },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Property already saved" },
        { status: 400 }
      );
    }

    // Save property
    const savedProperty = await prisma.saved_properties.create({
      data: { user_id: user.id, property_id },
    });

    return NextResponse.json(
      { saved_property: savedProperty, message: "Property saved successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Save property API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * OpenAPI metadata for DELETE /api/saved-properties
 * Documented endpoint: Remove saved property
 */
export const openApiDELETE: OpenApiMetadata = {
  method: 'delete',
  summary: 'Remove property from favorites',
  description: 'Remove a property from the authenticated user\'s saved properties list.',
  tags: ['Properties', 'User'],
  security: [{ bearerAuth: [] }],
  parameters: [
    {
      name: 'property_id',
      in: 'query',
      required: true,
      schema: { type: 'string' },
      description: 'Property ID to remove from saved',
    },
  ],
  responses: {
    '200': {
      description: 'Property removed successfully',
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
      description: 'Invalid request',
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
      description: 'Saved property not found',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/Error' },
        },
      },
    },
  },
}

// DELETE /api/saved-properties - Remove a property from favorites
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await getAuthUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get("property_id");

    if (!propertyId) {
      return NextResponse.json(
        { error: "Property ID is required" },
        { status: 400 }
      );
    }

    // Remove from saved properties
    await prisma.saved_properties.deleteMany({
      where: { user_id: user.id, property_id: propertyId },
    });

    return NextResponse.json({
      message: "Property removed from saved list"
    });
  } catch (error) {
    console.error("Remove saved property API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
