import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { OpenApiMetadata } from '@/lib/openapi/route-metadata'
import { requireAdmin } from '@/lib/auth/require-admin'
import { publicHealthBody } from '@/lib/system/health-body'

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
export async function GET(_request: NextRequest) {
  let databaseUp = false
  try {
    await prisma.$queryRaw`SELECT 1`
    databaseUp = true
  } catch (error) {
    console.error('Health check database error:', error)
  }

  const admin = await requireAdmin()
  if (!admin.ok) {
    const body = publicHealthBody(databaseUp)
    return NextResponse.json(body, { status: databaseUp ? 200 : 503 })
  }

  const started = Date.now()
  const counts = await Promise.all([
    prisma.properties.count(),
    prisma.properties.count({ where: { status: 'live' } }),
    prisma.profiles.count(),
    prisma.properties.count({ where: { status: 'pending_vetting' } }),
    prisma.properties.count({ where: { status: 'pending_ml_validation' } }),
  ]).catch((error: unknown) => {
    console.error('Health metrics error:', error)
    return null
  })

  return NextResponse.json({
    ...publicHealthBody(databaseUp),
    response_time_ms: Date.now() - started,
    metrics: counts
      ? {
          total_properties: counts[0],
          live_properties: counts[1],
          total_users: counts[2],
          pending_vetting: counts[3],
          pending_ml_validation: counts[4],
        }
      : null,
  }, { status: databaseUp ? 200 : 503 })
}

