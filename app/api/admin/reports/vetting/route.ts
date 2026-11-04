import { NextRequest, NextResponse } from 'next/server'
import { createClient, getAuthUser } from "@/lib/supabase/server"
import { prisma } from '@/lib/prisma'
import type { OpenApiMetadata } from '@/lib/openapi/route-metadata'

export const openApiGET: OpenApiMetadata = {
  method: 'get',
  summary: 'Get vetting report',
  description: 'Generate admin vetting summary statistics for a chosen time period and status filter.',
  tags: ['Admin'],
  security: [{ bearerAuth: [] }],
  parameters: [
    { name: 'period', in: 'query', schema: { type: 'string', enum: ['7d', '30d', '90d'] } },
    { name: 'status', in: 'query', schema: { type: 'string' } },
  ],
  responses: {
    '200': { description: 'Vetting report generated' },
    '401': { description: 'Authentication required' },
    '403': { description: 'Admin access required' },
  },
}

// GET /api/admin/reports/vetting - Admin vetting reports
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get authenticated user and verify admin role
    const { data: { user }, error: authError } = await getAuthUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
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
    const url = new URL(request.url)
    const period = url.searchParams.get('period') || '30d' // 7d, 30d, 90d
    const status = url.searchParams.get('status') // pending_vetting, live, rejected

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
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    // Build base query for properties in the period
    const properties = await prisma.properties.findMany({
      where: {
        created_at: { gte: startDate },
        ...(status ? { status } : {}),
      },
      select: {
        id: true,
        title: true,
        status: true,
        created_at: true,
        updated_at: true,
        owners: {
          select: { profiles: { select: { id: true, full_name: true, email: true } } },
        },
      },
      orderBy: { created_at: 'desc' },
    })

    // Map to consistent shape (owner from profiles relation)
    const mappedProperties = properties.map((p: any) => ({
      id: p.id,
      title: p.title,
      status: p.status,
      created_at: p.created_at,
      updated_at: p.updated_at,
      owner: p.owners?.profiles ? { id: p.owners.profiles.id, full_name: p.owners.profiles.full_name, email: p.owners.profiles.email } : null,
    }))

    // Calculate statistics
    const stats = {
      total_properties: mappedProperties?.length || 0,
      pending_vetting: mappedProperties?.filter((p: any) => p.status === 'pending_vetting').length || 0,
      live_properties: mappedProperties?.filter((p: any) => p.status === 'live').length || 0,
      rejected_properties: mappedProperties?.filter((p: any) => p.status === 'rejected').length || 0,
      average_vetting_time: 0,
      vetting_efficiency: 0
    }

    // Calculate vetting efficiency (properties processed per day)
    const completedProperties = mappedProperties?.filter((p: any) =>
      p.status === 'live' || p.status === 'rejected'
    ) || []

    const daysInPeriod = Math.max(1, Math.ceil((now.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)))
    stats.vetting_efficiency = completedProperties.length / daysInPeriod

    // Get admin activity summary
    const adminActivity = await prisma.admin_audit_log.findMany({
      where: {
        action: 'property_vetting',
        created_at: { gte: startDate },
      },
      include: {
        profiles: { select: { id: true, full_name: true } },
      },
      orderBy: { created_at: 'desc' },
    })

    // Group admin activity
    const adminStats: Record<string, any> = {}
    adminActivity?.forEach((activity: any) => {
      const adminId = activity.actor_id
      if (!adminStats[adminId]) {
        adminStats[adminId] = {
          admin_name: activity.profiles?.full_name || 'Unknown',
          vetted_count: 0,
          last_activity: activity.created_at
        }
      }
      adminStats[adminId].vetted_count++
    })

    return NextResponse.json({
      data: {
        properties: mappedProperties || [],
        stats,
        admin_activity: Object.values(adminStats),
      },
      period,
      date_range: {
        start: startDate.toISOString(),
        end: now.toISOString()
      }
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

