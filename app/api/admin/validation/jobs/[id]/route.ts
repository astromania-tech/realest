import { NextRequest, NextResponse } from 'next/server'
import { createClient, getAuthUser } from "@/lib/supabase/server"
import { prisma } from '@/lib/prisma'
import { getValidationJob } from '@/lib/validation/validation-job-worker'

type RouteParams = {
  params: Promise<{
    id: string
  }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient()
    const { id } = await params

    const { data: { user }, error: authError } = await getAuthUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminRow = await prisma.users.findUnique({ where: { id: user.id }, select: { role: true } })
    if (!adminRow || adminRow.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const job = await getValidationJob(id)
    if (!job) {
      return NextResponse.json({ error: 'Validation job not found' }, { status: 404 })
    }

    return NextResponse.json({ ok: true, data: job })
  } catch (error) {
    console.error('Validation job lookup error:', error)
    return NextResponse.json({ error: 'Unable to load validation job' }, { status: 500 })
  }
}
