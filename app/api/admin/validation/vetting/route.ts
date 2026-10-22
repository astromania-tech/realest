import { NextRequest, NextResponse } from 'next/server'
import { createClient, getAuthUser } from "@/lib/supabase/server"
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import type { OpenApiMetadata } from '@/lib/openapi/route-metadata'
import { requireStaff } from "@/lib/auth/require-staff"
import { authDeniedResponse } from "@/lib/auth/staff-api"

// Query parameters schema
const vettingQuerySchema = z.object({
  page: z.string().optional().default('1'),
  per_page: z.string().optional().default('20'),
  sort: z.enum(['newest', 'oldest', 'urgent', 'location']).optional().default('newest'),
  state: z.string().optional(), // Filter by state
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
})

export const openApiGET: OpenApiMetadata = {
  method: 'get',
  summary: 'Get vetting queue',
  description: 'List properties in the vetting queue with paging and urgency filters.',
  tags: ['Admin'],
  security: [{ bearerAuth: [] }],
  parameters: [
    { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
    { name: 'per_page', in: 'query', schema: { type: 'integer', default: 20 } },
    { name: 'sort', in: 'query', schema: { type: 'string', enum: ['newest', 'oldest', 'urgent', 'location'] } },
    { name: 'state', in: 'query', schema: { type: 'string' } },
    { name: 'priority', in: 'query', schema: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] } },
  ],
  responses: {
    '200': { description: 'Vetting queue loaded successfully' },
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
    const staff = await requireStaff()
    if (!staff.ok) {
      return NextResponse.json({ error: staff.error }, { status: staff.status })
    }
    const user = { id: staff.userId }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const queryValidation = vettingQuerySchema.safeParse({
      page: searchParams.get('page'),
      per_page: searchParams.get('per_page'),
      sort: searchParams.get('sort'),
      state: searchParams.get('state'),
      priority: searchParams.get('priority'),
    })

    if (!queryValidation.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: queryValidation.error.issues },
        { status: 400 }
      )
    }

    const { page, per_page, sort, state, priority } = queryValidation.data
    const pageNum = Math.max(1, parseInt(page, 10) || 1)
    const perPageNum = Math.min(50, Math.max(1, parseInt(per_page, 10) || 20))
    const offset = (pageNum - 1) * perPageNum

    const where = { status: 'pending_vetting', ...(state ? { state } : {}) }
    const orderBy = sort === 'oldest' ? { created_at: 'asc' as const } : { created_at: 'desc' as const }

    const [properties, totalCount] = await Promise.all([
      prisma.properties.findMany({
        where,
        select: {
          id: true,
          title: true,
          property_type: true,
          address: true,
          state: true,
          latitude: true,
          longitude: true,
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
      prisma.properties.count({ where }),
    ])

    const totalPages = Math.ceil(totalCount / perPageNum)

    const formattedProperties = properties.map((property) => {
      const documentCount = property._count.property_documents
      const mediaCount = property._count.property_media
      const price = Number(property.price)
      return {
        id: property.id,
        title: property.title,
        property_type: property.property_type,
        address: property.address,
        state: property.state,
        latitude: property.latitude,
        longitude: property.longitude,
        price: property.price,
        price_frequency: property.price_frequency,
        created_at: property.created_at,
        owner: property.owners?.profiles ?? null,
        document_count: documentCount,
        media_count: mediaCount,
        vetting_status: 'pending',
        days_since_created: Math.floor(
          (Date.now() - new Date(property.created_at!).getTime()) / (1000 * 60 * 60 * 24),
        ),
        is_high_value: price > 10000000,
        has_complete_documents: documentCount >= 3,
        urgency_level:
          price > 50000000
            ? 'urgent'
            : price > 10000000
              ? 'high'
              : documentCount >= 5
                ? 'medium'
                : 'low',
      }
    })

    let filteredProperties = formattedProperties
    if (priority) {
      filteredProperties = formattedProperties.filter((p: any) => p.urgency_level === priority)
    }

    return NextResponse.json({
      data: filteredProperties,
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
        urgent_properties: formattedProperties.filter((p: any) => p.urgency_level === 'urgent').length,
        high_value_properties: formattedProperties.filter((p: any) => p.is_high_value).length,
        average_wait_days: formattedProperties.reduce((acc: number, p: any) => acc + p.days_since_ml_validation, 0) / formattedProperties.length || 0,
        states_represented: [...new Set(formattedProperties.map((p: any) => p.state))].length,
      },
      filters: {
        applied_state: state,
        applied_priority: priority,
        available_states: [...new Set(properties?.map((p: any) => p.state) || [])].sort(),
      }
    })

  } catch (error) {
    console.error('Unexpected error in vetting queue:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}