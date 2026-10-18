import assert from "node:assert/strict";
import test from "node:test";
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

test("a completed identity webhook approves the pending row and does not insert", async () => {
  const store = memoryKycStore([pendingRow()]);
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
        idNumber: "12345678901",
        metadata: { requestId: "req_pending" },
      },
    },
    store,
  );
  assert.equal(outcome, "updated");
  assert.equal(store.rows[0]?.status, "approved");
  assert.equal(JSON.stringify(store.rows[0]).includes("12345678901"), false);
  store.insert = originalInsert;
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
