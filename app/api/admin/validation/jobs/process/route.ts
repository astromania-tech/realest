import { NextRequest, NextResponse } from 'next/server'
import { createClient, getAuthUser } from "@/lib/supabase/server"
import { prisma } from '@/lib/prisma'
import { claimValidationJobs, finishClaimedValidationJob } from '@/lib/validation/validation-job-worker'
import { requireStaff } from "@/lib/auth/require-staff"
import { authDeniedResponse } from "@/lib/auth/staff-api"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await getAuthUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminRow = await prisma.users.findUnique({ where: { id: user.id }, select: { role: true } })
    if (!adminRow || adminRow.role !== 'admin' && adminRow.role !== 'reviewer') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json().catch(() => ({} as Record<string, unknown>))
    const requestedJobId = typeof body.jobId === 'string' ? body.jobId : null

    const claimed = await claimValidationJobs(requestedJobId ? { limit: 1, jobId: requestedJobId } : { limit: 1 })

    if (!claimed.length) {
      return NextResponse.json({ ok: true, processed: 0, message: 'No validation jobs were ready' })
    }

    const processed = [] as Array<{ id: string; result: Awaited<ReturnType<typeof finishClaimedValidationJob>> }>
    for (const id of claimed) {
      processed.push({ id, result: await finishClaimedValidationJob(id) })
    }

    return NextResponse.json({ ok: true, processed: processed.length, data: processed })
  } catch (error) {
    console.error('Validation worker dispatch error:', error)
    return NextResponse.json({ error: 'Unable to process validation jobs' }, { status: 500 })
  }
}
