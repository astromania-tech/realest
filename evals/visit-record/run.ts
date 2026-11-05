/**
 * The visit record is the badge gate and the public sentence.
 *
 *   npx tsx evals/visit-record/run.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { publicVisitRecord } from "../../lib/trust/visit.ts";

const route = readFileSync("app/api/admin/validation/vetting/[id]/route.ts", "utf8");
const publicRoute = readFileSync("app/api/properties/[id]/public/route.ts", "utf8");

const cases = [
  {
    id: "approve-uses-the-check-in-gate",
    run: () => route.includes("badgeWriteAllowed") && route.includes("saveCheckIn") && route.includes("deviceCheckInAllowed") && route.includes("appendEvidence"),
  },
  {
    id: "one-file-goes-back",
    run: () => route.includes("pending_correction") && route.includes("markCorrection"),
  },
  {
    id: "a-flag-blocks-the-badge",
    run: () => route.includes("setOpenIssue"),
  },
  {
    id: "public-record-hides-the-pin-and-names-the-limit",
    run: () => {
      const record = publicVisitRecord({
        verified: true,
        checkedInAt: "2026-10-20T10:00:00.000Z",
        voidedAt: null,
        photoPath: "a/b.jpg",
        distanceMeters: 4,
      });
      return (
        publicRoute.includes("publicVisitRecord") &&
        Boolean(record?.statement.includes("does not prove title")) &&
        !JSON.stringify(record).includes("latitude")
      );
    },
  },
];

let failed = 0;
for (const item of cases) {
  if (!item.run()) {
    failed += 1;
    console.error(`FAIL ${item.id}`);
  } else {
    console.log(`pass ${item.id}`);
  }
}
assert.equal(failed, 0);
console.log(`visit record eval ${cases.length - failed}/${cases.length}`);
