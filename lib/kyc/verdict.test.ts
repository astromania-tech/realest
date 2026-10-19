import assert from "node:assert/strict";
import test from "node:test";
import { normalizeIdentityNumber, verdictFromHttp, verdictFromProvider } from "@/lib/kyc/verdict";

const personClaim = { firstName: "Sarah", lastName: "Doe", dateOfBirth: "1988-04-04" };

test("NIN and BVN must be 11 digits and CAC must carry a registry prefix", () => {
  assert.equal(normalizeIdentityNumber("nin", "1234 5678 901"), "12345678901");
  assert.equal(normalizeIdentityNumber("bvn", "1234567890"), null);
  assert.equal(normalizeIdentityNumber("cac", "rc 1234567"), "RC1234567");
  assert.equal(normalizeIdentityNumber("cac", "1234567"), null);
});

test("found with a provider reference approves a person only when the details match", () => {
  const missing = verdictFromProvider({
    idType: "nin",
    providerStatus: "found",
    companyStatus: null,
    referenceId: "yv_1",
  });
  assert.equal(missing.action, "unavailable");
  const matched = verdictFromProvider({
    idType: "nin",
    providerStatus: "found",
    companyStatus: null,
    referenceId: "yv_1",
    detailMatch: "match",
    idImageMatch: "match",
  });
  assert.equal(matched.action, "approved");
  const photoMissing = verdictFromProvider({
    idType: "nin",
    providerStatus: "found",
    companyStatus: null,
    referenceId: "yv_1",
    detailMatch: "match",
  });
  assert.equal(photoMissing.action, "unavailable");
  const mismatch = verdictFromProvider({
    idType: "nin",
    providerStatus: "found",
    companyStatus: null,
    referenceId: "yv_1",
    detailMatch: "mismatch",
  });
  assert.equal(mismatch.action, "rejected");
  if (mismatch.action === "rejected") assert.equal(mismatch.reason, "details_mismatch");
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
      detailMatch: "match",
    }).action,
    "approved",
  );
  assert.equal(
    verdictFromProvider({
      idType: "cac",
      providerStatus: "found",
      companyStatus: "ACTIVE",
      referenceId: "yv_cac",
    }).action,
    "unavailable",
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
  const verdict = verdictFromHttp(
    "nin",
    402,
    {
      success: false,
      statusCode: 402,
      message: "Insufficient fund",
      data: {},
    },
    { person: personClaim, companyName: null },
  );
  assert.equal(verdict.action, "unavailable");
});

test("HTTP 200 found maps through the response envelope only when the registry fields match", () => {
  const incomplete = verdictFromHttp(
    "bvn",
    200,
    {
      success: true,
      data: { id: "646b5608427a7e688e3ef633", status: "found", firstName: "Sarah", mobile: "08000000000" },
    },
    { person: personClaim, companyName: null },
  );
  assert.equal(incomplete.action, "unavailable");

  const matched = verdictFromHttp(
    "bvn",
    200,
    {
      success: true,
      data: {
        id: "646b5608427a7e688e3ef633",
        status: "found",
        firstName: "SARAH",
        lastName: "Doe",
        dateOfBirth: "1988-04-04",
        dataValidation: false,
        selfieValidation: false,
        validations: { selfie: { selfieVerification: { match: true, confidenceLevel: 90, threshold: 80 } } },
      },
    },
    { person: personClaim, companyName: null },
  );
  assert.deepEqual(matched, { action: "approved", referenceId: "646b5608427a7e688e3ef633" });

  const photoMiss = verdictFromHttp(
    "bvn",
    200,
    {
      success: true,
      data: {
        id: "646b5608427a7e688e3ef633",
        status: "found",
        firstName: "SARAH",
        lastName: "Doe",
        dateOfBirth: "1988-04-04",
        selfieValidation: true,
        validations: { selfie: { selfieVerification: { match: false, confidenceLevel: 10, threshold: 80 } } },
      },
    },
    { person: personClaim, companyName: null },
  );
  assert.equal(photoMiss.action, "rejected");
  if (photoMiss.action === "rejected") assert.equal(photoMiss.reason, "id_image_mismatch");

  const fuzzy = verdictFromHttp(
    "bvn",
    200,
    {
      success: true,
      data: {
        id: "646b5608427a7e688e3ef633",
        status: "found",
        firstName: "Sarah",
        lastName: "Roe",
        dateOfBirth: "1988-04-04",
        dataValidation: true,
        allValidationPassed: true,
      },
    },
    { person: personClaim, companyName: null },
  );
  assert.equal(fuzzy.action, "rejected");
  if (fuzzy.action === "rejected") assert.equal(fuzzy.reason, "details_mismatch");
});
