import { createClient, getAuthUser } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import type { OpenApiMetadata } from "@/lib/openapi/route-metadata";

const inquiryIdSchema = z.string().uuid("Invalid inquiry ID");

interface RouteParams {
  params: Promise<{ id: string }>;
}

export const openApiGET: OpenApiMetadata = {
  method: 'get',
  summary: 'Get owner inquiry',
  description: 'Fetch a single inquiry that belongs to the owner dashboard.',
  tags: ['Dashboard'],
  security: [{ bearerAuth: [] }],
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Inquiry ID' }],
  responses: {
    '200': { description: 'Inquiry retrieved successfully' },
    '401': { description: 'Unauthorized' },
    '403': { description: 'Access denied' },
    '404': { description: 'Inquiry not found' },
  },
}

export const openApiPUT: OpenApiMetadata = {
  method: 'put',
  summary: 'Update owner inquiry',
  description: 'Update the status of an inquiry in the owner dashboard.',
  tags: ['Dashboard'],
  security: [{ bearerAuth: [] }],
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Inquiry ID' }],
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: { status: { type: 'string', enum: ['new', 'read', 'responded', 'closed'] } },
        },
      },
    },
  },
  responses: {
    '200': { description: 'Inquiry updated successfully' },
    '400': { description: 'Invalid status or query data' },
    '401': { description: 'Unauthorized' },
    '403': { description: 'Access denied' },
    '404': { description: 'Inquiry not found' },
  },
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    const inquiryIdResult = inquiryIdSchema.safeParse(id);
    if (!inquiryIdResult.success) {
      return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
    }
    const inquiryId = inquiryIdResult.data;

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await getAuthUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch inquiry with related data
    const inquiry = await prisma.inquiries.findUnique({
      where: { id: inquiryId },
      include: {
        profiles_inquiries_sender_idToprofiles: {
          select: { full_name: true, email: true, phone: true, avatar_url: true },
        },
        profiles_inquiries_owner_idToprofiles: {
          select: { full_name: true, email: true },
        },
        properties: {
          select: {
            id: true,
            title: true,
            address: true,
            state: true,
            price: true,
            price_frequency: true,
            property_media: {
              select: { media_url: true, is_featured: true },
              take: 1,
              orderBy: { display_order: "asc" },
            },
          },
        },
      },
    });

    if (!inquiry) {
      return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
    }

    // Verify user can access this inquiry (must be sender or owner)
    if (inquiry.sender_id !== user.id && inquiry.owner_id !== user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json({ data: inquiry });
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
    const inquiryIdResult = inquiryIdSchema.safeParse(id);
    if (!inquiryIdResult.success) {
      return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
    }
    const inquiryId = inquiryIdResult.data;

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await getAuthUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const updates = await request.json();
    const allowedFields = ["status"];
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([key]) => allowedFields.includes(key)),
    );

    // Verify user can update this inquiry
    const existingInquiry = await prisma.inquiries.findUnique({
      where: { id: inquiryId },
      select: { sender_id: true, owner_id: true, status: true },
    });

    if (!existingInquiry) {
      return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
    }

    // Only sender and owner can update status
    if (
      existingInquiry.sender_id !== user.id &&
      existingInquiry.owner_id !== user.id
    ) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Validate status transitions
    const validStatuses = ["new", "read", "responded", "closed"];
    if (
      filteredUpdates.status &&
      typeof filteredUpdates.status === "string" &&
      !validStatuses.includes(filteredUpdates.status)
    ) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Update inquiry
    const updatedInquiry = await prisma.inquiries.update({
      where: { id: inquiryId },
      data: {
        ...(filteredUpdates.status ? { status: filteredUpdates.status as string } : {}),
        updated_at: new Date(),
      },
      include: {
        profiles_inquiries_sender_idToprofiles: {
          select: { full_name: true, email: true },
        },
        profiles_inquiries_owner_idToprofiles: {
          select: { full_name: true, email: true },
        },
        properties: {
          select: { title: true, address: true },
        },
      },
    });

    return NextResponse.json({
      data: updatedInquiry,
      message: "Inquiry updated successfully",
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
