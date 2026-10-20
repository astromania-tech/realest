import assert from "node:assert/strict";
import test from "node:test";
import { writeJudgment } from "@/lib/trust/brief";
import { caseStateLabel, evidenceLines, nextCaseState } from "@/lib/trust/case";
import { reconcileClaims } from "@/lib/trust/claims";

const officer = {
  note: "The duplex is at 12 Admiralty Way, Lekki.",
  addressMatches: true,
  sawBuilding: true,
  documentMatches: true,
};

test("the brief reads the listing and writes a judgment", () => {
  const findings = reconcileClaims({
    listingAddress: "12 Admiralty Way, Lekki, Lagos",
    accountName: "Ada Lovelace",
    documentLocation: "Wuse, Abuja",
    documentHolder: "Ada Lovelace",
    officer,
    registry: { reference: "LAG/2024/18", matches: true },
  });
  const brief = writeJudgment({
    title: "4 bedroom duplex",
    address: "12 Admiralty Way, Lekki, Lagos",
    description: "A detached duplex with a borehole and a generator.",
    findings,
  });
  assert.match(brief, /borehole/);
  assert.match(brief, /do not approve "4 bedroom duplex"/);
  assert.match(brief, /address_document is contradicted/);
});

test("a clear listing is sent to human review and does not write the badge", () => {
  const findings = reconcileClaims({
    listingAddress: "12 Admiralty Way, Lekki, Lagos",
    accountName: "Ada Lovelace",
    documentLocation: "Admiralty Way, Lekki",
    documentHolder: "Ada Lovelace",
    officer,
    registry: { reference: "LAG/2024/18", matches: true },
  });
  const brief = writeJudgment({
    title: "4 bedroom duplex",
    address: "12 Admiralty Way, Lekki, Lagos",
    description: "Detached duplex.",
    findings,
  });
  assert.match(brief, /human review/);
  assert.match(brief, /person still writes the badge/);
});

test("the case passes submitted, precheck, field assigned, field complete, then verified", () => {
  assert.equal(nextCaseState(null, "submit"), "submitted");
  assert.equal(nextCaseState("submitted", "precheck"), "ai_precheck");
  assert.equal(nextCaseState("ai_precheck", "desk"), "desk_review");
  assert.equal(nextCaseState("desk_review", "assign"), "field_assigned");
  assert.equal(nextCaseState("field_assigned", "start_field"), "field_in_progress");
  assert.equal(nextCaseState("field_in_progress", "check_in"), "field_complete");
  assert.equal(nextCaseState("field_complete", "reconcile"), "reconciliation");
  assert.equal(nextCaseState("reconciliation", "claims_clear"), "human_review");
  assert.equal(nextCaseState("human_review", "approve"), "verified");
  assert.equal(nextCaseState("human_review", "correct"), "correction");
  assert.equal(nextCaseState("desk_review", "reject"), "rejected");
  assert.equal(caseStateLabel("ai_precheck"), "AI precheck");
  assert.equal(caseStateLabel(null), "Not opened");
  const lines = evidenceLines("physical", { distanceMeters: 12.4, sawBuilding: true, latitude: 6.4 });
  assert.equal(lines.find((line) => line.label === "Distance from the pin")?.value, "12 metres");
  assert.equal(lines.some((line) => line.label === "latitude"), false);
});
