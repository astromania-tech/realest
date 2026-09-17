import assert from "node:assert/strict";
import { readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import {
  GIT_ONLY_VERSIONS_REMOVED,
  isMigrationFilename,
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

test("isMigrationFilename accepts YYYYMMDDHHMMSS_snake_case.sql only", () => {
  assert.equal(isMigrationFilename("20260917143000_add_listing_expiry.sql"), true);
  assert.equal(
    isMigrationFilename("20260502000002_waitlist_persona_rewards.sql"),
    true,
  );
  assert.equal(isMigrationFilename("001_create_profiles.sql"), false);
  assert.equal(isMigrationFilename("add_listing_expiry.sql"), false);
  assert.equal(
    isMigrationFilename("20260917143000-Add-Listing-Expiry.sql"),
    false,
  );
  assert.equal(isMigrationFilename("2026091714300_too_short.sql"), false);
});

test("every file in supabase/migrations matches the naming convention", () => {
  const files = readdirSync(MIGRATIONS_DIR).filter((name) => name.endsWith(".sql"));
  assert.equal(files.length > 0, true);
  for (const name of files) {
    assert.equal(isMigrationFilename(name), true, name);
  }
});
