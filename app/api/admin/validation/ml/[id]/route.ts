import { NextRequest, NextResponse } from 'next/server'
import { createClient, getAuthUser } from "@/lib/supabase/server"
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

// Request body schema for ML validation update
const mlValidationUpdateSchema = z.object({
  action: z.enum(['approve', 'reject', 'flag_duplicate']),
  ml_confidence_score: z.number().min(0).max(1).optional(),
  ml_validation_notes: z.string().optional(),
  admin_notes: z.string().optional(),
})

type RouteParams = {
  params: Promise<{
    id: string
  }>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient()
    const { id: propertyId } = await params

    // Verify admin authentication
    const { data: { user }, error: authError } = await getAuthUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify user is admin
    const adminRow = await prisma.users.findUnique({ where: { id: user.id }, select: { role: true } })
    if (!adminRow || adminRow.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await request.json()
    const validation = mlValidationUpdateSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: validation.error.issues },
        { status: 400 }
      )
    }

    const { action, ml_confidence_score, ml_validation_notes, admin_notes } = validation.data

    // Verify property exists and is in correct status
    const property = await prisma.properties.findFirst({
      where: { id: propertyId, status: 'pending_ml_validation' },
      select: { id: true, status: true, owner_id: true, title: true },
    })

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found or not in ML validation status' },
        { status: 404 }
      )
    }

    // Determine new status based on action (only schema-valid fields)
    let newStatus: string
    switch (action) {
      case 'approve': newStatus = 'pending_vetting'; break
      case 'reject': newStatus = 'rejected'; break
      case 'flag_duplicate': newStatus = 'pending_duplicate_review'; break
      default: return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const updatedProperty = await prisma.properties.update({
      where: { id: propertyId },
      data: { status: newStatus, updated_at: new Date() },
      select: { id: true, status: true, title: true },
    })

    // Log admin action
    await prisma.admin_audit_log.create({
      data: {
        actor_id: user.id,
        action: 'ml_validation_update',
        target_id: propertyId,
        metadata: { action, previous_status: 'pending_ml_validation', new_status: newStatus, ml_confidence_score, ml_validation_notes, admin_notes },
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        property: updatedProperty,
        action_taken: action,
        new_status: newStatus,
        message: `Property ${action}d successfully`,
      }
    })

  } catch (error) {
    console.error('Unexpected error in ML validation update:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const openApiPOST = {
  method: 'post',
  summary: 'Update ML validation status for a property',
  description: 'Admin endpoint to approve/reject/flag a property after ML validation.',
  tags: ['admin','validation','ml'],
  parameters: [ { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } } ],
  requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } },
  responses: { '200': { description: 'ML update applied' }, '400': { description: 'Invalid request' }, '401': { description: 'Unauthorized' }, '403': { description: 'Forbidden' }, '404': { description: 'Property not found' } },
} as const;