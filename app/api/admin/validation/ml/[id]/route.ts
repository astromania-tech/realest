import { NextRequest, NextResponse } from 'next/server'
import { createClient, getAuthUser } from "@/lib/supabase/server"
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { adminApproveAllowed, readTrustDecision } from '@/lib/trust/gate'
import { openDeskCase } from '@/lib/trust/visit-store'
import { requireStaff } from "@/lib/auth/require-staff"
import {
  buildListingRejectFeedback,
  deliverListingRejectFeedback,
  listingRejectRecipientSelect,
  listingRejectSiteOrigin,
  resolveListingRejectRecipients,
} from "@/lib/trust/listing-reject-feedback"

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
    const staff = await requireStaff()
    if (!staff.ok) {
      return NextResponse.json({ error: staff.error }, { status: staff.status })
    }
    const user = { id: staff.userId }

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
      select: {
        id: true,
        status: true,
        owner_id: true,
        title: true,
        address: true,
        city: true,
        state: true,
        ...listingRejectRecipientSelect,
      },
    })

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found or not in ML validation status' },
        { status: 404 }
      )
    }

    if (action === "approve") {
      const latestTrustJob = await prisma.property_validation_jobs.findFirst({
        where: { property_id: propertyId, job_kind: "property", source: "trust-reader", status: "completed" },
        orderBy: { queued_at: "desc" },
        select: { result: true },
      })
      const gate = adminApproveAllowed({
        trust: readTrustDecision(latestTrustJob?.result),
        adminNotes: admin_notes,
      })
      if (!gate.ok) {
        return NextResponse.json(
          { error: gate.error, hardBlocks: gate.hardBlocks, flags: gate.flags },
          { status: 409 },
        )
      }
    }

    // Determine new status based on action (only schema-valid fields)
    let newStatus: string
    switch (action) {
      case 'approve': newStatus = 'pending_vetting'; break
      case 'reject': newStatus = 'rejected'; break
      case 'flag_duplicate': newStatus = 'pending_duplicate_review'; break
      default: return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    if (action === 'approve') {
      await openDeskCase(propertyId)
    }

    const updatedProperty = await prisma.properties.update({
      where: { id: propertyId },
      data: {
        status: newStatus,
        verification_status: action === "reject" ? "rejected" : "pending",
        updated_at: new Date(),
      },
      select: { id: true, status: true, title: true },
    })

    let rejectAudit: Record<string, unknown> | null = null
    if (action === "reject") {
      const recipients = resolveListingRejectRecipients(property)
      if (recipients.length > 0) {
        const feedback = buildListingRejectFeedback({
          propertyId: property.id,
          propertyTitle: property.title,
          propertyAddress: property.address,
          city: property.city,
          state: property.state,
          reason: "other",
          staffNotes: admin_notes ?? ml_validation_notes ?? null,
          recipients,
          siteOrigin: listingRejectSiteOrigin(),
        })
        const delivery = await deliverListingRejectFeedback(feedback)
        rejectAudit = {
          ...feedback.audit,
          owner_notified: delivery.notified > 0,
          emails_sent: delivery.emailsSent,
        }
        if (delivery.emailErrors.length > 0) {
          console.error("[validation] ML reject email failed:", delivery.emailErrors)
        }
      }
    }

    // Log admin action
    await prisma.admin_audit_log.create({
      data: {
        actor_id: user.id,
        action: 'ml_validation_update',
        target_id: propertyId,
        metadata: {
          action,
          previous_status: 'pending_ml_validation',
          new_status: newStatus,
          ml_confidence_score,
          ml_validation_notes,
          admin_notes,
          ...(rejectAudit ?? {}),
        },
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