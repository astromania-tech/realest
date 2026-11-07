/**
 * [A-01] Signup resolves waitlist candidate_role on the server, not via public GET.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { marketplaceSignupRole } from "./marketplace-signup-role.ts";
import { signupRoleFromChoices } from "./signup-waitlist-role.ts";

test("marketplaceSignupRole still clamps staff values", () => {
  assert.equal(marketplaceSignupRole("admin"), "user");
  assert.equal(marketplaceSignupRole("owner"), "owner");
});

test("[A-01] signup route resolves role from waitlist server-side", () => {
  const route = readFileSync("app/api/auth/signup/route.ts", "utf8");
  assert.match(route, /resolveSignupRoleFromWaitlist/);
  assert.doesNotMatch(route, /marketplaceSignupRole\(userType\)/);
});

test("an owner or agent click is not replaced by a seeker waitlist role", () => {
  assert.equal(signupRoleFromChoices("owner", "user"), "owner");
  assert.equal(signupRoleFromChoices("agent", "user"), "agent");
  assert.equal(signupRoleFromChoices("owner", "buyer_renter"), "owner");
  assert.equal(signupRoleFromChoices("user", "owner"), "owner");
  assert.equal(signupRoleFromChoices("user", null), "user");
  assert.equal(signupRoleFromChoices("admin", "agent"), "agent");
  assert.equal(marketplaceSignupRole("admin"), "user");
});

test("[A-01] signup writes the resolved role onto public.users", () => {
  const route = readFileSync("app/api/auth/signup/route.ts", "utf8");
  assert.match(route, /prisma\.users\.upsert/);
  assert.match(route, /role: signupRole/);
});

test("finished owner and agent accounts leave the seeker profile", () => {
  const middleware = readFileSync("lib/supabase/middleware.ts", "utf8");
  assert.match(middleware, /pathname === "\/profile"/);
  assert.match(middleware, /role === "owner" \? "\/owner" : "\/agent"/);
});

test("[A-01] register client does not trust public candidateRole", () => {
  const client = readFileSync(
    "app/(auth)/register/RegisterClient.tsx",
    "utf8",
  );
  assert.doesNotMatch(client, /waitlistData\.candidateRole/);
  assert.match(client, /resolveSignupRoleFromWaitlist|server-side/);
});
