/**
 * Performance wave 5 contracts:
 * - saved-properties bounded + narrow select
 * - admin metric route aggregates via date_trunc (no findMany dumps)
 * - FeaturedProperties narrow columns; property barrel drops PropertyMap
 * - owner/agent dashboards narrow + parallel
 * - dashboard listings capped with media take:1 and inquiry _count
 * - property/listing detail galleries use next/image
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("saved-properties GET is paginated with narrow property select", () => {
  const source = readFileSync("app/api/saved-properties/route.ts", "utf8");
  assert.match(source, /Math\.min\(50/);
  assert.match(source, /skip/);
  assert.match(source, /take:\s*1/);
  assert.doesNotMatch(source, /property_details:\s*true/);
  assert.doesNotMatch(source, /property_media:\s*true/);
});

test("admin metric analytics aggregates with date_trunc instead of findMany dumps", () => {
  const source = readFileSync(
    "app/api/admin/analytics/[metric]/route.ts",
    "utf8",
  );
  assert.match(source, /date_trunc\('/);
  assert.match(source, /\$queryRaw/);
  assert.doesNotMatch(
    source,
    /prisma\.profiles\.findMany\(\{\s*\n?\s*where:\s*\{\s*created_at/,
  );
  assert.doesNotMatch(
    source,
    /prisma\.properties\.findMany\(\{\s*\n?\s*where:\s*\{\s*created_at/,
  );
  assert.doesNotMatch(
    source,
    /prisma\.inquiries\.findMany\(\{\s*\n?\s*where:\s*\{\s*created_at/,
  );
});

test("FeaturedProperties and property barrel stay light", () => {
  const featured = readFileSync(
    "components/property/FeaturedProperties.tsx",
    "utf8",
  );
  const barrel = readFileSync("components/property/index.ts", "utf8");
  const home = readFileSync("app/page.tsx", "utf8");

  assert.doesNotMatch(featured, /\.select\("\*"\)/);
  assert.match(featured, /id, title, price/);
  assert.doesNotMatch(barrel, /export \{[^}]*PropertyMap/);
  assert.doesNotMatch(barrel, /from ["'].*PropertyMap["']/);
  assert.doesNotMatch(barrel, /mapUtils/);
  assert.match(home, /@\/components\/property\/FeaturedProperties/);
});

test("owner dashboard narrows selects and parallelizes properties with inquiries", () => {
  const source = readFileSync("app/(dashboard)/owner/page.tsx", "utf8");
  assert.match(source, /Promise\.all/);
  assert.doesNotMatch(source, /\.select\("\*"\)/);
  assert.match(source, /\.limit\(50\)/);
  assert.match(source, /id, title, price, address, city/);
});

test("dashboard listings GET caps limit and uses media take + inquiry count", () => {
  const source = readFileSync("app/api/dashboard/listings/route.ts", "utf8");
  assert.match(source, /Math\.min\(50/);
  assert.match(source, /take:\s*1/);
  assert.match(source, /_count:\s*\{\s*select:\s*\{\s*inquiries:\s*true/);
  assert.doesNotMatch(source, /property_media:\s*true/);
  assert.doesNotMatch(source, /inquiries:\s*\{\s*select:\s*\{\s*id:\s*true/);
});

test("agent dashboard narrows profile/agent selects and parallelizes fetches", () => {
  const source = readFileSync("app/(dashboard)/agent/page.tsx", "utf8");
  assert.match(source, /Promise\.all/);
  assert.doesNotMatch(
    source,
    /\.from\("profiles"\)\s*\n?\s*\.select\("\*"\)/,
  );
  assert.doesNotMatch(
    source,
    /\.from\("agents"\)\s*\n?\s*\.select\("\*"\)/,
  );
  assert.match(source, /id, full_name, avatar_url/);
});

test("property and listing detail galleries use next/image with sizes", () => {
  const listing = readFileSync(
    "app/(public)/listing/[id]/ListingDetailClient.tsx",
    "utf8",
  );
  const property = readFileSync(
    "app/(public)/property/[id]/PropertyDetailClient.tsx",
    "utf8",
  );
  for (const source of [listing, property]) {
    assert.match(source, /from "next\/image"/);
    assert.match(source, /sizes=/);
    assert.doesNotMatch(source, /<img\s/);
  }
});
