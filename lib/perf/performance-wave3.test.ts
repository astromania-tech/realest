/**
 * Performance wave 3 contracts:
 * - PropertyMap dynamically imported on search/detail (not in initial chunk)
 * - ComingSoonHero defers full-site Hero/Featured chunks
 * - map query narrow selects (no select *)
 * - inquiries + owner properties lists are bounded
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("search and detail pages dynamically import PropertyMap", () => {
  const search = readFileSync("app/(public)/search/SearchPageClient.tsx", "utf8");
  const property = readFileSync(
    "app/(public)/property/[id]/PropertyDetailClient.tsx",
    "utf8",
  );
  const listing = readFileSync(
    "app/(public)/listing/[id]/ListingDetailClient.tsx",
    "utf8",
  );

  for (const source of [search, property, listing]) {
    assert.match(source, /dynamic\(/);
    assert.match(source, /PropertyMap/);
    assert.doesNotMatch(
      source,
      /import \{ PropertyMap \} from ["']@\/components\/property\/PropertyMap["']/,
    );
  }
});

test("ComingSoonHero dynamically loads full-site reveal chunks", () => {
  const source = readFileSync("components/marketing/ComingSoonHero.tsx", "utf8");
  assert.match(source, /dynamic\(\s*\n?\s*\(\)\s*=>\s*import\(["']@\/components\/marketing\/HeroSection["']\)/);
  assert.match(source, /dynamic\(\s*\n?\s*\(\)\s*=>\s*import\(["']@\/components\/property\/FeaturedProperties["']\)/);
  assert.doesNotMatch(
    source,
    /import \{ HeroSection \} from ["']@\/components\/marketing["']/,
  );
  assert.doesNotMatch(
    source,
    /import \{ FeaturedProperties \} from ["']@\/components\/property["']/,
  );
});

test("usePropertyMap uses narrow select without phone or star columns", () => {
  const source = readFileSync("lib/hooks/usePropertyMap.ts", "utf8");
  assert.doesNotMatch(source, /property_details\s*\(\s*\*\s*\)/);
  assert.doesNotMatch(source, /property_media\s*\(\s*\*\s*\)/);
  assert.doesNotMatch(source, /\n\s+\*,\s*\n/);
  assert.doesNotMatch(source, /phone/);
  assert.match(source, /property_details \( metadata \)/);
  assert.match(source, /media_url/);
  assert.match(source, /return 200/);
});

test("inquiries GET is paginated with a hard take cap", () => {
  const source = readFileSync("app/api/inquiries/route.ts", "utf8");
  assert.match(source, /Math\.min\(50,/);
  assert.match(source, /skip,/);
  assert.match(source, /take,/);
});

test("owner properties list narrows relations and uses inquiry groupBy", () => {
  const source = readFileSync("app/api/properties/owner/route.ts", "utf8");
  assert.doesNotMatch(source, /property_details:\s*true/);
  assert.doesNotMatch(source, /property_media:\s*true/);
  assert.doesNotMatch(source, /property_documents:\s*true/);
  assert.match(source, /groupBy\(\{\s*\n?\s*by:\s*\["property_id"\]/);
  assert.match(source, /take:\s*6/);
  assert.match(source, /take:\s*20/);
});
