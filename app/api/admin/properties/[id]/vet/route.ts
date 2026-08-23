import { NextRequest, NextResponse } from "next/server";
import { createClient, getAuthUser } from "@/lib/supabase/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

// Schema for vetting a property
const vetPropertySchema = z.object({
  status: z.enum(["live", "rejected"]),
  rejection_reason: z.string().optional(),
  admin_notes: z.string().optional(),
  verified_at: z.string().datetime().optional(), // ISO datetime string
});

type VetPropertyInput = z.infer<typeof vetPropertySchema>;

// PUT /api/admin/properties/[id]/vet - Admin property vetting
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    const propertyId = id;

    // Get authenticated user and verify admin role
    const {
      data: { user },
      error: authError,
    } = await getAuthUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // Verify user is admin
    const adminRow = await prisma.users.findUnique({ where: { id: user.id }, select: { role: true } })
    if (!adminRow || adminRow.role !== 'admin') {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 },
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = vetPropertySchema.parse(body);

    // Verify property exists and is in vetting status
    const property = await prisma.properties.findFirst({
      where: { id: propertyId, status: 'pending_vetting' },
      select: { id: true, status: true, owner_id: true, title: true },
    })

    if (!property) {
      return NextResponse.json(
        { error: "Property not found or not pending vetting" },
        { status: 404 },
      );
    }

    if (validatedData.status === "rejected" && !validatedData.rejection_reason) {
      return NextResponse.json(
        { error: "Rejection reason required for rejected properties" },
        { status: 400 },
      );
    }

    // Update property status (only schema-valid fields)
    const updatedProperty = await prisma.properties.update({
      where: { id: propertyId },
      data: { status: validatedData.status, updated_at: new Date() },
      select: { id: true, status: true, title: true, owner_id: true },
    })

    // Create notification for property owner
    const notificationMessage =
      validatedData.status === "live"
        ? `Your property "${property.title}" has been verified and is now live on RealEST!`
        : `Your property "${property.title}" has been rejected. Reason: ${validatedData.rejection_reason}`;

    if (property.owner_id) {
      await prisma.notifications.create({
        data: {
          user_id: property.owner_id,
          type: 'property_status',
          title: validatedData.status === 'live' ? 'Property Verified' : 'Property Rejected',
          message: notificationMessage,
          data: { property_id: propertyId, status: validatedData.status, rejection_reason: validatedData.rejection_reason ?? null },
        },
      })
    }

    // Log admin action
    await prisma.admin_audit_log.create({
      data: {
        actor_id: user.id,
        action: 'property_vetting',
        target_id: propertyId,
        metadata: {
          old_status: 'pending_vetting',
          new_status: validatedData.status,
          rejection_reason: validatedData.rejection_reason ?? null,
          admin_notes: validatedData.admin_notes ?? null,
        },
      },
    })

    return NextResponse.json({
      data: updatedProperty,
      message: `Property ${validatedData.status === "live" ? "approved" : "rejected"} successfully`,
    });
  } catch (error) {
    console.error("API error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export const openApiPUT = {
  method: 'put',
  summary: 'Vetting decision for property',
  description: 'Admin endpoint to approve (live) or reject a property during physical vetting.',
  tags: ['admin','properties','vetting'],
  parameters: [ { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } } ],
  requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } },
  responses: { '200': { description: 'Vetting applied' }, '400': { description: 'Invalid request' }, '401': { description: 'Unauthorized' }, '403': { description: 'Forbidden' }, '404': { description: 'Property not found' } },
} as const;
