import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type { OpenApiMetadata } from "@/lib/openapi/route-metadata";
import {
  loadPublicPropertyDetail,
  type PublicListingSource,
} from "@/lib/listings/load-public-property";

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
    const sourceParam = url.searchParams.get("source") ?? "owner";
    const source: PublicListingSource = sourceParam === "agent" ? "agent" : "owner";

    const formattedProperty = await loadPublicPropertyDetail(propertyId, source);
    if (!formattedProperty) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    return NextResponse.json({ data: formattedProperty });
  } catch (error) {
    console.error("Public property API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
