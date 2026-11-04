import { NextRequest, NextResponse } from "next/server";
import { createClient, getAuthUser } from "@/lib/supabase/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

// Schema for ML validation update
const mlUpdateSchema = z.object({
  status: z.enum(["passed", "failed", "review_required"]),
  confidence_score: z.number().min(0).max(1).optional(),
  notes: z.string().optional(),
  flagged_issues: z.array(z.string()).optional(),
});

type MLUpdateInput = z.infer<typeof mlUpdateSchema>;

// PUT /api/admin/properties/[id]/ml-update - Admin ML validation update
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
    const validatedData = mlUpdateSchema.parse(body);

    // Verify property exists and is in ML validation status
    const property = await prisma.properties.findFirst({
      where: { id: propertyId, status: 'pending_ml_validation' },
      select: { id: true, status: true, owner_id: true, title: true },
    })

    if (!property) {
      return NextResponse.json(
        { error: "Property not found or not pending ML validation" },
        { status: 404 },
      );
    }

    // Determine new property status based on ML result
    const newPropertyStatus = validatedData.status === 'passed' ? 'pending_vetting' : 'pending_ml_validation'

    // Update property status (only schema-valid fields)
    const updatedProperty = await prisma.properties.update({
      where: { id: propertyId },
      data: { status: newPropertyStatus, updated_at: new Date() },
      select: { id: true, status: true, title: true, owner_id: true },
    })

    // Create notification for property owner
    let notificationTitle = ''
    let notificationMessage = ''
    switch (validatedData.status) {
      case 'passed':
        notificationTitle = 'ML Validation Passed'
        notificationMessage = `Your property "${property.title}" has passed ML validation and is now pending physical vetting.`
        break
      case 'failed':
        notificationTitle = 'ML Validation Failed'
        notificationMessage = `Your property "${property.title}" failed ML validation. Please review and resubmit.`
        break
      case 'review_required':
        notificationTitle = 'ML Validation Review Required'
        notificationMessage = `Your property "${property.title}" requires manual review. Our team will contact you soon.`
        break
    }

    if (property.owner_id) {
      await prisma.notifications.create({
        data: {
          user_id: property.owner_id,
          type: 'ml_validation',
          title: notificationTitle,
          message: notificationMessage,
          data: {
            property_id: propertyId,
            ml_status: validatedData.status,
            confidence_score: validatedData.confidence_score ?? null,
            notes: validatedData.notes ?? null,
          },
        },
      })
    }

    // Log admin action
    await prisma.admin_audit_log.create({
      data: {
        actor_id: user.id,
        action: 'ml_validation_update',
        target_id: propertyId,
        metadata: {
          old_status: 'pending_ml_validation',
          new_status: newPropertyStatus,
          ml_status: validatedData.status,
          confidence_score: validatedData.confidence_score ?? null,
          notes: validatedData.notes ?? null,
          flagged_issues: validatedData.flagged_issues ?? null,
        },
      },
    })

    return NextResponse.json({
      data: updatedProperty,
      message: `ML validation ${validatedData.status} - property status updated`,
    });
  } catch (error) {
    console.error('API error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 },
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

export const openApiPUT = {
  method: 'put',
  summary: 'Admin ML validation update for property',
  description: 'Admin endpoint to apply ML validation results and update property status.',
  tags: ['admin','properties','ml'],
  parameters: [ { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } } ],
  requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } },
  responses: { '200': { description: 'ML update applied' }, '400': { description: 'Invalid request' }, '401': { description: 'Unauthorized' }, '403': { description: 'Forbidden' }, '404': { description: 'Property not found' } },
} as const;
