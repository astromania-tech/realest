/**
 * [A-01] Public waitlist email lookup is existence + status only.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { publicWaitlistLookupProjection } from "./waitlist-public-lookup.ts";

test("publicWaitlistLookupProjection omits name role and queue fields", () => {
  assert.deepEqual(publicWaitlistLookupProjection({ exists: false }), {
    exists: false,
  });
  assert.deepEqual(
    publicWaitlistLookupProjection({ exists: true, status: "active" }),
    { exists: true, status: "active" },
  );
});

test("[A-01] waitlist GET uses public projection and rate-limits stats/delete", () => {
  const source = readFileSync("app/api/waitlist/route.ts", "utf8");
  assert.match(source, /publicWaitlistLookupProjection/);
  assert.match(source, /waitlist_lookup/);
  assert.match(source, /waitlist_stats/);
  assert.match(source, /waitlist_unsubscribe/);
  assert.doesNotMatch(source, /firstName:\s*emailCheck\.firstName/);
  assert.doesNotMatch(source, /candidateRole:\s*emailCheck\.candidateRole/);
  assert.doesNotMatch(source, /position:\s*emailCheck\.position/);
  assert.doesNotMatch(source, /Waitlist API is working/);
});
