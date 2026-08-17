// realest/app/api/properties/[id]/media/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient, getAuthUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { propertyMediaSchema } from "@/lib/validations/property";
import type { OpenApiMetadata } from "@/lib/openapi/route-metadata";

const propertyIdSchema = z.string().uuid("Invalid property ID");

/**
 * OpenAPI metadata for GET /api/properties/{id}/media
 * Retrieves all media files (images, videos) associated with a property
 */
export const openApiGET: OpenApiMetadata = {
  method: "get",
  summary: "Get property media files",
  description: "Retrieve all media (images, videos) associated with a property. Published properties are visible to all users; draft properties only to the owner.",
  tags: ["Properties"],
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
      description: "Media list retrieved successfully",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              media: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    property_id: { type: "string", format: "uuid" },
                    media_type: { type: "string", enum: ["image", "video"] },
                    media_url: { type: "string", format: "url" },
                    is_featured: { type: "boolean" },
                    display_order: { type: "integer" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "404": {
      description: "Property not found or not accessible",
      content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
    },
  },
};

/**
 * OpenAPI metadata for POST /api/properties/{id}/media
 * Upload media (images, videos) for a property
 */
export const openApiPOST: OpenApiMetadata = {
  method: "post",
  summary: "Upload media for property",
  description: "Upload a new media file (image or video) to a property. Only property owner can upload. Media can only be added to draft properties.",
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
  requestBody: {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          required: ["media_type", "media_url"],
          properties: {
            media_type: { type: "string", enum: ["image", "video"], description: "Type of media" },
            media_url: { type: "string", format: "url", description: "URL to media file" },
            is_featured: { type: "boolean", description: "Mark as primary/featured image" },
          },
        },
      },
    },
  },
  responses: {
    "201": {
      description: "Media uploaded successfully",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              media: { type: "object" },
              message: { type: "string" },
            },
          },
        },
      },
    },
    "400": { description: "Invalid request or property is published" },
    "401": { description: "Unauthorized" },
    "404": { description: "Property not found or access denied" },
  },
};

// GET /api/properties/[id]/media - Get property media
export async function GET(
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

    const property = await prisma.properties.findUnique({
      where: { id: propertyId },
      select: { owner_id: true, status: true },
    });

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    const { data: { user } } = await getAuthUser();
    let ownerRecord: { id: string } | null = null;
    if (user) {
      ownerRecord = await prisma.owners.findUnique({ where: { profile_id: user.id }, select: { id: true } });
    }
    const isOwner = ownerRecord !== null && property.owner_id === ownerRecord.id;

    if (!isOwner && property.status !== "live") {
      return NextResponse.json({ error: "Property not available" }, { status: 404 });
    }

    const media = await prisma.property_media.findMany({
      where: { property_id: propertyId },
      orderBy: { display_order: "asc" },
    });

    return NextResponse.json({ media });
  } catch (error) {
    console.error("Media API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/properties/[id]/media - Upload media for property
export async function POST(
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

    const ownerRecordPost = await prisma.owners.findUnique({ where: { profile_id: user.id }, select: { id: true } });
    if (!property || !ownerRecordPost || property.owner_id !== ownerRecordPost.id) {
      return NextResponse.json({ error: "Property not found or access denied" }, { status: 404 });
    }

    if (property.status === "live") {
      return NextResponse.json({ error: "Cannot upload media to live properties" }, { status: 400 });
    }

    const body = await request.json();
    const validatedData = propertyMediaSchema.parse(body);

    // Get next display order
    const lastMedia = await prisma.property_media.findFirst({
      where: { property_id: propertyId },
      orderBy: { display_order: "desc" },
      select: { display_order: true },
    });
    const nextDisplayOrder = (lastMedia?.display_order ?? 0) + 1;

    // Unset other featured images if this is featured
    if (validatedData.is_featured) {
      await prisma.property_media.updateMany({
        where: { property_id: propertyId },
        data: { is_featured: false },
      });
    }

    const media = await prisma.property_media.create({
      data: {
        property_id: propertyId,
        media_type: validatedData.media_type,
        media_url: validatedData.media_url,
        file_name: validatedData.file_name,
        is_featured: validatedData.is_featured ?? false,
        display_order: nextDisplayOrder,
      },
    });

    return NextResponse.json({ media, message: "Media uploaded successfully" }, { status: 201 });
  } catch (error) {
    console.error("Media upload API error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid media data", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
