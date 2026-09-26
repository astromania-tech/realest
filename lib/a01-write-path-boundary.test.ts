/**
 * A-01 gate: Two write paths, no boundary.
 * Supabase = auth/storage only. Prisma = all table reads/writes in app/api.
 * @see docs/engineering/data-write-path.md
 */
/// <reference types="node" />
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  findSupabaseTableFromViolations,
  lineHasTableFrom,
} from "./write-path-boundary.ts";

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

test("[A-01] scanner flags camelCase and mixed-case .from table names", () => {
  assert.equal(lineHasTableFrom(`await svc.from('Waitlist').select('*')`), true);
  assert.equal(lineHasTableFrom(`supabase.from("UserProfiles").insert({})`), true);
  assert.equal(lineHasTableFrom(`supabase.storage.from('avatars').upload()`), false);
});
