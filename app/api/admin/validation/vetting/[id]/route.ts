import { NextRequest, NextResponse } from 'next/server'
import { createClient, getAuthUser } from "@/lib/supabase/server"
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { randomUUID } from 'node:crypto'
import { createServiceClient } from '@/lib/supabase/service'
import { haversineMeters } from '@/lib/trust/compare'
import { lagosToday, visitAssignmentAllowed } from '@/lib/trust/assignment'
import { badgeWriteAllowed, deviceCheckInAllowed, observationConflicts } from '@/lib/trust/visit'
import { readVisitPhoto, VISIT_EVIDENCE_BUCKET, visitPhotoPath } from '@/lib/trust/visit-photo'
import { claimsBlockBadge, documentClaimFields, reconcileClaims, type ClaimFinding } from '@/lib/trust/claims'
import { writeJudgment } from '@/lib/trust/brief'
import { nextCaseState } from '@/lib/trust/case'
import { registryConfirmationAllowed } from '@/lib/trust/registry'
import { appendEvidence, markCorrection, openDeskCase, readStoredVisit, saveCheckIn, saveRegistryConfirmation, setCaseState, setOpenIssue } from '@/lib/trust/visit-store'
import type { OpenApiMetadata } from '@/lib/openapi/route-metadata'
import { requireStaff } from "@/lib/auth/require-staff"
import { isAssignableOfficerRole } from "@/lib/auth/roles"
import { vettingActionAllowed } from "@/lib/auth/staff-action-gate"
import {
  buildListingRejectFeedback,
  deliverListingRejectFeedback,
  listingRejectRecipientSelect,
  listingRejectSiteOrigin,
  mapVettingRejectionReason,
  resolveListingRejectRecipients,
} from "@/lib/trust/listing-reject-feedback"
import { listingRejectNoteAllowed } from "@/lib/trust/listing-reject-note"

// Validation schema for vetting actions
const vettingUpdateSchema = z.object({
  action: z.enum(['approve', 'reject', 'schedule', 'flag_issue', 'assign', 'check_in', 'request_correction', 'confirm_registry']),
  notes: z.string().optional(),
  scheduled_date: z.string().optional(),
  officer_id: z.string().optional(),
  visit_day: z.string().optional(),
  document_id: z.string().uuid().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  photo_base64: z.string().optional(),
  saw_building: z.boolean().optional(),
  address_matches: z.boolean().optional(),
  document_matches: z.boolean().optional(),
  location_source: z.string().optional(),
  accuracy_meters: z.number().optional(),
  registry_reference: z.string().optional(),
  registry_matches: z.boolean().optional(),
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
            action: { type: 'string', enum: ['approve', 'reject', 'schedule', 'flag_issue', 'assign', 'check_in', 'request_correction', 'confirm_registry'] },
            notes: { type: 'string' },
            scheduled_date: { type: 'string' },
            officer_id: { type: 'string' },
            visit_day: { type: 'string' },
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
    const staff = await requireStaff()
    if (!staff.ok) {
      return NextResponse.json({ error: staff.error }, { status: staff.status })
    }
    const user = { id: staff.userId }

    // Validate request body
    const body = await request.json()
    const validation = vettingUpdateSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.issues },
        { status: 400 }
      )
    }

    const {
      action, notes, scheduled_date, rejection_reason, issue_details, officer_id, visit_day,
      document_id, latitude, longitude, photo_base64, saw_building, address_matches, document_matches,
      location_source, accuracy_meters, registry_reference, registry_matches,
    } = validation.data

    if (!vettingActionAllowed(staff.role, action)) {
      return NextResponse.json(
        { error: "Your role cannot run this vetting action." },
        { status: 403 },
      )
    }

    const property = await prisma.properties.findFirst({
      where: { id, status: 'pending_vetting' },
      select: {
        id: true,
        status: true,
        owner_id: true,
        title: true,
        latitude: true,
        longitude: true,
        address: true,
        city: true,
        state: true,
        description: true,
        ...listingRejectRecipientSelect,
      },
    })

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found or not eligible for vetting' },
        { status: 404 }
      )
    }

    if (action === 'assign') {
      const current = await readVettingAssignment(id)
      const decision = visitAssignmentAllowed({
        currentOfficerId: current.officerId,
        officerId: officer_id ?? '',
        visitDay: visit_day ?? '',
        today: lagosToday(),
      })
      if (!decision.ok) {
        return NextResponse.json({ error: decision.error }, { status: decision.status })
      }
      const officerId = officer_id ?? ""
      const visitDay = visit_day ?? ""
      const officer = await prisma.users.findUnique({
        where: { id: officerId },
        select: { role: true, is_active: true },
      })
      if (!officer || !officer.is_active || !isAssignableOfficerRole(officer.role)) {
        return NextResponse.json({ error: 'Choose an officer.' }, { status: 400 })
      }
      const updated = await prisma.$queryRaw<Array<{ id: string }>>`
        update public.properties
        set vetting_officer_id = ${officerId}::uuid,
            vetting_visit_on = ${visitDay}::date,
            updated_at = now()
        where id = ${id}::uuid
          and status = 'pending_vetting'
          and (vetting_officer_id is null or vetting_officer_id = ${officerId}::uuid)
        returning id::text as id
      `
      if (updated.length === 0) {
        return NextResponse.json({ error: 'This visit is already assigned.' }, { status: 409 })
      }
      await openDeskCase(id)
      const opened = await readStoredVisit(id)
      await setCaseState(id, nextCaseState(opened.caseState, 'assign'))
      await prisma.admin_audit_log.create({
        data: {
          actor_id: user.id,
          action: 'assign_vetting_visit',
          target_id: id,
          metadata: { officer_id: officerId, visit_day: visitDay, case_state: 'field_in_progress' },
        },
      })
      return NextResponse.json({
        success: true,
        data: { property: { id, status: 'pending_vetting' }, action_taken: 'assign' },
      })
    }

    if (action === 'check_in') {
      const current = await readStoredVisit(id)
      if (!current.officerId || current.officerId !== user.id) {
        return NextResponse.json({ error: 'The assigned officer checks in at the pin.' }, { status: 403 })
      }
      const device = deviceCheckInAllowed({
        locationSource: location_source ?? null,
        accuracyMeters: accuracy_meters ?? null,
      })
      if (!device.ok) return NextResponse.json({ error: device.error }, { status: 400 })
      const note = notes?.trim() ?? ''
      if (!note || latitude === undefined || longitude === undefined || saw_building === undefined || address_matches === undefined || document_matches === undefined) {
        return NextResponse.json({ error: 'Record the phone GPS, the photo, and what you saw.' }, { status: 400 })
      }
      const pinLat = property.latitude === null ? null : Number(property.latitude)
      const pinLng = property.longitude === null ? null : Number(property.longitude)
      if (pinLat === null || pinLng === null) {
        return NextResponse.json({ error: 'This listing has no pin.' }, { status: 409 })
      }
      const photo = readVisitPhoto(photo_base64 ?? '')
      if (!photo.ok) return NextResponse.json({ error: photo.error }, { status: 400 })
      const photoPath = visitPhotoPath(id, randomUUID(), photo.extension)
      if (!photoPath) return NextResponse.json({ error: 'The gate photo could not be stored.' }, { status: 400 })
      const stored = await createServiceClient().storage.from(VISIT_EVIDENCE_BUCKET).upload(photoPath, photo.bytes, {
        contentType: photo.contentType,
        upsert: false,
      })
      if (stored.error) {
        return NextResponse.json({ error: 'The gate photo could not be stored.' }, { status: 503 })
      }
      const distanceMeters = haversineMeters(pinLat, pinLng, latitude, longitude)
      await saveCheckIn({
        propertyId: id,
        officerId: user.id,
        checkedInAt: new Date().toISOString(),
        latitude,
        longitude,
        distanceMeters,
        photoPath,
        sawBuilding: saw_building,
        addressMatches: address_matches,
        documentMatches: document_matches,
        note,
      })
      const latestTrustJob = await prisma.property_validation_jobs.findFirst({
        where: { property_id: id, job_kind: 'property', source: 'trust-reader', status: 'completed' },
        orderBy: { queued_at: 'desc' },
        select: { result: true },
      })
      const fields = documentClaimFields(latestTrustJob?.result)
      const findings = reconcileClaims({
        listingAddress: [property.address, property.city, property.state].filter(Boolean).join(', '),
        accountName: property.owners?.profiles.full_name ?? null,
        documentLocation: fields.location,
        documentHolder: fields.holder,
        officer: { note, addressMatches: address_matches, sawBuilding: saw_building, documentMatches: document_matches },
        registry: { reference: current.registryReference, matches: current.registryMatches },
      })
      await appendEvidence({
        propertyId: id,
        layer: 'documentary',
        body: {
          addressDocument: findings.find((finding) => finding.point === 'address_document')?.status,
          holder: findings.find((finding) => finding.point === 'holder')?.status,
          title: findings.find((finding) => finding.point === 'title')?.status,
        },
      })
      const blocked = claimsBlockBadge(findings)
      const checked = nextCaseState(current.caseState, 'check_in')
      const reconciled = nextCaseState(checked, 'reconcile')
      const caseState = nextCaseState(reconciled, blocked ? 'claims_blocked' : 'claims_clear')
      const judgment = writeJudgment({
        title: property.title,
        address: [property.address, property.city, property.state].filter(Boolean).join(', '),
        description: property.description ?? '',
        findings,
      })
      await setCaseState(id, caseState, findings, judgment)
      const conflicts = observationConflicts({
        sawBuilding: saw_building,
        addressMatches: address_matches,
        documentMatches: document_matches,
        distanceMeters,
      })
      return NextResponse.json({
        success: true,
        data: { property: { id, status: 'pending_vetting' }, action_taken: 'check_in', conflicts, case_state: caseState, claims: findings },
      })
    }

    if (action === 'flag_issue') {
      const issue = issue_details?.trim() ?? ''
      if (!issue) return NextResponse.json({ error: 'Describe the issue that blocks the badge.' }, { status: 400 })
      await setOpenIssue(id, issue)
      await prisma.admin_audit_log.create({
        data: {
          actor_id: user.id,
          action: 'physical_vetting',
          target_id: id,
          metadata: { action, open_issue: issue },
        },
      })
      return NextResponse.json({
        success: true,
        data: { property: { id, status: 'pending_vetting' }, action_taken: 'flag_issue', message: `The badge stays closed until "${property.title}" replaces the flagged file.` },
      })
    }

    if (action === 'request_correction') {
      if (!document_id) return NextResponse.json({ error: 'Choose the file to send back.' }, { status: 400 })
      const document = await prisma.property_documents.findFirst({
        where: { id: document_id, property_id: id },
        select: { id: true, document_type: true },
      })
      if (!document) return NextResponse.json({ error: 'That file is not on this listing.' }, { status: 404 })
      const issue = issue_details?.trim() || `Replace the ${document.document_type} file.`
      await markCorrection({ propertyId: id, documentId: document.id, issue })
      await setCaseState(id, nextCaseState(null, 'correct'))
      await prisma.admin_audit_log.create({
        data: {
          actor_id: user.id,
          action: 'physical_vetting',
          target_id: id,
          metadata: { action, document_id: document.id, open_issue: issue },
        },
      })
      return NextResponse.json({
        success: true,
        data: {
          property: { id, status: 'pending_correction' },
          action_taken: 'request_correction',
          message: `The ${document.document_type} file was sent back. The rest of the listing stays.`,
        },
      })
    }

    if (action === 'confirm_registry') {
      const reference = registryConfirmationAllowed(registry_reference ?? '')
      if (!reference.ok) return NextResponse.json({ error: reference.error }, { status: 400 })
      if (registry_matches === undefined) {
        return NextResponse.json({ error: 'Say whether the registry file matches this listing.' }, { status: 400 })
      }
      await openDeskCase(id)
      await saveRegistryConfirmation({ propertyId: id, reference: reference.reference, matches: registry_matches })
      const current = await readStoredVisit(id)
      const latestTrustJob = await prisma.property_validation_jobs.findFirst({
        where: { property_id: id, job_kind: 'property', source: 'trust-reader', status: 'completed' },
        orderBy: { queued_at: 'desc' },
        select: { result: true },
      })
      const fields = documentClaimFields(latestTrustJob?.result)
      const findings: ClaimFinding[] = reconcileClaims({
        listingAddress: [property.address, property.city, property.state].filter(Boolean).join(', '),
        accountName: property.owners?.profiles.full_name ?? null,
        documentLocation: fields.location,
        documentHolder: fields.holder,
        officer: current.checkedInAt ? {
          note: current.visitNote,
          addressMatches: current.addressMatches,
          sawBuilding: current.sawBuilding,
          documentMatches: current.documentMatches,
        } : null,
        registry: { reference: reference.reference, matches: registry_matches },
      })
      await appendEvidence({
        propertyId: id,
        layer: 'registry',
        body: { reference: reference.reference, matches: registry_matches },
      })
      const blocked = claimsBlockBadge(findings)
      const caseState = nextCaseState(current.caseState, blocked ? 'claims_blocked' : 'claims_clear')
      const judgment = writeJudgment({
        title: property.title,
        address: [property.address, property.city, property.state].filter(Boolean).join(', '),
        description: property.description ?? '',
        findings,
      })
      await setCaseState(id, caseState, findings, judgment)
      await prisma.admin_audit_log.create({
        data: {
          actor_id: user.id,
          action: 'registry_confirmation',
          target_id: id,
          metadata: { reference: reference.reference, matches: registry_matches, case_state: caseState },
        },
      })
      return NextResponse.json({
        success: true,
        data: {
          property: { id, status: 'pending_vetting' },
          action_taken: 'confirm_registry',
          case_state: caseState,
          message: findings.find((finding) => finding.point === 'title')?.evidence,
        },
      })
    }

    if (action === 'approve') {
      const current = await readStoredVisit(id)
      const badge = badgeWriteAllowed(current)
      if (!badge.ok) {
        return NextResponse.json({ error: badge.error }, { status: 409 })
      }
      await setCaseState(id, nextCaseState(current.caseState, 'approve'))
    }

    if (action === 'reject') {
      const noteGate = listingRejectNoteAllowed(
        [notes, issue_details].filter((part) => Boolean(part?.trim())).join(" ").trim() || notes,
        { label: "reject this listing after the visit" },
      )
      if (!noteGate.ok) {
        return NextResponse.json({ error: noteGate.error }, { status: 409 })
      }
      await setCaseState(id, nextCaseState(null, 'reject'))
    }

    // Determine new status (only schema-valid fields: status + updated_at)
    let finalStatus: string
    switch (action) {
      case 'approve': finalStatus = 'live'; break
      case 'reject': finalStatus = 'rejected'; break
      case 'schedule': finalStatus = 'pending_vetting'; break
      default: return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const updatedProperty = await prisma.properties.update({
      where: { id },
      data: action === "approve"
        ? { status: "live", verification_status: "verified", updated_at: new Date() }
        : action === "reject"
          ? { status: "rejected", verification_status: "rejected", updated_at: new Date() }
          : { status: finalStatus, updated_at: new Date() },
      select: { id: true, status: true, title: true, verification_status: true },
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
          reason: mapVettingRejectionReason(rejection_reason),
          staffNotes: notes ?? issue_details ?? null,
          recipients,
          siteOrigin: listingRejectSiteOrigin(),
        })
        const delivery = await deliverListingRejectFeedback(feedback)
        rejectAudit = {
          ...feedback.audit,
          vetting_rejection_reason: rejection_reason ?? null,
          owner_notified: delivery.notified > 0,
          emails_sent: delivery.emailsSent,
        }
        if (delivery.emailErrors.length > 0) {
          console.error("[validation] Vetting reject email failed:", delivery.emailErrors)
        }
      }
    }

    // Log admin action
    await prisma.admin_audit_log.create({
      data: {
        actor_id: user.id,
        action: 'physical_vetting',
        target_id: id,
        metadata: {
          action,
          previous_status: 'pending_vetting',
          new_status: finalStatus,
          notes,
          scheduled_date,
          rejection_reason,
          issue_details,
          ...(rejectAudit ?? {}),
        },
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

async function readVettingAssignment(propertyId: string): Promise<{ officerId: string | null; visitDay: string | null }> {
  const visit = await readStoredVisit(propertyId)
  return { officerId: visit.officerId, visitDay: visit.visitDay }
}

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