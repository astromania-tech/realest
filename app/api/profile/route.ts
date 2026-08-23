// realest/app/api/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient, getAuthUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import type { OpenApiMetadata } from "@/lib/openapi/route-metadata";

const updateProfileSchema = z.object({
  full_name: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .optional(),
  phone: z
    .string()
    .regex(/^\+234[0-9]{10}$/, "Invalid Nigerian phone number")
    .optional(),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
});

/**
 * OpenAPI metadata for GET /api/profile
 * Documented endpoint: Get current user profile
 */
export const openApiGET: OpenApiMetadata = {
  method: 'get',
  summary: 'Get user profile',
  description: 'Retrieve the authenticated user\'s profile information.',
  tags: ['Profile', 'User'],
  security: [{ bearerAuth: [] }],
  responses: {
    '200': {
      description: 'User profile',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              profile: { $ref: '#/components/schemas/Profile' },
            },
          },
        },
      },
    },
    '401': {
      description: 'Unauthorized',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/Error' },
        },
      },
    },
    '404': {
      description: 'Profile not found',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/Error' },
        },
      },
    },
    '500': {
      description: 'Server error',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/Error' },
        },
      },
    },
  },
}

// GET /api/profile - Get current user profile
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await getAuthUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user profile
    const profile = await prisma.profiles.findUnique({
      where: { id: user.id },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Profile API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * OpenAPI metadata for PUT /api/profile
 * Documented endpoint: Update user profile
 */
export const openApiPUT: OpenApiMetadata = {
  method: 'put',
  summary: 'Update user profile',
  description: 'Update the authenticated user\'s profile information.',
  tags: ['Profile', 'User'],
  security: [{ bearerAuth: [] }],
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            full_name: {
              type: 'string',
              minLength: 2,
              description: 'User full name',
            },
            phone: {
              type: 'string',
              pattern: '^\\+234[0-9]{10}$',
              description: 'Nigerian phone number in +234... format',
            },
            bio: {
              type: 'string',
              maxLength: 500,
              description: 'User bio/description',
            },
          },
          'x-source': '@/lib/validations/profile.ts → updateProfileSchema',
        },
      },
    },
  },
  responses: {
    '200': {
      description: 'Profile updated successfully',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              profile: { $ref: '#/components/schemas/Profile' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    '400': {
      description: 'Invalid profile data',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/Error' },
        },
      },
    },
    '401': {
      description: 'Unauthorized',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/Error' },
        },
      },
    },
    '500': {
      description: 'Server error',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/Error' },
        },
      },
    },
  },
}

// PUT /api/profile - Update current user profile
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await getAuthUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updateProfileSchema.parse(body);

    const updatedProfile = await prisma.profiles.update({
      where: { id: user.id },
      data: {
        ...validatedData,
        updated_at: new Date(),
      },
    });

    return NextResponse.json({
      profile: updatedProfile,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Profile update API error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid profile data", details: error.errors },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
