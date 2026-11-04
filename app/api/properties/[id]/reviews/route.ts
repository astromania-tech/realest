import { NextRequest, NextResponse } from "next/server";
import { createClient, getAuthUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import type { OpenApiMetadata } from "@/lib/openapi/route-metadata";

const propertyIdSchema = z.string().uuid("Invalid property ID");

// Schema for creating a review
const createReviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(10).max(1000),
  target_type: z.enum(["owner", "agent"]).default("owner"), // Review target
});

type CreateReviewInput = z.infer<typeof createReviewSchema>;

/**
 * OpenAPI metadata for GET /api/properties/{id}/reviews
 * Retrieves user reviews for a property
 */
export const openApiGET: OpenApiMetadata = {
  method: "get",
  summary: "Get property reviews",
  description: "Retrieve all reviews and ratings for a property. Only shows reviews for published properties. Includes pagination and rating statistics.",
  tags: ["Properties"],
  parameters: [
    {
      name: "id",
      in: "path",
      required: true,
      schema: { type: "string", format: "uuid" },
      description: "Property ID",
    },
    {
      name: "page",
      in: "query",
      schema: { type: "integer", minimum: 1, default: 1 },
      description: "Page number",
    },
    {
      name: "per_page",
      in: "query",
      schema: { type: "integer", minimum: 1, maximum: 50, default: 10 },
      description: "Reviews per page",
    },
  ],
  responses: {
    "200": {
      description: "Reviews list with pagination and stats",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              data: { type: "array", items: { type: "object" } },
              pagination: { type: "object" },
              stats: { type: "object", properties: { average_rating: { type: "number" }, total_reviews: { type: "integer" } } },
            },
          },
        },
      },
    },
    "404": { description: "Property not found" },
  },
};

/**
 * OpenAPI metadata for POST /api/properties/{id}/reviews
 * Create a review for a property
 */
export const openApiPOST: OpenApiMetadata = {
  method: "post",
  summary: "Create property review",
  description: "Submit a review and rating for a property. Can review the owner or agent. Requires authentication.",
  tags: ["Properties"],
  security: [{ bearerAuth: [] }],
  parameters: [
    {
      name: "id",
      in: "path",
      required: true,
      schema: { type: "string", format: "uuid" },
      description: "Property ID",
    },
  ],
  requestBody: {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          required: ["rating", "comment"],
          properties: {
            rating: { type: "integer", minimum: 1, maximum: 5, description: "Rating from 1 to 5" },
            comment: { type: "string", minLength: 10, maxLength: 1000, description: "Review comment" },
            target_type: { type: "string", enum: ["owner", "agent"], description: "Who the review is for" },
          },
        },
      },
    },
  },
  responses: {
    "201": {
      description: "Review created successfully",
      content: { "application/json": { schema: { type: "object" } } },
    },
    "400": { description: "Invalid request (comment too short or rating out of range)" },
    "401": { description: "Unauthorized" },
    "404": { description: "Property not found" },
  },
};

// GET /api/properties/[id]/reviews - Get reviews for a property
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const propertyIdResult = propertyIdSchema.safeParse(id);
    if (!propertyIdResult.success) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }
    const propertyId = propertyIdResult.data;

    // Parse query parameters
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const perPage = Math.min(
      parseInt(url.searchParams.get("per_page") || "10"),
      50,
    );

    // Verify property exists and is live
    const property = await prisma.properties.findUnique({
      where: { id: propertyId },
      select: { id: true, owner_id: true, status: true },
    });

    if (!property || property.status !== "live") {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 },
      );
    }

    const where = { property_id: propertyId };

    const [reviews, total] = await Promise.all([
      prisma.reviews.findMany({
        where,
        select: {
          id: true,
          rating: true,
          comment: true,
          target_type: true,
          created_at: true,
          profiles: {
            select: {
              id: true,
              full_name: true,
              avatar_url: true,
            },
          },
        },
        orderBy: { created_at: "desc" },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      prisma.reviews.count({ where }),
    ]);

    // Calculate average rating
    const ratingAgg = await prisma.reviews.aggregate({
      where,
      _avg: { rating: true },
    });
    const averageRating = ratingAgg._avg.rating ?? 0;

    const totalPages = Math.ceil(total / perPage);

    return NextResponse.json({
      data: reviews,
      pagination: {
        page,
        per_page: perPage,
        total,
        total_pages: totalPages,
        has_next: page < totalPages,
        has_prev: page > 1,
      },
      stats: {
        average_rating: Math.round(averageRating * 10) / 10,
        total_reviews: total,
      },
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/properties/[id]/reviews - Create a review for a property
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    const propertyIdResult = propertyIdSchema.safeParse(id);
    if (!propertyIdResult.success) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }
    const propertyId = propertyIdResult.data;

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await getAuthUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = createReviewSchema.parse(body);

    // Verify property exists and is live
    const property = await prisma.properties.findUnique({
      where: { id: propertyId },
      select: { id: true, owner_id: true, status: true },
    });

    if (!property || property.status !== "live") {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 },
      );
    }

    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 },
      );
    }

    // Check if user has already reviewed this property
    const existingReview = await prisma.reviews.findFirst({
      where: { reviewer_id: user.id, property_id: propertyId },
      select: { id: true },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: "You have already reviewed this property" },
        { status: 409 },
      );
    }

    // Check if user has interacted with this property (inquiry or saved)
    const [hasInteraction, hasSaved] = await Promise.all([
      prisma.inquiries.findFirst({
        where: { sender_id: user.id, property_id: propertyId },
        select: { id: true },
      }),
      prisma.saved_properties.findFirst({
        where: { user_id: user.id, property_id: propertyId },
        select: { id: true },
      }),
    ]);

    if (!hasInteraction && !hasSaved) {
      return NextResponse.json(
        {
          error:
            "You must have interacted with this property (inquiry or saved) to leave a review",
        },
        { status: 403 },
      );
    }

    // Create the review
    const review = await prisma.reviews.create({
      data: {
        reviewer_id: user.id,
        property_id: propertyId,
        target_type: validatedData.target_type,
        rating: validatedData.rating,
        comment: validatedData.comment,
      },
      select: {
        id: true,
        rating: true,
        comment: true,
        target_type: true,
        created_at: true,
        profiles: {
          select: {
            id: true,
            full_name: true,
            avatar_url: true,
          },
        },
      },
    });

    return NextResponse.json(
      { data: review, message: "Review created successfully" },
      { status: 201 },
    );
  } catch (error) {
    console.error("API error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
