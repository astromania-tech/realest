import assert from "node:assert/strict";
import test from "node:test";
import { normalizeIdentityNumber, verdictFromHttp, verdictFromProvider } from "@/lib/kyc/verdict";

test("NIN and BVN must be 11 digits and CAC must carry a registry prefix", () => {
  assert.equal(normalizeIdentityNumber("nin", "1234 5678 901"), "12345678901");
  assert.equal(normalizeIdentityNumber("bvn", "1234567890"), null);
  assert.equal(normalizeIdentityNumber("cac", "rc 1234567"), "RC1234567");
  assert.equal(normalizeIdentityNumber("cac", "1234567"), null);
});

test("found with a provider reference approves a person", () => {
  const verdict = verdictFromProvider({
    idType: "nin",
    providerStatus: "found",
    companyStatus: null,
    referenceId: "yv_1",
  });
  assert.equal(verdict.action, "approved");
});

test("not_found rejects and an unknown status approves nothing", () => {
  assert.equal(
    verdictFromProvider({ idType: "bvn", providerStatus: "not_found", companyStatus: null, referenceId: "yv_2" }).action,
    "rejected",
  );
  assert.equal(
    verdictFromProvider({ idType: "nin", providerStatus: "review", companyStatus: null, referenceId: "yv_3" }).action,
    "unavailable",
  );
  assert.equal(
    verdictFromProvider({ idType: "nin", providerStatus: "found", companyStatus: null, referenceId: null }).action,
    "unavailable",
  );
});

test("CAC found approves only an ACTIVE company", () => {
  assert.equal(
    verdictFromProvider({
      idType: "cac",
      providerStatus: "found",
      companyStatus: "ACTIVE",
      referenceId: "yv_cac",
    }).action,
    "approved",
  );
  const inactive = verdictFromProvider({
    idType: "cac",
    providerStatus: "found",
    companyStatus: "inactive",
    referenceId: "yv_cac",
  });
  assert.equal(inactive.action, "rejected");
  if (inactive.action === "rejected") assert.equal(inactive.reason, "company_not_active");
  assert.equal(
    verdictFromProvider({ idType: "cac", providerStatus: "found", companyStatus: null, referenceId: "yv_cac" }).action,
    "unavailable",
  );
});

test("a failed HTTP call does not become an approval when the body has no terminal status", () => {
  const verdict = verdictFromHttp("nin", 402, {
    success: false,
    statusCode: 402,
    message: "Insufficient fund",
    data: {},
  });
  assert.equal(verdict.action, "unavailable");
});

test("HTTP 200 found maps through the response envelope", () => {
  const verdict = verdictFromHttp("bvn", 200, {
    success: true,
    data: { id: "646b5608427a7e688e3ef633", status: "found", firstName: "Sarah", mobile: "08000000000" },
  });
  assert.deepEqual(verdict, { action: "approved", referenceId: "646b5608427a7e688e3ef633" });
});
