/**
 * [A-01] Signup must not mint staff/admin via userType / user_metadata.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  isMarketplaceSignupRole,
  marketplaceSignupRole,
} from "./marketplace-signup-role.ts";

test("[A-01] marketplace signup allowlist accepts only user|owner|agent", () => {
  assert.equal(isMarketplaceSignupRole("user"), true);
  assert.equal(isMarketplaceSignupRole("owner"), true);
  assert.equal(isMarketplaceSignupRole("agent"), true);
  assert.equal(isMarketplaceSignupRole("admin"), false);
  assert.equal(isMarketplaceSignupRole("reviewer"), false);
  assert.equal(isMarketplaceSignupRole("supervisor"), false);
  assert.equal(isMarketplaceSignupRole("team_leader"), false);
  assert.equal(isMarketplaceSignupRole("team_member"), false);
  assert.equal(isMarketplaceSignupRole(""), false);
  assert.equal(isMarketplaceSignupRole(null), false);
});

test("[A-01] staff and garbage userType collapse to user", () => {
  assert.equal(marketplaceSignupRole("admin"), "user");
  assert.equal(marketplaceSignupRole("reviewer"), "user");
  assert.equal(marketplaceSignupRole("team_member"), "user");
  assert.equal(marketplaceSignupRole("hacker"), "user");
  assert.equal(marketplaceSignupRole(undefined), "user");
  assert.equal(marketplaceSignupRole("owner"), "owner");
  assert.equal(marketplaceSignupRole("agent"), "agent");
});

test("[A-01] signup route writes only allowlisted marketplace role", () => {
  const route = readFileSync("app/api/auth/signup/route.ts", "utf8");
  assert.match(route, /marketplaceSignupRole/);
  assert.doesNotMatch(route, /user_type:\s*userType\s*\|\|\s*['\"]user['\"]/);
});

test("[A-01] handle_new_user migration clamps metadata to marketplace roles", () => {
  const sql = readFileSync(
    "supabase/migrations/20261022160000_signup_role_allowlist_and_profiles_rls.sql",
    "utf8",
  );
  assert.match(sql, /handle_new_user/);
  assert.match(sql, /IN \('user',\s*'owner',\s*'agent'\)/);
  assert.match(sql, /Public profiles are viewable by everyone/);
  assert.match(sql, /profiles_select_own/);
});
