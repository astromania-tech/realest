/**
 * POST /api/inquiries/guest
 *
 * Saves the inquiry first. Email is a later notification. A missing or failed
 * send still leaves the row in place and does not claim the message was sent.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { sendInquiryEmail } from "@/lib/emailService";
import { clientAddress, consumeRateLimit } from "@/lib/http/rate-limit";
import { guestInquiryHttpResult } from "@/lib/inquiries/guest-inquiry";
import { publicListingWhere } from "@/lib/listings/public-listing";

const guestInquirySchema = z.object({
  property_id: z.string().uuid("Invalid property ID"),
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  phone: z.string().max(20).optional(),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000),
});

export async function POST(request: NextRequest) {
  try {
    const limited = await consumeRateLimit({
      bucket: "guest-inquiry",
      subject: clientAddress(request.headers),
    });
    if (!limited.allowed) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const body = await request.json();
    const data = guestInquirySchema.parse(body);

    const property = await prisma.properties.findFirst({
      where: { id: data.property_id, ...publicListingWhere },
      select: {
        id: true,
        title: true,
        address: true,
        listing_type: true,
        listing_source: true,
        owners: {
          select: {
            profile_id: true,
            profiles: { select: { full_name: true, email: true } },
          },
        },
        agents: {
          select: {
            profile_id: true,
            profiles: { select: { full_name: true, email: true } },
          },
        },
      },
    });

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    const isAgentListing = property.listing_source === "agent";
    const recipient = isAgentListing ? property.agents : property.owners;
    const recipientProfileId = recipient?.profile_id ?? null;
    if (!recipientProfileId) {
      return NextResponse.json({ error: "This listing has no recipient." }, { status: 422 });
    }

    const inserted = await prisma.$queryRaw<Array<{ id: string }>>`
      insert into public.inquiries (
        property_id, sender_id, owner_id, message, status, guest_name, guest_email, guest_phone
      )
      values (
        ${property.id}::uuid,
        null,
        ${recipientProfileId}::uuid,
        ${data.message},
        'new',
        ${data.name},
        ${data.email},
        ${data.phone ?? null}
      )
      returning id
    `;
    if (!inserted[0]?.id) {
      const lost = guestInquiryHttpResult({ saved: false, notified: false });
      return NextResponse.json(lost.body, { status: lost.status });
    }

    let notified = false;
    const contactEmail = recipient?.profiles?.email;
    if (contactEmail && process.env.RESEND_API_KEY) {
      const result = await sendInquiryEmail({
        recipientName: recipient?.profiles?.full_name ?? "Property Owner",
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
      notified = result.success;
      if (!result.success) {
        console.error("[Guest Inquiry] Email delivery failed:", result.error);
      }
    }

    const response = guestInquiryHttpResult({ saved: true, notified });
    return NextResponse.json(response.body, { status: response.status });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data", details: error.errors }, { status: 400 });
    }
    console.error("Guest inquiry error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
