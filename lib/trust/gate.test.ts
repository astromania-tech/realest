import assert from "node:assert/strict";
import test from "node:test";
import { adminApproveAllowed, readTrustDecision } from "@/lib/trust/gate";
import { trustFixtures } from "@/lib/trust/fixtures";

test("approve is refused when the reader has not finished", () => {
  const result = adminApproveAllowed({ trust: readTrustDecision({}), adminNotes: "noted" });
  assert.equal(result.ok, false);
});

test("approve is refused when a hard block is stored on the job", () => {
  const trust = trustFixtures.swappedDeed();
  const result = adminApproveAllowed({
    trust: readTrustDecision({ trust }),
    adminNotes: "looks fine",
  });
  assert.equal(result.ok, false);
  if (!result.ok) assert.ok(result.hardBlocks.includes("document_type_mismatch"));
});

test("a stored clean review can go to vetting only with a note", () => {
  const trust = trustFixtures.clean();
  assert.equal(adminApproveAllowed({ trust, adminNotes: "  " }).ok, false);
  assert.equal(adminApproveAllowed({ trust, adminNotes: "Visit booked." }).ok, true);
});
