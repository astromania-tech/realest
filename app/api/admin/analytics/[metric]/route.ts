import { NextRequest, NextResponse } from 'next/server'
import { createClient, getAuthUser } from "@/lib/supabase/server"
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

// Query parameters schema
const metricQuerySchema = z.object({
  period: z.enum(['7d', '30d', '90d', '1y', 'all']).optional().default('30d'),
  group_by: z.enum(['day', 'week', 'month']).optional().default('day'),
  include_comparison: z.string().optional().default('true'),
})

type RouteParams = {
  params: Promise<{
    metric: string
  }>
}

export const openApiGET = {
  method: 'get',
  summary: 'Metric time series',
  description: 'Fetch time-series metric data for a given metric identifier (users, properties, inquiries, revenue, performance). Admin-only.',
  tags: ['admin','analytics'],
  parameters: [
    { name: 'metric', in: 'path', required: true, schema: { type: 'string', enum: ['users','properties','inquiries','revenue','performance'] }, description: 'Metric identifier' },
    { name: 'period', in: 'query', schema: { type: 'string', enum: ['7d','30d','90d','1y','all'] }, description: 'Date range for the metric' },
    { name: 'group_by', in: 'query', schema: { type: 'string', enum: ['day','week','month'] }, description: 'Granularity for grouping' },
    { name: 'include_comparison', in: 'query', schema: { type: 'boolean' }, description: 'Include comparison to previous period' },
  ],
  responses: {
    200: { description: 'Metric time series payload' },
    400: { description: 'Invalid metric or query params' },
    401: { description: 'Unauthorized' },
    403: { description: 'Forbidden' },
  },
} as const;

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient()
    const { metric } = await params

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
    const queryValidation = metricQuerySchema.safeParse({
      period: searchParams.get('period'),
      group_by: searchParams.get('group_by'),
      include_comparison: searchParams.get('include_comparison'),
    })

    if (!queryValidation.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: queryValidation.error.issues },
        { status: 400 }
      )
    }

    const { period, group_by, include_comparison } = queryValidation.data
    const includeComparison = include_comparison === 'true'

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
        startDate = new Date('2024-01-01')
        break
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    const startDateStr = startDate.toISOString()

    // Generate metric data based on requested metric
    let metricData: any = null
    let comparisonData: any = null

    switch (metric) {
      case 'users':
        metricData = await getUserMetrics(startDateStr, group_by)
        if (includeComparison) {
          comparisonData = await getUserMetricsComparison(startDate, period, group_by)
        }
        break

      case 'properties':
        metricData = await getPropertyMetrics(startDateStr, group_by)
        if (includeComparison) {
          comparisonData = await getPropertyMetricsComparison(startDate, period, group_by)
        }
        break

      case 'inquiries':
        metricData = await getInquiryMetrics(startDateStr, group_by)
        if (includeComparison) {
          comparisonData = await getInquiryMetricsComparison(startDate, period, group_by)
        }
        break

      case 'revenue':
        metricData = await getRevenueMetrics(startDateStr, group_by)
        if (includeComparison) {
          comparisonData = await getRevenueMetricsComparison(startDate, period, group_by)
        }
        break

      case 'performance':
        metricData = await getPerformanceMetrics(startDateStr, group_by)
        if (includeComparison) {
          comparisonData = await getPerformanceMetricsComparison(startDate, period, group_by)
        }
        break

      default:
        return NextResponse.json(
          { error: 'Invalid metric. Supported metrics: users, properties, inquiries, revenue, performance' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      metric,
      period: {
        start_date: startDateStr,
        end_date: now.toISOString(),
        period_type: period,
        group_by,
      },
      data: metricData,
      comparison: includeComparison ? comparisonData : null,
      metadata: {
        total_period: Math.ceil((now.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)),
        data_points: metricData?.length || 0,
        has_comparison: includeComparison && comparisonData !== null,
      }
    })

  } catch (error) {
    console.error('Unexpected error in metric analytics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


// Helper: group a date into a period string
function groupDate(date: Date, groupBy: string): string {
  if (groupBy === 'month') return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
  if (groupBy === 'week') {
    const weekStart = new Date(date)
    weekStart.setDate(date.getDate() - date.getDay())
    return weekStart.toISOString().split('T')[0]
  }
  return date.toISOString().split('T')[0]
}

// Helper: period length in ms
function getPeriodLength(period: string): number {
  switch (period) {
    case '7d': return 7 * 24 * 60 * 60 * 1000
    case '30d': return 30 * 24 * 60 * 60 * 1000
    case '90d': return 90 * 24 * 60 * 60 * 1000
    case '1y': return 365 * 24 * 60 * 60 * 1000
    case 'all': return 365 * 24 * 60 * 60 * 1000
    default: return 30 * 24 * 60 * 60 * 1000
  }
}

// User metrics
async function getUserMetrics(startDateStr: string, groupBy: string) {
  const data = await prisma.profiles.findMany({
    where: { created_at: { gte: new Date(startDateStr) } },
    select: { created_at: true, users: { select: { role: true } } },
    orderBy: { created_at: 'asc' },
  })
  const grouped: Record<string, { period: string; total_users: number; regular_users: number; property_owners: number; admins: number }> = {}
  data.forEach((u: { created_at: Date | null; users: { role: string } | null }) => {
    const p = groupDate(new Date(u.created_at!), groupBy)
    const role = u.users?.role ?? 'user'
    if (!grouped[p]) grouped[p] = { period: p, total_users: 0, regular_users: 0, property_owners: 0, admins: 0 }
    grouped[p].total_users++
    if (role === 'user') grouped[p].regular_users++
    if (role === 'owner') grouped[p].property_owners++
    if (role === 'admin') grouped[p].admins++
  })
  return Object.values(grouped).sort((a, b) => a.period.localeCompare(b.period))
}

async function getUserMetricsComparison(startDate: Date, period: string, groupBy: string) {
  const prev = new Date(startDate.getTime() - getPeriodLength(period))
  const data = await prisma.profiles.findMany({
    where: { created_at: { gte: prev, lt: startDate } },
    select: { created_at: true, users: { select: { role: true } } },
    orderBy: { created_at: 'asc' },
  })
  const grouped: Record<string, { period: string; total_users: number; regular_users: number; property_owners: number; admins: number }> = {}
  data.forEach((u: { created_at: Date | null; users: { role: string } | null }) => {
    const p = groupDate(new Date(u.created_at!), groupBy)
    const role = u.users?.role ?? 'user'
    if (!grouped[p]) grouped[p] = { period: p, total_users: 0, regular_users: 0, property_owners: 0, admins: 0 }
    grouped[p].total_users++
    if (role === 'user') grouped[p].regular_users++
    if (role === 'owner') grouped[p].property_owners++
    if (role === 'admin') grouped[p].admins++
  })
  return Object.values(grouped).sort((a, b) => a.period.localeCompare(b.period))
}

// Property metrics
async function getPropertyMetrics(startDateStr: string, groupBy: string) {
  const data = await prisma.properties.findMany({
    where: { created_at: { gte: new Date(startDateStr) } },
    select: { status: true, created_at: true },
    orderBy: { created_at: 'asc' },
  })
  const grouped: Record<string, { period: string; total_properties: number; live_properties: number; pending_ml: number; pending_vetting: number; rejected_properties: number }> = {}
  data.forEach((prop: { created_at: Date | null; status: string | null }) => {
    const p = groupDate(new Date(prop.created_at!), groupBy)
    if (!grouped[p]) grouped[p] = { period: p, total_properties: 0, live_properties: 0, pending_ml: 0, pending_vetting: 0, rejected_properties: 0 }
    grouped[p].total_properties++
    if (prop.status === 'live') grouped[p].live_properties++
    if (prop.status === 'pending_ml_validation') grouped[p].pending_ml++
    if (prop.status === 'pending_vetting') grouped[p].pending_vetting++
    if (prop.status === 'rejected') grouped[p].rejected_properties++
  })
  return Object.values(grouped).sort((a, b) => a.period.localeCompare(b.period))
}

async function getPropertyMetricsComparison(startDate: Date, period: string, groupBy: string) {
  const prev = new Date(startDate.getTime() - getPeriodLength(period))
  const data = await prisma.properties.findMany({
    where: { created_at: { gte: prev, lt: startDate } },
    select: { status: true, created_at: true },
    orderBy: { created_at: 'asc' },
  })
  const grouped: Record<string, { period: string; total_properties: number; live_properties: number; pending_ml: number; pending_vetting: number; rejected_properties: number }> = {}
  data.forEach((prop: { created_at: Date | null; status: string | null }) => {
    const p = groupDate(new Date(prop.created_at!), groupBy)
    if (!grouped[p]) grouped[p] = { period: p, total_properties: 0, live_properties: 0, pending_ml: 0, pending_vetting: 0, rejected_properties: 0 }
    grouped[p].total_properties++
    if (prop.status === 'live') grouped[p].live_properties++
    if (prop.status === 'pending_ml_validation') grouped[p].pending_ml++
    if (prop.status === 'pending_vetting') grouped[p].pending_vetting++
    if (prop.status === 'rejected') grouped[p].rejected_properties++
  })
  return Object.values(grouped).sort((a, b) => a.period.localeCompare(b.period))
}

// Inquiry metrics
async function getInquiryMetrics(startDateStr: string, groupBy: string) {
  const data = await prisma.inquiries.findMany({
    where: { created_at: { gte: new Date(startDateStr) } },
    select: { status: true, created_at: true },
    orderBy: { created_at: 'asc' },
  })
  const grouped: Record<string, { period: string; total_inquiries: number; responded_inquiries: number; closed_inquiries: number; new_inquiries: number }> = {}
  data.forEach((inq: { created_at: Date | null; status: string | null }) => {
    const p = groupDate(new Date(inq.created_at!), groupBy)
    if (!grouped[p]) grouped[p] = { period: p, total_inquiries: 0, responded_inquiries: 0, closed_inquiries: 0, new_inquiries: 0 }
    grouped[p].total_inquiries++
    if (inq.status === 'responded') grouped[p].responded_inquiries++
    if (inq.status === 'closed') grouped[p].closed_inquiries++
    if (inq.status === 'new') grouped[p].new_inquiries++
  })
  return Object.values(grouped).sort((a, b) => a.period.localeCompare(b.period))
}

async function getInquiryMetricsComparison(startDate: Date, period: string, groupBy: string) {
  const prev = new Date(startDate.getTime() - getPeriodLength(period))
  const data = await prisma.inquiries.findMany({
    where: { created_at: { gte: prev, lt: startDate } },
    select: { status: true, created_at: true },
    orderBy: { created_at: 'asc' },
  })
  const grouped: Record<string, { period: string; total_inquiries: number; responded_inquiries: number; closed_inquiries: number; new_inquiries: number }> = {}
  data.forEach((inq: { created_at: Date | null; status: string | null }) => {
    const p = groupDate(new Date(inq.created_at!), groupBy)
    if (!grouped[p]) grouped[p] = { period: p, total_inquiries: 0, responded_inquiries: 0, closed_inquiries: 0, new_inquiries: 0 }
    grouped[p].total_inquiries++
    if (inq.status === 'responded') grouped[p].responded_inquiries++
    if (inq.status === 'closed') grouped[p].closed_inquiries++
    if (inq.status === 'new') grouped[p].new_inquiries++
  })
  return Object.values(grouped).sort((a, b) => a.period.localeCompare(b.period))
}

// Revenue metrics (placeholder - no transaction table yet)
async function getRevenueMetrics(startDateStr: string, _groupBy: string) {
  return [{ period: startDateStr.split('T')[0], revenue: 0, transactions: 0, average_transaction: 0 }]
}

async function getRevenueMetricsComparison(_startDate: Date, _period: string, _groupBy: string) {
  return []
}

// Performance metrics
async function getPerformanceMetrics(startDateStr: string, groupBy: string) {
  const [props, inqs, profs] = await Promise.all([
    prisma.properties.findMany({ where: { created_at: { gte: new Date(startDateStr) } }, select: { created_at: true, status: true } }),
    prisma.inquiries.findMany({ where: { created_at: { gte: new Date(startDateStr) } }, select: { created_at: true, status: true } }),
    prisma.profiles.findMany({ where: { created_at: { gte: new Date(startDateStr) } }, select: { created_at: true } }),
  ])
  const ops = [
    ...props.map((x: { created_at: Date | null; status: string | null }) => ({ created_at: x.created_at!, status: x.status })),
    ...inqs.map((x: { created_at: Date | null; status: string | null }) => ({ created_at: x.created_at!, status: x.status })),
    ...profs.map((x: { created_at: Date | null }) => ({ created_at: x.created_at!, status: 'success' })),
  ]
  const grouped: Record<string, { period: string; total_requests: number; successful_operations: number; failed_operations: number }> = {}
  ops.forEach((op) => {
    const p = groupDate(new Date(op.created_at), groupBy)
    if (!grouped[p]) grouped[p] = { period: p, total_requests: 0, successful_operations: 0, failed_operations: 0 }
    grouped[p].total_requests++
    if (['live', 'success', 'responded', 'closed'].includes(op.status ?? '')) grouped[p].successful_operations++
    else if (['rejected', 'failed'].includes(op.status ?? '')) grouped[p].failed_operations++
  })
  return Object.values(grouped).sort((a, b) => a.period.localeCompare(b.period))
}

async function getPerformanceMetricsComparison(startDate: Date, period: string, groupBy: string) {
  const prev = new Date(startDate.getTime() - getPeriodLength(period))
  const [props, inqs, profs] = await Promise.all([
    prisma.properties.findMany({ where: { created_at: { gte: prev, lt: startDate } }, select: { created_at: true, status: true } }),
    prisma.inquiries.findMany({ where: { created_at: { gte: prev, lt: startDate } }, select: { created_at: true, status: true } }),
    prisma.profiles.findMany({ where: { created_at: { gte: prev, lt: startDate } }, select: { created_at: true } }),
  ])
  const ops = [
    ...props.map((x: { created_at: Date | null; status: string | null }) => ({ created_at: x.created_at!, status: x.status })),
    ...inqs.map((x: { created_at: Date | null; status: string | null }) => ({ created_at: x.created_at!, status: x.status })),
    ...profs.map((x: { created_at: Date | null }) => ({ created_at: x.created_at!, status: 'success' })),
  ]
  const grouped: Record<string, { period: string; total_requests: number; successful_operations: number; failed_operations: number }> = {}
  ops.forEach((op) => {
    const p = groupDate(new Date(op.created_at), groupBy)
    if (!grouped[p]) grouped[p] = { period: p, total_requests: 0, successful_operations: 0, failed_operations: 0 }
    grouped[p].total_requests++
    if (['live', 'success', 'responded', 'closed'].includes(op.status ?? '')) grouped[p].successful_operations++
    else if (['rejected', 'failed'].includes(op.status ?? '')) grouped[p].failed_operations++
  })
  return Object.values(grouped).sort((a, b) => a.period.localeCompare(b.period))
}
