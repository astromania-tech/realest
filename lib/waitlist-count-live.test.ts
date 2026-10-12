import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("the waitlist page reads the live active count", () => {
  const page = readFileSync("app/(email-links)/waitlist/page.tsx", "utf8");
  const client = readFileSync("app/(email-links)/waitlist/WaitlistClient.tsx", "utf8");
  assert.match(page, /export const dynamic = 'force-dynamic'/);
  assert.match(page, /initialTotal=\{stats\.active\}/);
  assert.match(client, /\/api\/waitlist\?stats=true/);
  assert.match(client, /data\.active/);
});
