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
