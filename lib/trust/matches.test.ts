import assert from "node:assert/strict";
import test from "node:test";
import { duplicateRejectAllowed, matchedPropertyIdsFromResult, selectDuplicateMatches } from "@/lib/trust/matches";
import { DUPLICATE_CANDIDATE_STATUSES } from "@/lib/trust/types";

const listing = { address: "12 Admiralty Way Lekki", latitude: 6.4474, longitude: 3.47 };

test("the same address and a pin inside 50 meters are duplicate matches", () => {
  const matches = selectDuplicateMatches({
    ...listing,
    candidates: [
      { id: "address-hit", address: "12 admiralty way, lekki", latitude: null, longitude: null, status: "live" },
      { id: "pin-hit", address: "14 Bourdillon Ikoyi", latitude: 6.4475, longitude: 3.4701, status: "pending_duplicate_review" },
      { id: "far", address: "1 Wuse Abuja", latitude: 9.0765, longitude: 7.3986, status: "live" },
      { id: "draft", address: "12 Admiralty Way Lekki", latitude: 6.4474, longitude: 3.47, status: "draft" },
    ],
  });
  assert.deepEqual(
    matches.map((match) => match.id),
    ["address-hit", "pin-hit"],
  );
  assert.equal(matches[0]?.reason, "duplicate_address");
  assert.equal(matches[1]?.reason, "duplicate_pin");
  assert.ok((matches[1]?.meters ?? 999) <= 50);
});

test("duplicate review considers live and in-progress listings", () => {
  assert.ok(DUPLICATE_CANDIDATE_STATUSES.includes("live"));
  assert.ok(DUPLICATE_CANDIDATE_STATUSES.includes("pending_duplicate_review"));
  assert.equal((DUPLICATE_CANDIDATE_STATUSES as readonly string[]).includes("draft"), false);
});

test("stored match ids are read from the job result", () => {
  assert.deepEqual(matchedPropertyIdsFromResult({ duplicateResult: { matchedPropertyIds: ["a", ""] } }), ["a"]);
  assert.deepEqual(matchedPropertyIdsFromResult({ matchedPropertyIds: ["b"] }), ["b"]);
  assert.deepEqual(matchedPropertyIdsFromResult(null), []);
});

test("rejecting a duplicate requires a note", () => {
  assert.equal(duplicateRejectAllowed("  ").ok, false);
  assert.equal(duplicateRejectAllowed("too short").ok, false);
  assert.equal(duplicateRejectAllowed("Same photo as the live Lekki listing.").ok, true);
});
