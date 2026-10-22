/**
 * Hot-path performance contracts: do not block waitlist join on full recompute;
 * public lookup is one narrow select; search/public/case queries stay bounded.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("waitlist join defers reward recompute with after()", () => {
  const source = readFileSync("app/api/waitlist/route.ts", "utf8");
  assert.match(source, /after\(\s*\(\)\s*=>\s*\n?\s*applyWaitlistJoinRewards/);
  assert.match(source, /select:\s*\{\s*status:\s*true\s*\}/);
  assert.doesNotMatch(source, /checkEmailWithPosition/);
});

test("search properties uses narrow select not include:true", () => {
  const source = readFileSync("app/api/search/properties/route.ts", "utf8");
  assert.match(source, /property_details:\s*\{\s*\n?\s*select:/);
  assert.doesNotMatch(source, /property_details:\s*true/);
});

test("public property API caps media and selects details columns", () => {
  const source = readFileSync(
    "app/api/properties/[id]/public/route.ts",
    "utf8",
  );
  assert.match(source, /take:\s*24/);
  assert.doesNotMatch(source, /property_details:\s*true/);
});

test("case detail and my-visits queries are bounded", () => {
  const source = readFileSync("lib/trust/load-case-view.ts", "utf8");
  assert.match(source, /take:\s*30/);
  assert.match(source, /limit 50/);
});
