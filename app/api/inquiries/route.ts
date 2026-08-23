// realest/app/api/inquiries/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient, getAuthUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import type { OpenApiMetadata } from "@/lib/openapi/route-metadata";

const createInquirySchema = z.object({
  property_id: z.string().uuid(),
  message: z.string().min(10, "Message must be at least 10 characters"),
  contact_phone: z.string().optional(),
  contact_email: z.string().email().optional(),
});

const updateInquirySchema = z.object({
  status: z.enum(["pending", "responded", "closed"]).optional(),
});

/**
 * OpenAPI metadata for GET /api/inquiries
 * Documented endpoint: Get user's inquiries
 */
export const openApiGET: OpenApiMetadata = {
  method: 'get',
  summary: 'Get user inquiries',
  description: 'Get inquiries relevant to authenticated user. Users see inquiries they sent; owners see inquiries on their properties.',
  tags: ['Inquiries', 'User'],
  security: [{ bearerAuth: [] }],
  responses: {
    '200': {
      description: 'List of inquiries',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              inquiries: {
                type: 'array',
                items: { $ref: '#/components/schemas/Inquiry' },
              },
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
    '403': {
      description: 'Forbidden - invalid user type',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/Error' },
        },
      },
    },
    '404': {
      description: 'User not found',
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

// GET /api/inquiries - Get user's inquiries (user or owner)
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

    // Get user's role to determine query type
    const userRow = await prisma.users.findUnique({
      where: { id: user.id },
      select: { role: true },
    });

    if (!userRow) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let inquiries;

    if (userRow.role === "user") {
      // Users see inquiries they sent
      inquiries = await prisma.inquiries.findMany({
        where: { sender_id: user.id },
        include: {
          properties: {
            select: {
              id: true,
              title: true,
              address: true,
              price: true,
              property_media: {
                where: { is_featured: true },
                select: { media_url: true, is_featured: true },
                take: 1,
              },
            },
          },
          profiles_inquiries_sender_idToprofiles: {
            select: { full_name: true, avatar_url: true },
          },
        },
        orderBy: { created_at: "desc" },
      });
    } else if (userRow.role === "owner") {
      // Owners see inquiries on their properties
      inquiries = await prisma.inquiries.findMany({
        where: { owner_id: user.id },
        include: {
          properties: {
            select: {
              id: true,
              title: true,
              address: true,
              price: true,
              property_media: {
                where: { is_featured: true },
                select: { media_url: true, is_featured: true },
                take: 1,
              },
            },
          },
          profiles_inquiries_sender_idToprofiles: {
            select: { full_name: true, avatar_url: true, phone: true },
          },
        },
        orderBy: { created_at: "desc" },
      });
    } else {
      return NextResponse.json({ error: "Invalid user type" }, { status: 403 });
    }

    return NextResponse.json({ inquiries });
  } catch (error) {
    console.error("Inquiries API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * OpenAPI metadata for POST /api/inquiries
 * Documented endpoint: Create new inquiry
 */
export const openApiPOST: OpenApiMetadata = {
  method: 'post',
  summary: 'Create property inquiry',
  description: 'Send an inquiry about a property. Only users can send inquiries. Owner is automatically identified from property.',
  tags: ['Inquiries', 'User'],
  security: [{ bearerAuth: [] }],
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['property_id', 'message'],
          properties: {
            property_id: {
              type: 'string',
              format: 'uuid',
              description: 'Property to inquire about',
            },
            message: {
              type: 'string',
              minLength: 10,
              description: 'Inquiry message',
            },
            contact_phone: {
              type: 'string',
              description: 'Contact phone (optional)',
            },
            contact_email: {
              type: 'string',
              format: 'email',
              description: 'Contact email (optional)',
            },
          },
          'x-source': '@/lib/validations/inquiry.ts → createInquirySchema',
        },
      },
    },
  },
  responses: {
    '201': {
      description: 'Inquiry created successfully',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              inquiry: { $ref: '#/components/schemas/Inquiry' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    '400': {
      description: 'Invalid inquiry data',
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
    '403': {
      description: 'Forbidden - only users can send inquiries',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/Error' },
        },
      },
    },
    '404': {
      description: 'Property not found or not available',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/Error' },
        },
      },
    },
  },
}

// POST /api/inquiries - Create new inquiry
export async function POST(request: NextRequest) {
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

    // Check if user has the 'user' role (buyers send inquiries)
    const [userRow, senderProfile] = await Promise.all([
      prisma.users.findUnique({ where: { id: user.id }, select: { role: true } }),
      prisma.profiles.findUnique({
        where: { id: user.id },
        select: { phone: true, email: true },
      }),
    ]);

    if (!userRow || userRow.role !== "user") {
      return NextResponse.json(
        { error: "Only users can send inquiries" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const validatedData = createInquirySchema.parse(body);

    // Check if property exists and is live
    const property = await prisma.properties.findFirst({
      where: { id: validatedData.property_id, status: "live" },
      select: { id: true, owner_id: true, status: true, title: true },
    });

    if (!property) {
      return NextResponse.json(
        { error: "Property not found or not available" },
        { status: 404 },
      );
    }

    // Check if user already has a pending inquiry for this property
    const existingInquiry = await prisma.inquiries.findFirst({
      where: {
        property_id: validatedData.property_id,
        sender_id: user.id,
        status: "pending",
      },
      select: { id: true },
    });

    if (existingInquiry) {
      return NextResponse.json(
        { error: "You already have a pending inquiry for this property" },
        { status: 400 },
      );
    }

    // Create inquiry — owner_id comes from the property record
    const inquiry = await prisma.inquiries.create({
      data: {
        property_id: validatedData.property_id,
        sender_id: user.id,
        owner_id: property.owner_id!,
        message: validatedData.message,
        status: "pending",
      },
      include: {
        properties: { select: { title: true, owner_id: true } },
      },
    });

    // TODO: Send notification to property owner

    return NextResponse.json(
      {
        inquiry,
        message:
          "Inquiry sent successfully. The property owner will respond soon.",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Inquiry creation API error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid inquiry data", details: error.errors },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
