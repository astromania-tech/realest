/**
 * Middleware should not Auth-round-trip public marketing/search/waitlist paths.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { middlewareNeedsSession } from "./middleware-auth-paths.ts";

test("middlewareNeedsSession is true for guest and protected shells", () => {
  assert.equal(middlewareNeedsSession("/login"), true);
  assert.equal(middlewareNeedsSession("/admin/validation"), true);
  assert.equal(middlewareNeedsSession("/api/auth/signup"), true);
  assert.equal(middlewareNeedsSession("/api/admin/users"), true);
});

test("middlewareNeedsSession is false for public APIs and marketing", () => {
  assert.equal(middlewareNeedsSession("/api/waitlist"), false);
  assert.equal(middlewareNeedsSession("/api/search/properties"), false);
  assert.equal(middlewareNeedsSession("/"), false);
  assert.equal(middlewareNeedsSession("/search"), false);
  assert.equal(middlewareNeedsSession("/property/abc"), false);
});

test("middleware uses its own getUser and skips when session not needed", () => {
  const source = readFileSync(
    new URL("./middleware.ts", import.meta.url),
    "utf8",
  );
  assert.match(source, /middlewareNeedsSession/);
  assert.match(source, /supabase\.auth\.getUser/);
  assert.doesNotMatch(source, /getAuthUser/);
});
