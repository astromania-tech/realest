import assert from "node:assert/strict";
import test from "node:test";
import { badgeWriteAllowed, type VisitGate } from "@/lib/trust/visit";
import { lagosToday, visitAssignmentAllowed } from "@/lib/trust/assignment";

const officerA = "11111111-1111-1111-1111-111111111111";
const officerB = "22222222-2222-2222-2222-222222222222";

test("the first officer and a future visit day can be assigned", () => {
  const result = visitAssignmentAllowed({
    currentOfficerId: null,
    officerId: officerA,
    visitDay: "2026-10-20",
    today: "2026-10-18",
  });
  assert.equal(result.ok, true);
});

test("a second officer cannot take an assigned visit", () => {
  const result = visitAssignmentAllowed({
    currentOfficerId: officerA,
    officerId: officerB,
    visitDay: "2026-10-20",
    today: "2026-10-18",
  });
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.status, 409);
});

test("the same officer can move the visit day, and a past day is refused", () => {
  assert.equal(
    visitAssignmentAllowed({
      currentOfficerId: officerA,
      officerId: officerA,
      visitDay: "2026-10-21",
      today: "2026-10-18",
    }).ok,
    true,
  );
  const past = visitAssignmentAllowed({
    currentOfficerId: null,
    officerId: officerA,
    visitDay: "2026-10-17",
    today: "2026-10-18",
  });
  assert.equal(past.ok, false);
});

function readyVisit(overrides: Partial<VisitGate> = {}): VisitGate {
  return {
    officerId: officerA,
    visitDay: "2026-10-20",
    checkedInAt: "2026-10-20T10:00:00.000Z",
    voidedAt: null,
    photoPath: `${officerA}/${officerA}.jpg`,
    distanceMeters: 12,
    sawBuilding: true,
    addressMatches: true,
    documentMatches: true,
    openIssue: null,
    caseState: "human_review",
    ...overrides,
  };
}

test("the verified badge stays closed until the officer has checked in at the pin", () => {
  assert.equal(badgeWriteAllowed(readyVisit({ officerId: null, visitDay: null, checkedInAt: null, photoPath: null })).ok, false);
  assert.equal(badgeWriteAllowed(readyVisit({ checkedInAt: null, photoPath: null })).ok, false);
  assert.equal(badgeWriteAllowed(readyVisit()).ok, true);
});

test("Lagos today is a calendar date", () => {
  assert.equal(lagosToday(new Date("2026-10-17T23:30:00.000Z")), "2026-10-18");
});
