// realest/app/api/upload/signed-url/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient, getAuthUser } from "@/lib/supabase/server";
import { z } from "zod";
import { generateSignedUrl, signedUrlSchema } from "@/lib/utils/upload-utils";
import type { OpenApiMetadata } from "@/lib/openapi/route-metadata";

export const openApiPOST: OpenApiMetadata = {
  method: 'post',
  summary: 'Generate signed upload URL',
  description: 'Create a signed URL for direct file upload to storage.',
  tags: ['Utility'],
  security: [{ bearerAuth: [] }],
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: { type: 'object' },
      },
    },
  },
  responses: {
    '200': { description: 'Signed URL generated' },
    '400': { description: 'Invalid file data' },
    '401': { description: 'Unauthorized' },
  },
}

// POST /api/upload/signed-url - Generate signed URL for direct upload
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

    const body = await request.json();
    const validatedData = signedUrlSchema.parse({
      ...body,
      user_id: user.id,
    });

    const result = await generateSignedUrl(validatedData);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Signed URL API error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid file data", details: error.errors },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
