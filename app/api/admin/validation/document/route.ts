import { NextRequest, NextResponse } from 'next/server'
import { createClient, getAuthUser } from "@/lib/supabase/server"
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { enqueueValidationJob } from '@/lib/validation/validation-job-worker'
import { createInlineValidationAsset, uploadValidationAsset } from '@/lib/validation/validation-assets'

const documentValidationBodySchema = z.object({
  propertyId: z.string().uuid('Invalid property ID'),
  documentType: z.string().optional().default('title_deed'),
})

type RouteParams = {
  params: Promise<{}>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient()

    // Verify admin authentication
    const { data: { user }, error: authError } = await getAuthUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify user is admin
    const adminRow = await prisma.users.findUnique({
      where: { id: user.id },
      select: { role: true }
    })
    
    if (!adminRow || adminRow.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const propertyId = (formData.get('propertyId') as string) || ''
    const expectedType = (formData.get('documentType') as string) || 'title_deed'
    const fileUrl = (formData.get('fileUrl') as string) || ''

    // Validate inputs
    const bodyValidation = documentValidationBodySchema.safeParse({ propertyId, documentType: expectedType })
    if (!bodyValidation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: bodyValidation.error.issues },
        { status: 400 }
      )
    }

    // Verify property exists
    const property = await prisma.properties.findUnique({
      where: { id: propertyId },
      select: { id: true, title: true }
    })

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    let source:
      | { kind: 'inline'; contentBase64: string; mimeType: string; originalName?: string }
      | { kind: 'url'; fileUrl: string; mimeType?: string }
      | { kind: 'storage'; bucket: string; path: string; mimeType?: string; originalName?: string }

    if (file && typeof (file as any).arrayBuffer === 'function') {
      if ((file.type || '').toLowerCase() === 'application/pdf') {
        source = await createInlineValidationAsset(file)
      } else {
        source = await uploadValidationAsset({
          file,
          bucket: 'property-documents',
          propertyId,
          jobKind: 'document',
        })
      }
    } else if (fileUrl) {
      source = { kind: 'url', fileUrl, mimeType: file?.type || undefined }
    } else {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const queuedJob = await enqueueValidationJob({
      propertyId,
      jobKind: 'document',
      source: 'admin_document_validation',
      requestPayload: {
        kind: 'document',
        propertyId,
        documentType: expectedType,
        source,
      },
      requestedBy: user.id,
    })

    // Log validation
    await prisma.admin_audit_log.create({
      data: {
        actor_id: user.id,
        action: 'document_validation_queued',
        target_id: propertyId,
        metadata: {
          documentType: expectedType,
          jobId: queuedJob.id,
          status: queuedJob.status,
          source,
        },
      },
    })

    return NextResponse.json({
      ok: true,
      jobId: queuedJob.id,
      status: queuedJob.status,
      queuedAt: queuedJob.queued_at,
      pollUrl: `/api/admin/validation/jobs/${queuedJob.id}`,
      propertyId,
      documentType: expectedType,
    })

  } catch (error) {
    console.error('[validation] Document validation error:', error)
    return NextResponse.json(
      {
        error: 'Document validation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export const openApiPOST = {
  method: 'post',
  summary: 'Validate property document',
  description: 'Admin endpoint to validate a property document (PDF/JPEG) using ML and OCR.',
  tags: ['admin','validation','document'],
  requestBody: { required: true, content: { 'multipart/form-data': { schema: { type: 'object' } } } },
  responses: { '200': { description: 'Document validation result' }, '400': { description: 'Invalid request' }, '401': { description: 'Unauthorized' }, '403': { description: 'Forbidden' }, '404': { description: 'Property not found' } },
} as const;

