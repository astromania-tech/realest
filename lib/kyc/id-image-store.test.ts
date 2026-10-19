import assert from "node:assert/strict";
import test from "node:test";
import { kycIdImagePath, openKycIdImage, readKycIdImagePath } from "@/lib/kyc/id-image-store";
import { kycDocumentsJson, readStoredDocuments } from "@/lib/kyc/store";

test("the identity photo path stays inside the private bucket layout", () => {
  assert.equal(kycIdImagePath("user_1", "req_1", "jpg"), "user_1/req_1.jpg");
  assert.equal(kycIdImagePath("../user", "req_1", "jpg"), null);
  assert.equal(readKycIdImagePath("user_1/req_1.jpg"), "user_1/req_1.jpg");
  assert.equal(readKycIdImagePath("/9j/4AAQSkZJRgABAQEASABIAAD"), null);
});

test("the KYC document record keeps the path and not the photo bytes", () => {
  const documents = kycDocumentsJson({
    idType: "nin",
    idLast4: "8901",
    requestId: "req_1",
    companyStatus: null,
    claimDigest: null,
    idImagePath: "user_1/req_1.jpg",
  });
  assert.equal(readStoredDocuments(documents)?.idImagePath, "user_1/req_1.jpg");
  assert.equal(JSON.stringify(documents).includes("/9j/"), false);
  assert.equal(
    readStoredDocuments({ ...documents, idImagePath: "data:image/jpeg;base64,AAAA" })?.idImagePath,
    null,
  );
});

test("only an admin receives a signed URL for a stored identity photo", async () => {
  const missing = await openKycIdImage({
    admin: { ok: false, error: "Forbidden", status: 403 },
    idImagePath: "user_1/req_1.jpg",
    sign: async () => "https://signed.example/photo",
  });
  assert.equal(missing.ok, false);

  const absent = await openKycIdImage({
    admin: { ok: true, userId: "admin_1", email: "admin@example.com" },
    idImagePath: null,
    sign: async () => "https://signed.example/photo",
  });
  assert.equal(absent.ok, false);
  if (!absent.ok) assert.equal(absent.status, 404);

  const opened = await openKycIdImage({
    admin: { ok: true, userId: "admin_1", email: "admin@example.com" },
    idImagePath: "user_1/req_1.jpg",
    sign: async (path) => `https://signed.example/${path}`,
  });
  assert.deepEqual(opened, { ok: true, url: "https://signed.example/user_1/req_1.jpg" });
});
