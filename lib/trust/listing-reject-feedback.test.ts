import assert from "node:assert/strict";
import test from "node:test";
import {
  buildListingRejectFeedback,
  mapVettingRejectionReason,
  publicRejectionDetail,
  resolveListingRejectRecipients,
} from "@/lib/trust/listing-reject-feedback";
import { listingRejectNoteAllowed } from "@/lib/trust/listing-reject-note";
import { listingRejectCooldownAllows } from "@/lib/trust/listing-resubmit-limit";

test("public rejection detail strips internal detector tokens", () => {
  const detail = publicRejectionDetail(
    "Hard block duplicate_pin at 12m and photo_hash collision with listing X.",
  );
  assert.ok(detail);
  assert.equal(detail.includes("duplicate_pin"), false);
  assert.equal(detail.includes("photo_hash"), false);
  assert.match(detail, /\[redacted\]/);
  assert.match(detail, /listing X/);
});

test("resolve recipients includes owner and agent without duplicating the same profile", () => {
  const shared = { id: "p1", email: "a@b.ng", full_name: "Ada" };
  const recipients = resolveListingRejectRecipients({
    owners: { profiles: shared },
    agents: { profiles: shared },
  });
  assert.equal(recipients.length, 1);

  const both = resolveListingRejectRecipients({
    owners: { profiles: { id: "o1", email: "owner@b.ng", full_name: "Owner" } },
    agents: { profiles: { id: "a1", email: "agent@b.ng", full_name: "Agent" } },
  });
  assert.deepEqual(
    both.map((r) => r.role),
    ["owner", "agent"],
  );
});

test("feedback audit keeps full staff notes while public copy is scrubbed", () => {
  const feedback = buildListingRejectFeedback({
    propertyId: "prop-1",
    propertyTitle: "Flat Lekki",
    propertyAddress: "12 Admiralty",
    city: "Lagos",
    state: "Lagos",
    reason: "duplicate_listing",
    staffNotes: "duplicate_address match with live listing on Admiralty.",
    siteOrigin: "https://realest.ng",
    recipients: [
      { profileId: "o1", email: "o@x.ng", fullName: "Chioma", role: "owner" },
      { profileId: "a1", email: "a@x.ng", fullName: "Bola", role: "agent" },
    ],
  });

  assert.equal(feedback.notifications.length, 2);
  assert.equal(feedback.emails.length, 2);
  assert.equal(feedback.audit.staff_notes?.includes("duplicate_address"), true);
  assert.equal(feedback.audit.public_detail?.includes("duplicate_address"), false);
  assert.equal(feedback.emails[0]?.dashboardUrl, "https://realest.ng/owner/listings");
  assert.equal(feedback.emails[1]?.dashboardUrl, "https://realest.ng/agent/properties");
  assert.equal(feedback.notifications[0]?.data.rejection_reason, "duplicate_listing");
});

test("vetting reason maps to email-safe codes", () => {
  assert.equal(mapVettingRejectionReason("documents_fraudulent"), "fraudulent_documents");
  assert.equal(mapVettingRejectionReason("property_not_found"), "property_not_found");
  assert.equal(mapVettingRejectionReason("other"), "other");
});

test("reject cooldown blocks after the max rejected listings in window", () => {
  assert.equal(listingRejectCooldownAllows(2).ok, true);
  assert.equal(listingRejectCooldownAllows(3).ok, false);
});

test("reject note is required and must be long enough for the owner", () => {
  assert.equal(listingRejectNoteAllowed("").ok, false);
  assert.equal(listingRejectNoteAllowed("   ").ok, false);
  assert.equal(listingRejectNoteAllowed("too short").ok, false);
  const ok = listingRejectNoteAllowed("Address already listed on RealEST nearby.");
  assert.equal(ok.ok, true);
  if (ok.ok) assert.match(ok.note, /Address already listed/);
});
