/**
 * Production (rzclzcermmfrbvvjegwg) schema_migrations vs git.
 * Source: admin `npx supabase migration list --linked` 2026-09-17.
 * Do not apply these as new SQL on production. The hosted DB already ran them.
 */

export const SHARED_MIGRATION_VERSIONS = [
  "20241202000000",
  "20251231000000",
  "20260301000000",
  "20260302000000",
  "20260315000000",
  "20260401000000",
  "20260402000000",
  "20260403000000",
  "20260404000000",
  "20260501000000",
  "20260501000001",
  "20260502000000",
  "20260502000001",
  "20260502000002",
  "20260503000001",
  "20260601000000",
] as const;

/** Present on production, missing from git before the ledger sync. */
export const PRODUCTION_ONLY_VERSIONS = [
  "20260729103054",
  "20260729104022",
  "20260729105551",
  "20260729105627",
  "20260730021124",
  "20260730030155",
  "20260730030328",
  "20260730030436",
  "20260730030518",
] as const;

/** Git-only timestamps that were never recorded on production. Must not db push. */
export const GIT_ONLY_VERSIONS_REMOVED = [
  "20260729000000",
  "20260729000001",
] as const;

/** `YYYYMMDDHHMMSS_snake_case_what_changed.sql` */
export const MIGRATION_FILENAME_PATTERN =
  /^(\d{14})_([a-z0-9]+(?:_[a-z0-9]+)*)\.sql$/;

export function isMigrationFilename(filename: unknown): boolean {
  return MIGRATION_FILENAME_PATTERN.test(String(filename));
}

export function parseMigrationVersion(filename: unknown): string | null {
  const match = String(filename).match(MIGRATION_FILENAME_PATTERN);
  return match ? match[1] : null;
}
