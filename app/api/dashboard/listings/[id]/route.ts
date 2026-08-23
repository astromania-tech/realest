import { createClient, getAuthUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";
import type { OpenApiMetadata } from "@/lib/openapi/route-metadata";

const propertyIdSchema = z.string().uuid("Invalid property ID");

interface RouteParams {
  params: Promise<{ id: string }>;
}

export const openApiGET: OpenApiMetadata = {
  method: 'get',
  summary: 'Get dashboard property',
  description: 'Fetch a single property with all owner dashboard relations, media, documents, and inquiries.',
  tags: ['Dashboard'],
  security: [{ bearerAuth: [] }],
  parameters: [
    { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Property ID' },
  ],
  responses: {
    '200': { description: 'Property retrieved successfully' },
    '401': { description: 'Unauthorized' },
    '403': { description: 'Forbidden - Property owners only' },
    '404': { description: 'Property not found or access denied' },
  },
}

export const openApiPUT: OpenApiMetadata = {
  method: 'put',
  summary: 'Update dashboard property',
  description: 'Update owner-managed property fields before verification.',
  tags: ['Dashboard'],
  security: [{ bearerAuth: [] }],
  parameters: [
    { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Property ID' },
  ],
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: { type: 'object', description: 'Partial property update payload' },
      },
    },
  },
  responses: {
    '200': { description: 'Property updated successfully' },
    '401': { description: 'Unauthorized' },
    '403': { description: 'Forbidden - Property owners only' },
    '404': { description: 'Property not found or access denied' },
  },
}

export const openApiDELETE: OpenApiMetadata = {
  method: 'delete',
  summary: 'Delete dashboard property',
  description: 'Delete a draft, unlisted, or rejected property from the dashboard.',
  tags: ['Dashboard'],
  security: [{ bearerAuth: [] }],
  parameters: [
    { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Property ID' },
  ],
  responses: {
    '200': { description: 'Property deleted successfully' },
    '400': { description: 'Cannot delete property' },
    '401': { description: 'Unauthorized' },
    '403': { description: 'Forbidden - Property owners only' },
    '404': { description: 'Property not found or access denied' },
  },
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    const propertyIdResult = propertyIdSchema.safeParse(id);
    if (!propertyIdResult.success) {
      return NextResponse.json({ error: "Property not found or access denied" }, { status: 404 });
    }
    const propertyId = propertyIdResult.data;

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
      return NextResponse.json(
        { error: "Forbidden - Property owners only" },
        { status: 403 },
      );
    }

    // Resolve owner ID for ownership filter (owner_id now → owners.id)
    let ownerIdFilter: string | undefined;
    if (userRow.role !== "admin") {
      const ownerRec = await prisma.owners.findUnique({ where: { profile_id: user.id }, select: { id: true } });
      if (!ownerRec) {
        return NextResponse.json({ error: "Property not found or access denied" }, { status: 404 });
      }
      ownerIdFilter = ownerRec.id;
    }

    // Fetch property with related data
    const property = await prisma.properties.findFirst({
      where: {
        id: propertyId,
        ...(ownerIdFilter ? { owner_id: ownerIdFilter } : {}),
      },
      include: {
        owners: { include: { profiles: { select: { full_name: true, email: true, phone: true, avatar_url: true } } } },
        property_media: true,
        property_documents: true,
        inquiries: {
          include: {
            profiles_inquiries_sender_idToprofiles: { select: { full_name: true, email: true } },
          },
        },
      },
    });

    if (!property) {
      return NextResponse.json(
        { error: "Property not found or access denied" },
        { status: 404 },
      );
    }

    return NextResponse.json({ data: property });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    const propertyIdResult = propertyIdSchema.safeParse(id);
    if (!propertyIdResult.success) {
      return NextResponse.json({ error: "Property not found or access denied" }, { status: 404 });
    }
    const propertyId = propertyIdResult.data;

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
      return NextResponse.json(
        { error: "Forbidden - Property owners only" },
        { status: 403 },
      );
    }

    // Parse request body
    const updates = await request.json();

    // Prevent updating certain fields that should be managed by the system
    const protectedFields = ["id", "owner_id", "status", "verified_at", "created_at"];
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([key]) => !protectedFields.includes(key)),
    );

    // Resolve owner ID for non-admin ownership filter (PUT)
    let ownerIdFilterPut: string | undefined;
    if (userRow.role !== "admin") {
      const ownerRec = await prisma.owners.findUnique({ where: { profile_id: user.id }, select: { id: true } });
      if (!ownerRec) {
        return NextResponse.json({ error: "Property not found or access denied" }, { status: 404 });
      }
      ownerIdFilterPut = ownerRec.id;
    }

    // Update property via Prisma
    const property = await prisma.properties.updateMany({
      where: {
        id: propertyId,
        ...(ownerIdFilterPut ? { owner_id: ownerIdFilterPut } : {}),
      },
      data: { ...filteredUpdates, updated_at: new Date() },
    });

    if (property.count === 0) {
      return NextResponse.json(
        { error: "Property not found or access denied" },
        { status: 404 },
      );
    }

    const updated = await prisma.properties.findUnique({
      where: { id: propertyId },
      include: { owners: { include: { profiles: { select: { full_name: true, email: true } } } } },
    });

    return NextResponse.json({
      data: updated,
      message: "Property updated successfully",
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    const propertyIdResult = propertyIdSchema.safeParse(id);
    if (!propertyIdResult.success) {
      return NextResponse.json({ error: "Property not found or access denied" }, { status: 404 });
    }
    const propertyId = propertyIdResult.data;

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
      return NextResponse.json(
        { error: "Forbidden - Property owners only" },
        { status: 403 },
      );
    }

    // Resolve owner ID for non-admin ownership filter (DELETE)
    let ownerIdFilterDel: string | undefined;
    if (userRow.role !== "admin") {
      const ownerRec = await prisma.owners.findUnique({ where: { profile_id: user.id }, select: { id: true } });
      if (!ownerRec) {
        return NextResponse.json({ error: "Property not found or access denied" }, { status: 404 });
      }
      ownerIdFilterDel = ownerRec.id;
    }

    // Check current property status - only allow deletion of draft/unlisted/rejected properties
    const currentProperty = await prisma.properties.findFirst({
      where: {
        id: propertyId,
        ...(ownerIdFilterDel ? { owner_id: ownerIdFilterDel } : {}),
      },
      select: { status: true },
    });

    if (!currentProperty) {
      return NextResponse.json(
        { error: "Property not found or access denied" },
        { status: 404 },
      );
    }

    if (!["draft", "unlisted", "rejected"].includes(currentProperty.status)) {
      return NextResponse.json(
        {
          error: "Cannot delete property",
          message: "Only draft, unlisted, or rejected properties can be deleted",
        },
        { status: 400 },
      );
    }

    // Delete property (cascades to media/documents via FK)
    await prisma.properties.delete({ where: { id: propertyId } });

    return NextResponse.json({
      message: "Property deleted successfully",
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
