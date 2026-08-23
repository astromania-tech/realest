import { NextRequest, NextResponse } from 'next/server'
import { createClient, getAuthUser } from "@/lib/supabase/server"
import { prisma } from '@/lib/prisma'
import { Prisma } from '@/lib/prisma/client'
import { processValidationJob } from '@/lib/validation/validation-job-worker'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await getAuthUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminRow = await prisma.users.findUnique({ where: { id: user.id }, select: { role: true } })
    if (!adminRow || adminRow.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json().catch(() => ({} as Record<string, unknown>))
    const requestedJobId = typeof body.jobId === 'string' ? body.jobId : null

    const queuedJobs = requestedJobId
      ? [{ id: requestedJobId }]
      : await prisma.$queryRaw<Array<{ id: string }>>(Prisma.sql`
          select id
          from public.property_validation_jobs
          where status in ('queued', 'failed')
            and coalesce(next_retry_at, now()) <= now()
          order by queued_at asc
          limit 1
        `)

    if (!queuedJobs.length) {
      return NextResponse.json({ ok: true, processed: 0, message: 'No validation jobs were ready' })
    }

    const processed = [] as Array<{ id: string; result: Awaited<ReturnType<typeof processValidationJob>> }>
    for (const job of queuedJobs) {
      processed.push({ id: job.id, result: await processValidationJob(job.id) })
    }

    return NextResponse.json({ ok: true, processed: processed.length, data: processed })
  } catch (error) {
    console.error('Validation worker dispatch error:', error)
    return NextResponse.json({ error: 'Unable to process validation jobs' }, { status: 500 })
  }
}
