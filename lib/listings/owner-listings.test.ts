import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  ownerListingMatchesFilter,
  ownerListingPriceSuffix,
  ownerListingStatusLabel,
  toOwnerListingCard,
} from "@/lib/listings/owner-listings";

test("owner listing filters use the real property statuses", () => {
  assert.equal(ownerListingMatchesFilter("live", "live"), true);
  assert.equal(ownerListingMatchesFilter("active", "live"), false);
  assert.equal(ownerListingMatchesFilter("pending_vetting", "review"), true);
  assert.equal(ownerListingMatchesFilter("pending_ml_validation", "review"), true);
  assert.equal(ownerListingMatchesFilter("draft", "review"), false);
  assert.equal(ownerListingStatusLabel("pending_vetting"), "Vetting");
  assert.equal(ownerListingPriceSuffix("for_rent", "annual"), "/year");
  assert.equal(ownerListingPriceSuffix("for_sale", "sale"), "");
});

test("owner listing cards count real inquiries and files", () => {
  const card = toOwnerListingCard({
    id: "11111111-1111-4111-8111-111111111111",
    title: "Lekki flat",
    address: "Admiralty Way",
    city: "Lagos",
    property_type: "apartment",
    listing_type: "for_rent",
    price_frequency: "annual",
    price: "2500000.00",
    status: "draft",
    verification_status: "pending",
    _count: { inquiries: 2, property_media: 4, property_documents: 1 },
  });
  assert.equal(card.price, 2500000);
  assert.equal(card.inquiries, 2);
  assert.equal(card.images_count, 4);
  assert.equal(card.documents_count, 1);
});

test("owner My Listings reads this owner's properties, not the sample cards", () => {
  const page = readFileSync("app/(dashboard)/owner/listings/page.tsx", "utf8");
  assert.match(page, /prisma\.properties\.findMany/);
  assert.match(page, /owner_id: owner\.id/);
  assert.doesNotMatch(page, /Modern 3BR Apartment/);
  assert.doesNotMatch(page, /setTimeout/);
});
