import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

// GET /api/agents/[id] - Get agent details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    const agentId = id;

    // Get agent — joined through agents table (profile_id)
    const agentRow = await prisma.agents.findFirst({
      where: { profile_id: agentId },
      include: {
        profiles: {
          select: { id: true, full_name: true, email: true, phone: true, avatar_url: true, created_at: true },
        },
      },
    });

    if (!agentRow) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    // Only return verified agents publicly
    if (!agentRow.verified) {
      return NextResponse.json(
        { error: "Agent profile not available" },
        { status: 404 },
      );
    }

    // Get agent's properties (live only)
    const properties = await prisma.properties.findMany({
      where: { agent_id: agentRow.id, status: "live" },
      select: {
        id: true,
        title: true,
        price: true,
        price_frequency: true,
        state: true,
        bedrooms: true,
        bathrooms: true,
        square_feet: true,
        status: true,
        created_at: true,
        property_media: {
          select: { media_url: true, is_featured: true },
          take: 1,
          orderBy: { display_order: "asc" },
        },
      },
      orderBy: { created_at: "desc" },
      take: 6,
    });

    // Get agent reviews
    const reviews = await prisma.reviews.findMany({
      where: { target_type: "agent", properties: { agent_id: agentRow.id } },
      select: {
        id: true,
        rating: true,
        comment: true,
        created_at: true,
        profiles: { select: { id: true, full_name: true, avatar_url: true } },
      },
      orderBy: { created_at: "desc" },
      take: 5,
    });

    // Calculate review statistics
    let reviewStats = {
      average_rating: agentRow.rating ? Number(agentRow.rating) : 0,
      total_reviews: 0,
      rating_distribution: {} as Record<string, number>,
    };

    if (reviews && reviews.length > 0) {
      // Recalculate from actual reviews
      const totalRating = reviews.reduce(
        (sum: number, review: any) => sum + review.rating,
        0,
      );
      reviewStats.average_rating =
        Math.round((totalRating / reviews.length) * 10) / 10;
      reviewStats.total_reviews = reviews.length;

      // Rating distribution
      reviewStats.rating_distribution = {
        5: reviews.filter((r: any) => r.rating === 5).length,
        4: reviews.filter((r: any) => r.rating === 4).length,
        3: reviews.filter((r: any) => r.rating === 3).length,
        2: reviews.filter((r: any) => r.rating === 2).length,
        1: reviews.filter((r: any) => r.rating === 1).length,
      };
    }

    // Format response
    const agentProfile = {
      id: agentRow.profiles.id,
      name: agentRow.profiles.full_name,
      email: agentRow.profiles.email,
      phone: agentRow.profiles.phone,
      avatar_url: agentRow.profiles.avatar_url,
      verified: agentRow.verified,
      verified_at: agentRow.verification_date,
      member_since: agentRow.profiles.created_at,
      about: agentRow.bio,
      specialties: agentRow.specialization || [],
      experience_years: agentRow.years_experience,
      languages: [],
      service_areas: [],
      properties_count: agentRow.total_listings || 0,
      response_time_hours: null,
      company: agentRow.agency_name,
      license_number: agentRow.license_number,
      website: null,
      social_links: null,
      reviews: reviewStats,
      recent_reviews: reviews || [],
      recent_properties: properties || [],
    };

    return NextResponse.json({ data: agentProfile });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
