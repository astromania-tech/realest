import assert from "node:assert/strict";
import test from "node:test";
import {
  LISTING_REJECT_COOLDOWN_MAX,
  listingRejectCooldownAllows,
  listingSubmitRateMessage,
  rejectCooldownSince,
} from "@/lib/trust/listing-resubmit-limit";

test("cooldown allows under the cap and blocks at the cap", () => {
  assert.equal(listingRejectCooldownAllows(0).ok, true);
  assert.equal(listingRejectCooldownAllows(LISTING_REJECT_COOLDOWN_MAX - 1).ok, true);
  const blocked = listingRejectCooldownAllows(LISTING_REJECT_COOLDOWN_MAX);
  assert.equal(blocked.ok, false);
  if (!blocked.ok) assert.equal(blocked.code, "reject_cooldown");
});

test("reject cooldown window starts seven days before now", () => {
  const now = new Date("2026-10-22T12:00:00.000Z");
  const since = rejectCooldownSince(now);
  assert.equal(since.toISOString(), "2026-10-15T12:00:00.000Z");
});

test("submit rate message is owner-safe", () => {
  assert.match(listingSubmitRateMessage(), /too many listings/i);
});
