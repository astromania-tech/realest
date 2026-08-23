import { createClient, getAuthUser } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import type { OpenApiMetadata } from "@/lib/openapi/route-metadata";

const closeSchema = z.object({
  reason: z
    .enum(["resolved", "no_longer_interested", "duplicate", "spam", "other"])
    .optional(),
  notes: z
    .string()
    .max(500, "Notes must be less than 500 characters")
    .optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export const openApiPOST: OpenApiMetadata = {
  method: 'post',
  summary: 'Close owner inquiry',
  description: 'Close an inquiry and notify the other party.',
  tags: ['Dashboard'],
  security: [{ bearerAuth: [] }],
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Inquiry ID' }],
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            reason: { type: 'string', enum: ['resolved', 'no_longer_interested', 'duplicate', 'spam', 'other'] },
            notes: { type: 'string' },
          },
        },
      },
    },
  },
  responses: {
    '200': { description: 'Inquiry closed successfully' },
    '400': { description: 'Invalid close data' },
    '401': { description: 'Unauthorized' },
    '403': { description: 'Access denied' },
    '404': { description: 'Inquiry not found' },
  },
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    const inquiryId = id;

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await getAuthUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = closeSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid close data",
          details: validationResult.error.issues,
        },
        { status: 400 },
      );
    }

    const closeData = validationResult.data;

    // Verify inquiry exists and user can close it
    const inquiry = await prisma.inquiries.findUnique({
      where: { id: inquiryId },
      include: {
        profiles_inquiries_sender_idToprofiles: { select: { id: true, full_name: true, email: true } },
        profiles_inquiries_owner_idToprofiles: { select: { id: true, full_name: true, email: true } },
        properties: { select: { title: true, address: true, owner_id: true } },
      },
    });

    if (!inquiry) {
      return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
    }

    // Verify user is either sender or owner
    if (inquiry.sender_id !== user.id && inquiry.owner_id !== user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Close the inquiry
    const closedInquiry = await prisma.inquiries.update({
      where: { id: inquiryId },
      data: { status: "closed", updated_at: new Date() },
      include: {
        profiles_inquiries_sender_idToprofiles: { select: { full_name: true, email: true } },
        profiles_inquiries_owner_idToprofiles: { select: { full_name: true, email: true } },
        properties: { select: { title: true, address: true } },
      },
    });

    // Log closure reason if provided (could be stored in a separate activity log)
    if (closeData.reason || closeData.notes) {
      console.log(`Inquiry ${inquiryId} closed by user ${user.id}:`, {
        reason: closeData.reason,
        notes: closeData.notes,
      });
    }

    // Send notification email to the other party
    const isOwnerClosing = inquiry.owner_id === user.id;
    const recipient = isOwnerClosing
      ? inquiry.profiles_inquiries_sender_idToprofiles
      : inquiry.profiles_inquiries_owner_idToprofiles;

    const emailData = {
      to: recipient.email,
      subject: `Inquiry closed for ${inquiry.properties?.title}`,
      template: "inquiry-closed",
      data: {
        recipient_name: recipient?.full_name,
        property_title: inquiry.properties?.title,
        property_address: inquiry.properties?.address,
        closed_by: isOwnerClosing ? "property owner" : "inquirer",
        reason: closeData.reason,
        notes: closeData.notes,
      },
    };

    // Trigger email sending
    console.log("Sending closure notification:", emailData);

    return NextResponse.json({
      data: closedInquiry,
      message: "Inquiry closed successfully",
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
