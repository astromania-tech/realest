import assert from "node:assert/strict";
import test from "node:test";
import { personClaimDigest } from "@/lib/kyc/match";
import { memoryKycStore } from "@/lib/kyc/memory-store";
import { youverifySignatureHex, youverifySignatureValid } from "@/lib/kyc/signature";
import type { KycRow } from "@/lib/kyc/types";
import { applyYouverifyWebhook } from "@/lib/kyc/webhook";

const secret = "sandbox-secret";

function pendingRow(overrides: Partial<KycRow> = {}): KycRow {
  return {
    id: "kyc_pending",
    userId: "user_1",
    userType: "owner",
    status: "pending",
    provider: "youverify",
    referenceId: "yv_pending",
    requestId: "req_pending",
    idType: "nin",
    idLast4: "8901",
    companyStatus: null,
    rejectionReason: null,
    claimDigest: null,
    idImagePath: null,
    ...overrides,
  };
}

test("the signature check fails closed", () => {
  const raw = '{"event":"identity.verification.completed"}';
  const header = youverifySignatureHex(raw, secret);
  assert.equal(youverifySignatureValid(raw, header, secret), true);
  assert.equal(youverifySignatureValid(raw, `sha256=${header}`, secret), true);
  assert.equal(youverifySignatureValid(raw, header, "other"), false);
  assert.equal(youverifySignatureValid(raw, header, ""), false);
  assert.equal(youverifySignatureValid(raw, "abcd", secret), false);
  assert.equal(youverifySignatureValid(`${raw} `, header, secret), false);
});

test("a completed identity webhook approves the pending row only when the stored claim matches", async () => {
  const claimDigest = personClaimDigest({ firstName: "Sarah", lastName: "Doe", dateOfBirth: "1988-04-04" });
  const store = memoryKycStore([pendingRow({ claimDigest })]);
  const originalInsert = store.insert;
  store.insert = async () => {
    throw new Error("webhook must not insert");
  };
  const outcome = await applyYouverifyWebhook(
    {
      event: "identity.verification.completed",
      data: {
        id: "yv_pending",
        status: "found",
        type: "nin",
        firstName: "Sarah",
        lastName: "Doe",
        dateOfBirth: "1988-04-04",
        idNumber: "12345678901",
        metadata: { requestId: "req_pending" },
        validations: { selfie: { selfieVerification: { match: true, confidenceLevel: 91, threshold: 80 } } },
      },
    },
    store,
  );
  assert.equal(outcome, "updated");
  assert.equal(store.rows[0]?.status, "approved");
  assert.equal(JSON.stringify(store.rows[0]).includes("12345678901"), false);
  store.insert = originalInsert;
});

test("a found webhook whose ID photo does not match rejects the pending row", async () => {
  const claimDigest = personClaimDigest({ firstName: "Sarah", lastName: "Doe", dateOfBirth: "1988-04-04" });
  const store = memoryKycStore([pendingRow({ claimDigest })]);
  const outcome = await applyYouverifyWebhook(
    {
      event: "identity.verification.completed",
      data: {
        id: "yv_pending",
        status: "found",
        firstName: "Sarah",
        lastName: "Doe",
        dateOfBirth: "1988-04-04",
        selfieValidation: true,
        validations: { selfie: { selfieVerification: { match: false } } },
      },
    },
    store,
  );
  assert.equal(outcome, "updated");
  assert.equal(store.rows[0]?.status, "rejected");
  assert.equal(store.rows[0]?.rejectionReason, "id_image_mismatch");
});

test("a found webhook without a stored claim does not approve", async () => {
  const store = memoryKycStore([pendingRow()]);
  const outcome = await applyYouverifyWebhook(
    {
      event: "identity.verification.completed",
      data: {
        id: "yv_pending",
        status: "found",
        firstName: "Sarah",
        lastName: "Doe",
        dateOfBirth: "1988-04-04",
      },
    },
    store,
  );
  assert.equal(outcome, "ignored");
  assert.equal(store.rows[0]?.status, "pending");
});

test("a webhook for an unknown reference writes nothing", async () => {
  const store = memoryKycStore([pendingRow()]);
  const outcome = await applyYouverifyWebhook(
    { event: "identity.completed", data: { id: "missing", status: "found" } },
    store,
  );
  assert.equal(outcome, "ignored");
  assert.equal(store.rows[0]?.status, "pending");
});

test("an address event and a CAC result without an active company do not approve", async () => {
  const store = memoryKycStore([
    pendingRow({ id: "kyc_cac", userType: "agent", idType: "cac", referenceId: "yv_cac", requestId: "req_cac" }),
  ]);
  const address = await applyYouverifyWebhook(
    { event: "address.verification.completed", data: { id: "yv_cac", status: "found" } },
    store,
  );
  assert.equal(address, "ignored");
  const inactive = await applyYouverifyWebhook(
    { event: "company.verification.completed", data: { id: "yv_cac", status: "found", companyStatus: "INACTIVE" } },
    store,
  );
  assert.equal(inactive, "updated");
  assert.equal(store.rows[0]?.status, "rejected");
});

test("a later webhook does not reopen an approved row", async () => {
  const store = memoryKycStore([pendingRow({ status: "approved" })]);
  const outcome = await applyYouverifyWebhook(
    { event: "identity.verification.completed", data: { id: "yv_pending", status: "not_found" } },
    store,
  );
  assert.equal(outcome, "ignored");
  assert.equal(store.rows[0]?.status, "approved");
});
