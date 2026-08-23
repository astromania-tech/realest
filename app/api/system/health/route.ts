import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { OpenApiMetadata } from '@/lib/openapi/route-metadata'

export const openApiGET: OpenApiMetadata = {
  method: 'get',
  summary: 'Get system health',
  description: 'Check database connectivity and application health metrics.',
  tags: ['System'],
  responses: {
    '200': { description: 'System healthy' },
    '503': { description: 'System unhealthy' },
  },
}

// GET /api/system/health - System health check
export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now()

    // Check database connectivity via Prisma
    let dbStatus = 'healthy'
    let dbError: string | null = null
    try {
      await prisma.$queryRaw`SELECT 1`
    } catch (err: any) {
      dbStatus = 'error'
      dbError = err.message
    }

    const dbResponseTime = Date.now() - startTime

    // Get system statistics
    const stats: any = {
      database: {
        status: dbStatus,
        response_time_ms: dbResponseTime,
        error: dbError
      }
    }

    // Get application metrics (if available)
    try {
      const [totalProperties, liveProperties, totalUsers, pendingVetting, pendingML] = await Promise.all([
        prisma.properties.count(),
        prisma.properties.count({ where: { status: 'live' } }),
        prisma.profiles.count(),
        prisma.properties.count({ where: { status: 'pending_vetting' } }),
        prisma.properties.count({ where: { status: 'pending_ml_validation' } }),
      ])

      stats.metrics = {
        total_properties: totalProperties,
        live_properties: liveProperties,
        total_users: totalUsers,
        pending_vetting: pendingVetting,
        pending_ml_validation: pendingML,
        vetting_queue_size: pendingVetting + pendingML
      }
    } catch (metricsError: any) {
      stats.metrics = {
        error: 'Failed to fetch metrics',
        details: metricsError.message
      }
    }

    // Determine overall health status
    const overallStatus = dbStatus === 'healthy' ? 'healthy' : 'unhealthy'

    // Check for critical issues
    const issues = []
    if (dbStatus !== 'healthy') {
      issues.push('Database connection failed')
    }

    if (stats.metrics && typeof stats.metrics === 'object' && 'vetting_queue_size' in stats.metrics) {
      const queueSize = stats.metrics.vetting_queue_size as number
      if (queueSize > 100) {
        issues.push(`Large vetting queue: ${queueSize} properties pending`)
      }
    }

    const response = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      stats,
      issues: issues.length > 0 ? issues : null
    }

    // Return appropriate HTTP status
    const httpStatus = overallStatus === 'healthy' ? 200 : 503

    return NextResponse.json(response, { status: httpStatus })

  } catch (error) {
    console.error('Health check error:', error)

    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 503 })
  }
}

