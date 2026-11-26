/**
 * [A-01] Stale getRedirectUrl / hasRole in lib/auth.ts must stay gone.
 * Login homes use postLoginHomePath (full UserRole) in lib/auth/roles.ts.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { postLoginHomePath } from "./roles.ts";

test("[A-01] lib/auth.ts no longer exports getRedirectUrl or hasRole", () => {
  const source = readFileSync(new URL("../auth.ts", import.meta.url), "utf8");
  assert.doesNotMatch(source, /export function getRedirectUrl/);
  assert.doesNotMatch(source, /export async function hasRole/);
});

test("[RMVP-80] onboarding routing reads the role from public.users", () => {
  const source = readFileSync(
    new URL("../../app/onboarding/layout.tsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /prisma\.users\.findUnique\(/);
  assert.match(source, /select:\s*\{\s*role:\s*true\s*\}/);
  assert.match(source, /const role = userRow\?\.role \?\? null/);
  assert.doesNotMatch(source, /user_metadata|app_metadata/);
});

test("[RMVP-80] auth profile helper maps the role from public.users.role", () => {
  const source = readFileSync(new URL("../auth.ts", import.meta.url), "utf8");
  const start = source.indexOf("export async function getUserProfile(");
  const end = source.indexOf("/**\n * Sign in with email and password", start);
  assert.ok(start >= 0, "getUserProfile helper exists");
  assert.ok(end > start, "getUserProfile helper has a clear boundary");

  const profileHelper = source.slice(start, end);
  assert.match(profileHelper, /\.from\("users"\)/);
  assert.match(profileHelper, /\.select\("id, email, phone, full_name, avatar_url, role"\)/);
  assert.match(profileHelper, /user_type:\s*userData\.role/);
  assert.doesNotMatch(profileHelper, /user_metadata|app_metadata/);
});

test("[A-01] postLoginHomePath covers Connect staff", () => {
  assert.equal(postLoginHomePath("reviewer"), "/admin/validation");
  assert.equal(postLoginHomePath("supervisor"), "/admin/validation/field");
  assert.equal(postLoginHomePath("team_leader"), "/admin/validation/field");
  assert.equal(postLoginHomePath("team_member"), "/admin/validation/my-visits");
  assert.equal(postLoginHomePath("admin"), "/admin");
  assert.equal(postLoginHomePath("owner"), "/owner");
  assert.equal(postLoginHomePath("agent"), "/agent");
  assert.equal(postLoginHomePath("user"), "/profile");
});
