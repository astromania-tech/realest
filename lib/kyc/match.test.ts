import assert from "node:assert/strict";
import test from "node:test";
import { companyClaimDigest, matchClaimToRegistry, normalizeCompanyName, normalizeDateOfBirth, normalizePersonName, personClaimDigest } from "@/lib/kyc/match";

const claim = { firstName: "Sarah", lastName: "Doe", dateOfBirth: "1988-04-04" };

test("person names and dates normalize without treating a different name as the same", () => {
  assert.equal(normalizePersonName("  SARAH  "), "sarah");
  assert.equal(normalizePersonName("O'Brien"), "o'brien");
  assert.equal(normalizePersonName("A"), null);
  assert.equal(normalizeDateOfBirth("1988-04-04T00:00:00.000Z"), "1988-04-04");
  assert.equal(normalizeDateOfBirth("1988-02-31"), null);
  assert.equal(normalizeCompanyName("Acme Limited"), "acme ltd");
  assert.equal(normalizeCompanyName("ACME LTD."), normalizeCompanyName("Acme Limited"));
  assert.notEqual(normalizeCompanyName("Acme Ventures"), normalizeCompanyName("Acme Limited"));
});

test("a registry hit matches only the same person fields", () => {
  const registry = { firstName: "SARAH", lastName: "Doe", dateOfBirth: "1988-04-04T00:00:00.000Z", companyName: null };
  assert.equal(matchClaimToRegistry("nin", { person: claim, companyName: null }, registry), "match");
  assert.equal(
    matchClaimToRegistry("bvn", { person: { ...claim, lastName: "Roe" }, companyName: null }, registry),
    "mismatch",
  );
  assert.equal(
    matchClaimToRegistry("nin", { person: claim, companyName: null }, { ...registry, dateOfBirth: null }),
    "incomplete",
  );
  assert.equal(personClaimDigest(claim), personClaimDigest({ firstName: "sarah", lastName: "DOE", dateOfBirth: "1988-04-04" }));
});

test("a company match ignores legal-suffix spelling and still requires the same name", () => {
  const registry = { firstName: null, lastName: null, dateOfBirth: null, companyName: "John Doe Inc" };
  assert.equal(
    matchClaimToRegistry("cac", { person: null, companyName: "John Doe Incorporated" }, registry),
    "match",
  );
  assert.equal(matchClaimToRegistry("cac", { person: null, companyName: "Jane Doe Inc" }, registry), "mismatch");
  assert.equal(matchClaimToRegistry("cac", { person: null, companyName: "John Doe Inc" }, { ...registry, companyName: null }), "incomplete");
  assert.equal(companyClaimDigest("John Doe Inc"), companyClaimDigest("John Doe Incorporated"));
});
