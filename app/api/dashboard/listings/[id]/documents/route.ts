import { createClient, getAuthUser } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { generateSignedUrl } from "@/lib/utils/upload-utils";
import { z } from "zod";
import type { OpenApiMetadata } from "@/lib/openapi/route-metadata";

const propertyIdSchema = z.string().uuid("Invalid property ID");

interface RouteParams {
  params: Promise<{ id: string }>;
}

export const openApiGET: OpenApiMetadata = {
  method: 'get',
  summary: 'List dashboard property documents',
  description: 'Retrieve all legal documents associated with a property.',
  tags: ['Dashboard'],
  security: [{ bearerAuth: [] }],
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Property ID' }],
  responses: {
    '200': { description: 'Document list retrieved successfully' },
    '401': { description: 'Unauthorized' },
    '403': { description: 'Forbidden' },
    '404': { description: 'Property not found or access denied' },
  },
}

export const openApiPOST: OpenApiMetadata = {
  method: 'post',
  summary: 'Upload dashboard property document',
  description: 'Upload a legal or compliance document for a property.',
  tags: ['Dashboard'],
  security: [{ bearerAuth: [] }],
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Property ID' }],
  requestBody: {
    required: true,
    content: {
      'multipart/form-data': {
        schema: {
          type: 'object',
          required: ['file', 'document_type'],
          properties: {
            file: { type: 'string', format: 'binary' },
            document_type: { type: 'string' },
          },
        },
      },
    },
  },
  responses: {
    '201': { description: 'Document uploaded successfully' },
    '400': { description: 'Invalid file or document type' },
    '401': { description: 'Unauthorized' },
    '403': { description: 'Forbidden' },
    '404': { description: 'Property not found or access denied' },
  },
}

export async function GET(request: Request, { params }: RouteParams) {
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

    const userRow = await prisma.users.findUnique({
      where: { id: user.id },
      select: { role: true },
    });
    if (!userRow || !["owner", "agent", "admin"].includes(userRow.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (userRow.role !== "admin") {
      const accessFilter = userRow.role === "agent"
        ? { id: propertyId, agent: { profile_id: user.id } }
        : { id: propertyId, owners: { profile_id: user.id } };

      const property = await prisma.properties.findFirst({
        where: accessFilter,
        select: { id: true },
      });
      if (!property) {
        return NextResponse.json(
          { error: "Property not found or access denied" },
          { status: 404 },
        );
      }
    }

    const documents = await prisma.property_documents.findMany({
      where: { property_id: propertyId },
      orderBy: { created_at: "asc" },
    });

    return NextResponse.json({ data: documents });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
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

    const userRow = await prisma.users.findUnique({
      where: { id: user.id },
      select: { role: true },
    });
    if (!userRow || !["owner", "agent", "admin"].includes(userRow.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (userRow.role !== "admin") {
      const accessFilter = userRow.role === "agent"
        ? { id: propertyId, agent: { profile_id: user.id } }
        : { id: propertyId, owners: { profile_id: user.id } };

      const property = await prisma.properties.findFirst({
        where: accessFilter,
        select: { id: true },
      });
      if (!property) {
        return NextResponse.json(
          { error: "Property not found or access denied" },
          { status: 404 },
        );
      }
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const documentType = formData.get("document_type") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only PDF, JPEG, PNG are allowed for documents." },
        { status: 400 },
      );
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${maxSize / (1024 * 1024)}MB.` },
        { status: 400 },
      );
    }

    const signedUrlResult = await generateSignedUrl({
      bucket: "property-documents",
      file_name: file.name,
      file_type: file.type,
      file_size: file.size,
      user_id: user.id,
      property_id: propertyId,
    });

    const uploadResponse = await fetch(signedUrlResult.signed_url, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": file.type },
    });

    if (!uploadResponse.ok) {
      console.error("Upload to signed URL failed:", uploadResponse.statusText);
      return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
    }

    const publicUrl = signedUrlResult.public_url;

    const serviceSupabase = createServiceClient();
    const { data: documentRecord, error: insertError } = await serviceSupabase
      .from("property_documents")
      .insert({
        property_id: propertyId,
        document_type: documentType,
        document_url: publicUrl,
        file_name: file.name,
        file_size: file.size,
        verification_status: "pending", // Documents start as pending verification
      })
      .select()
      .maybeSingle();

    if (insertError) {
      console.error("Failed to insert document record via service client:", insertError);
      return NextResponse.json({ error: "Failed to save document record" }, { status: 500 });
    }

    return NextResponse.json(
      { data: documentRecord, message: "Document uploaded successfully and submitted for verification" },
      { status: 201 },
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}