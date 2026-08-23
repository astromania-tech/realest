import { createClient, getAuthUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import type { OpenApiMetadata } from "@/lib/openapi/route-metadata";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export const openApiPOST: OpenApiMetadata = {
  method: 'post',
  summary: 'Renew dashboard property',
  description: 'Renew a live or expired property listing and set it back to live status.',
  tags: ['Dashboard'],
  security: [{ bearerAuth: [] }],
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Property ID' }],
  responses: {
    '200': { description: 'Property renewed successfully' },
    '400': { description: 'Cannot renew property' },
    '401': { description: 'Unauthorized' },
    '403': { description: 'Forbidden - Property owners only' },
    '404': { description: 'Property not found or access denied' },
  },
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const supabase = await createClient();
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

    // Verify property ownership (unless admin) and check status
    const property = await prisma.properties.findFirst({
      where: {
        id: propertyId,
        ...(userRow.role !== "admin" ? { owner_id: user.id } : {}),
      },
      select: { status: true },
    });

    if (!property) {
      return NextResponse.json(
        { error: "Property not found or access denied" },
        { status: 404 },
      );
    }

    if (userRow.role !== "admin" && !["live", "expired"].includes(property.status)) {
      return NextResponse.json(
        {
          error: "Cannot renew property",
          message: "Only live or expired properties can be renewed",
        },
        { status: 400 },
      );
    }

    // Update property with renewal via Prisma
    const updatedProperty = await prisma.properties.update({
      where: { id: propertyId },
      data: {
        status: "live",
        updated_at: new Date(),
      },
      include: { owners: { include: { profiles: { select: { full_name: true, email: true } } } } },
    });

    console.log(`Property ${propertyId} renewed by user ${user.id}`);

    return NextResponse.json({
      data: updatedProperty,
      message: "Property renewed successfully for another year",
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
