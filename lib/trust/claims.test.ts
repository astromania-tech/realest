import assert from "node:assert/strict";
import test from "node:test";
import { claimsBlockBadge, claimsBrief, reconcileClaims } from "@/lib/trust/claims";
import { landRegistryMode, registryTitleFinding } from "@/lib/trust/registry";
import { nextCaseState, publicEvidenceBody } from "@/lib/trust/case";
import { deviceCheckInAllowed } from "@/lib/trust/visit";

const officer = {
  note: "The duplex is at 12 Admiralty Way, Lekki.",
  addressMatches: true,
  sawBuilding: true,
  documentMatches: true,
};

test("a matching document and officer note are supported, and title stays short of evidence", () => {
  const findings = reconcileClaims({
    listingAddress: "12 Admiralty Way, Lekki, Lagos",
    accountName: "Ada Lovelace",
    documentLocation: "Admiralty Way, Lekki",
    documentHolder: "Ada Lovelace",
    officer,
  });
  assert.equal(findings.find((finding) => finding.point === "address_document")?.status, "supported");
  assert.equal(findings.find((finding) => finding.point === "address_visit")?.status, "supported");
  assert.equal(findings.find((finding) => finding.point === "title")?.status, "insufficient");
  assert.match(claimsBlockBadge(findings) ?? "", /has not confirmed/);
  assert.match(claimsBrief(findings), /Title is not proved/);
  const confirmed = reconcileClaims({
    listingAddress: "12 Admiralty Way, Lekki, Lagos",
    accountName: "Ada Lovelace",
    documentLocation: "Admiralty Way, Lekki",
    documentHolder: "Ada Lovelace",
    officer,
    registry: { reference: "LAG/2024/18", matches: true },
  });
  assert.equal(confirmed.find((finding) => finding.point === "title")?.status, "supported");
  assert.equal(claimsBlockBadge(confirmed), null);
});

test("a registry file that does not match is contradicted, and a URL alone does not confirm title", () => {
  const refused = reconcileClaims({
    listingAddress: "12 Admiralty Way, Lekki, Lagos",
    accountName: "Ada Lovelace",
    documentLocation: "Lekki",
    documentHolder: "Ada Lovelace",
    officer,
    registry: { reference: "LAG/2024/18", matches: false },
  });
  assert.equal(refused.find((finding) => finding.point === "title")?.status, "contradicted");
  const mode = landRegistryMode("https://registry.example");
  assert.equal(mode.mode, "remote");
  const untouched = registryTitleFinding({ confirmation: null, mode });
  assert.equal(untouched.status, "insufficient");
  assert.match(untouched.evidence, /was not called/);
});

test("a document that names another place is contradicted", () => {
  const findings = reconcileClaims({
    listingAddress: "12 Admiralty Way, Lekki, Lagos",
    accountName: "Ada Lovelace",
    documentLocation: "Wuse, Abuja",
    documentHolder: "Ada Lovelace",
    officer,
  });
  assert.equal(findings.find((finding) => finding.point === "address_document")?.status, "contradicted");
  assert.ok(claimsBlockBadge(findings));
});

test("an empty officer note is short of evidence", () => {
  const findings = reconcileClaims({
    listingAddress: "12 Admiralty Way, Lekki, Lagos",
    accountName: "Ada Lovelace",
    documentLocation: "Lekki",
    documentHolder: "Ada Lovelace",
    officer: { ...officer, note: "   " },
  });
  assert.equal(findings.find((finding) => finding.point === "address_visit")?.status, "insufficient");
});

test("assign stops at field assigned and a blocked claim stays in reconciliation", () => {
  assert.equal(nextCaseState("desk_review", "assign"), "field_assigned");
  assert.equal(nextCaseState("reconciliation", "claims_blocked"), "reconciliation");
});

test("typed coordinates are refused and a public layer hides the pin", () => {
  assert.equal(deviceCheckInAllowed({ locationSource: "typed", accuracyMeters: 8 }).ok, false);
  assert.equal(deviceCheckInAllowed({ locationSource: "device", accuracyMeters: 80 }).ok, false);
  assert.equal(deviceCheckInAllowed({ locationSource: "device", accuracyMeters: 12 }).ok, true);
  const shown = publicEvidenceBody("physical", { latitude: 6.4, longitude: 3.4, distanceMeters: 12, photoPath: "a/b.jpg" });
  assert.equal("latitude" in shown, false);
  assert.equal("photoPath" in shown, false);
  assert.equal(shown.distanceMeters, 12);
});
