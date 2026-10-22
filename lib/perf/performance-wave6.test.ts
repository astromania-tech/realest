/**
 * Performance wave 6 contracts:
 * - public property GET loads by viewer (no unbounded docs/inquiries for public)
 * - agent properties use groupBy + media take:1
 * - public catalog / explore narrow media and details
 * - admin vetting report aggregates; admin user detail bounded + parallel
 * - agent detail Promise.all; search/forms/layout imports stay light
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("public property GET scopes documents and inquiries to private viewers", () => {
  const source = readFileSync("app/api/properties/[id]/route.ts", "utf8");
  assert.match(source, /take:\s*24/);
  assert.match(source, /privateViewer/);
  assert.match(source, /\.\.\.\(privateViewer/);
  assert.match(source, /property_documents:[\s\S]*?take:\s*50/);
  assert.match(source, /inquiries:[\s\S]*?take:\s*50/);
  assert.doesNotMatch(source, /property_media:\s*true/);
  assert.doesNotMatch(source, /property_documents:\s*true/);
});

test("agent properties list uses status groupBy and media take 1", () => {
  const source = readFileSync("app/api/agents/[id]/properties/route.ts", "utf8");
  assert.match(source, /groupBy\(\{\s*\n?\s*by:\s*\[["']status["']\]/);
  assert.match(source, /take:\s*1/);
  assert.doesNotMatch(
    source,
    /findMany\(\{\s*\n?\s*where:\s*\{\s*agent_id:\s*agentRow\.id\s*\},\s*\n?\s*select:\s*\{\s*status:\s*true/,
  );
});

test("public properties catalog and explore keep media/details narrow", () => {
  const catalog = readFileSync("app/api/properties/route.ts", "utf8");
  const explore = readFileSync("app/api/properties/explore/route.ts", "utf8");
  assert.doesNotMatch(catalog, /property_details:\s*true/);
  assert.match(catalog, /property_details:\s*\{\s*\n?\s*select:\s*\{\s*metadata:\s*true/);
  assert.match(catalog, /property_media:\s*\{\s*\n?\s*select:/);
  assert.doesNotMatch(explore, /property_media:\s*true/);
  assert.match(explore, /take:\s*1/);
});

test("admin vetting report aggregates instead of full-period dumps", () => {
  const source = readFileSync("app/api/admin/reports/vetting/route.ts", "utf8");
  assert.match(source, /groupBy\(\{\s*\n?\s*by:\s*\[['"]status['"]\]/);
  assert.match(source, /admin_audit_log\.groupBy/);
  assert.match(source, /Promise\.all/);
  assert.match(source, /take:\s*100/);
});

test("admin user detail bounds properties and parallelizes fetches", () => {
  const source = readFileSync("app/api/admin/users/[id]/route.ts", "utf8");
  assert.match(source, /Promise\.all/);
  assert.match(source, /groupBy\(\{\s*\n?\s*by:\s*\[['"]status['"]\]/);
  assert.match(source, /take:\s*20/);
});

test("agent detail selects card fields and loads properties with reviews in parallel", () => {
  const source = readFileSync("app/api/agents/[id]/route.ts", "utf8");
  assert.match(source, /Promise\.all/);
  assert.match(source, /select:\s*\{\s*\n?\s*id:\s*true,\s*\n?\s*verified:\s*true/);
  assert.doesNotMatch(source, /include:\s*\{\s*\n?\s*profiles:/);
});

test("search and featured avoid fat barrels on hot public paths", () => {
  const search = readFileSync(
    "app/(public)/search/SearchPageClient.tsx",
    "utf8",
  );
  const featured = readFileSync(
    "components/property/FeaturedProperties.tsx",
    "utf8",
  );
  const buy = readFileSync("app/(public)/buy/BuyPageClient.tsx", "utf8");
  const rent = readFileSync("app/(public)/rent/RentPageClient.tsx", "utf8");

  assert.match(
    search,
    /from ["']@\/components\/patterns\/forms\/AdvancedSearchForm["']/,
  );
  assert.doesNotMatch(search, /from ["']@\/components\/patterns\/forms["']/);
  assert.match(featured, /from ["']@\/components\/realest\/badges["']/);
  assert.doesNotMatch(featured, /from ["']@\/components\/realest["']/);
  for (const source of [search, buy, rent]) {
    assert.match(source, /from ["']@\/components\/layout\/Header["']/);
    assert.match(source, /from ["']@\/components\/layout\/Footer["']/);
    assert.doesNotMatch(source, /from ["']@\/components\/layout["']/);
  }
});
