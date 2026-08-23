/**
 * POST /api/inquiries/guest
 *
 * Unauthenticated inquiry submission used by the public property/listing detail pages.
 * Because the `inquiries` table requires a non-nullable `sender_id`, guests cannot be
 * stored as a DB row without a schema migration. Instead we send an email notification
 * directly to the property owner or agent via Resend.
 *
 * Upgrade path: once `inquiries` supports nullable sender_id + contact fields, replace
 * the email logic here with a prisma.inquiries.create() call and keep the email as a
 * notification side-effect.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { sendInquiryEmail } from "@/lib/emailService";

const guestInquirySchema = z.object({
  property_id: z.string().uuid("Invalid property ID"),
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  phone: z.string().max(20).optional(),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = guestInquirySchema.parse(body);

    // Resolve property and the right contact (agent or owner)
    const property = await prisma.properties.findFirst({
      where: { id: data.property_id, status: "live" },
      select: {
        id: true,
        title: true,
        address: true,
        listing_type: true,
        listing_source: true,
        owners: {
          include: {
            profiles: { select: { full_name: true, email: true } },
          },
        },
        agents: {
          select: {
            profiles: { select: { full_name: true, email: true } },
          },
        },
      },
    });

    if (!property) {
      return NextResponse.json(
        { error: "Property not found or no longer available" },
        { status: 404 },
      );
    }

    const isAgentListing = property.listing_source === "agent";
    const contactEmail = isAgentListing
      ? property.agents?.profiles?.email
      : property.owners?.profiles?.email;
    const contactName = isAgentListing
      ? property.agents?.profiles?.full_name
      : property.owners?.profiles?.full_name;

    // Send email if Resend is configured and we have a valid contact address
    if (contactEmail && process.env.RESEND_API_KEY) {
      const result = await sendInquiryEmail({
        recipientName: contactName ?? "Property Owner",
        recipientEmail: contactEmail,
        senderName: data.name,
        senderEmail: data.email,
        senderPhone: data.phone,
        propertyTitle: property.title ?? "Property",
        propertyAddress: property.address ?? "",
        propertyId: property.id,
        listingType: property.listing_type ?? "for_sale",
        message: data.message,
      });

      if (!result.success) {
        console.error("[Guest Inquiry] Email delivery failed:", result.error);
        if (result.quotaExceeded) {
          return NextResponse.json(
            { error: "Our email service is temporarily at capacity. Your inquiry was received — please try again in a few hours or contact the owner directly." },
            { status: 503 },
          );
        }
        return NextResponse.json(
          { error: "Failed to deliver inquiry email. Please try again.", detail: result.error },
          { status: 502 },
        );
      }

      console.log("[Guest Inquiry] Email sent to", contactEmail, "\u2014 Resend id:", result.messageId);
    } else if (!process.env.RESEND_API_KEY) {
      // Dev fallback: log the inquiry
      console.log("[Guest Inquiry] Email not sent (RESEND_API_KEY not set):", data);
    } else if (!contactEmail) {
      console.warn("[Guest Inquiry] No contact email found for property", data.property_id);
    }

    return NextResponse.json(
      { message: "Inquiry sent successfully" },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.errors },
        { status: 400 },
      );
    }
    console.error("Guest inquiry error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
