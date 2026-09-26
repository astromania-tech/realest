/**
 * A-01 gate: Two write paths, no boundary.
 * Supabase = auth/storage only. Prisma = all table reads/writes in app/api.
 * @see docs/engineering/data-write-path.md
 */
/// <reference types="node" />
import assert from "node:assert/strict";
import { test } from "node:test";
import { findSupabaseTableFromViolations } from "./write-path-boundary.ts";

test("[A-01] API routes do not use supabase .from(table) for DB access", () => {
  const violations = findSupabaseTableFromViolations();
  assert.deepEqual(
    violations,
    [],
    violations
      .map((v) => `${v.file}:${v.line} .from('${v.table}') — ${v.snippet}`)
      .join("\n"),
  );
});
