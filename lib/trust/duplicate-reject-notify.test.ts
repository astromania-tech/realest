import assert from "node:assert/strict";
import test from "node:test";
import { buildDuplicateRejectOwnerNotify } from "@/lib/trust/duplicate-reject-notify";

test("duplicate reject notify uses profile id and carries the reviewer note", () => {
  const payload = buildDuplicateRejectOwnerNotify({
    propertyId: "prop-1",
    propertyTitle: "2 Bed Flat Lekki",
    propertyAddress: "12 Admiralty Way",
    city: "Lagos",
    state: "Lagos",
    ownerProfileId: "profile-1",
    ownerName: "Chioma Ada",
    ownerEmail: "chioma@example.ng",
    reviewerNotes: "  Same pin as live listing on Admiralty Way.  ",
  });

  assert.equal(payload.notification.userId, "profile-1");
  assert.equal(payload.notification.type, "listing_rejected_duplicate");
  assert.match(payload.notification.message, /Same pin as live listing on Admiralty Way/);
  assert.equal(payload.notification.data.rejection_reason, "duplicate_listing");
  assert.equal(payload.notification.data.admin_notes, "Same pin as live listing on Admiralty Way.");
  assert.equal(payload.email.rejectionReason, "duplicate_listing");
  assert.equal(payload.email.rejectionDetail, "Same pin as live listing on Admiralty Way.");
  assert.equal(payload.email.ownerEmail, "chioma@example.ng");
  assert.equal(payload.email.propertyAddress, "12 Admiralty Way, Lagos, Lagos");
  assert.match(payload.email.dashboardUrl ?? "", /^https?:\/\//);
});

test("duplicate reject notify falls back when owner name is missing", () => {
  const payload = buildDuplicateRejectOwnerNotify({
    propertyId: "prop-2",
    propertyTitle: "Studio Yaba",
    propertyAddress: "1 Herbert Macaulay",
    city: "Lagos",
    state: null,
    ownerProfileId: "profile-2",
    ownerName: "  ",
    ownerEmail: "owner@example.ng",
    reviewerNotes: "Exact address match with listing ABC.",
    siteOrigin: "https://realest.ng",
  });

  assert.equal(payload.email.ownerName, "there");
  assert.equal(payload.email.propertyAddress, "1 Herbert Macaulay, Lagos");
  assert.equal(payload.email.dashboardUrl, "https://realest.ng/owner/listings");
});
