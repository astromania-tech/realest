/**
 * Performance wave 4 contracts:
 * - buy/rent server-load marketplace cards (no client select *)
 * - search cards use next/image
 * - admin analytics aggregates instead of full-row pulls
 * - root layout preloads only critical fonts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("buy and rent pages load listings on the server with a narrow helper", () => {
  const buy = readFileSync("app/(public)/buy/page.tsx", "utf8");
  const rent = readFileSync("app/(public)/rent/page.tsx", "utf8");
  const loader = readFileSync("lib/listings/load-marketplace-listings.ts", "utf8");
  const buyClient = readFileSync("app/(public)/buy/BuyPageClient.tsx", "utf8");
  const rentClient = readFileSync("app/(public)/rent/RentPageClient.tsx", "utf8");

  assert.match(buy, /loadMarketplaceListings/);
  assert.match(rent, /loadMarketplaceListings/);
  assert.doesNotMatch(buy, /"use client"/);
  assert.doesNotMatch(rent, /"use client"/);
  assert.match(loader, /publicListingWhere/);
  assert.match(loader, /take:\s*1/);
  assert.doesNotMatch(buyClient, /select\("\*"\)/);
  assert.doesNotMatch(rentClient, /select\("\*"\)/);
  assert.doesNotMatch(rentClient, /status", "active"/);
  assert.match(buyClient, /₦/);
  assert.match(rentClient, /₦/);
});

test("search property cards use next/image with sizes", () => {
  const source = readFileSync("app/(public)/search/SearchPageClient.tsx", "utf8");
  assert.match(source, /from "next\/image"/);
  assert.match(source, /sizes=/);
  assert.doesNotMatch(source, /<img\s/);
});

test("admin analytics overview aggregates instead of findMany row dumps", () => {
  const source = readFileSync("app/api/admin/analytics/overview/route.ts", "utf8");
  assert.match(source, /groupBy\(/);
  assert.match(source, /aggregate\(/);
  assert.match(source, /date_trunc\('day'/);
  assert.doesNotMatch(
    source,
    /prisma\.profiles\.findMany\(\{\s*\n?\s*where:\s*\{\s*created_at/,
  );
  assert.doesNotMatch(
    source,
    /prisma\.properties\.findMany\(\{\s*\n?\s*where:\s*\{\s*created_at/,
  );
});

test("referral and poll analytics stay bounded or grouped", () => {
  const referrals = readFileSync(
    "app/api/admin/analytics/referrals/route.ts",
    "utf8",
  );
  const polls = readFileSync("app/api/admin/analytics/polls/route.ts", "utf8");
  assert.match(referrals, /take:\s*50/);
  assert.match(referrals, /take:\s*100/);
  assert.match(referrals, /referral_count:\s*\{\s*gt:\s*0\s*\}/);
  assert.match(referrals, /aggregate\(\{\s*_sum:\s*\{\s*referral_count/);
  assert.match(polls, /by:\s*\[['"]question_key['"],\s*['"]answer['"],\s*['"]ref['"]\]/);
  assert.doesNotMatch(polls, /findMany\(\{\s*\n?\s*select:\s*\{\s*question_key/);
});

test("root layout preloads only critical fonts", () => {
  const source = readFileSync("app/layout.tsx", "utf8");
  assert.match(source, /SpaceGrotesk-Regular/);
  assert.match(source, /Neulis_Neue_Regular/);
  assert.doesNotMatch(source, /SpaceGrotesk-Medium/);
  assert.doesNotMatch(source, /LufgaRegular/);
  assert.doesNotMatch(source, /JetBrainsMono-Regular/);
});
