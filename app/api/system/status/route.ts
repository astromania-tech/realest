import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { OpenApiMetadata } from '@/lib/openapi/route-metadata'
import { requireAdmin } from '@/lib/auth/require-admin'
import { publicHealthBody } from '@/lib/system/health-body'

export const openApiGET: OpenApiMetadata = {
  method: 'get',
  summary: 'Get system status',
  description: 'Return application mode, feature flags, and operational statistics.',
  tags: ['System'],
  responses: {
    '200': { description: 'System status loaded' },
    '500': { description: 'Failed to retrieve system status' },
  },
}

// GET /api/system/status - System status information
export async function GET(_request: NextRequest) {
  const admin = await requireAdmin()
  if (!admin.ok) {
    let databaseUp = false
    try {
      await prisma.$queryRaw`SELECT 1`
      databaseUp = true
    } catch (error) {
      console.error('Status database error:', error)
    }
    const body = publicHealthBody(databaseUp)
    return NextResponse.json(body, { status: databaseUp ? 200 : 503 })
  }

  try {
    const appMode = process.env.NEXT_PUBLIC_APP_MODE || 'development'

    const systemInfo = {
      app_mode: appMode,
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    }

    const stats: any = {}

    try {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const [
        totalProperties,
        liveProperties,
        pendingProperties,
        totalUsers,
        owners,
        agents,
        admins,
        recentProperties,
        recentInquiries,
      ] = await Promise.all([
        prisma.properties.count(),
        prisma.properties.count({ where: { status: 'live' } }),
        prisma.properties.count({ where: { status: { in: ['pending_ml_validation', 'pending_vetting'] } } }),
        prisma.users.count(),
        prisma.users.count({ where: { role: 'owner' } }),
        prisma.users.count({ where: { role: 'agent' } }),
        prisma.users.count({ where: { role: 'admin' } }),
        prisma.properties.count({ where: { created_at: { gte: thirtyDaysAgo } } }),
        prisma.inquiries.count({ where: { created_at: { gte: thirtyDaysAgo } } }),
      ])

      stats.database = {
        properties: {
          total: totalProperties,
          live: liveProperties,
          pending: pendingProperties,
          recent: recentProperties
        },
        users: {
          total: totalUsers,
          owners,
          agents,
          admins
        },
        activity: {
          recent_inquiries: recentInquiries,
          inquiries_last_30_days: recentInquiries
        }
      }
    } catch (statsError: unknown) {
      console.error('Status statistics error:', statsError)
      stats.database = {
        error: 'Failed to fetch database statistics',
      }
    }

    // Get feature flags based on app mode
    const features = {
      authentication: true,
      property_listing: appMode !== 'coming-soon',
      property_search: appMode !== 'coming-soon',
      admin_dashboard: appMode === 'development' || appMode === 'full-site',
      agent_dashboard: appMode === 'development' || appMode === 'full-site',
      owner_dashboard: appMode === 'development' || appMode === 'full-site',
      waitlist: appMode === 'coming-soon',
      ml_validation: true,
      physical_vetting: true,
      geospatial_search: true,
      email_notifications: true
    }

    // Get Nigerian market specific status
    const nigerianStatus = {
      supported_states: [
        'Lagos', 'Abuja (FCT)', 'Rivers', 'Ogun', 'Oyo', 'Kano',
        'Kaduna', 'Edo', 'Delta', 'Enugu', 'Anambra', 'Imo'
      ],
      currency: 'NGN (₦)',
      phone_format: '+234',
      property_types: [
        'House', 'Apartment', 'Land', 'Commercial', 'Boys Quarters',
        'Self-Contained', 'Room and Parlor', 'Duplex', 'Bungalow'
      ],
      infrastructure_focus: [
        'NEPA Power Status', 'Water Sources', 'Internet Types',
        'Security Features', 'Road Conditions'
      ]
    }

    return NextResponse.json({
      system: systemInfo,
      stats,
      features,
      nigerian_market: nigerianStatus,
      status: 'operational'
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      {
        status: 'error',
        error: 'Failed to retrieve system status',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

