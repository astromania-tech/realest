import { NextRequest, NextResponse } from 'next/server'
import { createClient, getAuthUser } from "@/lib/supabase/server"
import { prisma, Prisma } from '@/lib/prisma'
import { z } from 'zod'
import type { OpenApiMetadata } from '@/lib/openapi/route-metadata'

// Query parameters schema
const userQuerySchema = z.object({
  page: z.string().optional().default('1'),
  per_page: z.string().optional().default('20'),
  sort: z.enum(['newest', 'oldest', 'name', 'type']).optional().default('newest'),
  user_type: z.enum(['user', 'owner', 'agent', 'admin']).optional(),
  search: z.string().optional(),
  status: z.enum(['active', 'suspended', 'banned']).optional(),
})

export const openApiGET: OpenApiMetadata = {
  method: 'get',
  summary: 'List admin users',
  description: 'Return a searchable, paginated list of platform users for admin management.',
  tags: ['Admin'],
  security: [{ bearerAuth: [] }],
  parameters: [
    { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
    { name: 'per_page', in: 'query', schema: { type: 'integer', default: 20 } },
    { name: 'sort', in: 'query', schema: { type: 'string', enum: ['newest', 'oldest', 'name', 'type'] } },
    { name: 'user_type', in: 'query', schema: { type: 'string', enum: ['user', 'owner', 'agent', 'admin'] } },
    { name: 'search', in: 'query', schema: { type: 'string' } },
    { name: 'status', in: 'query', schema: { type: 'string', enum: ['active', 'suspended', 'banned'] } },
  ],
  responses: {
    '200': { description: 'Users loaded successfully' },
    '400': { description: 'Invalid query parameters' },
    '401': { description: 'Unauthorized' },
    '403': { description: 'Admin access required' },
  },
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Auth
    const { data: { user }, error: authError } = await getAuthUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Admin role check via Prisma
    const adminRow = await prisma.users.findUnique({
      where: { id: user.id },
      select: { role: true },
    })
    if (!adminRow || adminRow.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const queryValidation = userQuerySchema.safeParse({
      page: searchParams.get('page'),
      per_page: searchParams.get('per_page'),
      sort: searchParams.get('sort'),
      user_type: searchParams.get('user_type'),
      search: searchParams.get('search'),
      status: searchParams.get('status'),
    })

    if (!queryValidation.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: queryValidation.error.issues },
        { status: 400 }
      )
    }

    const { page, per_page, sort, user_type, search } = queryValidation.data
    const pageNum = parseInt(page)
    const perPageNum = parseInt(per_page)
    const skip = (pageNum - 1) * perPageNum

    // Build where clause
    const where: Prisma.usersWhereInput = {}
    if (user_type) {
      where.role = user_type as Prisma.EnumUserRoleFilter
    }
    if (search) {
      where.profiles = {
        OR: [
          { full_name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }
    }

    // Determine orderBy
    let orderBy: Prisma.usersOrderByWithRelationInput
    switch (sort) {
      case 'oldest':
        orderBy = { created_at: 'asc' }
        break
      case 'name':
        orderBy = { profiles: { full_name: 'asc' } }
        break
      case 'type':
        orderBy = { role: 'asc' }
        break
      default: // newest
        orderBy = { created_at: 'desc' }
    }

    // Fetch users + total count in parallel
    const [userRows, totalCount] = await Promise.all([
      prisma.users.findMany({
        where,
        orderBy,
        skip,
        take: perPageNum,
        include: {
          profiles: {
            select: {
              full_name: true,
              email: true,
              phone: true,
              avatar_url: true,
            },
          },
        },
      }),
      prisma.users.count({ where }),
    ])

    // Fetch property/inquiry counts per user
    const userIds = userRows.map((u: any) => u.id)
    const [propCounts, inqCounts] = await Promise.all([
      prisma.properties.groupBy({ by: ['owner_id'], where: { owner_id: { in: userIds } }, _count: { id: true } }),
      prisma.inquiries.groupBy({ by: ['owner_id'], where: { owner_id: { in: userIds } }, _count: { id: true } }),
    ])
    const propCountMap = Object.fromEntries(propCounts.map((r: any) => [r.owner_id, r._count.id]))
    const inqCountMap = Object.fromEntries(inqCounts.map((r: any) => [r.owner_id, r._count.id]))

    const totalPages = Math.ceil(totalCount / perPageNum)

    const formattedUsers = userRows.map((u: any) => ({
      id: u.id,
      full_name: u.profiles?.full_name ?? null,
      email: u.profiles?.email ?? null,
      phone: u.profiles?.phone ?? null,
      avatar_url: u.profiles?.avatar_url ?? null,
      role: u.role,
      created_at: u.created_at,
      updated_at: u.updated_at,
      property_count: propCountMap[u.id] ?? 0,
      inquiry_count: inqCountMap[u.id] ?? 0,
      is_active: true,
      last_activity: u.updated_at,
      account_age_days: Math.floor(
        (Date.now() - new Date(u.created_at ?? 0).getTime()) / (1000 * 60 * 60 * 24)
      ),
    }))

    // Role distribution for current page (summary reflects full result set via totalCount)
    const roleStats = formattedUsers.reduce((acc: Record<string, number>, u: any) => {
      if (u.role) acc[u.role] = (acc[u.role] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      data: formattedUsers,
      pagination: {
        page: pageNum,
        per_page: perPageNum,
        total: totalCount,
        total_pages: totalPages,
        has_next: pageNum < totalPages,
        has_prev: pageNum > 1,
      },
      summary: {
        total_users: totalCount,
        role_distribution: roleStats,
        new_users_last_30_days: formattedUsers.filter((u: any) =>
          new Date(u.created_at ?? 0) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        ).length,
        average_account_age_days:
          formattedUsers.length > 0
            ? formattedUsers.reduce((acc: number, u: any) => acc + u.account_age_days, 0) / formattedUsers.length
            : 0,
      },
      filters: {
        applied_role: user_type,
        applied_search: search,
        available_roles: ['user', 'owner', 'agent', 'admin'],
      },
    })
  } catch (error) {
    console.error('Unexpected error in admin user management:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}