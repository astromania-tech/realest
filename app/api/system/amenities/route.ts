import { NextRequest, NextResponse } from 'next/server'
import type { OpenApiMetadata } from '@/lib/openapi/route-metadata'

export const openApiGET: OpenApiMetadata = {
  method: 'get',
  summary: 'List property amenities',
  description: 'Return categorized Nigerian property amenities with optional category and search filtering.',
  tags: ['System'],
  parameters: [
    { name: 'category', in: 'query', schema: { type: 'string' } },
    { name: 'search', in: 'query', schema: { type: 'string' } },
  ],
  responses: {
    '200': { description: 'Amenities loaded successfully' },
  },
}

// GET /api/system/amenities - Available amenities list
export async function GET(request: NextRequest) {
  try {
    // Nigerian property amenities
    const amenities = {
      // Infrastructure
      infrastructure: [
        { id: 'nepa_stable', name: 'Stable NEPA Power', category: 'infrastructure' },
        { id: 'nepa_intermittent', name: 'Intermittent NEPA Power', category: 'infrastructure' },
        { id: 'generator', name: 'Generator', category: 'infrastructure' },
        { id: 'inverter', name: 'Inverter System', category: 'infrastructure' },
        { id: 'solar_panels', name: 'Solar Panels', category: 'infrastructure' },
        { id: 'borehole', name: 'Borehole Water', category: 'infrastructure' },
        { id: 'public_water', name: 'Public Water Supply', category: 'infrastructure' },
        { id: 'well', name: 'Well Water', category: 'infrastructure' },
        { id: 'water_tank', name: 'Water Tank', category: 'infrastructure' },
        { id: 'water_treatment', name: 'Water Treatment System', category: 'infrastructure' },
        { id: 'fiber_internet', name: 'Fiber Internet', category: 'infrastructure' },
        { id: 'starlink', name: 'Starlink Internet', category: 'infrastructure' },
        { id: '4g_internet', name: '4G Internet', category: 'infrastructure' }
      ],

      // Security
      security: [
        { id: 'gated_community', name: 'Gated Community', category: 'security' },
        { id: 'security_post', name: 'Security Post', category: 'security' },
        { id: 'cctv', name: 'CCTV Cameras', category: 'security' },
        { id: 'perimeter_fence', name: 'Perimeter Fence', category: 'security' },
        { id: 'security_dogs', name: 'Security Dogs', category: 'security' },
        { id: 'estate_security', name: 'Estate Security', category: 'security' },
        { id: 'intercom', name: 'Intercom System', category: 'security' },
        { id: 'electric_fence', name: 'Electric Fence', category: 'security' }
      ],

      // Property Features
      features: [
        { id: 'boys_quarters', name: 'Boys Quarters (BQ)', category: 'features' },
        { id: 'parking_spaces', name: 'Parking Spaces', category: 'features' },
        { id: 'swimming_pool', name: 'Swimming Pool', category: 'features' },
        { id: 'gym', name: 'Gym/Fitness Center', category: 'features' },
        { id: 'garden', name: 'Garden/Landscaping', category: 'features' },
        { id: 'balcony', name: 'Balcony', category: 'features' },
        { id: 'terrace', name: 'Terrace', category: 'features' },
        { id: 'rooftop', name: 'Rooftop Access', category: 'features' },
        { id: 'elevator', name: 'Elevator', category: 'features' },
        { id: 'backup_generator', name: 'Backup Generator', category: 'features' }
      ],

      // Interior Amenities
      interior: [
        { id: 'air_conditioning', name: 'Air Conditioning', category: 'interior' },
        { id: 'furnished', name: 'Furnished', category: 'interior' },
        { id: 'built_in_kitchen', name: 'Built-in Kitchen', category: 'interior' },
        { id: 'walk_in_closet', name: 'Walk-in Closet', category: 'interior' },
        { id: 'ensuite_bathrooms', name: 'Ensuite Bathrooms', category: 'interior' },
        { id: 'jacuzzi', name: 'Jacuzzi/Bathtub', category: 'interior' },
        { id: 'fireplace', name: 'Fireplace', category: 'interior' },
        { id: 'hardwood_floors', name: 'Hardwood Floors', category: 'interior' },
        { id: 'tile_floors', name: 'Tile Floors', category: 'interior' },
        { id: 'carpet', name: 'Carpet', category: 'interior' }
      ],

      // Exterior Amenities
      exterior: [
        { id: 'garage', name: 'Garage', category: 'exterior' },
        { id: 'carport', name: 'Carport', category: 'exterior' },
        { id: 'driveway', name: 'Driveway', category: 'exterior' },
        { id: 'patio', name: 'Patio', category: 'exterior' },
        { id: 'deck', name: 'Deck', category: 'exterior' },
        { id: 'outdoor_kitchen', name: 'Outdoor Kitchen', category: 'exterior' },
        { id: 'playground', name: 'Playground', category: 'exterior' },
        { id: 'tennis_court', name: 'Tennis Court', category: 'exterior' },
        { id: 'basketball_court', name: 'Basketball Court', category: 'exterior' }
      ],

      // Community Amenities
      community: [
        { id: 'clubhouse', name: 'Clubhouse', category: 'community' },
        { id: 'community_pool', name: 'Community Pool', category: 'community' },
        { id: 'community_gym', name: 'Community Gym', category: 'community' },
        { id: 'playground', name: 'Children\'s Playground', category: 'community' },
        { id: 'sports_facilities', name: 'Sports Facilities', category: 'community' },
        { id: 'shopping_center', name: 'Shopping Center', category: 'community' },
        { id: 'school', name: 'Nearby School', category: 'community' },
        { id: 'hospital', name: 'Nearby Hospital', category: 'community' },
        { id: 'church', name: 'Nearby Church/Mosque', category: 'community' },
        { id: 'market', name: 'Nearby Market', category: 'community' }
      ]
    }

    // Parse query parameters
    const url = new URL(request.url)
    const category = url.searchParams.get('category') // Filter by category
    const search = url.searchParams.get('search') // Search amenities

    let filteredAmenities: Record<string, any[]> = amenities

    // Filter by category if specified
    if (category && category in amenities) {
      filteredAmenities = { [category]: amenities[category as keyof typeof amenities] }
    }

    // Search functionality
    if (search) {
      const searchLower = search.toLowerCase()
      const searchResults: Record<string, any[]> = {}

      Object.entries(amenities).forEach(([cat, items]) => {
        const matchingItems = items.filter((item: any) =>
          item.name.toLowerCase().includes(searchLower) ||
          item.id.toLowerCase().includes(searchLower)
        )
        if (matchingItems.length > 0) {
          searchResults[cat] = matchingItems
        }
      })

      filteredAmenities = searchResults
    }

    // Flatten for response if no category filter
    const response = category || search ? filteredAmenities : {
      ...amenities,
      all: Object.values(amenities).flat()
    }

    return NextResponse.json({
      data: response,
      meta: {
        total_categories: Object.keys(amenities).length,
        filtered_categories: Object.keys(filteredAmenities).length,
        search_term: search,
        category_filter: category
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

