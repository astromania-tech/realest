/**
 * Deterministic eval: a validation job is claimable once, then waits out its backoff.
 *
 *   npx tsx evals/validation-queue/run.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { jobIsClaimable, retryDelayMinutes, VALIDATION_JOB_MAX_ATTEMPTS } from "../../lib/validation/job-claim.ts";

const now = new Date("2026-10-18T10:00:00.000Z");
const worker = readFileSync("lib/validation/validation-job-worker.ts", "utf8");

const cases: Array<{ id: string; run: () => boolean }> = [
  {
    id: "queued-job-is-claimable",
    run: () => jobIsClaimable({ status: "queued", attempts: 0, nextRetryAt: null, updatedAt: now }, now),
  },
  {
    id: "failed-without-backoff-is-not-claimable",
    run: () =>
      jobIsClaimable({ status: "failed", attempts: 1, nextRetryAt: null, updatedAt: now }, now) === false,
  },
  {
    id: "stale-processing-job-is-claimable",
    run: () =>
      jobIsClaimable(
        {
          status: "processing",
          attempts: 1,
          nextRetryAt: null,
          updatedAt: new Date(now.getTime() - 10 * 60_000),
        },
        now,
      ),
  },
  {
    id: "fifth-attempt-is-not-claimable",
    run: () =>
      jobIsClaimable(
        { status: "queued", attempts: VALIDATION_JOB_MAX_ATTEMPTS, nextRetryAt: null, updatedAt: now },
        now,
      ) === false && retryDelayMinutes(VALIDATION_JOB_MAX_ATTEMPTS) === null,
  },
  {
    id: "worker-claims-with-skip-locked",
    run: () => worker.includes("for update skip locked") && worker.includes("next_retry_at is not null"),
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
console.log(`validation queue eval ${cases.length - failed}/${cases.length}`);
