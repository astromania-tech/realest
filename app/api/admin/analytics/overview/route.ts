import { NextRequest, NextResponse } from 'next/server'
import { createClient, getAuthUser } from "@/lib/supabase/server"
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

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

    // Fetch core metrics via Prisma
    const [userStats, propertyStats, inquiryStats, adminActions] = await Promise.all([
      // User statistics
      prisma.profiles.findMany({
        where: { created_at: { gte: startDate } },
        select: { created_at: true, users: { select: { role: true } } },
      }),
      // Property statistics
      prisma.properties.findMany({
        where: { created_at: { gte: startDate } },
        select: { status: true, property_type: true, state: true, created_at: true, price: true },
      }),
      // Inquiry statistics
      prisma.inquiries.findMany({
        where: { created_at: { gte: startDate } },
        select: { status: true, created_at: true, properties: { select: { status: true } } },
      }),
      // Admin action statistics
      prisma.admin_audit_log.findMany({
        where: { created_at: { gte: startDate } },
        select: { action: true, created_at: true },
      }),
    ])

    const userError = null, propertyError = null, inquiryError = null, adminError = null

    // Calculate user metrics
    const userMetrics = {
      total_users: userStats?.length || 0,
      new_users: userStats?.length || 0,
      user_type_distribution: userStats?.reduce((acc: Record<string, number>, u: any) => {
        const role = u.users?.role || 'user'
        acc[role] = (acc[role] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {},
      user_growth_rate: calculateGrowthRate(userStats || [], startDate),
    }

    // Calculate property metrics
    const propertyMetrics = {
      total_properties: propertyStats?.length || 0,
      live_properties: propertyStats?.filter((p: any) => p.status === 'live').length || 0,
      pending_properties: propertyStats?.filter((p: any) =>
        ['pending_ml_validation', 'pending_vetting'].includes(p.status)
      ).length || 0,
      rejected_properties: propertyStats?.filter((p: any) => p.status === 'rejected').length || 0,
      verified_properties: propertyStats?.filter((p: any) => p.verified_at).length || 0,
      property_type_distribution: propertyStats?.reduce((acc: Record<string, number>, property: any) => {
        acc[property.property_type] = (acc[property.property_type] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {},
      state_distribution: propertyStats?.reduce((acc: Record<string, number>, property: any) => {
        acc[property.state] = (acc[property.state] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {},
      average_property_price: propertyStats?.length ?
        propertyStats.reduce((sum: number, p: any) => sum + (Number(p.price) || 0), 0) / propertyStats.length : 0,
      property_success_rate: propertyStats?.length ?
        (propertyStats.filter((p: any) => p.status === 'live').length / propertyStats.length) * 100 : 0,
    }

    // Calculate inquiry metrics
    const inquiryMetrics = {
      total_inquiries: inquiryStats?.length || 0,
      responded_inquiries: inquiryStats?.filter((i: any) => i.status === 'responded').length || 0,
      closed_inquiries: inquiryStats?.filter((i: any) => i.status === 'closed').length || 0,
      inquiry_response_rate: inquiryStats?.length ?
        (inquiryStats.filter((i: any) => ['responded', 'closed'].includes(i.status)).length / inquiryStats.length) * 100 : 0,
      inquiries_on_live_properties: inquiryStats?.filter((i: any) =>
        i.property && i.property.status === 'live'
      ).length || 0,
    }

    // Calculate admin metrics
    const adminMetrics = {
      total_admin_actions: adminActions?.length || 0,
      action_type_distribution: adminActions?.reduce((acc: Record<string, number>, action: any) => {
        acc[action.action] = (acc[action.action] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {},
      admin_productivity: adminActions?.length ?
        adminActions.length / Math.max(1, Math.ceil((now.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000))) : 0,
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

// Helper function to calculate growth rate
function calculateGrowthRate(data: any[], startDate: Date): number {
  if (data.length === 0) return 0

  const totalPeriod = Math.ceil((Date.now() - startDate.getTime()) / (24 * 60 * 60 * 1000))
  const dailyAverage = data.length / Math.max(1, totalPeriod)

  // Compare to previous period (same length)
  const previousPeriodStart = new Date(startDate.getTime() - totalPeriod * 24 * 60 * 60 * 1000)

  // This is a simplified calculation - in production you'd query historical data
  return dailyAverage * 30 // Monthly growth rate estimate
}

// Helper function to generate trend data
async function generateTrendData(startDate: Date, period: string) {
  // Generate daily data points for the period
  const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365
  const dataPoints = []

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
    const dateStr = date.toISOString().split('T')[0]

    const [userCount, propertyCount, inquiryCount] = await Promise.all([
      prisma.profiles.count({ where: { created_at: { lte: date } } }),
      prisma.properties.count({ where: { created_at: { lte: date } } }),
      prisma.inquiries.count({ where: { created_at: { lte: date } } }),
    ])

    dataPoints.push({
      date: dateStr,
      users: userCount,
      properties: propertyCount,
      inquiries: inquiryCount,
    })
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