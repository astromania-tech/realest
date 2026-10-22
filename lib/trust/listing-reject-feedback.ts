import type { ListingRejectedEmailData, RejectionReason } from "@/emails";
import { sendListingRejectedEmail } from "@/lib/emailService";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/prisma/client";

export type ListingRejectReasonCode = RejectionReason;

export type ListingRejectRecipient = {
  profileId: string;
  email: string;
  fullName: string | null;
  role: "owner" | "agent";
};

export type ListingRejectFeedbackInput = {
  propertyId: string;
  propertyTitle: string;
  propertyAddress: string;
  city: string;
  state: string | null;
  reason: ListingRejectReasonCode;
  /** Full staff note. Stored in audit; scrubbed before owner/agent copy. */
  staffNotes?: string | null;
  recipients: ListingRejectRecipient[];
  siteOrigin?: string;
};

export type ListingRejectNotification = {
  userId: string;
  type: "listing_rejected";
  title: string;
  message: string;
  data: {
    href: string;
    property_id: string;
    rejection_reason: ListingRejectReasonCode;
    public_detail: string | null;
  };
};

export type ListingRejectFeedback = {
  notifications: ListingRejectNotification[];
  emails: ListingRejectedEmailData[];
  audit: {
    rejection_reason: ListingRejectReasonCode;
    public_detail: string | null;
    staff_notes: string | null;
    recipient_profile_ids: string[];
  };
};

const INTERNAL_TOKEN =
  /\b(duplicate_pin|duplicate_address|duplicate_photo|hardBlocks?|hard_blocks?|exif_[a-z0-9_]+|photo_hash|trust_reader|matchedPropertyIds?|confidence_score)\b/gi;

const REASON_TITLE: Record<ListingRejectReasonCode, string> = {
  duplicate_listing: "Listing rejected as a duplicate",
  documents_failed_vetting: "Listing rejected — documents failed vetting",
  property_not_found: "Listing rejected — property not found",
  ownership_dispute: "Listing rejected — ownership dispute",
  fraudulent_documents: "Listing rejected — document fraud",
  other: "Listing could not be approved",
};

function formatAddress(address: string, city: string, state: string | null): string {
  return [address, city, state].filter((part) => Boolean(part?.trim())).join(", ");
}

export function listingRejectSiteOrigin(env?: {
  NEXT_PUBLIC_SITE_URL?: string;
  NEXT_PUBLIC_APP_URL?: string;
}): string {
  const source = env ?? {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  };
  const raw = source.NEXT_PUBLIC_SITE_URL ?? source.NEXT_PUBLIC_APP_URL ?? "http://127.0.0.1:3000";
  return raw.replace(/\/$/, "");
}

/** Strip detector names / internal codes from staff notes before owner-facing copy. */
export function publicRejectionDetail(notes: string | undefined | null, max = 240): string | null {
  if (!notes?.trim()) return null;
  const cleaned = notes
    .replace(INTERNAL_TOKEN, "[redacted]")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) return null;
  return cleaned.length > max ? `${cleaned.slice(0, max - 1)}…` : cleaned;
}

export function mapVettingRejectionReason(
  reason: string | undefined | null,
): ListingRejectReasonCode {
  switch (reason) {
    case "property_not_found":
      return "property_not_found";
    case "documents_fraudulent":
      return "fraudulent_documents";
    case "location_inaccurate":
      return "property_not_found";
    default:
      return "other";
  }
}

export function dashboardPathForRecipient(role: "owner" | "agent"): string {
  return role === "agent" ? "/agent/properties" : "/owner/listings";
}

type ProfileRow = { id: string; email: string; full_name: string | null };

/** Owner and agent profiles tied to the listing (deduped). */
export function resolveListingRejectRecipients(input: {
  owners?: { profiles: ProfileRow | null } | null;
  agents?: { profiles: ProfileRow | null } | null;
}): ListingRejectRecipient[] {
  const out: ListingRejectRecipient[] = [];
  const seen = new Set<string>();
  const push = (role: "owner" | "agent", profile: ProfileRow | null | undefined) => {
    if (!profile?.email?.trim() || seen.has(profile.id)) return;
    seen.add(profile.id);
    out.push({
      profileId: profile.id,
      email: profile.email.trim(),
      fullName: profile.full_name,
      role,
    });
  };
  push("owner", input.owners?.profiles);
  push("agent", input.agents?.profiles);
  return out;
}

export const listingRejectRecipientSelect = {
  owners: {
    select: {
      profiles: { select: { id: true, email: true, full_name: true } },
    },
  },
  agents: {
    select: {
      profiles: { select: { id: true, email: true, full_name: true } },
    },
  },
} as const;

/** Pure payloads: in-app + email for each recipient; audit keeps full staff notes. */
export function buildListingRejectFeedback(input: ListingRejectFeedbackInput): ListingRejectFeedback {
  const staffNotes = input.staffNotes?.trim() || null;
  const publicDetail = publicRejectionDetail(staffNotes);
  const fullAddress = formatAddress(input.propertyAddress, input.city, input.state);
  const origin = (input.siteOrigin ?? listingRejectSiteOrigin()).replace(/\/$/, "");
  const title = REASON_TITLE[input.reason];

  const notifications: ListingRejectNotification[] = [];
  const emails: ListingRejectedEmailData[] = [];

  for (const recipient of input.recipients) {
    const href = dashboardPathForRecipient(recipient.role);
    const name = recipient.fullName?.trim() || "there";
    const detailLine = publicDetail
      ? ` ${publicDetail}`
      : " Check your dashboard for next steps.";

    notifications.push({
      userId: recipient.profileId,
      type: "listing_rejected",
      title,
      message: `Your listing "${input.propertyTitle}" was not approved.${detailLine}`,
      data: {
        href,
        property_id: input.propertyId,
        rejection_reason: input.reason,
        public_detail: publicDetail,
      },
    });

    emails.push({
      ownerName: name,
      ownerEmail: recipient.email,
      propertyTitle: input.propertyTitle,
      propertyAddress: fullAddress,
      propertyId: input.propertyId,
      rejectionReason: input.reason,
      rejectionDetail: publicDetail ?? undefined,
      dashboardUrl: `${origin}${href}`,
      appealUrl: `${origin}${href}`,
    });
  }

  return {
    notifications,
    emails,
    audit: {
      rejection_reason: input.reason,
      public_detail: publicDetail,
      staff_notes: staffNotes,
      recipient_profile_ids: input.recipients.map((r) => r.profileId),
    },
  };
}

/** Persist in-app notices and send emails. Email failure does not throw. */
export async function deliverListingRejectFeedback(
  feedback: ListingRejectFeedback,
): Promise<{ notified: number; emailsSent: number; emailErrors: string[] }> {
  if (feedback.notifications.length > 0) {
    await prisma.notifications.createMany({
      data: feedback.notifications.map((item) => ({
        user_id: item.userId,
        type: item.type,
        title: item.title,
        message: item.message,
        data: item.data as Prisma.InputJsonValue,
      })),
    });
  }

  let emailsSent = 0;
  const emailErrors: string[] = [];
  for (const email of feedback.emails) {
    const result = await sendListingRejectedEmail(email);
    if (result.success) emailsSent += 1;
    else if (result.error) emailErrors.push(result.error);
  }

  return {
    notified: feedback.notifications.length,
    emailsSent,
    emailErrors,
  };
}
