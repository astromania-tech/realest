import { createClient, getAuthUser } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import type { OpenApiMetadata } from "@/lib/openapi/route-metadata";

const respondSchema = z.object({
  response_message: z
    .string()
    .min(10, "Response must be at least 10 characters")
    .max(2000, "Response must be less than 2000 characters"),
  contact_phone: z
    .string()
    .regex(/^\+234[0-9]{10}$/, "Invalid Nigerian phone number")
    .optional(),
  contact_email: z.string().email("Invalid email address").optional(),
  schedule_viewing: z.boolean().optional(),
  viewing_date: z.string().optional(), // ISO date string
  viewing_time: z.string().optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export const openApiPOST: OpenApiMetadata = {
  method: 'post',
  summary: 'Respond to owner inquiry',
  description: 'Send a response to an inquiry and mark it as responded.',
  tags: ['Dashboard'],
  security: [{ bearerAuth: [] }],
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Inquiry ID' }],
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['response_message'],
          properties: {
            response_message: { type: 'string' },
            contact_phone: { type: 'string' },
            contact_email: { type: 'string', format: 'email' },
            schedule_viewing: { type: 'boolean' },
            viewing_date: { type: 'string' },
            viewing_time: { type: 'string' },
          },
        },
      },
    },
  },
  responses: {
    '200': { description: 'Response sent successfully' },
    '400': { description: 'Invalid response data' },
    '401': { description: 'Unauthorized' },
    '403': { description: 'Access denied - Only property owners can respond to inquiries' },
    '404': { description: 'Inquiry not found' },
  },
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    const inquiryId = id;

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await getAuthUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = respondSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid response data",
          details: validationResult.error.issues,
        },
        { status: 400 },
      );
    }

    const responseData = validationResult.data;

    // Verify inquiry exists and user is the property owner
    const inquiry = await prisma.inquiries.findUnique({
      where: { id: inquiryId },
      include: {
        profiles_inquiries_sender_idToprofiles: { select: { full_name: true, email: true } },
        properties: { select: { title: true, address: true, owner_id: true } },
      },
    });

    if (!inquiry) {
      return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
    }

    // Verify user is the property owner
    if (inquiry.properties?.owner_id !== user.id) {
      return NextResponse.json(
        {
          error: "Access denied - Only property owners can respond to inquiries",
        },
        { status: 403 },
      );
    }

    // Update inquiry status (no responded_at field in schema)
    const updatedInquiry = await prisma.inquiries.update({
      where: { id: inquiryId },
      data: { status: "responded", updated_at: new Date() },
    });

    // Create response record (assuming there's a responses table, or store in inquiry)
    // For now, we'll store the response in the inquiry message or create a separate response
    // This would typically be a separate table for threaded conversations

    // Send email notification to inquirer
    const ownerProfile = await prisma.profiles.findUnique({
      where: { id: user.id },
      select: { full_name: true, email: true },
    });

    const emailData = {
      to: inquiry.profiles_inquiries_sender_idToprofiles?.email,
      subject: `Response to your inquiry about ${inquiry.properties?.title}`,
      template: "inquiry-response",
      data: {
        inquirer_name: inquiry.profiles_inquiries_sender_idToprofiles?.full_name,
        owner_name: ownerProfile?.full_name || "Property Owner",
        property_title: inquiry.properties?.title,
        property_address: inquiry.properties?.address,
        response_message: responseData.response_message,
        contact_phone: responseData.contact_phone,
        contact_email: responseData.contact_email,
        schedule_viewing: responseData.schedule_viewing,
        viewing_date: responseData.viewing_date,
        viewing_time: responseData.viewing_time,
      },
    };

    // Trigger email sending (would typically be done via Edge Function or queue)
    console.log("Sending response email:", emailData);

    // In a real implementation, you'd call an email service here
    // await sendEmail(emailData)

    return NextResponse.json({
      data: updatedInquiry,
      message: "Response sent successfully",
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
