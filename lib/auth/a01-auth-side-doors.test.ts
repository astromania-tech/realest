/**
 * [A-01] Auth side-doors: resend is rate-limited; waitlist sync requires session email match;
 * duplicate reject is desk-gated like other listing decisions.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("[A-01] signup GET resend consumes a rate limit", () => {
  const route = readFileSync("app/api/auth/signup/route.ts", "utf8");
  assert.match(route, /consumeRateLimit/);
  assert.match(route, /signup_resend/);
});

test("[A-01] sync-waitlist-context requires session email match", () => {
  const route = readFileSync(
    "app/api/auth/sync-waitlist-context/route.ts",
    "utf8",
  );
  assert.match(route, /getAuthUser/);
  assert.match(route, /Email does not match the signed-in account/);
  assert.match(route, /id: user\.id/);
});

test("[A-01] signup syncs waitlist context server-side after createUser", () => {
  const route = readFileSync("app/api/auth/signup/route.ts", "utf8");
  assert.match(route, /syncWaitlistAfterSignup/);
  assert.match(route, /syncWaitlistContextToProfile/);
});

test("[A-01] duplicate reject requires desk decision role", () => {
  const route = readFileSync(
    "app/api/admin/validation/duplicates/[id]/route.ts",
    "utf8",
  );
  assert.match(route, /canMakeDeskDecision/);
});
