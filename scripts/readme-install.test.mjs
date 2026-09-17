import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const README = readFileSync(join(ROOT, "README.md"), "utf8");
const CLONE_URL = "https://github.com/astromania-tech/realest.git";

test("README clone command uses the astromania-tech repo", () => {
  assert.equal(README.includes(`git clone ${CLONE_URL}`), true);
});

test("README still documents ./start.sh as the launcher", () => {
  assert.equal(README.includes("./start.sh"), true);
});

test("README does not tell cloners to run missing scripts/001_*.sql files", () => {
  assert.equal(README.includes("scripts/001_create_profiles.sql"), false);
  assert.equal(README.includes("scripts/007_create_profile_trigger.sql"), false);
});

test("README does not tell cloners to supabase init on an existing project", () => {
  assert.match(README, /Do not run `supabase init`/);
});

test("README states local Docker and production stay in sync through git migrations", () => {
  assert.equal(README.includes("supabase/migrations/"), true);
  assert.equal(README.includes("schema_migrations"), true);
  assert.match(README, /never share rows/i);
});

test("README documents how to add a migration and the filename convention", () => {
  assert.match(README, /Adding a schema migration/);
  assert.match(README, /YYYYMMDDHHMMSS_snake_case_what_changed\.sql/);
  assert.match(README, /npx supabase migration new/);
  assert.match(README, /npx supabase db reset/);
  assert.equal(README.includes("001_create_profiles.sql"), true);
  assert.match(README, /Do not put new SQL under `scripts\/`/);
});
