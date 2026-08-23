import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/agents - List verified agents
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const perPage = Math.min(parseInt(url.searchParams.get('per_page') || '20'), 100)
    const verified = url.searchParams.get('verified') !== 'false'
    const sortBy = url.searchParams.get('sort_by') || 'total_listings'
    const sortOrder = (url.searchParams.get('sort_order') || 'desc') as 'asc' | 'desc'

    const where: Record<string, unknown> = {}
    if (verified) where.verified = true

    const validSortFields: Record<string, string> = {
      total_listings: 'total_listings',
      rating: 'rating',
      name: 'profiles',
      created_at: 'created_at',
    }
    const sortField = validSortFields[sortBy] ? sortBy : 'total_listings'

    type AgentSortable = 'total_listings' | 'rating' | 'created_at'
    const directSort: AgentSortable[] = ['total_listings', 'rating', 'created_at']

    const orderBy = directSort.includes(sortField as AgentSortable)
      ? { [sortField]: sortOrder }
      : { created_at: sortOrder }

    const skip = (page - 1) * perPage

    const [agents, total] = await Promise.all([
      prisma.agents.findMany({
        where,
        include: {
          profiles: {
            select: {
              full_name: true,
              email: true,
              phone: true,
              avatar_url: true,
              created_at: true,
            },
          },
        },
        orderBy,
        skip,
        take: perPage,
      }),
      prisma.agents.count({ where }),
    ])

    const totalPages = Math.ceil(total / perPage)

    return NextResponse.json({
      data: agents,
      pagination: {
        page,
        per_page: perPage,
        total,
        total_pages: totalPages,
        has_next: page < totalPages,
        has_prev: page > 1,
      },
    })

  } catch (error) {
    console.error('Agents API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
