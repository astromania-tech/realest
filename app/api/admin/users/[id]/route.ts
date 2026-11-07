import { NextRequest, NextResponse } from 'next/server'
import { createClient, getAuthUser } from "@/lib/supabase/server"
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

type RouteParams = {
  params: Promise<{ id: string }>
}

const userIdSchema = z.string().uuid('Invalid user ID')

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient()
    const { id } = await params
    const userIdResult = userIdSchema.safeParse(id)
    if (!userIdResult.success) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    const userId = userIdResult.data

    const { data: { user }, error: authError } = await getAuthUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Admin role check
    const adminRow = await prisma.users.findUnique({ where: { id: user.id }, select: { role: true } })
    if (!adminRow || adminRow.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Fetch target user
    const targetUser = await prisma.users.findUnique({
      where: { id: userId },
      include: {
        profiles: {
          select: {
            full_name: true,
            email: true,
            phone: true,
            avatar_url: true,
            bio: true,
            created_at: true,
            updated_at: true,
          },
        },
      },
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const [
      propCount,
      statusGroups,
      sentInqCount,
      receivedInqCount,
      properties,
      sentInquiries,
      receivedInquiries,
    ] = await Promise.all([
      prisma.properties.count({ where: { owner_id: userId } }),
      prisma.properties.groupBy({
        by: ['status'],
        where: { owner_id: userId },
        _count: { _all: true },
      }),
      prisma.inquiries.count({ where: { sender_id: userId } }),
      prisma.inquiries.count({ where: { owner_id: userId } }),
      prisma.properties.findMany({
        where: { owner_id: userId },
        select: {
          id: true,
          title: true,
          property_type: true,
          status: true,
          price: true,
          price_frequency: true,
          state: true,
          city: true,
          created_at: true,
        },
        orderBy: { created_at: 'desc' },
        take: 20,
      }),
      prisma.inquiries.findMany({
        where: { sender_id: userId },
        select: {
          id: true,
          property_id: true,
          message: true,
          status: true,
          created_at: true,
          properties: { select: { title: true, status: true } },
        },
        orderBy: { created_at: 'desc' },
        take: 10,
      }),
      prisma.inquiries.findMany({
        where: { owner_id: userId },
        select: {
          id: true,
          property_id: true,
          sender_id: true,
          message: true,
          status: true,
          created_at: true,
          properties: { select: { title: true } },
          profiles_inquiries_sender_idToprofiles: { select: { full_name: true, email: true } },
        },
        orderBy: { created_at: 'desc' },
        take: 10,
      }),
    ])

    const countFor = (...statuses: string[]) =>
      statusGroups
        .filter((row) => statuses.includes(row.status ?? ''))
        .reduce((sum, row) => sum + row._count._all, 0)

    const liveProps = countFor('live')
    const pendingProps = countFor('pending_ml_validation', 'pending_vetting')
    const rejectedProps = countFor('rejected')
    const accountCreated = targetUser.created_at ?? targetUser.profiles?.created_at
    const accountAgeDays = accountCreated
      ? Math.floor((Date.now() - new Date(accountCreated).getTime()) / (1000 * 60 * 60 * 24))
      : 0

    return NextResponse.json({
      data: {
        id: targetUser.id,
        role: targetUser.role,
        created_at: targetUser.created_at,
        updated_at: targetUser.updated_at,
        profile: targetUser.profiles,
        stats: {
          total_properties: propCount,
          live_properties: liveProps,
          pending_properties: pendingProps,
          rejected_properties: rejectedProps,
          total_inquiries_sent: sentInqCount,
          total_inquiries_received: receivedInqCount,
          account_age_days: accountAgeDays,
          last_activity: targetUser.updated_at,
        },
        properties,
        recent_inquiries_sent: sentInquiries,
        recent_inquiries_received: receivedInquiries,
        risk_factors: {
          has_rejected_properties: rejectedProps > 0,
          high_rejection_rate: propCount > 0 && (rejectedProps / propCount) > 0.5,
          inactive_account: accountAgeDays > 30 && propCount === 0,
        },
      },
    })
  } catch (error) {
    console.error('Unexpected error in user details:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export const openApiGET = {
  method: 'get',
  summary: 'Get user details',
  description: 'Admin endpoint to fetch a single user profile, stats, properties and recent inquiries.',
  tags: ['admin','users'],
  parameters: [
    { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
  ],
  responses: {
    200: { description: 'User details' },
    401: { description: 'Unauthorized' },
    403: { description: 'Forbidden' },
    404: { description: 'User not found' },
  },
} as const;