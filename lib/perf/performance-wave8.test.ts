/**
 * Performance wave 8 contracts (Low leftovers):
 * - events page narrow select + live status
 * - favorites / my-inquiries / owner inquiries bounded
 * - campaign recipients preview capped; send pages recipients
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("events page uses narrow select and live verified listings", () => {
  const source = readFileSync("app/(public)/events/page.tsx", "utf8");
  assert.doesNotMatch(source, /\.select\(["']\*["']\)/);
  assert.match(source, /id, title, price, address, city/);
  assert.match(source, /\.eq\(["']status["'],\s*["']live["']\)/);
  assert.match(source, /\.limit\(12\)/);
  assert.match(source, /from ["']@\/components\/layout\/Header["']/);
});

test("favorites and my-inquiries pages cap client lists at 50", () => {
  const favorites = readFileSync(
    "app/(dashboard)/profile/favorites/page.tsx",
    "utf8",
  );
  const inquiries = readFileSync(
    "app/(dashboard)/profile/my-inquiries/page.tsx",
    "utf8",
  );
  assert.match(favorites, /\.limit\(50\)/);
  assert.match(inquiries, /\.limit\(50\)/);
});

test("owner inquiries page and API stay bounded", () => {
  const page = readFileSync("app/(dashboard)/owner/inquiries/page.tsx", "utf8");
  const api = readFileSync("app/api/dashboard/owner/inquiries/route.ts", "utf8");
  assert.match(page, /take:\s*50/);
  assert.doesNotMatch(page, /\.select\(["']\*["']\)/);
  assert.match(api, /Math\.min\(50/);
});

test("campaign recipients preview is capped and send pages audience", () => {
  const recipients = readFileSync(
    "app/api/admin/emails/campaigns/[id]/recipients/route.ts",
    "utf8",
  );
  const send = readFileSync(
    "app/api/admin/emails/campaigns/[id]/send/route.ts",
    "utf8",
  );
  assert.match(recipients, /take:\s*100/);
  assert.match(recipients, /truncated:\s*total > recipients\.length/);
  assert.match(send, /RECIPIENT_PAGE\s*=\s*500/);
  assert.match(send, /iterateWaitlistRecipients|AsyncGenerator/);
  assert.match(send, /for await \(const recipients of pages\)/);
  assert.doesNotMatch(
    send,
    /prisma\.waitlist\.findMany\(\{\s*\n?\s*where:\s*\{\s*status:\s*['"]active['"]\s*\},\s*\n?\s*select:\s*\{\s*email:\s*true/,
  );
});
