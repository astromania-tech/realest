import { getAuthUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { propertiesWithinRadius } from "@/lib/geo/properties-within-radius";
import { NextResponse } from "next/server";
import type { OpenApiMetadata } from "@/lib/openapi/route-metadata";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export const openApiPOST: OpenApiMetadata = {
  method: 'post',
  summary: 'Check dashboard listing duplicates',
  description: 'Run duplicate detection for a dashboard listing using address, location, and title heuristics.',
  tags: ['Dashboard'],
  security: [{ bearerAuth: [] }],
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Property ID' }],
  responses: {
    '200': { description: 'Duplicate analysis completed' },
    '401': { description: 'Unauthorized' },
    '403': { description: 'Forbidden' },
    '404': { description: 'Property not found' },
  },
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const propertyId = id;

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await getAuthUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify role via Prisma
    const userRow = await prisma.users.findUnique({
      where: { id: user.id },
      select: { role: true },
    });
    if (!userRow || !["owner", "admin"].includes(userRow.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get the property details for duplicate checking
    const property = await prisma.properties.findUnique({
      where: { id: propertyId },
      select: { title: true, address: true, state: true, latitude: true, longitude: true, owner_id: true },
    });

    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 },
      );
    }

    // Verify ownership (unless admin)
    if (userRow.role !== "admin" && property.owner_id !== user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Perform duplicate checks
    const duplicates = {
      exact_address: [] as any[],
      nearby_properties: [] as any[],
      similar_titles: [] as any[],
    };

    // 1. Exact address match via Prisma
    const exactMatches = await prisma.properties.findMany({
      where: {
        address: property.address,
        state: property.state ?? undefined,
        NOT: [{ id: propertyId }, { status: "rejected" }],
      },
      select: {
        id: true,
        title: true,
        address: true,
        state: true,
        status: true,
        created_at: true,
        owners: { select: { profiles: { select: { full_name: true, email: true } } } },
      },
      take: 5,
    });

    duplicates.exact_address = exactMatches;

    // 2. Nearby properties — PostGIS via Prisma
    if (property.latitude && property.longitude) {
      const nearby = await propertiesWithinRadius({
        lat: Number(property.latitude),
        lng: Number(property.longitude),
        radiusKm: 0.5,
        excludePropertyId: propertyId,
      });
      duplicates.nearby_properties = nearby.slice(0, 5);
    }

    // 3. Similar titles in same state (basic text similarity)
    const titleWords = property.title.toLowerCase().split(" ");
    const significantWords = titleWords.filter(
      (word: string) =>
        word.length > 3 &&
        !["the", "and", "for", "with", "from"].includes(word),
    );

    if (significantWords.length > 0) {
      const similarTitles = await prisma.properties.findMany({
        where: {
          state: property.state ?? undefined,
          NOT: [{ id: propertyId }, { status: "rejected" }],
          title: { contains: significantWords[0], mode: "insensitive" },
        },
        select: {
          id: true,
          title: true,
          address: true,
          state: true,
          status: true,
          owners: { select: { profiles: { select: { full_name: true } } } },
        },
        take: 5,
      });
      duplicates.similar_titles = similarTitles;
    }

    // Calculate overall duplicate risk
    const totalDuplicates =
      duplicates.exact_address.length +
      duplicates.nearby_properties.length +
      duplicates.similar_titles.length;

    let riskLevel: "low" | "medium" | "high" = "low";
    if (totalDuplicates >= 3) {
      riskLevel = "high";
    } else if (totalDuplicates >= 1) {
      riskLevel = "medium";
    }

    return NextResponse.json({
      data: {
        property_id: propertyId,
        risk_level: riskLevel,
        total_duplicates: totalDuplicates,
        duplicates,
        recommendations:
          riskLevel === "high"
            ? [
                "Contact RealEST support to review potential duplicate",
                "Consider modifying property details",
              ]
            : riskLevel === "medium"
              ? [
                  "Review similar properties to ensure this is unique",
                  "Consider adding more specific details",
                ]
              : ["Property appears unique - proceed with listing"],
      },
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
