#!/usr/bin/env node
/**
 * Periodic eval for clone-and-run.
 * Deterministic checks only. Pass threshold is 1.0 (every case must pass).
 *
 *   node evals/start-app/run.mjs
 */

import { existsSync, readFileSync, accessSync, constants } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const CASES_PATH = join(ROOT, "evals", "start-app", "cases.json");

function isExecutable(path) {
  try {
    accessSync(path, constants.X_OK);
    return true;
  } catch {
    return false;
  }
}

function gitCheckIgnore(path) {
  const result = spawnSync("git", ["check-ignore", "-q", path], { cwd: ROOT });
  return result.status === 0;
}

const checks = {
  start_sh_exists: () => existsSync(join(ROOT, "start.sh")),
  start_sh_executable: () => isExecutable(join(ROOT, "start.sh")),
  env_example_exists: () => existsSync(join(ROOT, ".env.example")),
  env_example_not_ignored: () =>
    existsSync(join(ROOT, ".env.example")) && !gitCheckIgnore(".env.example"),
  env_example_lists_required_keys: () => {
    const text = readFileSync(join(ROOT, ".env.example"), "utf8");
    return (
      text.includes("NEXT_PUBLIC_SUPABASE_URL=") &&
      text.includes("NEXT_PUBLIC_SUPABASE_ANON_KEY=")
    );
  },
  package_json_has_start_app: () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
    return Boolean(pkg.scripts && pkg.scripts["start:app"]);
  },
  gitignore_allows_env_example: () => {
    const text = readFileSync(join(ROOT, ".gitignore"), "utf8");
    return text.includes("!.env.example");
  },
  gate_tests_pass: () => {
    const result = spawnSync(
      process.execPath,
      [
        "--test",
        join(ROOT, "scripts", "start-app.test.mjs"),
        join(ROOT, "scripts", "migration-ledger.test.mjs"),
        join(ROOT, "scripts", "readme-install.test.mjs"),
      ],
      { cwd: ROOT, encoding: "utf8" },
    );
    return result.status === 0;
  },
  readme_documents_start_sh: () => {
    const text = readFileSync(join(ROOT, "README.md"), "utf8");
    return text.includes("./start.sh");
  },
  readme_has_clone_url: () => {
    const text = readFileSync(join(ROOT, "README.md"), "utf8");
    return text.includes("git clone https://github.com/astromania-tech/realest.git");
  },
  readme_omits_false_sql_install: () => {
    const text = readFileSync(join(ROOT, "README.md"), "utf8");
    return (
      !text.includes("scripts/001_create_profiles.sql") &&
      !text.includes("Option 2: Manual Setup")
    );
  },
  readme_documents_schema_sync: () => {
    const text = readFileSync(join(ROOT, "README.md"), "utf8");
    return (
      text.includes("supabase/migrations/") &&
      text.includes("schema_migrations") &&
      /never share rows/i.test(text)
    );
  },
};

function main() {
  const spec = JSON.parse(readFileSync(CASES_PATH, "utf8"));
  const results = [];

  for (const testCase of spec.cases) {
    const fn = checks[testCase.id];
    if (!fn) {
      results.push({ id: testCase.id, pass: false, detail: "missing checker" });
      continue;
    }
    let pass = false;
    let detail = "";
    try {
      pass = Boolean(fn());
      if (!pass) detail = "checker returned false";
    } catch (error) {
      pass = false;
      detail = error instanceof Error ? error.message : String(error);
    }
    results.push({ id: testCase.id, pass, detail });
  }

  const passed = results.filter((row) => row.pass).length;
  const score = results.length === 0 ? 0 : passed / results.length;
  const ok = score >= spec.threshold;

  for (const row of results) {
    const mark = row.pass ? "PASS" : "FAIL";
    const extra = row.detail ? ` ${row.detail}` : "";
    process.stdout.write(`${mark} ${row.id}${extra}\n`);
  }
  process.stdout.write(
    `score=${score.toFixed(2)} threshold=${spec.threshold} passed=${passed}/${results.length}\n`,
  );

  process.exit(ok ? 0 : 1);
}

main();
