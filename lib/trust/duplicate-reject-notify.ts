/**
 * @deprecated Prefer buildListingRejectFeedback from listing-reject-feedback.ts.
 * Kept as a thin wrapper for older tests/evals.
 */
import {
  buildListingRejectFeedback,
  listingRejectSiteOrigin,
  type ListingRejectFeedback,
} from "@/lib/trust/listing-reject-feedback";
import type { ListingRejectedEmailData } from "@/emails";

export type DuplicateRejectOwnerInput = {
  propertyId: string;
  propertyTitle: string;
  propertyAddress: string;
  city: string;
  state: string | null;
  ownerProfileId: string;
  ownerName: string | null;
  ownerEmail: string;
  reviewerNotes: string;
  siteOrigin?: string;
};

export type DuplicateRejectOwnerNotify = {
  notification: {
    userId: string;
    type: string;
    title: string;
    message: string;
    data: {
      href: string;
      property_id: string;
      rejection_reason: "duplicate_listing";
      admin_notes: string;
    };
  };
  email: ListingRejectedEmailData;
};

export { listingRejectSiteOrigin as duplicateRejectSiteOrigin };

export function buildDuplicateRejectOwnerNotify(
  input: DuplicateRejectOwnerInput,
): DuplicateRejectOwnerNotify {
  const feedback: ListingRejectFeedback = buildListingRejectFeedback({
    propertyId: input.propertyId,
    propertyTitle: input.propertyTitle,
    propertyAddress: input.propertyAddress,
    city: input.city,
    state: input.state,
    reason: "duplicate_listing",
    staffNotes: input.reviewerNotes,
    siteOrigin: input.siteOrigin,
    recipients: [
      {
        profileId: input.ownerProfileId,
        email: input.ownerEmail,
        fullName: input.ownerName,
        role: "owner",
      },
    ],
  });

  const notification = feedback.notifications[0]!;
  const email = feedback.emails[0]!;
  return {
    notification: {
      userId: notification.userId,
      type: "listing_rejected_duplicate",
      title: notification.title,
      message: notification.message,
      data: {
        href: notification.data.href,
        property_id: notification.data.property_id,
        rejection_reason: "duplicate_listing",
        admin_notes: feedback.audit.staff_notes ?? input.reviewerNotes.trim(),
      },
    },
    email,
  };
}
