import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("saving a draft listing does not redeem the first-listing waiver", () => {
  const listings = readFileSync("app/api/dashboard/listings/route.ts", "utf8");
  const redeemRoute = readFileSync("app/api/rewards/redeem-first-listing-waiver/route.ts", "utf8");
  assert.equal(listings.includes("redeemFirstListingWaiver"), false);
  assert.equal(redeemRoute.includes("redeemFirstListingWaiver"), false);
  assert.match(listings, /Listing fee is not charged yet/);
  assert.match(redeemRoute, /Listing fee is not charged yet/);
});
