import { NextRequest, NextResponse } from "next/server";
import { createClient, getAuthUser } from "@/lib/supabase/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

// Schema for resolving duplicates
const resolveDuplicateSchema = z.object({
  action: z.enum(["keep_both", "keep_master", "reject_duplicate"]),
  master_property_id: z.string().uuid().optional(), // Required if action is 'keep_master'
  rejection_reason: z.string().optional(), // Required if action is 'reject_duplicate'
  admin_notes: z.string().optional(),
});

type ResolveDuplicateInput = z.infer<typeof resolveDuplicateSchema>;

// PUT /api/admin/duplicates/[id]/resolve - Admin duplicate resolution
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    const duplicateId = id;

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
    const validatedData = resolveDuplicateSchema.parse(body);

    // Get duplicate record (is_duplicate not in schema, just fetch by id)
    const duplicate = await prisma.properties.findUnique({
      where: { id: duplicateId },
      select: { id: true, status: true, owner_id: true, title: true },
    })

    if (!duplicate) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 },
      );
    }

    // Validate action-specific requirements
    if (
      validatedData.action === "keep_master" &&
      !validatedData.master_property_id
    ) {
      return NextResponse.json(
        { error: "Master property ID required for keep_master action" },
        { status: 400 },
      );
    }

    if (
      validatedData.action === "reject_duplicate" &&
      !validatedData.rejection_reason
    ) {
      return NextResponse.json(
        { error: "Rejection reason required for reject_duplicate action" },
        { status: 400 },
      );
    }

    // Execute resolution action (only schema-valid fields: status + updated_at)
    let result: { id: string; status: string | null } | null = null
    const resolutionDetails = {
      duplicate_id: duplicateId,
      action: validatedData.action,
      master_property_id: validatedData.master_property_id ?? null,
      rejection_reason: validatedData.rejection_reason ?? null,
      admin_notes: validatedData.admin_notes ?? null,
      resolved_at: new Date().toISOString(),
      resolved_by: user.id,
    }

    switch (validatedData.action) {
      case 'keep_both':
        // Both listings remain, no status change
        result = await prisma.properties.update({
          where: { id: duplicateId },
          data: { updated_at: new Date() },
          select: { id: true, status: true },
        })
        break

      case 'keep_master':
        // Reject the duplicate
        result = await prisma.properties.update({
          where: { id: duplicateId },
          data: { status: 'rejected', updated_at: new Date() },
          select: { id: true, status: true },
        })
        break

      case 'reject_duplicate':
        // Reject the duplicate
        result = await prisma.properties.update({
          where: { id: duplicateId },
          data: { status: 'rejected', updated_at: new Date() },
          select: { id: true, status: true },
        })
        break
    }

    // Create notifications for affected owners
    if (validatedData.action === 'keep_master' && duplicate.owner_id) {
      await prisma.notifications.create({
        data: {
          user_id: duplicate.owner_id,
          type: 'duplicate_resolution',
          title: 'Property Marked as Duplicate',
          message: `Your property "${duplicate.title}" has been identified as a duplicate and rejected. The original listing will remain active.`,
          data: resolutionDetails,
        },
      })
    } else if (validatedData.action === 'reject_duplicate' && duplicate.owner_id) {
      await prisma.notifications.create({
        data: {
          user_id: duplicate.owner_id,
          type: 'duplicate_resolution',
          title: 'Property Rejected - Duplicate',
          message: `Your property "${duplicate.title}" has been rejected as a duplicate. Reason: ${validatedData.rejection_reason}`,
          data: resolutionDetails,
        },
      })
    }

    // Log admin action
    await prisma.admin_audit_log.create({
      data: {
        actor_id: user.id,
        action: 'duplicate_resolution',
        target_id: duplicateId,
        metadata: resolutionDetails,
      },
    })

    return NextResponse.json({
      data: result,
      message: `Duplicate resolved: ${validatedData.action}`,
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
  summary: 'Resolve duplicate property',
  description: 'Admin endpoint to resolve a suspected duplicate property listing (keep both, keep master, reject duplicate).',
  tags: ['admin','duplicates'],
  responses: {
    200: { description: 'Duplicate resolved' },
    400: { description: 'Invalid request' },
    401: { description: 'Unauthorized' },
    403: { description: 'Forbidden' },
    404: { description: 'Property not found' },
  },
} as const;
