import assert from "node:assert/strict";
import test from "node:test";
import { photoHashesCollide } from "@/lib/trust/hash";
import { haversineMeters } from "@/lib/trust/compare";
import { trustFixtures, cleanListing } from "@/lib/trust/fixtures";
import { decideTrust } from "@/lib/trust/policy";
import { DUPLICATE_RADIUS_METERS } from "@/lib/trust/types";
import { adminApproveAllowed } from "@/lib/trust/gate";

test("a swapped deed stays out of vetting", () => {
  const decision = trustFixtures.swappedDeed();
  assert.equal(decision.decision, "reject");
  assert.equal(decision.allowsVetting, false);
  assert.ok(decision.hardBlocks.includes("document_type_mismatch"));
  assert.equal(decision.recommendedQueue, "pending_ml_validation");
});

test("an unreadable deed stays out of vetting", () => {
  const decision = trustFixtures.unreadableDeed();
  assert.equal(decision.allowsVetting, false);
  assert.ok(decision.hardBlocks.includes("document_unreadable"));
});

test("a repeated pin goes to the duplicate queue", () => {
  const decision = trustFixtures.repeatedPin();
  assert.ok(decision.hardBlocks.includes("duplicate_pin"));
  assert.equal(decision.recommendedQueue, "pending_duplicate_review");
  assert.equal(decision.allowsVetting, false);
  assert.ok(DUPLICATE_RADIUS_METERS >= 12);
});

test("a repeated photo goes to the duplicate queue", () => {
  const decision = trustFixtures.repeatedPhoto();
  assert.ok(decision.hardBlocks.includes("duplicate_photo"));
  assert.equal(decision.recommendedQueue, "pending_duplicate_review");
});

test("a screenshot is refused", () => {
  const decision = trustFixtures.screenshot();
  assert.ok(decision.hardBlocks.includes("photo_screenshot"));
  assert.equal(decision.allowsVetting, false);
});

test("a clean listing stops for a person and does not verify itself", () => {
  const decision = trustFixtures.clean();
  assert.equal(decision.decision, "review");
  assert.equal(decision.allowsVetting, true);
  assert.deepEqual(decision.flags, ["photo_classifier_unavailable"]);
  assert.equal(decision.recommendedQueue, "pending_ml_validation");
  assert.equal(adminApproveAllowed({ trust: decision, adminNotes: "" }).ok, false);
  assert.equal(adminApproveAllowed({ trust: decision, adminNotes: "Officer will confirm the building." }).ok, true);
});

test("photo hashes collide inside the hamming limit and not outside it", () => {
  assert.equal(photoHashesCollide(["0000000000000000"], ["0000000000000001"]), true);
  assert.equal(photoHashesCollide(["0000000000000000"], ["ffffffffffffffff"]), false);
});

test("fifty meters is inside the duplicate radius and sixty is outside", () => {
  assert.equal(haversineMeters(6.45, 3.47, 6.45, 3.47), 0);
  assert.equal(decideTrust(cleanListing({ nearestOtherListingMeters: 50 })).hardBlocks.includes("duplicate_pin"), true);
  assert.equal(decideTrust(cleanListing({ nearestOtherListingMeters: 51 })).hardBlocks.includes("duplicate_pin"), false);
});
