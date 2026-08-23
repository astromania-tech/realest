import { NextRequest, NextResponse } from 'next/server'
import { createClient, getAuthUser } from "@/lib/supabase/server"
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import type { OpenApiMetadata } from '@/lib/openapi/route-metadata'

// Validation schema for vetting actions
const vettingUpdateSchema = z.object({
  action: z.enum(['approve', 'reject', 'schedule', 'flag_issue']),
  notes: z.string().optional(),
  scheduled_date: z.string().optional(), // ISO date string for scheduling
  rejection_reason: z.enum([
    'property_not_found',
    'documents_fraudulent',
    'owner_unresponsive',
    'property_condition_poor',
    'location_inaccurate',
    'pricing_inaccurate',
    'other'
  ]).optional(),
  issue_details: z.string().optional(),
})

export const openApiPOST: OpenApiMetadata = {
  method: 'post',
  summary: 'Update vetting action',
  description: 'Approve, reject, schedule, or flag a property in the vetting workflow.',
  tags: ['Admin'],
  security: [{ bearerAuth: [] }],
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Property ID' }],
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['action'],
          properties: {
            action: { type: 'string', enum: ['approve', 'reject', 'schedule', 'flag_issue'] },
            notes: { type: 'string' },
            scheduled_date: { type: 'string' },
            rejection_reason: { type: 'string' },
            issue_details: { type: 'string' },
          },
        },
      },
    },
  },
  responses: {
    '200': { description: 'Vetting action completed successfully' },
    '400': { description: 'Invalid request data' },
    '401': { description: 'Unauthorized' },
    '403': { description: 'Admin access required' },
    '404': { description: 'Property not found or not eligible for vetting' },
  },
}

type RouteParams = {
  params: Promise<{
    id: string
  }>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient()
    const { id } = await params

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

    // Validate request body
    const body = await request.json()
    const validation = vettingUpdateSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.issues },
        { status: 400 }
      )
    }

    const { action, notes, scheduled_date, rejection_reason, issue_details } = validation.data

    // Fetch current property
    const property = await prisma.properties.findFirst({
      where: { id, status: 'pending_vetting' },
      select: { id: true, status: true, owner_id: true, title: true },
    })

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found or not eligible for vetting' },
        { status: 404 }
      )
    }

    // Determine new status (only schema-valid fields: status + updated_at)
    let finalStatus: string
    switch (action) {
      case 'approve': finalStatus = 'live'; break
      case 'reject': finalStatus = 'rejected'; break
      case 'schedule': finalStatus = 'pending_vetting'; break
      case 'flag_issue': finalStatus = 'pending_vetting'; break
      default: return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const updatedProperty = await prisma.properties.update({
      where: { id },
      data: { status: finalStatus, updated_at: new Date() },
      select: { id: true, status: true, title: true },
    })

    // Log admin action
    await prisma.admin_audit_log.create({
      data: {
        actor_id: user.id,
        action: 'physical_vetting',
        target_id: id,
        metadata: { action, previous_status: 'pending_vetting', new_status: finalStatus, notes, scheduled_date, rejection_reason, issue_details },
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        property: updatedProperty,
        action_taken: action,
        new_status: finalStatus,
        message: getActionMessage(action, property.title),
      }
    })

  } catch (error) {
    console.error('Unexpected error in vetting action:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to generate action-specific messages
function getActionMessage(action: string, propertyTitle: string): string {
  switch (action) {
    case 'approve':
      return `Property "${propertyTitle}" has been approved and is now live on the marketplace.`
    case 'reject':
      return `Property "${propertyTitle}" has been rejected and removed from the marketplace.`
    case 'schedule':
      return `Vetting visit for "${propertyTitle}" has been scheduled.`
    case 'flag_issue':
      return `Property "${propertyTitle}" has been flagged for additional review.`
    default:
      return `Action completed for property "${propertyTitle}".`
  }
}