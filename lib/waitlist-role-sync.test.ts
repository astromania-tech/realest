import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("waitlist sync stores a candidate role and does not write users.role", () => {
  const source = readFileSync("lib/reward-engine.ts", "utf8");
  const start = source.indexOf("export async function syncWaitlistContextToProfile");
  const end = source.indexOf("export async function getReferralSummaryForEmail");
  assert.ok(start !== -1 && end > start);
  const fn = source.slice(start, end);
  assert.match(fn, /candidate_role: candidateRole/);
  assert.match(fn, /waitlist_persona: persona/);
  assert.equal(fn.includes("prisma.users.update"), false);
  assert.equal(fn.includes("data: { role:"), false);
});
