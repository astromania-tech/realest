import assert from "node:assert/strict";
import test from "node:test";
import { parseNipostPostcode } from "@/lib/postcode/format";
import { lookupNipostPostcode } from "@/lib/postcode/nipost";
import { propertyDraftSchema, propertyListingSchema } from "@/lib/validations/property";

const sample = {
  data: {
    postcode: "LA-11-W06-TC-10",
    valid: true,
    administrative_address: {
      state_name: "LAGOS",
      lga_name: "ETI OSA",
      locality_name: "VICTORIA ISLAND",
      zone: "SOUTH WEST",
    },
    recent_house_address: { recent: "ADEOLA ODEKU, VICTORIA ISLAND" },
    building_use_status: "residential",
  },
};

test("parse accepts separators and rejects the old 6-digit code", () => {
  assert.equal(parseNipostPostcode("la 11 w06 tc 10")?.canonical, "LA-11-W06-TC-10");
  assert.equal(parseNipostPostcode("EK-01-A03-FK-01")?.canonical, "EK-01-A03-FK-01");
  assert.equal(parseNipostPostcode("569101"), null);
  assert.equal(parseNipostPostcode("LA-11-W06-TC"), null);
});

test("lookup sends the secret header and does not call NIPOST for a bad shape", async () => {
  let called = false;
  const bad = await lookupNipostPostcode("569101", {
    fetchImpl: async () => {
      called = true;
      return new Response("no");
    },
    apiKey: "nipost_test_secret",
  });
  assert.equal(bad.ok, false);
  assert.equal(bad.ok === false && bad.status, 400);
  assert.equal(called, false);

  const missing = await lookupNipostPostcode("LA-11-W06-TC-10", {
    apiKey: "  ",
    fetchImpl: async () => {
      throw new Error("should not fetch");
    },
  });
  assert.equal(missing.ok, false);
  assert.equal(missing.ok === false && missing.status, 503);

  let header = "";
  let url = "";
  const ok = await lookupNipostPostcode("la11w06tc10", {
    apiKey: "nipost_test_secret",
    baseUrl: "https://api.postcode.gov.ng/",
    fetchImpl: async (input, init) => {
      url = String(input);
      header = new Headers(init?.headers).get("X-API-Key") ?? "";
      return Response.json(sample);
    },
  });
  assert.equal(url, "https://api.postcode.gov.ng/v1/lookup?code=LA-11-W06-TC-10");
  assert.equal(header, "nipost_test_secret");
  assert.equal(ok.ok, true);
  if (ok.ok) {
    assert.equal(ok.lookup.stateName, "LAGOS");
    assert.equal(ok.lookup.recentHouseAddress, "ADEOLA ODEKU, VICTORIA ISLAND");
    assert.equal(ok.lookup.buildingUseStatus, "residential");
  }
});

test("lookup maps a credit failure without treating it as a valid code", async () => {
  const result = await lookupNipostPostcode("LA-11-W06-TC-10", {
    apiKey: "nipost_live_secret",
    fetchImpl: async () =>
      Response.json(
        { error: { code: "insufficient_credits", message: "not enough credits" } },
        { status: 402 },
      ),
  });
  assert.deepEqual(result, { ok: false, status: 402, message: "NIPOST credits are used up" });
});

test("listing schemas store a canonical NIPOST code and reject the old length", () => {
  const listing = propertyListingSchema.safeParse({
    title: "Three bedroom flat in Victoria Island",
    description: "A verified flat with borehole water, inverter, and a gated street in Victoria Island.",
    property_type: "apartment",
    listing_type: "for_rent",
    address: "12 Adeola Odeku",
    city: "Victoria Island",
    state: "Lagos",
    postal_code: "la-11-w06-tc-10",
    latitude: 6.4281,
    longitude: 3.4219,
    price: 2500000,
  });
  assert.equal(listing.success, true);
  if (listing.success) assert.equal(listing.data.postal_code, "LA-11-W06-TC-10");

  const old = propertyDraftSchema.safeParse({
    title: "Flat",
    property_type: "apartment",
    listing_type: "for_rent",
    price: 1000,
    address: "12 Adeola Odeku",
    city: "Victoria Island",
    postal_code: "569101",
  });
  assert.equal(old.success, false);
});
