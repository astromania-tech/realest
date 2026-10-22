import assert from "node:assert/strict";
import {
  buildListingRejectFeedback,
  publicRejectionDetail,
  resolveListingRejectRecipients,
} from "../../lib/trust/listing-reject-feedback.ts";
import { listingRejectNoteAllowed } from "../../lib/trust/listing-reject-note.ts";
import { listingRejectCooldownAllows } from "../../lib/trust/listing-resubmit-limit.ts";
import { duplicateRejectAllowed } from "../../lib/trust/matches.ts";

const cases = [
  {
    id: "duplicate-reject-requires-note",
    ok: () =>
      duplicateRejectAllowed("").ok === false &&
      duplicateRejectAllowed("Same address as live listing.").ok === true,
  },
  {
    id: "desk-and-field-reject-require-note",
    ok: () =>
      listingRejectNoteAllowed("").ok === false &&
      listingRejectNoteAllowed("short").ok === false &&
      listingRejectNoteAllowed("Documents did not match the visit.").ok === true,
  },
  {
    id: "owner-and-agent-both-notified",
    ok: () => {
      const recipients = resolveListingRejectRecipients({
        owners: { profiles: { id: "o1", email: "o@x.ng", full_name: "Owner" } },
        agents: { profiles: { id: "a1", email: "a@x.ng", full_name: "Agent" } },
      });
      const feedback = buildListingRejectFeedback({
        propertyId: "p1",
        propertyTitle: "House",
        propertyAddress: "1 Road",
        city: "Lagos",
        state: "Lagos",
        reason: "duplicate_listing",
        staffNotes: "Collides with another listing nearby.",
        recipients,
        siteOrigin: "https://realest.ng",
      });
      return feedback.notifications.length === 2 && feedback.audit.recipient_profile_ids.length === 2;
    },
  },
  {
    id: "public-copy-hides-detector-codes",
    ok: () => {
      const detail = publicRejectionDetail("Triggered duplicate_pin and hardBlocks list.");
      return Boolean(detail && !detail.includes("duplicate_pin") && !detail.includes("hardBlocks"));
    },
  },
  {
    id: "audit-keeps-full-staff-notes",
    ok: () => {
      const feedback = buildListingRejectFeedback({
        propertyId: "p2",
        propertyTitle: "Flat",
        propertyAddress: "2 Road",
        city: "Abuja",
        state: "FCT",
        reason: "other",
        staffNotes: "trust_reader unavailable; manual reject.",
        recipients: [{ profileId: "u1", email: "u@x.ng", fullName: "U", role: "owner" }],
      });
      return (
        feedback.audit.staff_notes?.includes("trust_reader") === true &&
        feedback.audit.public_detail?.includes("trust_reader") !== true
      );
    },
  },
  {
    id: "resubmit-cooldown-after-three-rejects",
    ok: () => listingRejectCooldownAllows(3).ok === false && listingRejectCooldownAllows(2).ok === true,
  },
];

let failed = 0;
for (const item of cases) {
  if (!item.ok()) {
    failed += 1;
    console.error(`fail ${item.id}`);
  } else {
    console.log(`pass ${item.id}`);
  }
}

assert.equal(failed, 0);
console.log(`listing-reject-feedback eval ${cases.length - failed}/${cases.length}`);
