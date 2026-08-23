// realest/app/api/properties/[id]/documents/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient, getAuthUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { propertyDocumentSchema } from "@/lib/validations/property";
import type { OpenApiMetadata } from "@/lib/openapi/route-metadata";

const propertyIdSchema = z.string().uuid("Invalid property ID");

/**
 * OpenAPI metadata for GET /api/properties/{id}/documents
 * Retrieves property verification documents
 */
export const openApiGET: OpenApiMetadata = {
  method: "get",
  summary: "Get property documents",
  description: "Retrieve all property documents (title deeds, permits, etc). Only accessible to property owner or admin.",
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
  responses: {
    "200": {
      description: "Documents list retrieved successfully",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              documents: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    property_id: { type: "string", format: "uuid" },
                    document_type: { type: "string" },
                    document_url: { type: "string", format: "url" },
                    file_name: { type: "string" },
                    verification_status: { type: "string", enum: ["pending", "approved", "rejected"] },
                    created_at: { type: "string", format: "date-time" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "401": { description: "Unauthorized" },
    "403": { description: "Access denied" },
    "404": { description: "Property not found" },
  },
};

/**
 * OpenAPI metadata for POST /api/properties/{id}/documents
 * Upload verification documents for a property
 */
export const openApiPOST: OpenApiMetadata = {
  method: "post",
  summary: "Upload property document",
  description: "Upload property verification documents (title deeds, permits, etc). Only owner can upload. Triggers ML validation service.",
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
          required: ["document_type", "document_url", "file_name"],
          properties: {
            document_type: { type: "string", description: "Type of document (title_deed, permit, etc)" },
            document_url: { type: "string", format: "url", description: "URL to document file" },
            file_name: { type: "string", description: "Original file name" },
          },
        },
      },
    },
  },
  responses: {
    "201": {
      description: "Document uploaded and submitted for verification",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              document: { type: "object" },
              message: { type: "string" },
            },
          },
        },
      },
    },
    "400": { description: "Invalid request or property is published" },
    "401": { description: "Unauthorized" },
    "404": { description: "Property not found or access denied" },
  },
};

// GET /api/properties/[id]/documents - Get property documents
export async function GET(
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

    // Auth
    const { data: { user } } = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check property exists and access
    const property = await prisma.properties.findUnique({
      where: { id: propertyId },
      select: { owner_id: true, status: true },
    });

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    const ownerRecord = await prisma.owners.findUnique({ where: { profile_id: user.id }, select: { id: true } });
    const isOwner = ownerRecord !== null && property.owner_id === ownerRecord.id;
    const userRow = await prisma.users.findUnique({ where: { id: user.id }, select: { role: true } });
    const isAdmin = userRow?.role === "admin";

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const documents = await prisma.property_documents.findMany({
      where: { property_id: propertyId },
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json({ documents });
  } catch (error) {
    console.error("Documents API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/properties/[id]/documents - Upload document for property
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    const propertyIdResult = propertyIdSchema.safeParse(id);
    if (!propertyIdResult.success) {
      return NextResponse.json({ error: "Property not found or access denied" }, { status: 404 });
    }
    const propertyId = propertyIdResult.data;

    const { data: { user }, error: authError } = await getAuthUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const property = await prisma.properties.findUnique({
      where: { id: propertyId },
      select: { owner_id: true, status: true },
    });

    const ownerRecordPost = await prisma.owners.findUnique({ where: { profile_id: user.id }, select: { id: true } });
    if (!property || !ownerRecordPost || property.owner_id !== ownerRecordPost.id) {
      return NextResponse.json({ error: "Property not found or access denied" }, { status: 404 });
    }

    if (property.status === "live") {
      return NextResponse.json({ error: "Cannot upload documents to live properties" }, { status: 400 });
    }

    const body = await request.json();
    const validatedData = propertyDocumentSchema.parse(body);

    const document = await prisma.property_documents.create({
      data: {
        property_id: propertyId,
        document_type: validatedData.document_type,
        document_url: validatedData.document_url,
        file_name: validatedData.file_name,
        verification_status: "pending",
      },
    });

    // TODO: Trigger ML validation service here

    return NextResponse.json(
      { document, message: "Document uploaded successfully. Validation in progress." },
      { status: 201 },
    );
  } catch (error) {
    console.error("Document upload API error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid document data", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
