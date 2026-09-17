import assert from "node:assert/strict";
import { readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import {
  GIT_ONLY_VERSIONS_REMOVED,
  parseMigrationVersion,
  PRODUCTION_ONLY_VERSIONS,
  SHARED_MIGRATION_VERSIONS,
} from "./lib/production-migration-ledger.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const MIGRATIONS_DIR = join(ROOT, "supabase", "migrations");

function localVersions() {
  return readdirSync(MIGRATIONS_DIR)
    .map(parseMigrationVersion)
    .filter(Boolean)
    .sort();
}

test("git lists every production-only version from the admin migration list", () => {
  const local = new Set(localVersions());
  for (const version of PRODUCTION_ONLY_VERSIONS) {
    assert.equal(local.has(version), true, `missing ${version}`);
  }
});

test("shared versions through 20260601 remain", () => {
  const local = new Set(localVersions());
  for (const version of SHARED_MIGRATION_VERSIONS) {
    assert.equal(local.has(version), true, `missing ${version}`);
  }
});

test("unapplied git-only timestamps are gone so db push will not send them to production", () => {
  const local = new Set(localVersions());
  for (const version of GIT_ONLY_VERSIONS_REMOVED) {
    assert.equal(local.has(version), false, `must not keep ${version}`);
  }
});
