/**
 * Deterministic eval: one officer, then the badge. Pin candidates stay inside 50 metres.
 *
 *   npx tsx evals/vetting-assignment/run.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { visitAssignmentAllowed } from "../../lib/trust/assignment.ts";
import { badgeWriteAllowed, type VisitGate } from "../../lib/trust/visit.ts";
import { DUPLICATE_RADIUS_KM } from "../../lib/trust/candidates.ts";
import { persistablePhotoHashes } from "../../lib/trust/photo-store.ts";

const officerA = "11111111-1111-1111-1111-111111111111";
const officerB = "22222222-2222-2222-2222-222222222222";

function checkedIn(): VisitGate {
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
  };
}

const cases: Array<{ id: string; run: () => boolean }> = [
  {
    id: "unassigned-cannot-approve",
    run: () => badgeWriteAllowed({ ...checkedIn(), officerId: null, visitDay: null }).ok === false,
  },
  {
    id: "second-officer-blocked",
    run: () =>
      visitAssignmentAllowed({
        currentOfficerId: officerA,
        officerId: officerB,
        visitDay: "2026-10-20",
        today: "2026-10-18",
      }).ok === false,
  },
  {
    id: "assignment-alone-cannot-approve",
    run: () => badgeWriteAllowed({ ...checkedIn(), checkedInAt: null, photoPath: null }).ok === false,
  },
  {
    id: "check-in-at-the-pin-can-approve",
    run: () => badgeWriteAllowed(checkedIn()).ok === true,
  },
  {
    id: "open-issue-blocks-the-badge",
    run: () => badgeWriteAllowed({ ...checkedIn(), openIssue: "Replace the survey." }).ok === false,
  },
  {
    id: "pin-radius-is-50-metres",
    run: () => DUPLICATE_RADIUS_KM === 0.05,
  },
  {
    id: "short-hash-is-not-stored",
    run: () => persistablePhotoHashes([{ mediaId: "m", dHashHex: "abc" }]).length === 0,
  },
  {
    id: "worker-uses-postgis-and-stores-hash",
    run: () => {
      const source = readFileSync("lib/validation/validation-job-worker.ts", "utf8");
      return (
        source.includes("loadDuplicateCandidates") &&
        source.includes("persistStoredPhotoHashes") &&
        !source.includes("take: 50")
      );
    },
  },
  {
    id: "timer-is-outside-vercel",
    run: () => {
      const deploy = readFileSync(".github/workflows/deploy.yml", "utf8");
      const timer = readFileSync("deploy/validation-worker.timer", "utf8");
      return !deploy.includes("validation:worker") && timer.includes("OnUnitActiveSec") && !timer.toLowerCase().includes("vercel");
    },
  },
];

let failed = 0;
for (const item of cases) {
  const ok = item.run();
  if (!ok) {
    failed += 1;
    console.error(`FAIL ${item.id}`);
  } else {
    console.log(`pass ${item.id}`);
  }
}

assert.equal(failed, 0);
console.log(`vetting assignment eval ${cases.length - failed}/${cases.length}`);
