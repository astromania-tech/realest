/**
 * Deterministic eval: waitlist join still sends mail if rewards throw.
 *
 *   npx tsx evals/waitlist-join-rewards/run.ts
 */
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const CASES_PATH = join(ROOT, "evals", "waitlist-join-rewards", "cases.json");

type CheckFn = () => boolean;

const checks: Record<string, CheckFn> = {
  route_uses_safe_helper: () => {
    const text = readFileSync(join(ROOT, "app/api/waitlist/route.ts"), "utf8");
    return (
      text.includes("applyWaitlistJoinRewards") &&
      text.includes("@/lib/waitlist-join-rewards") &&
      !/await ensureWaitlistCohortReward\(\{/.test(text)
    );
  },
  route_does_not_wrap_helper: () => {
    const text = readFileSync(join(ROOT, "app/api/waitlist/route.ts"), "utf8");
    const start = text.indexOf("if (result.data)");
    const end = text.indexOf("const positionData");
    if (start < 0 || end < 0 || end <= start) return false;
    const window = text.slice(start, end);
    return (
      window.includes("applyWaitlistJoinRewards") &&
      !window.includes("try {") &&
      !window.includes("catch (error)")
    );
  },
  helper_never_throws_on_missing_deps: () => {
    const text = readFileSync(
      join(ROOT, "lib/waitlist-join-rewards.ts"),
      "utf8",
    );
    return (
      text.includes("return { rewardsOk: false }") &&
      !text.includes(
        'throw new Error("applyWaitlistJoinRewards requires reward deps")',
      )
    );
  },
  helper_does_not_throw_on_p2003: () => {
    const result = spawnSync(
      "npx",
      ["tsx", "--test", "lib/waitlist-join-rewards.test.ts"],
      { cwd: ROOT, encoding: "utf8" },
    );
    return result.status === 0;
  },
};

const spec = JSON.parse(readFileSync(CASES_PATH, "utf8")) as {
  threshold: number;
  cases: Array<{ id: string; check: string }>;
};

let passed = 0;
for (const c of spec.cases) {
  const ok = Boolean(checks[c.check]?.());
  console.log(`${ok ? "pass" : "FAIL"}  ${c.id}`);
  if (ok) passed += 1;
}
const score = passed / spec.cases.length;
console.log(`score ${score} threshold ${spec.threshold}`);
if (score < spec.threshold) process.exit(1);
