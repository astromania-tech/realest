/// <reference types="node" />
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  buildFieldBrief,
  claimFindingToRow,
  deriveCasePriority,
  deriveCaseRisk,
  deriveEvidenceCoverage,
  matchesCaseQueueFilter,
} from "./case-view.ts";

test("deriveCaseRisk escalates on open issue and hard blocks", () => {
  assert.equal(
    deriveCaseRisk({ hardBlocks: [], flags: [], openIssue: null, listingStatus: "pending_vetting" }),
    "Low",
  );
  assert.equal(
    deriveCaseRisk({
      hardBlocks: ["duplicate_pin"],
      flags: [],
      openIssue: null,
      listingStatus: "pending_ml_validation",
    }),
    "High",
  );
  assert.equal(
    deriveCaseRisk({
      hardBlocks: ["a", "b", "c"],
      flags: [],
      openIssue: null,
      listingStatus: "pending_vetting",
    }),
    "Critical",
  );
});

test("queue filters match Connect-style buckets", () => {
  assert.equal(
    matchesCaseQueueFilter(
      { listingStatus: "pending_ml_validation", caseState: "ai_precheck" },
      "review",
    ),
    true,
  );
  assert.equal(
    matchesCaseQueueFilter(
      { listingStatus: "pending_vetting", caseState: "field_assigned" },
      "field",
    ),
    true,
  );
  assert.equal(
    matchesCaseQueueFilter({ listingStatus: "live", caseState: "verified" }, "verified"),
    true,
  );
  assert.equal(
    matchesCaseQueueFilter(
      { listingStatus: "pending_duplicate_review", caseState: null },
      "duplicates",
    ),
    true,
  );
});

test("claim findings map to Connect UI pills", () => {
  const row = claimFindingToRow(
    {
      point: "address_visit",
      status: "supported",
      claim: "Officer stood at the address.",
      evidence: "Note matches listing.",
    },
    0,
  );
  assert.equal(row.status, "confirmed");
  assert.equal(row.claim, "Officer stood at the address.");
});

test("field brief prefers judgment and fraud summary", () => {
  const brief = buildFieldBrief({
    judgment: "Visit cleared the pin.",
    fraudSummary: "1 contradicted finding.",
    hardBlocks: [],
    flags: ["holder_name_mismatch"],
  });
  assert.match(brief ?? "", /Visit cleared/);
  assert.match(brief ?? "", /Flags for the visit/);
});

test("evidence coverage stays within 0-100", () => {
  assert.equal(
    deriveEvidenceCoverage({
      evidenceCount: 0,
      documentCount: 0,
      hasCheckIn: false,
      claimCount: 0,
      supportedClaims: 0,
    }),
    20,
  );
  assert.ok(
    deriveEvidenceCoverage({
      evidenceCount: 10,
      documentCount: 5,
      hasCheckIn: true,
      claimCount: 4,
      supportedClaims: 4,
    }) <= 100,
  );
  assert.equal(deriveCasePriority("High", "pending_vetting"), "High");
  assert.equal(deriveCasePriority("Low", "pending_vetting"), "Standard");
});
