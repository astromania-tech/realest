/**
 * Deterministic eval: coming-soon lockdown classifiers match real allowlist semantics.
 *
 *   npx tsx evals/route-lockdown/run.ts
 *
 * Catches the regression where `/` (200 coming-soon) and `/not-found` (intentional 404)
 * were marked FAIL even though those routes were working.
 */
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const CASES_PATH = join(ROOT, "evals", "route-lockdown", "cases.json");

type CheckFn = () => boolean;

const checks: Record<string, CheckFn> = {
  analysis_exported_and_used: () => {
    const lib = readFileSync(
      join(ROOT, "lib/route-lockdown-analysis.ts"),
      "utf8",
    );
    const script = readFileSync(
      join(ROOT, "scripts/test-route-lockdown.ts"),
      "utf8",
    );
    return (
      lib.includes("export function analyzeRouteLockdownResponse") &&
      script.includes("analyzeRouteLockdownResponse") &&
      script.includes("../lib/route-lockdown-analysis.ts")
    );
  },
  status_not_body_is_block_signal: () => {
    const lib = readFileSync(
      join(ROOT, "lib/route-lockdown-analysis.ts"),
      "utf8",
    );
    // Must not treat body alone as the lockdown block on HTTP 200.
    return (
      lib.includes("export function isLockdownBlocked") &&
      !lib.includes('body.includes("404")') &&
      !lib.includes(
        'passed = statusCode === 200 && !body.includes("Page Not Found")',
      )
    );
  },
  not_found_allowlist_special_cased: () => {
    const lib = readFileSync(
      join(ROOT, "lib/route-lockdown-analysis.ts"),
      "utf8",
    );
    return (
      lib.includes('route === "/not-found"') &&
      lib.includes('body.includes("Page Not Found")')
    );
  },
  gate_unit_tests_green: () => {
    const result = spawnSync(
      "npx",
      ["tsx", "--test", "lib/route-lockdown-analysis.test.ts"],
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
  const fn = checks[c.check];
  const ok = Boolean(fn?.());
  console.log(`${ok ? "pass" : "FAIL"}  ${c.id}`);
  if (ok) passed += 1;
}
const score = passed / spec.cases.length;
console.log(`score ${score} threshold ${spec.threshold}`);
if (score < spec.threshold) process.exit(1);
