// realest/app/api/inquiries/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient, getAuthUser } from "@/lib/supabase/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const updateInquirySchema = z.object({
  status: z.enum(["pending", "responded", "closed"]).optional(),
  response_message: z.string().optional(),
});

// GET /api/inquiries/[id] - Get single inquiry with full details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    const inquiryId = id;

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await getAuthUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get inquiry with related data
    const inquiry = await prisma.inquiries.findUnique({
      where: { id: inquiryId },
      include: {
        properties: {
          select: {
            id: true,
            title: true,
            address: true,
            price: true,
            owner_id: true,
            property_media: {
              select: { media_url: true, is_featured: true },
              take: 1,
              orderBy: { display_order: 'asc' },
            },
          },
        },
        profiles_inquiries_sender_idToprofiles: {
          select: { id: true, full_name: true, avatar_url: true, phone: true, email: true },
        },
        profiles_inquiries_owner_idToprofiles: {
          select: { id: true, full_name: true, avatar_url: true, phone: true },
        },
      },
    });

    if (!inquiry) {
      return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
    }

    // Check if user has access (user who sent it or property owner)
    const isUser = inquiry.sender_id === user.id;
    const isOwner = inquiry.properties?.owner_id === user.id;

    if (!isUser && !isOwner) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json({ inquiry });
  } catch (error) {
    console.error("Inquiry API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PUT /api/inquiries/[id] - Update inquiry (status, response)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    const inquiryId = id;

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await getAuthUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updateInquirySchema.parse(body);

    // Get inquiry to check ownership
    const inquiry = await prisma.inquiries.findUnique({
      where: { id: inquiryId },
      select: { sender_id: true, owner_id: true, properties: { select: { owner_id: true } } },
    });

    if (!inquiry) {
      return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
    }

    // Check permissions
    const isUser = inquiry.sender_id === user.id;
    const isOwner = inquiry.properties?.owner_id === user.id;

    if (!isUser && !isOwner) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Users can only close their inquiries
    if (isUser && validatedData.status && validatedData.status !== "closed") {
      return NextResponse.json(
        { error: "Users can only close inquiries" },
        { status: 403 },
      );
    }

    // Owners can respond and update status
    if (isOwner && validatedData.response_message) {
      // TODO: Send response notification to user
    }

    const updatedInquiry = await prisma.inquiries.update({
      where: { id: inquiryId },
      data: {
        ...(validatedData.status ? { status: validatedData.status } : {}),
        updated_at: new Date(),
      },
    });

    return NextResponse.json({
      inquiry: updatedInquiry,
      message: "Inquiry updated successfully",
    });
  } catch (error) {
    console.error("Inquiry update API error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid update data", details: error.errors },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
