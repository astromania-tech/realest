import assert from "node:assert/strict";
import test from "node:test";
import { kycIdImagePath, type IdImageSaver } from "@/lib/kyc/id-image-store";
import { memoryKycStore } from "@/lib/kyc/memory-store";
import { resolveYouverifyBaseUrl, submitYouverifyIdentity } from "@/lib/kyc/submit";
import { YOUVERIFY_SANDBOX_URL } from "@/lib/kyc/types";

const ownerNin = "12345678901";
const ownerImage =
  "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=";

function memoryImageSaver(): IdImageSaver & { calls: number } {
  return {
    calls: 0,
    async save(input) {
      this.calls += 1;
      const path = kycIdImagePath(input.userId, input.requestId, input.extension);
      if (!path) throw new Error("bad path");
      return { path };
    },
  };
}
const ownerClaim = {
  firstName: "Sarah",
  lastName: "Doe",
  dateOfBirth: "1988-04-04",
};

function foundResponse(overrides: Record<string, unknown> = {}) {
  return new Response(
    JSON.stringify({
      success: true,
      data: {
        id: "yv_found",
        status: "found",
        firstName: "SARAH",
        lastName: "Doe",
        dateOfBirth: "1988-04-04",
        mobile: "08000000000",
        idNumber: ownerNin,
        image: "data:image/jpeg;base64,AAAA",
        dataValidation: true,
        validations: {
          selfie: { selfieVerification: { match: true, confidenceLevel: 96, threshold: 80 } },
        },
        ...overrides,
      },
    }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
}

test("an unset base URL stays on the Youverify sandbox host", () => {
  assert.equal(resolveYouverifyBaseUrl({}), YOUVERIFY_SANDBOX_URL);
  assert.equal(resolveYouverifyBaseUrl({ YOUVERIFY_BASE_URL: "https://evil.example" }), null);
});

test("a found NIN writes an approved row and does not store the identity number", async () => {
  const store = memoryKycStore();
  let sentUrl = "";
  let sentToken = "";
  let sentBody = "";
  const result = await submitYouverifyIdentity(
    { userId: "user_1", role: "owner", idType: "nin", idNumber: ownerNin, consent: true, ...ownerClaim, idImageBase64: ownerImage },
    {
      store,
      env: { YOUVERIFY_SECRET_KEY: "sandbox-secret" },
      newId: () => "req_1",
      saveIdImage: memoryImageSaver(),
      fetchImpl: async (input, init) => {
        sentUrl = String(input);
        const headers = init?.headers as Record<string, string>;
        sentToken = headers.token;
        sentBody = String(init?.body);
        return foundResponse();
      },
    },
  );
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.status, "approved");
    assert.equal(result.personBadge, "verified");
  }
  assert.equal(sentUrl, `${YOUVERIFY_SANDBOX_URL}/v2/api/identity/ng/nin`);
  assert.equal(sentToken, "sandbox-secret");
  assert.match(sentBody, /"isSubjectConsent":true/);
  assert.match(sentBody, /"firstName":"Sarah"/);
  assert.match(sentBody, /"dateOfBirth":"1988-04-04"/);
  const saved = JSON.stringify(store.rows[0]);
  assert.equal(saved.includes(ownerNin), false);
  assert.equal(saved.includes("Sarah"), false);
  assert.equal(saved.includes("SARAH"), false);
  assert.equal(saved.includes("Doe"), false);
  assert.equal(saved.includes("08000000000"), false);
  assert.equal(saved.includes(ownerImage.slice(0, 24)), false);
  assert.equal(store.rows[0]?.idImagePath, "user_1/req_1.jpg");
  assert.match(sentBody, /"selfie":\{"image":/);
  assert.equal(store.rows[0]?.idLast4, "8901");
  assert.equal(store.rows[0]?.provider, "youverify");
  assert.equal(store.rows[0]?.referenceId, "yv_found");
});

test("a storage failure writes no KYC row", async () => {
  const store = memoryKycStore();
  const result = await submitYouverifyIdentity(
    { userId: "user_1", role: "owner", idType: "nin", idNumber: ownerNin, consent: true, ...ownerClaim, idImageBase64: ownerImage },
    {
      store,
      env: { YOUVERIFY_SECRET_KEY: "sandbox-secret" },
      saveIdImage: {
        async save() {
          throw new Error("bucket down");
        },
      },
      fetchImpl: async () => foundResponse(),
    },
  );
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.status, 503);
  assert.equal(store.rows.length, 0);
});

test("a found record whose ID photo does not match is rejected and the upload is not stored", async () => {
  const store = memoryKycStore();
  const result = await submitYouverifyIdentity(
    { userId: "user_1", role: "owner", idType: "nin", idNumber: ownerNin, consent: true, ...ownerClaim, idImageBase64: ownerImage },
    {
      store,
      env: { YOUVERIFY_SECRET_KEY: "sandbox-secret" },
      saveIdImage: memoryImageSaver(),
      fetchImpl: async () =>
        foundResponse({
          validations: {
            selfie: { selfieVerification: { match: false, confidenceLevel: 12, threshold: 80 } },
          },
          selfieValidation: true,
        }),
    },
  );
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.status, "rejected");
    assert.equal(result.reason, "id_image_mismatch");
  }
  assert.equal(JSON.stringify(store.rows[0]).includes(ownerImage.slice(0, 24)), false);
});

test("a person check without an ID photo does not call Youverify", async () => {
  const store = memoryKycStore();
  let called = false;
  const result = await submitYouverifyIdentity(
    { userId: "user_1", role: "owner", idType: "nin", idNumber: ownerNin, consent: true, ...ownerClaim },
    {
      store,
      env: { YOUVERIFY_SECRET_KEY: "sandbox-secret" },
      fetchImpl: async () => {
        called = true;
        return foundResponse();
      },
    },
  );
  assert.equal(called, false);
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.status, 400);
  assert.equal(store.rows.length, 0);
});

test("a found record whose name does not match is rejected and stores neither name", async () => {
  const store = memoryKycStore();
  const result = await submitYouverifyIdentity(
    { userId: "user_1", role: "owner", idType: "nin", idNumber: ownerNin, consent: true, ...ownerClaim, idImageBase64: ownerImage },
    {
      store,
      env: { YOUVERIFY_SECRET_KEY: "sandbox-secret" },
      saveIdImage: memoryImageSaver(),
      fetchImpl: async () => foundResponse({ lastName: "Roe", dataValidation: true, allValidationPassed: true }),
    },
  );
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.status, "rejected");
    assert.equal(result.reason, "details_mismatch");
    assert.equal(result.personBadge, "rejected");
  }
  const saved = JSON.stringify(store.rows[0]);
  assert.equal(saved.includes("Sarah"), false);
  assert.equal(saved.includes("Roe"), false);
  assert.equal(saved.includes(ownerNin), false);
});

test("a found record missing the date of birth writes nothing", async () => {
  const store = memoryKycStore();
  const result = await submitYouverifyIdentity(
    { userId: "user_1", role: "owner", idType: "nin", idNumber: ownerNin, consent: true, ...ownerClaim, idImageBase64: ownerImage },
    {
      store,
      env: { YOUVERIFY_SECRET_KEY: "sandbox-secret" },
      fetchImpl: async () => foundResponse({ dateOfBirth: null }),
    },
  );
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.status, 502);
  assert.equal(store.rows.length, 0);
});

test("an agent CAC check that is not active is stored as rejected", async () => {
  const store = memoryKycStore();
  const result = await submitYouverifyIdentity(
    { userId: "agent_1", role: "agent", idType: "cac", idNumber: "RC1234567", consent: true, companyName: "Fake Ltd" },
    {
      store,
      env: { YOUVERIFY_SECRET_KEY: "sandbox-secret", YOUVERIFY_BASE_URL: "https://api.youverify.co" },
      fetchImpl: async (input, init) => {
        assert.equal(String(input), "https://api.youverify.co/v2/api/verifications/ng/company/basic");
        const body = JSON.parse(String(init?.body));
        assert.equal(body.registrationNumber, "RC1234567");
        assert.equal(body.isConsent, true);
        return new Response(
          JSON.stringify({ success: true, data: { id: "yv_co", status: "found", companyStatus: "INACTIVE", name: "Fake Ltd" } }),
          { status: 200 },
        );
      },
    },
  );
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.status, "rejected");
    assert.equal(result.personBadge, "rejected");
    assert.equal(result.reason, "company_not_active");
  }
  assert.equal(store.rows[0]?.rejectionReason, "company_not_active");
  assert.equal(JSON.stringify(store.rows[0]).includes("Fake Ltd"), false);
});

test("an owner cannot submit CAC and a failed provider call writes nothing", async () => {
  const store = memoryKycStore();
  const mismatch = await submitYouverifyIdentity(
    { userId: "user_1", role: "owner", idType: "cac", idNumber: "RC1234567", consent: true },
    { store, env: { YOUVERIFY_SECRET_KEY: "sandbox-secret" }, fetchImpl: async () => foundResponse() },
  );
  assert.equal(mismatch.ok, false);
  assert.equal(store.rows.length, 0);

  const down = await submitYouverifyIdentity(
    { userId: "user_1", role: "owner", idType: "nin", idNumber: ownerNin, consent: true, ...ownerClaim, idImageBase64: ownerImage },
    {
      store,
      env: { YOUVERIFY_SECRET_KEY: "sandbox-secret" },
      fetchImpl: async () => new Response(JSON.stringify({ success: false, statusCode: 402, data: {} }), { status: 402 }),
    },
  );
  assert.equal(down.ok, false);
  if (!down.ok) assert.equal(down.status, 502);
  assert.equal(store.rows.length, 0);
});

test("an existing approved row is returned without calling Youverify", async () => {
  const store = memoryKycStore([
    {
      id: "kyc_existing",
      userId: "user_1",
      userType: "owner",
      status: "approved",
      provider: "youverify",
      referenceId: "yv_old",
      requestId: "req_old",
      idType: "nin",
      idLast4: "8901",
      companyStatus: null,
      rejectionReason: null,
      claimDigest: null,
      idImagePath: null,
    },
  ]);
  const result = await submitYouverifyIdentity(
    { userId: "user_1", role: "owner", idType: "bvn", idNumber: "10987654321", consent: true },
    {
      store,
      env: { YOUVERIFY_SECRET_KEY: "sandbox-secret" },
      fetchImpl: async () => {
        throw new Error("Youverify should not be called");
      },
    },
  );
  assert.deepEqual(result, {
    ok: true,
    status: "approved",
    kycRequestId: "kyc_existing",
    created: false,
    personBadge: "verified",
    reason: null,
  });
  assert.equal(store.rows.length, 1);
});

test("a missing secret writes nothing", async () => {
  const store = memoryKycStore();
  const result = await submitYouverifyIdentity(
    { userId: "user_1", role: "owner", idType: "nin", idNumber: ownerNin, consent: true, ...ownerClaim, idImageBase64: ownerImage },
    { store, env: {}, fetchImpl: async () => foundResponse() },
  );
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.status, 503);
  assert.equal(store.rows.length, 0);
});
