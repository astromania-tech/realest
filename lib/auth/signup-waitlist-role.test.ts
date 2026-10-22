/**
 * [A-01] Signup resolves waitlist candidate_role on the server, not via public GET.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { marketplaceSignupRole } from "./marketplace-signup-role.ts";

test("marketplaceSignupRole still clamps staff values", () => {
  assert.equal(marketplaceSignupRole("admin"), "user");
  assert.equal(marketplaceSignupRole("owner"), "owner");
});

test("[A-01] signup route resolves role from waitlist server-side", () => {
  const route = readFileSync("app/api/auth/signup/route.ts", "utf8");
  assert.match(route, /resolveSignupRoleFromWaitlist/);
  assert.doesNotMatch(route, /marketplaceSignupRole\(userType\)/);
});

test("[A-01] register client does not trust public candidateRole", () => {
  const client = readFileSync(
    "app/(auth)/register/RegisterClient.tsx",
    "utf8",
  );
  assert.doesNotMatch(client, /waitlistData\.candidateRole/);
  assert.match(client, /resolveSignupRoleFromWaitlist|server-side/);
});
