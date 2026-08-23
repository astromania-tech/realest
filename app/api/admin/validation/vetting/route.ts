import { NextRequest, NextResponse } from 'next/server'
import { createClient, getAuthUser } from "@/lib/supabase/server"
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import type { OpenApiMetadata } from '@/lib/openapi/route-metadata'

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
    const pageNum = parseInt(page)
    const perPageNum = parseInt(per_page)
    const offset = (pageNum - 1) * perPageNum

    const where = { status: 'pending_vetting', ...(state ? { state } : {}) }
    const orderBy = sort === 'oldest' ? { created_at: 'asc' as const } : { created_at: 'desc' as const }

    const [properties, totalCount] = await Promise.all([
      prisma.properties.findMany({
        where,
        include: {
          owners: { include: { profiles: { select: { full_name: true, email: true, phone: true } } } },
          property_documents: true,
          property_media: { select: { id: true } },
        },
        orderBy,
        skip: offset,
        take: perPageNum,
      }),
      prisma.properties.count({ where }),
    ])

    const totalPages = Math.ceil(totalCount / perPageNum)

    const formattedProperties = properties.map((property: any) => ({
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
      document_count: property.property_documents?.length || 0,
      media_count: property.property_media?.length || 0,
      vetting_status: 'pending',
      days_since_created: Math.floor((Date.now() - new Date(property.created_at!).getTime()) / (1000 * 60 * 60 * 24)),
      is_high_value: Number(property.price) > 10000000,
      has_complete_documents: (property.property_documents?.length || 0) >= 3,
      urgency_level: Number(property.price) > 50000000 ? 'urgent' :
                    Number(property.price) > 10000000 ? 'high' :
                    (property.property_documents?.length || 0) >= 5 ? 'medium' : 'low',
    }))

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