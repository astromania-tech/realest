import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient, getAuthUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import type { OpenApiMetadata } from "@/lib/openapi/route-metadata";

const propertyIdSchema = z.string().uuid("Invalid property ID");

/**
 * OpenAPI metadata for POST /api/properties/{id}/favorites
 * Save a property to user's favorites
 */
export const openApiPOST: OpenApiMetadata = {
  method: "post",
  summary: "Save property to favorites",
  description: "Add a property to the authenticated user's saved/favorite properties. Property must be published.",
  tags: ["Properties"],
  security: [{ bearerAuth: [] }],
  parameters: [
    {
      name: "id",
      in: "path",
      required: true,
      schema: { type: "string", format: "uuid" },
      description: "Property ID",
    },
  ],
  responses: {
    "201": {
      description: "Property saved to favorites",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              data: { type: "object" },
              message: { type: "string" },
            },
          },
        },
      },
    },
    "401": { description: "Unauthorized" },
    "404": { description: "Property not found" },
    "409": { description: "Property already saved to favorites" },
  },
};

/**
 * OpenAPI metadata for DELETE /api/properties/{id}/favorites
 * Remove property from user's favorites
 */
export const openApiDELETE: OpenApiMetadata = {
  method: "delete",
  summary: "Remove property from favorites",
  description: "Remove a property from the authenticated user's saved/favorite properties.",
  tags: ["Properties"],
  security: [{ bearerAuth: [] }],
  parameters: [
    {
      name: "id",
      in: "path",
      required: true,
      schema: { type: "string", format: "uuid" },
      description: "Property ID",
    },
  ],
  responses: {
    "200": {
      description: "Property removed from favorites",
      content: { "application/json": { schema: { type: "object" } } },
    },
    "401": { description: "Unauthorized" },
    "404": { description: "Property not found in favorites" },
  },
};

// POST /api/properties/[id]/favorites - Save a property to favorites
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    const propertyIdResult = propertyIdSchema.safeParse(id);
    if (!propertyIdResult.success) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }
    const propertyId = propertyIdResult.data;

    const { data: { user }, error: authError } = await getAuthUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Verify property exists and is live
    const property = await prisma.properties.findFirst({
      where: { id: propertyId, status: "live" },
      select: { id: true, title: true },
    });

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    // Check if already saved
    const existingSave = await prisma.saved_properties.findFirst({
      where: { user_id: user.id, property_id: propertyId },
      select: { id: true },
    });

    if (existingSave) {
      return NextResponse.json({ error: "Property already saved to favorites" }, { status: 409 });
    }

    const savedProperty = await prisma.saved_properties.create({
      data: { user_id: user.id, property_id: propertyId },
      include: {
        properties: {
          select: {
            id: true,
            title: true,
            price: true,
            price_frequency: true,
            state: true,
            city: true,
            bedrooms: true,
            bathrooms: true,
            status: true,
          },
        },
      },
    });

    return NextResponse.json(
      { data: savedProperty, message: "Property saved to favorites" },
      { status: 201 },
    );
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/properties/[id]/favorites - Remove property from favorites
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    const propertyIdResult = propertyIdSchema.safeParse(id);
    if (!propertyIdResult.success) {
      return NextResponse.json({ error: "Property not found in favorites" }, { status: 404 });
    }
    const propertyId = propertyIdResult.data;

    const { data: { user }, error: authError } = await getAuthUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const deleted = await prisma.saved_properties.deleteMany({
      where: { user_id: user.id, property_id: propertyId },
    });

    if (deleted.count === 0) {
      return NextResponse.json({ error: "Property not found in favorites" }, { status: 404 });
    }

    return NextResponse.json({ message: "Property removed from favorites" });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
