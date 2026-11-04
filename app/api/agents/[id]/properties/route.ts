import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma, Prisma } from '@/lib/prisma'

// GET /api/agents/[id]/properties - Get properties listed by agent
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    const agentId = id;

    // Verify agent exists and is verified
    const agentRow = await prisma.agents.findFirst({
      where: { profile_id: agentId },
      select: { id: true, verified: true, profiles: { select: { id: true, full_name: true } } },
    });

    if (!agentRow) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    if (!agentRow.verified) {
      return NextResponse.json(
        { error: "Agent profile not available" },
        { status: 404 },
      );
    }

    // Parse query parameters
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const perPage = Math.min(
      parseInt(url.searchParams.get("per_page") || "12"),
      50,
    );
    const status = url.searchParams.get("status") || "live"; // live, all
    const sortBy = url.searchParams.get("sort_by") || "created_at"; // created_at, price, title
    const sortOrder = url.searchParams.get("sort_order") || "desc";

    // Build properties query
    const where: Prisma.propertiesWhereInput = { agent_id: agentRow.id };
    if (status !== "all") where.status = status;

    const validSortFields = ["created_at", "price", "title"];
    const sortField = validSortFields.includes(sortBy) ? sortBy : "created_at";
    const orderBy: Prisma.propertiesOrderByWithRelationInput = { [sortField]: sortOrder as 'asc' | 'desc' };

    const skip = (page - 1) * perPage;

    const [properties, count] = await Promise.all([
      prisma.properties.findMany({
        where,
        select: {
          id: true,
          title: true,
          description: true,
          price: true,
          price_frequency: true,
          address: true,
          state: true,
          city: true,
          bedrooms: true,
          bathrooms: true,
          square_feet: true,
          property_type: true,
          status: true,
          created_at: true,
          updated_at: true,
          property_media: {
            select: { id: true, media_url: true, is_featured: true, display_order: true },
            orderBy: { display_order: 'asc' },
          },
        },
        orderBy,
        skip,
        take: perPage,
      }),
      prisma.properties.count({ where }),
    ]);

    // Process properties to include featured image
    const processedProperties =
      properties.map((property: any) => ({
        ...property,
        primary_image:
          property.property_media?.find((m: any) => m.is_featured)?.media_url ||
          property.property_media?.[0]?.media_url ||
          null,
        images_count: property.property_media?.length || 0,
      }));

    // Get property statistics for this agent
    const allStatuses = await prisma.properties.findMany({
      where: { agent_id: agentRow.id },
      select: { status: true },
    });

    const propertyStats = {
      total: allStatuses.length,
      live: allStatuses.filter((p: any) => p.status === "live").length,
      pending: allStatuses.filter((p: any) =>
        ["pending_ml_validation", "pending_vetting"].includes(p.status),
      ).length,
      sold: allStatuses.filter((p: any) => p.status === "sold").length,
    };

    const totalPages = Math.ceil(count / perPage);

    return NextResponse.json({
      data: processedProperties,
      agent: {
        id: agentRow.profiles.id,
        name: agentRow.profiles.full_name,
      },
      pagination: {
        page,
        per_page: perPage,
        total: count || 0,
        total_pages: totalPages,
        has_next: page < totalPages,
        has_prev: page > 1,
      },
      stats: propertyStats,
      filters: {
        status,
        sort_by: sortBy,
        sort_order: sortOrder,
      },
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
