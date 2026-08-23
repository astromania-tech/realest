import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma, Prisma } from '@/lib/prisma'
import { z } from 'zod'
import type { OpenApiMetadata } from '@/lib/openapi/route-metadata'

// Query schema for property exploration
const exploreQuerySchema = z.object({
  // Location filters
  state: z.string().optional(),
  lga: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  radius_km: z.number().min(1).max(100).optional(),

  // Property filters
  property_type: z.enum(['house', 'apartment', 'land', 'commercial', 'event_center', 'hotel', 'shop', 'office']).optional(),
  min_price: z.number().min(0).optional(),
  max_price: z.number().min(0).optional(),
  bedrooms: z.number().min(0).optional(),
  bathrooms: z.number().min(0).optional(),
  has_bq: z.boolean().optional(),

  // Infrastructure filters (Nigerian market)
  nepa_status: z.enum(['stable', 'intermittent', 'poor', 'none', 'generator_only']).optional(),
  water_source: z.enum(['borehole', 'public_water', 'well', 'water_vendor', 'none']).optional(),
  internet_type: z.enum(['fiber', 'starlink', '4g', '3g', 'none']).optional(),
  security_type: z.array(z.enum(['gated_community', 'security_post', 'cctv', 'perimeter_fence', 'security_dogs', 'none'])).optional(),

  // Pagination
  page: z.number().min(1).default(1),
  per_page: z.number().min(1).max(50).default(20),

  // Sorting
  sort_by: z.enum(['newest', 'price_asc', 'price_desc', 'distance']).default('newest'),
})

type ExploreQuery = z.infer<typeof exploreQuerySchema>

/**
 * OpenAPI metadata for GET /api/properties/explore
 * Advanced property discovery with Nigerian market context
 */
export const openApiGET: OpenApiMetadata = {
  method: 'get',
  summary: 'Explore properties with advanced filters',
  description: 'Advanced property search with location, price, features, and Nigerian infrastructure filters. Supports geospatial radius search, pagination, and multiple sorting options.',
  tags: ['Properties'],
  parameters: [
    { name: 'state', in: 'query', schema: { type: 'string' }, description: 'State filter (e.g., Lagos, Abuja)' },
    { name: 'latitude', in: 'query', schema: { type: 'number' }, description: 'Latitude for geospatial search' },
    { name: 'longitude', in: 'query', schema: { type: 'number' }, description: 'Longitude for geospatial search' },
    { name: 'radius_km', in: 'query', schema: { type: 'number', minimum: 1, maximum: 100 }, description: 'Search radius in km' },
    { name: 'property_type', in: 'query', schema: { type: 'string', enum: ['house', 'apartment', 'land', 'commercial', 'event_center', 'hotel', 'shop', 'office'] } },
    { name: 'min_price', in: 'query', schema: { type: 'number', minimum: 0 } },
    { name: 'max_price', in: 'query', schema: { type: 'number', minimum: 0 } },
    { name: 'bedrooms', in: 'query', schema: { type: 'integer', minimum: 0 } },
    { name: 'bathrooms', in: 'query', schema: { type: 'integer', minimum: 0 } },
    { name: 'has_bq', in: 'query', schema: { type: 'boolean' }, description: 'Has Boys Quarters' },
    { name: 'nepa_status', in: 'query', schema: { type: 'string', enum: ['stable', 'intermittent', 'poor', 'none', 'generator_only'] } },
    { name: 'water_source', in: 'query', schema: { type: 'string', enum: ['borehole', 'public_water', 'well', 'water_vendor', 'none'] } },
    { name: 'internet_type', in: 'query', schema: { type: 'string', enum: ['fiber', 'starlink', '4g', '3g', 'none'] } },
    { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
    { name: 'per_page', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 50, default: 20 } },
    { name: 'sort_by', in: 'query', schema: { type: 'string', enum: ['newest', 'price_asc', 'price_desc', 'distance'], default: 'newest' } },
  ],
  responses: {
    '200': {
      description: 'Featured and matching properties with pagination',
      content: { 'application/json': { schema: { type: 'object', properties: { properties: { type: 'array' }, pagination: { type: 'object' } } } } },
    },
    '400': { description: 'Invalid filter parameters' },
  },
};

export async function GET(request: NextRequest) {
  try {
    // Parse and validate query parameters
    const url = new URL(request.url)
    const queryParams: Record<string, string | string[]> = {}

    // Handle array parameters (security_type)
    for (const [key, value] of url.searchParams.entries()) {
      if (key === 'security_type') {
        if (!queryParams[key]) queryParams[key] = []
        ;(queryParams[key] as string[]).push(value)
      } else {
        queryParams[key] = value
      }
    }

    const query = exploreQuerySchema.parse(queryParams)

    // Build Prisma where clause — only supports schema fields
    const where: Prisma.propertiesWhereInput = { status: 'live' }

    // Apply location filters (schema has: state, city, address, latitude, longitude)
    if (query.state) {
      where.state = query.state
    }

    // Geospatial radius search — use Supabase RPC (PostGIS)
    if (query.latitude && query.longitude && query.radius_km) {
      const supabase = await createClient()
      const { data: radiusProperties } = await supabase.rpc('properties_within_radius', {
        lat: query.latitude,
        lng: query.longitude,
        radius_km: query.radius_km,
      })

      if (radiusProperties && radiusProperties.length > 0) {
        const radiusIds = radiusProperties.map((p: any) => p.id)
        where.id = { in: radiusIds }
      } else {
        return NextResponse.json({
          properties: [],
          pagination: {
            page: query.page || 1,
            per_page: query.per_page || 20,
            total: 0,
            total_pages: 0,
            has_next: false,
            has_prev: false,
          },
        })
      }
    }

    // Property type filter
    if (query.property_type) {
      where.property_type = query.property_type
    }

    // Price range filters
    if (query.min_price !== undefined || query.max_price !== undefined) {
      where.price = {}
      if (query.min_price !== undefined) where.price.gte = query.min_price
      if (query.max_price !== undefined) where.price.lte = query.max_price
    }

    // Bedroom/bathroom filters
    if (query.bedrooms !== undefined) {
      where.bedrooms = { gte: query.bedrooms }
    }
    if (query.bathrooms !== undefined) {
      where.bathrooms = { gte: query.bathrooms }
    }

    // Build orderBy
    let orderBy: Prisma.propertiesOrderByWithRelationInput = { created_at: 'desc' }
    if (query.sort_by === 'price_asc') orderBy = { price: 'asc' }
    else if (query.sort_by === 'price_desc') orderBy = { price: 'desc' }

    const [properties, total] = await Promise.all([
      prisma.properties.findMany({
        where,
        select: {
          id: true,
          title: true,
          property_type: true,
          price: true,
          price_frequency: true,
          address: true,
          city: true,
          state: true,
          latitude: true,
          longitude: true,
          bedrooms: true,
          bathrooms: true,
          status: true,
          created_at: true,
          updated_at: true,
          owners: { select: { profiles: { select: { full_name: true, avatar_url: true } } } },
          property_media: true,
        },
        orderBy,
        skip: (query.page - 1) * query.per_page,
        take: query.per_page,
      }),
      prisma.properties.count({ where }),
    ])

    const totalPages = Math.ceil(total / query.per_page)

    return NextResponse.json({
      data: properties,
      pagination: {
        page: query.page,
        per_page: query.per_page,
        total,
        total_pages: totalPages,
        has_next: query.page < totalPages,
        has_prev: query.page > 1,
      },
      filters: {
        applied: {
          state: query.state,
          property_type: query.property_type,
          price_range: query.min_price || query.max_price ? {
            min: query.min_price,
            max: query.max_price,
          } : undefined,
          bedrooms: query.bedrooms,
          bathrooms: query.bathrooms,
          location: query.latitude && query.longitude ? {
            latitude: query.latitude,
            longitude: query.longitude,
            radius_km: query.radius_km,
          } : undefined,
        },
      },
    })
  } catch (error) {
    console.error('API error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 },
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

