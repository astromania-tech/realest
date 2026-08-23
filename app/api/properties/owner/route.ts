// realest/app/api/properties/owner/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient, getAuthUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import type { OpenApiMetadata } from "@/lib/openapi/route-metadata";

/**
 * OpenAPI metadata for GET /api/properties/owner
 * Retrieve authenticated user's properties
 */
export const openApiGET: OpenApiMetadata = {
  method: "get",
  summary: "Get user's properties",
  description: "Retrieve all properties owned or managed by the authenticated user. Only accessible to property owners and agents. Supports pagination.",
  tags: ["Properties"],
  security: [{ bearerAuth: [] }],
  parameters: [
    {
      name: "page",
      in: "query",
      schema: { type: "integer", minimum: 1, default: 1 },
      description: "Page number",
    },
    {
      name: "limit",
      in: "query",
      schema: { type: "integer", minimum: 1, maximum: 50, default: 20 },
      description: "Properties per page",
    },
  ],
  responses: {
    "200": {
      description: "User properties list with pagination",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              properties: { type: "array", items: { type: "object" } },
              pagination: { type: "object" },
            },
          },
        },
      },
    },
    "401": { description: "Unauthorized" },
    "403": { description: "User must be an owner or agent" },
    "404": { description: "Owner/agent profile not found" },
  },
};

// GET /api/properties/owner - Get current user's properties (owner/agent)
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

    // Check if user has owner or agent role
    const userRow = await prisma.users.findUnique({
      where: { id: user.id },
      select: { role: true },
    });

    if (!userRow || !["owner", "agent"].includes(userRow.role)) {
      return NextResponse.json(
        { error: "Only property owners and agents can access this endpoint" },
        { status: 403 },
      );
    }

    // For agents, get their agent_id from the agents table
    let agentId: string | null = null;
    if (userRow.role === "agent") {
      const agentData = await prisma.agents.findFirst({
        where: { profile_id: user.id },
        select: { id: true },
      });

      if (!agentData) {
        return NextResponse.json(
          { error: "Agent profile not found" },
          { status: 404 },
        );
      }
      agentId = agentData.id;
    }

    // Parse pagination parameters
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const skip = (page - 1) * limit;

    // For owners, look up owners record (owner_id now → owners.id, not profiles.id)
    let ownerId: string | undefined;
    if (userRow.role === "owner") {
      const ownerRecord = await prisma.owners.findUnique({
        where: { profile_id: user.id },
        select: { id: true },
      });
      if (!ownerRecord) {
        return NextResponse.json({
          properties: [],
          pagination: { page, limit, total: 0, total_pages: 0, has_next: false, has_prev: false },
        });
      }
      ownerId = ownerRecord.id;
    }

    const where =
      userRow.role === "owner"
        ? { owner_id: ownerId! }
        : { agent_id: agentId! };

    const [properties, totalCount] = await Promise.all([
      prisma.properties.findMany({
        where,
        include: {
          property_details: true,
          property_media: true,
          property_documents: true,
        },
        orderBy: { created_at: "desc" },
        skip,
        take: limit,
      }),
      prisma.properties.count({ where }),
    ]);

    // Get inquiry stats for each property
    const propertyIds = properties.map((p: any) => p.id);
    let inquiryStats: Record<string, { count: number; recent: unknown[] }> = {};

    if (propertyIds.length > 0) {
      const inquiries = await prisma.inquiries.findMany({
        where: { property_id: { in: propertyIds } },
        select: {
          id: true,
          property_id: true,
          message: true,
          status: true,
          created_at: true,
          profiles_inquiries_sender_idToprofiles: {
            select: { full_name: true, avatar_url: true },
          },
        },
        orderBy: { created_at: "desc" },
      });

      const countMap: Record<string, number> = {};
      const recentMap: Record<string, unknown[]> = {};

      inquiries.forEach((inq: any) => {
        countMap[inq.property_id] = (countMap[inq.property_id] || 0) + 1;
        if (!recentMap[inq.property_id]) recentMap[inq.property_id] = [];
        if (recentMap[inq.property_id].length < 3) {
          recentMap[inq.property_id].push({
            id: inq.id,
            message: inq.message,
            status: inq.status,
            created_at: inq.created_at,
            sender: inq.profiles_inquiries_sender_idToprofiles,
          });
        }
      });

      propertyIds.forEach((id: string) => {
        inquiryStats[id] = {
          count: countMap[id] || 0,
          recent: recentMap[id] || [],
        };
      });
    }

    const propertiesWithStats = properties.map((property: any) => ({
      ...property,
      inquiry_count: inquiryStats[property.id]?.count || 0,
      recent_inquiries: inquiryStats[property.id]?.recent || [],
    }));

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      properties: propertiesWithStats,
      pagination: {
        page,
        limit,
        total: totalCount,
        total_pages: totalPages,
        has_next: page < totalPages,
        has_prev: page > 1,
      },
    });
  } catch (error) {
    console.error("Owner properties API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
