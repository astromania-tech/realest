/**
 * Performance wave 2 contracts:
 * - public property/listing: one shared loader, no client re-fetch
 * - useUser: narrow selects (no select *)
 * - admin properties queue: bounded take + narrow select
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("public property pages use cached loader and pass initial props", () => {
  const loader = readFileSync("lib/listings/load-public-property.ts", "utf8");
  const propertyPage = readFileSync("app/(public)/property/[id]/page.tsx", "utf8");
  const listingPage = readFileSync("app/(public)/listing/[id]/page.tsx", "utf8");
  const propertyClient = readFileSync(
    "app/(public)/property/[id]/PropertyDetailClient.tsx",
    "utf8",
  );
  const listingClient = readFileSync(
    "app/(public)/listing/[id]/ListingDetailClient.tsx",
    "utf8",
  );
  const api = readFileSync("app/api/properties/[id]/public/route.ts", "utf8");

  assert.match(loader, /cache\(/);
  assert.match(loader, /export const loadPublicPropertyDetail/);
  assert.match(propertyPage, /loadPublicPropertyDetail\(id, \"owner\"\)/);
  assert.match(listingPage, /loadPublicPropertyDetail\(id, \"agent\"\)/);
  assert.match(propertyPage, /initialProperty=/);
  assert.match(listingPage, /initialProperty=/);
  assert.match(api, /loadPublicPropertyDetail/);
  assert.doesNotMatch(propertyClient, /fetch\(`\/api\/properties/);
  assert.doesNotMatch(listingClient, /fetch\(`\/api\/properties/);
});

test("useUser fetches narrow profile/owner/agent columns", () => {
  const source = readFileSync("lib/hooks/useUser.tsx", "utf8");
  assert.doesNotMatch(source, /\.select\("\*"\)/);
  assert.match(source, /id, email, full_name, phone, bio, avatar_url/);
  assert.match(source, /id, business_name, property_types/);
  assert.match(source, /id, license_number, agency_name/);
});

test("admin properties GET is bounded and narrow", () => {
  const source = readFileSync("app/api/admin/properties/route.ts", "utf8");
  assert.match(source, /take,/);
  assert.match(source, /Math\.min\(Math\.trunc\(takeRaw\), 100\)/);
  assert.match(source, /property_media: \{\s*\n?\s*select:/);
  assert.match(source, /take:\s*6/);
  assert.match(source, /take:\s*20/);
  assert.doesNotMatch(source, /property_details:\s*true/);
  assert.doesNotMatch(source, /property_media:\s*true/);
  assert.doesNotMatch(source, /property_documents:\s*true/);
  assert.doesNotMatch(source, /phone:\s*true/);
});
