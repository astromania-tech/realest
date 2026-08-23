import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { propertyListingSchema } from '@/lib/validations/property'
import { redeemFirstListingWaiver } from '@/lib/reward-engine'
import type { OpenApiMetadata } from '@/lib/openapi/route-metadata'

const querySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
  status: z.enum(['draft', 'pending_ml_validation', 'pending_vetting', 'live', 'rejected', 'unlisted']).optional(),
  sort: z.enum(['newest', 'oldest', 'price_high', 'price_low', 'views']).optional().default('newest')
})

export const openApiGET: OpenApiMetadata = {
  method: 'get',
  summary: 'List dashboard properties',
  description: 'Return the authenticated owner or admin properties with pagination, status filtering, and sorting.',
  tags: ['Dashboard'],
  security: [{ bearerAuth: [] }],
  parameters: [
    { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
    { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
    { name: 'status', in: 'query', schema: { type: 'string' } },
    { name: 'sort', in: 'query', schema: { type: 'string', enum: ['newest', 'oldest', 'price_high', 'price_low', 'views'] } },
  ],
  responses: {
    '200': { description: 'Paginated property list' },
    '400': { description: 'Invalid query parameters' },
    '401': { description: 'Unauthorized' },
    '403': { description: 'Forbidden - Property owners only' },
  },
}

export const openApiPOST: OpenApiMetadata = {
  method: 'post',
  summary: 'Create dashboard property',
  description: 'Create a new property listing from the owner dashboard and queue it for validation.',
  tags: ['Dashboard'],
  security: [{ bearerAuth: [] }],
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/PropertyListing' },
      },
    },
  },
  responses: {
    '201': { description: 'Property created successfully' },
    '400': { description: 'Invalid property data' },
    '401': { description: 'Unauthorized' },
    '403': { description: 'Forbidden - Property owners only' },
  },
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify user is property owner or admin
    const userRow = await prisma.users.findUnique({
      where: { id: user.id },
      select: { role: true },
    })

    if (!userRow || !['owner', 'admin'].includes(userRow.role)) {
      return NextResponse.json(
        { error: 'Forbidden - Property owners only' },
        { status: 403 }
      )
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const queryResult = querySchema.safeParse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      status: searchParams.get('status'),
      sort: searchParams.get('sort')
    })

    if (!queryResult.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: queryResult.error.issues },
        { status: 400 }
      )
    }

    const { page, limit, status, sort } = queryResult.data
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}
    if (userRow.role === 'owner') {
      const ownerRecord = await prisma.owners.findUnique({
        where: { profile_id: user.id },
        select: { id: true },
      })
      if (!ownerRecord) {
        return NextResponse.json({ data: [], pagination: { page, limit, total: 0, total_pages: 0, has_next: false, has_prev: false } })
      }
      where.owner_id = ownerRecord.id
    }
    if (status) where.status = status

    type SortOrder = { [key: string]: 'asc' | 'desc' }
    const sortMap: Record<string, SortOrder> = {
      newest:     { created_at: 'desc' },
      oldest:     { created_at: 'asc' },
      price_high: { price: 'desc' },
      price_low:  { price: 'asc' },
      views:      { created_at: 'desc' }, // fallback: no views_count column
    }
    const orderBy = sortMap[sort] ?? { created_at: 'desc' }

    const [properties, total] = await Promise.all([
      prisma.properties.findMany({
        where,
        include: {
          property_media: true,
          inquiries: { select: { id: true } },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.properties.count({ where }),
    ])

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      data: properties,
      pagination: {
        page,
        limit,
        total,
        total_pages: totalPages,
        has_next: page < totalPages,
        has_prev: page > 1
      }
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify user is property owner or admin (POST)
    const userRowPost = await prisma.users.findUnique({
      where: { id: user.id },
      select: { role: true },
    })

    if (!userRowPost || !['owner', 'admin', 'agent'].includes(userRowPost.role)) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = propertyListingSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid property data',
          details: validationResult.error.issues
        },
        { status: 400 }
      )
    }

    const propertyData = validationResult.data

    // Check for potential duplicates
    const existingProperties = await prisma.properties.findMany({
      where: {
        address: propertyData.address,
        state: propertyData.state,
        NOT: { status: 'rejected' },
      },
      select: { id: true, title: true, address: true },
    })

    const isDuplicate = existingProperties.length > 0

    let ownerId: string | null = null;
    let agentId: string | null = null;
    let includeData: any = {};

    if (userRowPost.role === 'owner') {
      const ownerRec = await prisma.owners.upsert({
        where: { profile_id: user.id },
        create: { profile_id: user.id },
        update: {},
        select: { id: true },
      })
      ownerId = ownerRec.id;
      includeData = { owners: { include: { profiles: { select: { full_name: true, email: true } } } } };
    } else if (userRowPost.role === 'agent') {
      // Agents should already be created, but we upsert to be safe
      const agentRec = await prisma.agents.upsert({
        where: { profile_id: user.id },
        create: { profile_id: user.id, license_number: 'PENDING', agency_name: 'Independent', specialization: [], verified: false },
        update: {},
        select: { id: true },
      })
      agentId = agentRec.id;
      includeData = { agent: { include: { profiles: { select: { full_name: true, email: true } } } } };
    }

    // Create property (only pass schema-valid fields)
    const { images: _images, documents: _documents, verification_status: _vs, toilets: _toilets, ...validPropertyData } = propertyData as any
    const property = await prisma.properties.create({
      data: {
        ...validPropertyData,
        owner_id: ownerId,
        agent_id: agentId,
        status: 'draft',
        created_at: new Date(),
        updated_at: new Date(),
      },
      include: includeData,
    })

    if (isDuplicate) {
      console.log('Property flagged as potential duplicate:', property.id)
    }

    const launchRewardRedemption = userRowPost.role === 'owner'
      ? await redeemFirstListingWaiver(user.id, property.id)
      : { redeemed: false, reason: 'Not applicable for this account.' }

    return NextResponse.json({
      data: property,
      message: 'Property listing created successfully. It will be reviewed by our team before going live.',
      launchRewardRedemption,
    }, { status: 201 })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
