import assert from "node:assert/strict";
import test from "node:test";
import { jobIsClaimable, retryDelayMinutes, VALIDATION_JOB_MAX_ATTEMPTS, VALIDATION_JOB_STALE_MINUTES } from "@/lib/validation/job-claim";

const now = new Date("2026-10-18T10:00:00.000Z");

function row(overrides: Partial<Parameters<typeof jobIsClaimable>[0]> = {}) {
  return {
    status: "queued",
    attempts: 0,
    nextRetryAt: null,
    updatedAt: now,
    ...overrides,
  };
}

test("a queued job is claimable and a fresh processing job is not", () => {
  assert.equal(jobIsClaimable(row(), now), true);
  assert.equal(jobIsClaimable(row({ status: "processing" }), now), false);
  assert.equal(jobIsClaimable(row({ status: "completed" }), now), false);
});

test("a failed job waits for next_retry_at and does not retry immediately", () => {
  assert.equal(jobIsClaimable(row({ status: "failed", attempts: 1, nextRetryAt: null }), now), false);
  assert.equal(
    jobIsClaimable(row({ status: "failed", attempts: 1, nextRetryAt: new Date(now.getTime() + 60_000) }), now),
    false,
  );
  assert.equal(
    jobIsClaimable(row({ status: "failed", attempts: 1, nextRetryAt: new Date(now.getTime() - 1000) }), now),
    true,
  );
});

test("a crashed processing job is claimable only after it goes stale", () => {
  const fresh = new Date(now.getTime() - (VALIDATION_JOB_STALE_MINUTES - 1) * 60_000);
  const stale = new Date(now.getTime() - VALIDATION_JOB_STALE_MINUTES * 60_000);
  assert.equal(jobIsClaimable(row({ status: "processing", attempts: 1, updatedAt: fresh }), now), false);
  assert.equal(jobIsClaimable(row({ status: "processing", attempts: 1, updatedAt: stale }), now), true);
});

test("the attempt cap stops claims and the backoff grows then stops", () => {
  assert.equal(jobIsClaimable(row({ attempts: VALIDATION_JOB_MAX_ATTEMPTS }), now), false);
  assert.equal(retryDelayMinutes(1), 1);
  assert.equal(retryDelayMinutes(2), 2);
  assert.equal(retryDelayMinutes(3), 4);
  assert.equal(retryDelayMinutes(VALIDATION_JOB_MAX_ATTEMPTS), null);
  assert.ok((retryDelayMinutes(VALIDATION_JOB_MAX_ATTEMPTS - 1) ?? 0) <= 30);
});
