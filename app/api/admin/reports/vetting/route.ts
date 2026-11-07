import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from "@/lib/supabase/server"
import { prisma } from '@/lib/prisma'
import type { OpenApiMetadata } from '@/lib/openapi/route-metadata'

export const openApiGET: OpenApiMetadata = {
  method: 'get',
  summary: 'Get vetting report',
  description: 'Generate admin vetting summary statistics for a chosen time period and status filter.',
  tags: ['Admin'],
  security: [{ bearerAuth: [] }],
  parameters: [
    { name: 'period', in: 'query', schema: { type: 'string', enum: ['7d', '30d', '90d'] } },
    { name: 'status', in: 'query', schema: { type: 'string' } },
  ],
  responses: {
    '200': { description: 'Vetting report generated' },
    '401': { description: 'Authentication required' },
    '403': { description: 'Admin access required' },
  },
}

// GET /api/admin/reports/vetting - Admin vetting reports
export async function GET(request: NextRequest) {
  try {
    const { data: { user }, error: authError } = await getAuthUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const adminRow = await prisma.users.findUnique({ where: { id: user.id }, select: { role: true } })
    if (!adminRow || adminRow.role !== 'admin' && adminRow.role !== 'reviewer') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const url = new URL(request.url)
    const period = url.searchParams.get('period') || '30d'
    const status = url.searchParams.get('status')

    const now = new Date()
    let startDate: Date

    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    const propertyWhere = {
      created_at: { gte: startDate },
      ...(status ? { status } : {}),
    }

    const [statusGroups, properties, adminGroups] = await Promise.all([
      prisma.properties.groupBy({
        by: ['status'],
        where: propertyWhere,
        _count: { _all: true },
      }),
      prisma.properties.findMany({
        where: propertyWhere,
        select: {
          id: true,
          title: true,
          status: true,
          created_at: true,
          updated_at: true,
          owners: {
            select: { profiles: { select: { id: true, full_name: true, email: true } } },
          },
        },
        orderBy: { created_at: 'desc' },
        take: 100,
      }),
      prisma.admin_audit_log.groupBy({
        by: ['actor_id'],
        where: {
          action: 'property_vetting',
          created_at: { gte: startDate },
        },
        _count: { _all: true },
        _max: { created_at: true },
      }),
    ])

    const countFor = (...statuses: string[]) =>
      statusGroups
        .filter((row) => statuses.includes(row.status ?? ''))
        .reduce((sum, row) => sum + row._count._all, 0)

    const totalProperties = statusGroups.reduce((sum, row) => sum + row._count._all, 0)
    const liveCount = countFor('live')
    const rejectedCount = countFor('rejected')
    const pendingCount = countFor('pending_vetting')
    const completedCount = liveCount + rejectedCount

    const daysInPeriod = Math.max(
      1,
      Math.ceil((now.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)),
    )

    const stats = {
      total_properties: totalProperties,
      pending_vetting: pendingCount,
      live_properties: liveCount,
      rejected_properties: rejectedCount,
      average_vetting_time: 0,
      vetting_efficiency: completedCount / daysInPeriod,
    }

    const mappedProperties = properties.map((p) => ({
      id: p.id,
      title: p.title,
      status: p.status,
      created_at: p.created_at,
      updated_at: p.updated_at,
      owner: p.owners?.profiles
        ? {
            id: p.owners.profiles.id,
            full_name: p.owners.profiles.full_name,
            email: p.owners.profiles.email,
          }
        : null,
    }))

    const actorIds = adminGroups.map((row) => row.actor_id)
    const actorProfiles = actorIds.length
      ? await prisma.profiles.findMany({
          where: { id: { in: actorIds } },
          select: { id: true, full_name: true },
        })
      : []
    const nameById = Object.fromEntries(
      actorProfiles.map((p) => [p.id, p.full_name || 'Unknown']),
    )

    const adminActivity = adminGroups.map((row) => ({
      admin_name: nameById[row.actor_id] || 'Unknown',
      vetted_count: row._count._all,
      last_activity: row._max.created_at,
    }))

    return NextResponse.json({
      data: {
        properties: mappedProperties,
        stats,
        admin_activity: adminActivity,
      },
      period,
      date_range: {
        start: startDate.toISOString(),
        end: now.toISOString(),
      },
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
