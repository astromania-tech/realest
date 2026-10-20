import assert from "node:assert/strict";
import test from "node:test";
import { readVisitPhoto } from "@/lib/trust/visit-photo";
import {
  badgeWriteAllowed,
  correctionReplacementAllowed,
  observationConflicts,
  publicVisitRecord,
  type VisitGate,
} from "@/lib/trust/visit";

const officer = "11111111-1111-1111-1111-111111111111";

function ready(overrides: Partial<VisitGate> = {}): VisitGate {
  return {
    officerId: officer,
    visitDay: "2026-10-20",
    checkedInAt: "2026-10-20T10:00:00.000Z",
    voidedAt: null,
    photoPath: `${officer}/${officer}.jpg`,
    distanceMeters: 12,
    sawBuilding: true,
    addressMatches: true,
    documentMatches: true,
    openIssue: null,
    caseState: "human_review",
    ...overrides,
  };
}

test("an assignment without a check-in cannot write the badge", () => {
  const result = badgeWriteAllowed(ready({ checkedInAt: null, photoPath: null }));
  assert.equal(result.ok, false);
});

test("a check-in off the pin, a missed building, or an open issue blocks the badge", () => {
  assert.equal(badgeWriteAllowed(ready({ distanceMeters: 80 })).ok, false);
  assert.equal(badgeWriteAllowed(ready({ sawBuilding: false })).ok, false);
  assert.equal(badgeWriteAllowed(ready({ openIssue: "Replace the survey." })).ok, false);
  assert.equal(badgeWriteAllowed(ready()).ok, true);
});

test("the observation names the conflict with the listing, the document, and the pin", () => {
  const conflicts = observationConflicts({
    sawBuilding: false,
    addressMatches: false,
    documentMatches: true,
    distanceMeters: 12,
  });
  assert.equal(conflicts.length, 2);
  assert.match(conflicts.join(" "), /building/);
  assert.match(conflicts.join(" "), /address/);
});

test("sending one file back refuses every other file", () => {
  const refused = correctionReplacementAllowed({
    status: "pending_correction",
    correctionDocumentType: "survey",
    uploadedType: "title_deed",
  });
  assert.equal(refused.ok, false);
  const allowed = correctionReplacementAllowed({
    status: "pending_correction",
    correctionDocumentType: "survey",
    uploadedType: "survey",
  });
  assert.equal(allowed.ok, true);
});

test("the public record says the visit does not prove title and hides the officer pin", () => {
  const record = publicVisitRecord({
    verified: true,
    checkedInAt: "2026-10-20T10:00:00.000Z",
    voidedAt: null,
    photoPath: "a/b.jpg",
    distanceMeters: 12,
  });
  assert.match(record?.statement ?? "", /does not prove title/);
  assert.deepEqual(record?.checked, ["document gate", "officer at the pin", "photo at the gate"]);
  assert.equal(JSON.stringify(record).includes("latitude"), false);
  assert.equal(publicVisitRecord({
    verified: false,
    checkedInAt: "2026-10-20T10:00:00.000Z",
    voidedAt: null,
    photoPath: "a/b.jpg",
    distanceMeters: 12,
  }), null);
});

test("a gate photo must be a real image under 1 MB", () => {
  assert.equal(readVisitPhoto(Buffer.from([0xff, 0xd8, 0xff, 0x00]).toString("base64")).ok, true);
  assert.equal(readVisitPhoto(Buffer.from("hello").toString("base64")).ok, false);
});
