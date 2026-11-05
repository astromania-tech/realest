import { NextRequest, NextResponse } from 'next/server'
import { createClient, getAuthUser } from "@/lib/supabase/server"
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { logAuth401Diagnostics } from '@/lib/auth-diagnostics'
import type { OpenApiMetadata } from '@/lib/openapi/route-metadata'
import { requireStaff } from "@/lib/auth/require-staff"
import { authDeniedResponse } from "@/lib/auth/staff-api"

// Query parameters schema
const mlValidationQuerySchema = z.object({
  page: z.string().optional().default('1'),
  per_page: z.string().optional().default('20'),
  sort: z.enum(['newest', 'oldest', 'priority']).optional().default('newest'),
  status: z.enum(['pending', 'processing', 'completed']).optional(),
})

export const openApiGET: OpenApiMetadata = {
  method: 'get',
  summary: 'Get ML validation queue',
  description: 'List properties awaiting ML validation with paging and status filters.',
  tags: ['Admin'],
  security: [{ bearerAuth: [] }],
  parameters: [
    { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
    { name: 'per_page', in: 'query', schema: { type: 'integer', default: 20 } },
    { name: 'sort', in: 'query', schema: { type: 'string', enum: ['newest', 'oldest', 'priority'] } },
    { name: 'status', in: 'query', schema: { type: 'string', enum: ['pending', 'processing', 'completed'] } },
  ],
  responses: {
    '200': { description: 'ML queue loaded successfully' },
    '400': { description: 'Invalid query parameters' },
    '401': { description: 'Unauthorized' },
    '403': { description: 'Admin access required' },
  },
}

type RouteParams = {
  params: Promise<{}>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient()

    // Verify admin authentication
    const { data: { user }, error: authError } = await getAuthUser()
    if (authError || !user) {
      await logAuth401Diagnostics({
        route: '/api/admin/validation/ml',
        request,
        authError: authError?.message ?? null,
      })
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify user is admin
    const adminRow = await prisma.users.findUnique({ where: { id: user.id }, select: { role: true } })
    if (!adminRow || adminRow.role !== 'admin' && adminRow.role !== 'reviewer') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const queryValidation = mlValidationQuerySchema.safeParse({
      page: searchParams.get('page') ?? undefined,
      per_page: searchParams.get('per_page') ?? undefined,
      sort: searchParams.get('sort') ?? undefined,
      status: searchParams.get('status') ?? undefined,
    })

    if (!queryValidation.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: queryValidation.error.issues },
        { status: 400 }
      )
    }

    const { page, per_page, sort } = queryValidation.data
    const pageNum = Math.max(1, parseInt(page, 10) || 1)
    const perPageNum = Math.min(50, Math.max(1, parseInt(per_page, 10) || 20))
    const offset = (pageNum - 1) * perPageNum

    const orderBy: { created_at: 'asc' | 'desc' } = sort === 'oldest' ? { created_at: 'asc' } : { created_at: 'desc' }

    const [properties, totalCount] = await Promise.all([
      prisma.properties.findMany({
        where: { status: 'pending_ml_validation' },
        select: {
          id: true,
          title: true,
          property_type: true,
          address: true,
          state: true,
          price: true,
          price_frequency: true,
          created_at: true,
          owners: {
            select: {
              profiles: { select: { full_name: true, email: true, phone: true } },
            },
          },
          _count: { select: { property_documents: true, property_media: true } },
        },
        orderBy,
        skip: offset,
        take: perPageNum,
      }),
      prisma.properties.count({ where: { status: 'pending_ml_validation' } }),
    ])

    const totalPages = Math.ceil(totalCount / perPageNum)

    const formattedProperties = properties.map((property) => {
      const documentCount = property._count.property_documents
      const mediaCount = property._count.property_media
      return {
        id: property.id,
        title: property.title,
        property_type: property.property_type,
        address: property.address,
        state: property.state,
        price: property.price,
        price_frequency: property.price_frequency,
        created_at: property.created_at,
        owner: property.owners?.profiles ?? null,
        document_count: documentCount,
        media_count: mediaCount,
        ml_status: 'pending',
        ml_confidence_score: null,
        has_multiple_documents: documentCount > 3,
        is_high_value: Number(property.price) > 5000000,
      }
    })

    return NextResponse.json({
      data: formattedProperties,
      pagination: {
        page: pageNum,
        per_page: perPageNum,
        total: totalCount,
        total_pages: totalPages,
        has_next: pageNum < totalPages,
        has_prev: pageNum > 1,
      },
      summary: {
        total_pending: totalCount,
        high_priority: formattedProperties.filter((p: any) => p.has_multiple_documents || p.is_high_value).length,
        average_documents: formattedProperties.reduce((acc: number, p: any) => acc + p.document_count, 0) / formattedProperties.length || 0,
      }
    })

  } catch (error) {
    console.error('Unexpected error in ML validation queue:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}