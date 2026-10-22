import { NextRequest, NextResponse } from 'next/server'
import { createClient, getAuthUser } from "@/lib/supabase/server"
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@/lib/prisma/client'

// Query parameters schema
const analyticsQuerySchema = z.object({
  period: z.enum(['7d', '30d', '90d', '1y', 'all']).optional().default('30d'),
  include_trends: z.string().optional().default('true'), // Whether to include trend data
})

type RouteParams = {
  params: Promise<{}>
}

export const openApiGET = {
  method: 'get',
  summary: 'Admin analytics overview',
  description: 'High-level platform analytics: users, properties, inquiries, admin actions and optional trend data. Admin-only.',
  tags: ['admin','analytics'],
  parameters: [
    { name: 'period', in: 'query', schema: { type: 'string', enum: ['7d','30d','90d','1y','all'] }, description: 'Date range for metrics' },
    { name: 'include_trends', in: 'query', schema: { type: 'boolean' }, description: 'Include time series trend data' },
  ],
  responses: {
    200: { description: 'Analytics overview JSON' },
    401: { description: 'Unauthorized' },
    403: { description: 'Forbidden' },
  },
} as const;

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
    const queryValidation = analyticsQuerySchema.safeParse({
      period: searchParams.get('period'),
      include_trends: searchParams.get('include_trends'),
    })

    if (!queryValidation.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: queryValidation.error.issues },
        { status: 400 }
      )
    }

    const { period, include_trends } = queryValidation.data
    const includeTrends = include_trends === 'true'

    // Calculate date range
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
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      case 'all':
        startDate = new Date('2024-01-01') // Platform launch date
        break
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    const startDateStr = startDate.toISOString()
    const periodDays = Math.max(
      1,
      Math.ceil((now.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)),
    )

    // Aggregate in SQL — do not pull full row sets into JS
    const [
      totalUsers,
      roleGroups,
      propertyStatusGroups,
      propertyTypeGroups,
      propertyStateGroups,
      propertyPriceAgg,
      verifiedProperties,
      inquiryStatusGroups,
      inquiriesOnLive,
      adminActionGroups,
      totalAdminActions,
    ] = await Promise.all([
      prisma.profiles.count({ where: { created_at: { gte: startDate } } }),
      prisma.users.groupBy({
        by: ['role'],
        where: { created_at: { gte: startDate } },
        _count: { _all: true },
      }),
      prisma.properties.groupBy({
        by: ['status'],
        where: { created_at: { gte: startDate } },
        _count: { _all: true },
      }),
      prisma.properties.groupBy({
        by: ['property_type'],
        where: { created_at: { gte: startDate } },
        _count: { _all: true },
      }),
      prisma.properties.groupBy({
        by: ['state'],
        where: { created_at: { gte: startDate } },
        _count: { _all: true },
      }),
      prisma.properties.aggregate({
        where: { created_at: { gte: startDate } },
        _avg: { price: true },
        _count: { _all: true },
      }),
      prisma.properties.count({
        where: {
          created_at: { gte: startDate },
          verification_status: 'verified',
        },
      }),
      prisma.inquiries.groupBy({
        by: ['status'],
        where: { created_at: { gte: startDate } },
        _count: { _all: true },
      }),
      prisma.inquiries.count({
        where: {
          created_at: { gte: startDate },
          properties: { status: 'live' },
        },
      }),
      prisma.admin_audit_log.groupBy({
        by: ['action'],
        where: { created_at: { gte: startDate } },
        _count: { _all: true },
      }),
      prisma.admin_audit_log.count({
        where: { created_at: { gte: startDate } },
      }),
    ])

    const countBy = <T extends string>(
      rows: Array<{ [K in T]: string | null } & { _count: { _all: number } }>,
      key: T,
    ): Record<string, number> =>
      rows.reduce((acc, row) => {
        const label = (row[key] as string | null) || 'unknown'
        acc[label] = row._count._all
        return acc
      }, {} as Record<string, number>)

    const propertyStatus = countBy(propertyStatusGroups, 'status')
    const inquiryStatus = countBy(inquiryStatusGroups, 'status')
    const totalProperties = propertyPriceAgg._count._all
    const liveProperties = propertyStatus.live || 0
    const pendingProperties =
      (propertyStatus.pending_ml_validation || 0) +
      (propertyStatus.pending_vetting || 0)
    const rejectedProperties = propertyStatus.rejected || 0
    const respondedInquiries = inquiryStatus.responded || 0
    const closedInquiries = inquiryStatus.closed || 0
    const totalInquiries = Object.values(inquiryStatus).reduce((s, n) => s + n, 0)

    const userMetrics = {
      total_users: totalUsers,
      new_users: totalUsers,
      user_type_distribution: countBy(roleGroups, 'role'),
      user_growth_rate: (totalUsers / periodDays) * 30,
    }

    const propertyMetrics = {
      total_properties: totalProperties,
      live_properties: liveProperties,
      pending_properties: pendingProperties,
      rejected_properties: rejectedProperties,
      verified_properties: verifiedProperties,
      property_type_distribution: countBy(propertyTypeGroups, 'property_type'),
      state_distribution: countBy(propertyStateGroups, 'state'),
      average_property_price: Number(propertyPriceAgg._avg.price ?? 0),
      property_success_rate: totalProperties
        ? (liveProperties / totalProperties) * 100
        : 0,
    }

    const inquiryMetrics = {
      total_inquiries: totalInquiries,
      responded_inquiries: respondedInquiries,
      closed_inquiries: closedInquiries,
      inquiry_response_rate: totalInquiries
        ? ((respondedInquiries + closedInquiries) / totalInquiries) * 100
        : 0,
      inquiries_on_live_properties: inquiriesOnLive,
    }

    const adminMetrics = {
      total_admin_actions: totalAdminActions,
      action_type_distribution: countBy(adminActionGroups, 'action'),
      admin_productivity: totalAdminActions / periodDays,
    }

    // Calculate platform health metrics
    const platformHealth = {
      user_engagement_rate: userMetrics.total_users > 0 ?
        (inquiryMetrics.total_inquiries / userMetrics.total_users) * 100 : 0,
      property_verification_rate: propertyMetrics.total_properties > 0 ?
        (propertyMetrics.verified_properties / propertyMetrics.total_properties) * 100 : 0,
      marketplace_efficiency: propertyMetrics.live_properties > 0 ?
        (inquiryMetrics.inquiries_on_live_properties / propertyMetrics.live_properties) : 0,
      admin_workload: adminMetrics.total_admin_actions / Math.max(1, propertyMetrics.pending_properties),
    }

    // Generate trend data if requested
    let trends = null
    if (includeTrends) {
      trends = await generateTrendData(startDate, period)
    }

    return NextResponse.json({
      period: {
        start_date: startDateStr,
        end_date: now.toISOString(),
        period_type: period,
      },
      metrics: {
        users: userMetrics,
        properties: propertyMetrics,
        inquiries: inquiryMetrics,
        admin: adminMetrics,
        platform_health: platformHealth,
      },
      trends: trends,
      summary: {
        total_active_users: userMetrics.total_users,
        total_live_properties: propertyMetrics.live_properties,
        total_inquiries: inquiryMetrics.total_inquiries,
        platform_health_score: calculateHealthScore(platformHealth),
        top_performing_states: Object.entries(propertyMetrics.state_distribution)
          .sort(([,a], [,b]) => (b as number) - (a as number))
          .slice(0, 5)
          .map(([state, count]) => ({ state, count })),
        recent_growth: {
          users_last_7_days: await getRecentCount('profiles', 7),
          properties_last_7_days: await getRecentCount('properties', 7),
          inquiries_last_7_days: await getRecentCount('inquiries', 7),
        }
      }
    })

  } catch (error) {
    console.error('Unexpected error in analytics overview:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to generate trend data (one grouped query per series, not N×3 counts)
async function generateTrendData(_startDate: Date, period: string) {
  const days =
    period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 90
  const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

  const [userBaseline, propertyBaseline, inquiryBaseline, userDays, propertyDays, inquiryDays] =
    await Promise.all([
      prisma.profiles.count({ where: { created_at: { lt: from } } }),
      prisma.properties.count({ where: { created_at: { lt: from } } }),
      prisma.inquiries.count({ where: { created_at: { lt: from } } }),
      prisma.$queryRaw<Array<{ d: Date; n: bigint }>>(Prisma.sql`
        select date_trunc('day', created_at)::date as d, count(*)::bigint as n
        from public.profiles
        where created_at >= ${from}
        group by 1
        order by 1
      `),
      prisma.$queryRaw<Array<{ d: Date; n: bigint }>>(Prisma.sql`
        select date_trunc('day', created_at)::date as d, count(*)::bigint as n
        from public.properties
        where created_at >= ${from}
        group by 1
        order by 1
      `),
      prisma.$queryRaw<Array<{ d: Date; n: bigint }>>(Prisma.sql`
        select date_trunc('day', created_at)::date as d, count(*)::bigint as n
        from public.inquiries
        where created_at >= ${from}
        group by 1
        order by 1
      `),
    ])

  const toMap = (rows: Array<{ d: Date; n: bigint }>) => {
    const map = new Map<string, number>()
    for (const row of rows) {
      const key = new Date(row.d).toISOString().slice(0, 10)
      map.set(key, Number(row.n))
    }
    return map
  }

  const userMap = toMap(userDays)
  const propertyMap = toMap(propertyDays)
  const inquiryMap = toMap(inquiryDays)

  let users = userBaseline
  let properties = propertyBaseline
  let inquiries = inquiryBaseline
  const dataPoints = []

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
    const dateStr = date.toISOString().slice(0, 10)
    users += userMap.get(dateStr) ?? 0
    properties += propertyMap.get(dateStr) ?? 0
    inquiries += inquiryMap.get(dateStr) ?? 0
    dataPoints.push({ date: dateStr, users, properties, inquiries })
  }

  return dataPoints
}

// Helper function to get recent counts
async function getRecentCount(table: 'profiles' | 'properties' | 'inquiries', days: number): Promise<number> {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
  if (table === 'profiles') return prisma.profiles.count({ where: { created_at: { gte: startDate } } })
  if (table === 'properties') return prisma.properties.count({ where: { created_at: { gte: startDate } } })
  return prisma.inquiries.count({ where: { created_at: { gte: startDate } } })
}

// Helper function to calculate platform health score (0-100)
function calculateHealthScore(health: any): number {
  const weights = {
    user_engagement_rate: 0.3,
    property_verification_rate: 0.3,
    marketplace_efficiency: 0.2,
    admin_workload: 0.2,
  }

  const scores = {
    user_engagement_rate: Math.min(health.user_engagement_rate / 10, 100), // Target: 10+ inquiries per user
    property_verification_rate: health.property_verification_rate,
    marketplace_efficiency: Math.min(health.marketplace_efficiency * 10, 100), // Target: 10+ inquiries per property
    admin_workload: Math.max(0, 100 - (health.admin_workload * 10)), // Lower workload is better
  }

  return Object.entries(weights).reduce((total, [key, weight]) => {
    return total + (scores[key as keyof typeof scores] * weight)
  }, 0)
}