import { NextRequest, NextResponse } from 'next/server'
import { createClient, getAuthUser } from "@/lib/supabase/server"
import { prisma } from '@/lib/prisma'

type RouteParams = {
  params: Promise<{
    id: string
  }>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
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

    const result = await prisma.$queryRaw<Array<{ retry_property_validation_job: unknown }>>`
      select public.retry_property_validation_job(${id}::uuid)
    `

    return NextResponse.json({ ok: true, data: result[0]?.retry_property_validation_job ?? null })
  } catch (error) {
    console.error('Retry validation job error:', error)
    return NextResponse.json({ error: 'Unable to retry job' }, { status: 500 })
  }
}