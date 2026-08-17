import { NextRequest, NextResponse } from 'next/server'
import { createClient, getAuthUser } from "@/lib/supabase/server"
import { prisma } from '@/lib/prisma'
import { Prisma } from '@/lib/prisma/client'
import { logAuth401Diagnostics } from '@/lib/auth-diagnostics'
import { z } from 'zod'

const queueQuerySchema = z.object({
  page: z.string().optional().default('1'),
  per_page: z.string().optional().default('12'),
  status: z.enum(['queued', 'processing', 'completed', 'failed', 'all']).optional().default('all'),
})

type ValidationJobRow = {
  job_id: string
  property_id: string
  job_kind: string
  job_status: string
  attempts: number
  retry_count: number
  source: string
  last_error: string | null
  failure_reason: string | null
  final_property_status: string | null
  queued_at: string
  started_at: string | null
  finished_at: string | null
  updated_at: string
  next_retry_at: string | null
  property_title: string
  property_address: string
  property_city: string
  property_state: string | null
  property_type: string
  listing_type: string
  property_price: string
  property_status: string
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await getAuthUser()

    if (authError || !user) {
      await logAuth401Diagnostics({
        route: '/api/admin/validation/jobs',
        request,
        authError: authError?.message ?? null,
      })
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminRow = await prisma.users.findUnique({ where: { id: user.id }, select: { role: true } })

    if (!adminRow || adminRow.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const parsed = queueQuerySchema.safeParse({
      page: searchParams.get('page') ?? undefined,
      per_page: searchParams.get('per_page') ?? undefined,
      status: searchParams.get('status') ?? undefined,
    })

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid query parameters', details: parsed.error.issues }, { status: 400 })
    }

    const { page, per_page, status } = parsed.data
    const pageNum = Number.parseInt(page, 10)
    const perPageNum = Number.parseInt(per_page, 10)
    const offset = (pageNum - 1) * perPageNum

    const statusFilter = status === 'all' ? Prisma.empty : Prisma.sql`and j.status = ${status}`

    const jobs = await prisma.$queryRaw<ValidationJobRow[]>(Prisma.sql`
      select
        j.id as job_id,
        j.property_id,
        j.job_kind,
        j.status as job_status,
        j.attempts,
        j.retry_count,
        j.source,
        j.last_error,
        j.failure_reason,
        j.final_property_status,
        j.queued_at,
        j.started_at,
        j.finished_at,
        j.updated_at,
        j.next_retry_at,
        p.title as property_title,
        p.address as property_address,
        p.city as property_city,
        p.state as property_state,
        p.property_type,
        p.listing_type,
        p.price::text as property_price,
        p.status as property_status
      from public.property_validation_jobs j
      join public.properties p on p.id = j.property_id
      where 1 = 1
      ${statusFilter}
      order by j.updated_at desc
      limit ${perPageNum}
      offset ${offset}
    `)

    const totalCountRows = await prisma.$queryRaw<Array<{ total: number }>>(Prisma.sql`
      select count(*)::int as total
      from public.property_validation_jobs j
      where 1 = 1
      ${statusFilter}
    `)

    const summaryRows = await prisma.$queryRaw<Array<{ status: string; count: number }>>(Prisma.sql`
      select status, count(*)::int as count
      from public.property_validation_jobs
      group by status
    `)

    const statusCounts = summaryRows.reduce<Record<string, number>>((acc, row) => {
      acc[row.status] = row.count
      return acc
    }, {})

    const metrics = {
      queued: statusCounts.queued ?? 0,
      processing: statusCounts.processing ?? 0,
      completed: statusCounts.completed ?? 0,
      failed: statusCounts.failed ?? 0,
      total: totalCountRows[0]?.total ?? 0,
      average_attempts: jobs.length > 0 ? jobs.reduce((sum, job) => sum + job.attempts, 0) / jobs.length : 0,
      retryable_failed: jobs.filter((job) => job.job_status === 'failed' && (job.next_retry_at === null || new Date(job.next_retry_at) <= new Date())).length,
    }

    return NextResponse.json({
      data: jobs,
      pagination: {
        page: pageNum,
        per_page: perPageNum,
        total: metrics.total,
        total_pages: Math.ceil(metrics.total / perPageNum),
      },
      metrics,
    })
  } catch (error) {
    console.error('Admin validation jobs API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}