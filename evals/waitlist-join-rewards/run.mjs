#!/usr/bin/env node
/**
 * Deterministic eval: waitlist join still sends mail if rewards throw.
 *
 *   node evals/waitlist-join-rewards/run.mjs
 */
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const CASES_PATH = join(ROOT, "evals", "waitlist-join-rewards", "cases.json");

const checks = {
  route_uses_safe_helper: () => {
    const text = readFileSync(join(ROOT, "app/api/waitlist/route.ts"), "utf8");
    return (
      text.includes("applyWaitlistJoinRewards") &&
      !/await ensureWaitlistCohortReward\(\{/.test(text)
    );
  },
  helper_does_not_throw_on_p2003: () => {
    const result = spawnSync(
      process.execPath,
      ["--test", "scripts/waitlist-join-rewards.test.mjs"],
      { cwd: ROOT, encoding: "utf8" },
    );
    return result.status === 0;
  },
};

const spec = JSON.parse(readFileSync(CASES_PATH, "utf8"));
let passed = 0;
for (const c of spec.cases) {
  const ok = Boolean(checks[c.check]());
  console.log(`${ok ? "pass" : "FAIL"}  ${c.id}`);
  if (ok) passed += 1;
}
const score = passed / spec.cases.length;
console.log(`score ${score} threshold ${spec.threshold}`);
if (score < spec.threshold) process.exit(1);
