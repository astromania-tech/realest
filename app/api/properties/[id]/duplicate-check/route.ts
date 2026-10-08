// realest/app/api/properties/[id]/duplicate-check/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { propertiesWithinRadius } from "@/lib/geo/properties-within-radius";
import { z } from "zod";
import type { OpenApiMetadata } from "@/lib/openapi/route-metadata";

const propertyIdSchema = z.string().uuid("Invalid property ID");

const duplicateCheckSchema = z.object({
  address: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  radius: z.number().min(0.01).max(10).default(0.1), // km radius for proximity check
});

/**
 * OpenAPI metadata for POST /api/properties/{id}/duplicate-check
 * Check for potential duplicate property listings
 */
export const openApiPOST: OpenApiMetadata = {
  method: "post",
  summary: "Check for duplicate properties",
  description: "Check for potential duplicate property listings based on address or geospatial proximity. Uses address matching and location-based radius search.",
  tags: ["Properties"],
  security: [{ bearerAuth: [] }],
  parameters: [
    {
      name: "id",
      in: "path",
      required: true,
      schema: { type: "string", format: "uuid" },
      description: "Property ID to check",
    },
  ],
  requestBody: {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            address: { type: "string", description: "Address to check (optional, uses property address if not provided)" },
            latitude: { type: "number", minimum: -90, maximum: 90, description: "Latitude for geo check" },
            longitude: { type: "number", minimum: -180, maximum: 180, description: "Longitude for geo check" },
            radius: { type: "number", minimum: 0.01, maximum: 10, default: 0.1, description: "Search radius in kilometers" },
          },
        },
      },
    },
  },
  responses: {
    "200": {
      description: "Duplicate check results",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              potentialDuplicates: { type: "array", items: { type: "object" } },
              message: { type: "string" },
            },
          },
        },
      },
    },
    "400": { description: "Address or coordinates required" },
    "401": { description: "Unauthorized" },
    "404": { description: "Property not found or access denied" },
  },
};

// POST /api/properties/[id]/duplicate-check - Check for potential duplicate properties
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const propertyIdResult = propertyIdSchema.safeParse(id);
    if (!propertyIdResult.success) {
      return NextResponse.json({ error: "Property not found or access denied" }, { status: 404 });
    }
    const propertyId = propertyIdResult.data;

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await getAuthUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check ownership via Prisma (owner_id now references owners.id, not profiles.id)
    const property = await prisma.properties.findUnique({
      where: { id: propertyId },
      select: { owner_id: true, address: true, latitude: true, longitude: true },
    });

    const ownerRecord = await prisma.owners.findUnique({ where: { profile_id: user.id }, select: { id: true } });
    if (!property || !ownerRecord || property.owner_id !== ownerRecord.id) {
      return NextResponse.json(
        { error: "Property not found or access denied" },
        { status: 404 },
      );
    }

    const body = await request.json();
    const validatedData = duplicateCheckSchema.parse(body);

    // Use provided data or fall back to property data
    const checkAddress = validatedData.address || property.address;
    const checkLatitude = validatedData.latitude ?? (property.latitude ? Number(property.latitude) : null);
    const checkLongitude = validatedData.longitude ?? (property.longitude ? Number(property.longitude) : null);

    if (!checkAddress && (!checkLatitude || !checkLongitude)) {
      return NextResponse.json(
        { error: "Address or coordinates required for duplicate check" },
        { status: 400 },
      );
    }

    const potentialDuplicates: any[] = [];

    // 1. Exact address match check via Prisma
    if (checkAddress) {
      const addressMatches = await prisma.properties.findMany({
        where: {
          NOT: { id: propertyId },
          status: "live",
          address: { contains: checkAddress.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").toLowerCase(), mode: "insensitive" },
        },
        select: {
          id: true,
          title: true,
          address: true,
          latitude: true,
          longitude: true,
          status: true,
          verification_status: true,
          created_at: true,
          owners: { select: { profiles: { select: { full_name: true } } } },
        },
      });

      if (addressMatches.length > 0) {
        potentialDuplicates.push(
          ...addressMatches.map((match: any) => ({
            ...match,
            duplicate_type: "exact_address",
            confidence: "high",
          })),
        );
      }
    }

    // 2. Geospatial proximity check (PostGIS via Prisma)
    if (checkLatitude && checkLongitude) {
      const radiusProperties = await propertiesWithinRadius({
        lat: checkLatitude,
        lng: checkLongitude,
        radiusKm: validatedData.radius,
      });

      if (radiusProperties.length > 0) {
        const radiusIds: string[] = radiusProperties.map((p) => p.id).filter((id) => id !== propertyId);
        if (radiusIds.length > 0) {
          const proximityMatches = await prisma.properties.findMany({
            where: { id: { in: radiusIds }, status: "live", NOT: { id: propertyId } },
            select: {
              id: true,
              title: true,
              address: true,
              latitude: true,
              longitude: true,
              status: true,
              verification_status: true,
              created_at: true,
              owners: { select: { profiles: { select: { full_name: true } } } },
            },
          });

          const nearbyWithDistance = proximityMatches
            .map((match: any) => {
              const distance = calculateDistance(
                checkLatitude,
                checkLongitude,
                Number(match.latitude),
                Number(match.longitude),
              );
              return { ...match, distance, duplicate_type: "geospatial_proximity" };
            })
            .filter((m: any) => m.distance <= validatedData.radius)
            .map((m: any) => ({
              ...m,
              confidence: m.distance < 0.05 ? "high" : m.distance < 0.2 ? "medium" : "low",
            }));

          potentialDuplicates.push(...nearbyWithDistance);
        }
      }
    }

    // 3. Owner-specific check via Prisma
    const ownerMatches = await prisma.properties.findMany({
      where: {
        NOT: { id: propertyId },
        owner_id: ownerRecord.id,
        status: { in: ["draft", "pending_ml_validation", "pending_vetting"] },
      },
      select: {
        id: true,
        title: true,
        address: true,
        latitude: true,
        longitude: true,
        status: true,
        verification_status: true,
        created_at: true,
      },
    });

    if (ownerMatches.length > 0) {
      potentialDuplicates.push(
        ...ownerMatches.map((match: any) => ({
          ...match,
          duplicate_type: "same_owner",
          confidence: "high",
          profiles: { full_name: "You" },
        })),
      );
    }

    // Remove duplicates from results
    const uniqueDuplicates = potentialDuplicates.filter(
      (duplicate, index, self) =>
        index === self.findIndex((d) => d.id === duplicate.id),
    );

    return NextResponse.json({
      has_duplicates: uniqueDuplicates.length > 0,
      potential_duplicates: uniqueDuplicates,
      checked_criteria: {
        address: !!checkAddress,
        coordinates: !!(checkLatitude && checkLongitude),
        radius_km: validatedData.radius,
        total_checked: uniqueDuplicates.length,
      },
    });
  } catch (error) {
    console.error("Duplicate check API error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid check parameters", details: error.errors },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// Helper function to calculate distance between two coordinates (Haversine formula)
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}
