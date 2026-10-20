import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { clientAddress, rateLimitAllows, rateWindowStart } from "@/lib/http/rate-limit";

test("five hits in a window are allowed and the sixth is not", () => {
  assert.equal(rateLimitAllows(5, 5), true);
  assert.equal(rateLimitAllows(6, 5), false);
});

test("the window start is stable inside the same minute", () => {
  const start = rateWindowStart(new Date("2026-10-19T07:00:10.000Z"), 60_000);
  const later = rateWindowStart(new Date("2026-10-19T07:00:59.000Z"), 60_000);
  assert.equal(start.toISOString(), later.toISOString());
  assert.equal(clientAddress(new Headers({ "x-forwarded-for": "1.2.3.4, 5.6.7.8" })), "1.2.3.4");
});

test("public forms use the shared limiter", () => {
  for (const file of [
    "app/api/waitlist/route.ts",
    "app/api/referral/invite/route.ts",
    "app/api/inquiries/guest/route.ts",
  ]) {
    const source = readFileSync(file, "utf8");
    assert.match(source, /consumeRateLimit/);
    assert.equal(source.includes("new Map"), false);
  }
});
