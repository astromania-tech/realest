import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("the validation timer is a host unit, not a Vercel cron", () => {
  const deploy = readFileSync(".github/workflows/deploy.yml", "utf8");
  const service = readFileSync("deploy/validation-worker.service", "utf8");
  const timer = readFileSync("deploy/validation-worker.timer", "utf8");
  const worker = readFileSync("scripts/validation-worker.ts", "utf8");
  assert.equal(deploy.includes("validation:worker"), false);
  assert.equal(deploy.includes("vercel/action@"), false);
  assert.match(service, /VALIDATION_WORKER_DIRECT=1|EnvironmentFile=/);
  assert.match(timer, /OnUnitActiveSec=2min/);
  assert.equal(timer.toLowerCase().includes("vercel"), false);
  assert.match(worker, /VALIDATION_WORKER_DIRECT === "1"/);
  assert.match(worker, /runValidationWorkerOnce/);
});

test("the worker asks PostGIS for pin candidates and stores photo hashes", () => {
  const source = readFileSync("lib/validation/validation-job-worker.ts", "utf8");
  assert.equal(source.includes("take: 50"), false);
  assert.match(source, /loadDuplicateCandidates/);
  assert.match(source, /propertiesWithinRadius/);
  assert.match(source, /persistStoredPhotoHashes/);
  assert.match(source, /photoHashesForProperties/);
});
