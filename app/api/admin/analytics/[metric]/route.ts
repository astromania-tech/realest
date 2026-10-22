import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from "@/lib/supabase/server"
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@/lib/prisma/client'

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

type TruncUnit = 'day' | 'week' | 'month'

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
    const { metric } = await params

    const { data: { user }, error: authError } = await getAuthUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminRow = await prisma.users.findUnique({ where: { id: user.id }, select: { role: true } })
    if (!adminRow || adminRow.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const queryValidation = metricQuerySchema.safeParse({
      period: searchParams.get('period'),
      group_by: searchParams.get('group_by'),
      include_comparison: searchParams.get('include_comparison'),
    })

    if (!queryValidation.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: queryValidation.error.issues },
        { status: 400 },
      )
    }

    const { period, group_by, include_comparison } = queryValidation.data
    const includeComparison = include_comparison === 'true'

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
    const endDate = now

    let metricData: unknown = null
    let comparisonData: unknown = null

    switch (metric) {
      case 'users':
        metricData = await getUserMetrics(startDate, endDate, group_by)
        if (includeComparison) {
          const prev = new Date(startDate.getTime() - getPeriodLength(period))
          comparisonData = await getUserMetrics(prev, startDate, group_by)
        }
        break
      case 'properties':
        metricData = await getPropertyMetrics(startDate, endDate, group_by)
        if (includeComparison) {
          const prev = new Date(startDate.getTime() - getPeriodLength(period))
          comparisonData = await getPropertyMetrics(prev, startDate, group_by)
        }
        break
      case 'inquiries':
        metricData = await getInquiryMetrics(startDate, endDate, group_by)
        if (includeComparison) {
          const prev = new Date(startDate.getTime() - getPeriodLength(period))
          comparisonData = await getInquiryMetrics(prev, startDate, group_by)
        }
        break
      case 'revenue':
        metricData = await getRevenueMetrics(startDateStr)
        if (includeComparison) {
          comparisonData = await getRevenueMetricsComparison()
        }
        break
      case 'performance':
        metricData = await getPerformanceMetrics(startDate, endDate, group_by)
        if (includeComparison) {
          const prev = new Date(startDate.getTime() - getPeriodLength(period))
          comparisonData = await getPerformanceMetrics(prev, startDate, group_by)
        }
        break
      default:
        return NextResponse.json(
          { error: 'Invalid metric. Supported metrics: users, properties, inquiries, revenue, performance' },
          { status: 400 },
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
        data_points: Array.isArray(metricData) ? metricData.length : 0,
        has_comparison: includeComparison && comparisonData !== null,
      },
    })
  } catch (error) {
    console.error('Unexpected error in metric analytics:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

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

function truncUnit(groupBy: string): TruncUnit {
  if (groupBy === 'week') return 'week'
  if (groupBy === 'month') return 'month'
  return 'day'
}

/** Whitelisted date_trunc literal — never interpolate user input into SQL. */
function dateTrunc(columnSql: 'created_at' | 'p.created_at', groupBy: string): Prisma.Sql {
  const unit = truncUnit(groupBy)
  return Prisma.raw(`date_trunc('${unit}', ${columnSql})`)
}

function periodKey(d: Date, groupBy: string): string {
  if (groupBy === 'month') {
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
  }
  return d.toISOString().slice(0, 10)
}

async function getUserMetrics(start: Date, end: Date, groupBy: string) {
  const trunc = dateTrunc('p.created_at', groupBy)
  const rows = await prisma.$queryRaw<
    Array<{ period: Date; role: string | null; n: bigint }>
  >(Prisma.sql`
    select ${trunc} as period,
           coalesce(u.role::text, 'user') as role,
           count(*)::bigint as n
    from public.profiles p
    left join public.users u on u.id = p.id
    where p.created_at >= ${start} and p.created_at < ${end}
    group by 1, 2
    order by 1
  `)

  const grouped: Record<
    string,
    { period: string; total_users: number; regular_users: number; property_owners: number; admins: number }
  > = {}
  for (const row of rows) {
    const key = periodKey(new Date(row.period), groupBy)
    if (!grouped[key]) {
      grouped[key] = {
        period: key,
        total_users: 0,
        regular_users: 0,
        property_owners: 0,
        admins: 0,
      }
    }
    const n = Number(row.n)
    grouped[key].total_users += n
    if (row.role === 'user') grouped[key].regular_users += n
    if (row.role === 'owner') grouped[key].property_owners += n
    if (row.role === 'admin') grouped[key].admins += n
  }
  return Object.values(grouped).sort((a, b) => a.period.localeCompare(b.period))
}

async function getPropertyMetrics(start: Date, end: Date, groupBy: string) {
  const trunc = dateTrunc('created_at', groupBy)
  const rows = await prisma.$queryRaw<
    Array<{ period: Date; status: string | null; n: bigint }>
  >(Prisma.sql`
    select ${trunc} as period, status, count(*)::bigint as n
    from public.properties
    where created_at >= ${start} and created_at < ${end}
    group by 1, 2
    order by 1
  `)

  const grouped: Record<
    string,
    {
      period: string
      total_properties: number
      live_properties: number
      pending_ml: number
      pending_vetting: number
      rejected_properties: number
    }
  > = {}
  for (const row of rows) {
    const key = periodKey(new Date(row.period), groupBy)
    if (!grouped[key]) {
      grouped[key] = {
        period: key,
        total_properties: 0,
        live_properties: 0,
        pending_ml: 0,
        pending_vetting: 0,
        rejected_properties: 0,
      }
    }
    const n = Number(row.n)
    grouped[key].total_properties += n
    if (row.status === 'live') grouped[key].live_properties += n
    if (row.status === 'pending_ml_validation') grouped[key].pending_ml += n
    if (row.status === 'pending_vetting') grouped[key].pending_vetting += n
    if (row.status === 'rejected') grouped[key].rejected_properties += n
  }
  return Object.values(grouped).sort((a, b) => a.period.localeCompare(b.period))
}

async function getInquiryMetrics(start: Date, end: Date, groupBy: string) {
  const trunc = dateTrunc('created_at', groupBy)
  const rows = await prisma.$queryRaw<
    Array<{ period: Date; status: string | null; n: bigint }>
  >(Prisma.sql`
    select ${trunc} as period, status, count(*)::bigint as n
    from public.inquiries
    where created_at >= ${start} and created_at < ${end}
    group by 1, 2
    order by 1
  `)

  const grouped: Record<
    string,
    {
      period: string
      total_inquiries: number
      responded_inquiries: number
      closed_inquiries: number
      new_inquiries: number
    }
  > = {}
  for (const row of rows) {
    const key = periodKey(new Date(row.period), groupBy)
    if (!grouped[key]) {
      grouped[key] = {
        period: key,
        total_inquiries: 0,
        responded_inquiries: 0,
        closed_inquiries: 0,
        new_inquiries: 0,
      }
    }
    const n = Number(row.n)
    grouped[key].total_inquiries += n
    if (row.status === 'responded') grouped[key].responded_inquiries += n
    if (row.status === 'closed') grouped[key].closed_inquiries += n
    if (row.status === 'new') grouped[key].new_inquiries += n
  }
  return Object.values(grouped).sort((a, b) => a.period.localeCompare(b.period))
}

async function getRevenueMetrics(startDateStr: string) {
  return [{ period: startDateStr.split('T')[0], revenue: 0, transactions: 0, average_transaction: 0 }]
}

async function getRevenueMetricsComparison() {
  return []
}

async function getPerformanceMetrics(start: Date, end: Date, groupBy: string) {
  const trunc = dateTrunc('created_at', groupBy)
  const [propRows, inqRows, profileRows] = await Promise.all([
    prisma.$queryRaw<
      Array<{ period: Date; status: string | null; n: bigint }>
    >(Prisma.sql`
      select ${trunc} as period, status, count(*)::bigint as n
      from public.properties
      where created_at >= ${start} and created_at < ${end}
      group by 1, 2
      order by 1
    `),
    prisma.$queryRaw<
      Array<{ period: Date; status: string | null; n: bigint }>
    >(Prisma.sql`
      select ${trunc} as period, status, count(*)::bigint as n
      from public.inquiries
      where created_at >= ${start} and created_at < ${end}
      group by 1, 2
      order by 1
    `),
    prisma.$queryRaw<
      Array<{ period: Date; n: bigint }>
    >(Prisma.sql`
      select ${trunc} as period, count(*)::bigint as n
      from public.profiles
      where created_at >= ${start} and created_at < ${end}
      group by 1
      order by 1
    `),
  ])

  const grouped: Record<
    string,
    { period: string; total_requests: number; successful_operations: number; failed_operations: number }
  > = {}

  const bump = (key: string, total: number, success = 0, failed = 0) => {
    if (!grouped[key]) {
      grouped[key] = {
        period: key,
        total_requests: 0,
        successful_operations: 0,
        failed_operations: 0,
      }
    }
    grouped[key].total_requests += total
    grouped[key].successful_operations += success
    grouped[key].failed_operations += failed
  }

  for (const row of propRows) {
    const key = periodKey(new Date(row.period), groupBy)
    const n = Number(row.n)
    const success = row.status === 'live' ? n : 0
    const failed = row.status === 'rejected' ? n : 0
    bump(key, n, success, failed)
  }
  for (const row of inqRows) {
    const key = periodKey(new Date(row.period), groupBy)
    const n = Number(row.n)
    const success =
      row.status === 'responded' || row.status === 'closed' ? n : 0
    bump(key, n, success, 0)
  }
  for (const row of profileRows) {
    const key = periodKey(new Date(row.period), groupBy)
    const n = Number(row.n)
    bump(key, n, n, 0)
  }

  return Object.values(grouped).sort((a, b) => a.period.localeCompare(b.period))
}
