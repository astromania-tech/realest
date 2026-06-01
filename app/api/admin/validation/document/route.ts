import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { validateDocumentBuffer } from '@/lib/validation/ml-validation'
import type { DocumentValidationResult } from '@/lib/types/validation'

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
    const { data: { user }, error: authError } = await supabase.auth.getUser()
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

    // Validate inputs
    const bodyValidation = documentValidationBodySchema.safeParse({ propertyId, documentType: expectedType })
    if (!bodyValidation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: bodyValidation.error.issues },
        { status: 400 }
      )
    }

    // `file` may be omitted when a `fileUrl` is provided (E2E harness). Handle below.

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

    // Convert file to buffer. Accept either an uploaded File or a `fileUrl` pointing
    // to an already-uploaded public object (used by E2E harness).
    let buffer: Buffer
    let contentType = file?.type || ''

    if (file && typeof (file as any).arrayBuffer === 'function') {
      const bytes = await (file as any).arrayBuffer()
      buffer = Buffer.from(bytes)
    } else {
      const fileUrl = (formData.get('fileUrl') as string) || ''
      if (!fileUrl) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 })
      }
      // Try a normal public fetch first
      const fetched = await fetch(fileUrl)
      if (fetched.ok) {
        const bytes = await fetched.arrayBuffer()
        buffer = Buffer.from(bytes)
        contentType = fetched.headers.get('content-type') || contentType
      } else {
        // If public fetch fails and this is a Supabase storage URL, try service-role download
        const serviceSupabase = createServiceClient()
        try {
          const url = new URL(fileUrl)
          const storagePrefix = '/storage/v1/object/'
          const idx = url.pathname.indexOf(storagePrefix)
          if (idx === -1) {
            return NextResponse.json({ error: 'Failed to fetch fileUrl', details: fetched.statusText }, { status: 400 })
          }
          let suffix = url.pathname.slice(idx + storagePrefix.length) // e.g. 'public/property-documents/...'
          const parts = suffix.split('/').filter(Boolean)
          if (parts[0] === 'public' || parts[0] === 'private') parts.shift()
          const bucket = parts.shift()
          const filePath = parts.join('/')
          if (!bucket || !filePath) {
            return NextResponse.json({ error: 'Invalid storage URL' }, { status: 400 })
          }

          const { data: downloaded, error: dlError } = await serviceSupabase.storage.from(bucket).download(filePath)
          if (dlError || !downloaded) {
            return NextResponse.json({ error: 'Failed to download from storage', details: dlError?.message || 'no data' }, { status: 400 })
          }

          let ab: ArrayBuffer
          if (typeof (downloaded as any).arrayBuffer === 'function') {
            ab = await (downloaded as any).arrayBuffer()
          } else {
            ab = await new Response(downloaded as any).arrayBuffer()
          }
          buffer = Buffer.from(ab)
          contentType = (downloaded as any).type || contentType
        } catch (err) {
          return NextResponse.json({ error: 'Failed to fetch fileUrl', details: String(err) }, { status: 400 })
        }
      }
    }

    // Perform validation
    const validationResult = validateDocumentBuffer(buffer, contentType || file.type, expectedType)

    // Log validation
    await prisma.admin_audit_log.create({
      data: {
        actor_id: user.id,
        action: 'document_validation',
        target_id: propertyId,
        metadata: {
          documentType: expectedType,
          confidence: validationResult.confidence,
          isValid: validationResult.isValid,
          issues: validationResult.issues,
        },
      },
    })

    return NextResponse.json(validationResult)

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

