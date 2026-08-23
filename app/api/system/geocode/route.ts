import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import type { OpenApiMetadata } from '@/lib/openapi/route-metadata'

// Query parameters schema for geocoding
const geocodeQuerySchema = z.object({
  address: z.string().min(3, 'Address must be at least 3 characters'),
  state: z.string().optional(), // Nigerian state for better accuracy
  lga: z.string().optional(), // Local Government Area
})

export const openApiGET: OpenApiMetadata = {
  method: 'get',
  summary: 'Geocode an address',
  description: 'Resolve a Nigerian address into coordinates and address components.',
  tags: ['System'],
  parameters: [
    { name: 'address', in: 'query', required: true, schema: { type: 'string' } },
    { name: 'state', in: 'query', schema: { type: 'string' } },
    { name: 'lga', in: 'query', schema: { type: 'string' } },
  ],
  responses: {
    '200': { description: 'Geocoding result' },
    '400': { description: 'Invalid query parameters' },
    '404': { description: 'Address not found' },
    '503': { description: 'Geocoding service unavailable' },
  },
}

type RouteParams = {
  params: Promise<{}>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const queryValidation = geocodeQuerySchema.safeParse({
      address: searchParams.get('address'),
      state: searchParams.get('state'),
      lga: searchParams.get('lga'),
    })

    if (!queryValidation.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: queryValidation.error.issues },
        { status: 400 }
      )
    }

    const { address, state, lga } = queryValidation.data

    // Construct full address for geocoding
    let fullAddress = address
    if (lga && state) {
      fullAddress += `, ${lga}, ${state}, Nigeria`
    } else if (state) {
      fullAddress += `, ${state}, Nigeria`
    } else {
      fullAddress += ', Nigeria'
    }

    // Use Mapbox Geocoding API (or Google Maps as fallback)
    const mapboxToken = process.env.MAPBOX_ACCESS_TOKEN

    if (!mapboxToken) {
      return NextResponse.json(
        { error: 'Geocoding service not configured' },
        { status: 503 }
      )
    }

    // Call Mapbox Geocoding API
    const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(fullAddress)}.json?access_token=${mapboxToken}&limit=5&country=ng`

    const response = await fetch(geocodeUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      console.error('Mapbox API error:', response.status, response.statusText)
      return NextResponse.json(
        { error: 'Geocoding service temporarily unavailable' },
        { status: 503 }
      )
    }

    const data = await response.json()

    if (!data.features || data.features.length === 0) {
      return NextResponse.json(
        {
          error: 'Address not found',
          suggestions: [
            'Try adding the state name',
            'Include the Local Government Area (LGA)',
            'Use a more specific address',
            'Check spelling and formatting'
          ]
        },
        { status: 404 }
      )
    }

    // Format results for Nigerian addresses
    const results = data.features.map((feature: any) => ({
      place_name: feature.place_name,
      latitude: feature.center[1],
      longitude: feature.center[0],
      relevance: feature.relevance,
      address_components: {
        street: extractStreetName(feature),
        area: extractArea(feature),
        lga: extractLGA(feature),
        state: extractState(feature),
      },
      confidence: calculateConfidence(feature, address, state, lga),
      mapbox_id: feature.id,
    }))

    // Sort by confidence score
    results.sort((a: any, b: any) => b.confidence - a.confidence)

    return NextResponse.json({
      query: {
        original_address: address,
        full_address: fullAddress,
        state_hint: state,
        lga_hint: lga,
      },
      results,
      metadata: {
        total_results: results.length,
        geocoding_service: 'mapbox',
        country: 'Nigeria',
        timestamp: new Date().toISOString(),
      }
    })

  } catch (error) {
    console.error('Unexpected error in geocoding:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper functions for extracting Nigerian address components
function extractStreetName(feature: any): string | null {
  const context = feature.context || []
  // Look for address or street in context
  const addressComponent = context.find((c: any) =>
    c.id.includes('address') || c.id.includes('street')
  )
  return addressComponent ? addressComponent.text : null
}

function extractArea(feature: any): string | null {
  const context = feature.context || []
  // Look for neighborhood or locality
  const areaComponent = context.find((c: any) =>
    c.id.includes('neighborhood') || c.id.includes('locality')
  )
  return areaComponent ? areaComponent.text : null
}

function extractLGA(feature: any): string | null {
  const context = feature.context || []
  // LGAs are typically represented as regions or districts
  const lgaComponent = context.find((c: any) =>
    c.id.includes('region') || c.id.includes('district')
  )
  return lgaComponent ? lgaComponent.text : null
}

function extractState(feature: any): string | null {
  const context = feature.context || []
  // States are represented as regions
  const stateComponent = context.find((c: any) =>
    c.id.includes('region') && isNigerianState(c.text)
  )
  return stateComponent ? stateComponent.text : null
}

function isNigerianState(text: string): boolean {
  const nigerianStates = [
    'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa',
    'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo',
    'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo', 'Jigawa', 'Kaduna',
    'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa',
    'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers',
    'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
  ]
  return nigerianStates.some(state =>
    text.toLowerCase().includes(state.toLowerCase())
  )
}

function calculateConfidence(feature: any, originalAddress: string, stateHint?: string, lgaHint?: string): number {
  let confidence = feature.relevance || 0.5

  // Boost confidence if state matches
  if (stateHint && extractState(feature)?.toLowerCase().includes(stateHint.toLowerCase())) {
    confidence += 0.2
  }

  // Boost confidence if LGA matches
  if (lgaHint && extractLGA(feature)?.toLowerCase().includes(lgaHint.toLowerCase())) {
    confidence += 0.2
  }

  // Boost confidence for exact matches in place name
  if (feature.place_name.toLowerCase().includes(originalAddress.toLowerCase())) {
    confidence += 0.1
  }

  // Cap at 1.0
  return Math.min(confidence, 1.0)
}