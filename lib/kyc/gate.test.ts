import assert from "node:assert/strict";
import test from "node:test";
import { listingCreateAllowed, LISTING_KYC_ERROR } from "@/lib/kyc/gate";

const approved = (userType: string, provider = "youverify", status = "approved") => ({
  user_type: userType,
  kyc_provider: provider,
  status,
});

test("a missing kyc row blocks an owner draft", () => {
  const result = listingCreateAllowed({ role: "owner", rows: [] });
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.error, LISTING_KYC_ERROR);
});

test("pending and rejected Youverify rows block an agent draft", () => {
  assert.equal(listingCreateAllowed({ role: "agent", rows: [approved("agent", "youverify", "pending")] }).ok, false);
  assert.equal(listingCreateAllowed({ role: "agent", rows: [approved("agent", "youverify", "rejected")] }).ok, false);
});

test("an approved row from another provider does not open a draft", () => {
  const result = listingCreateAllowed({ role: "owner", rows: [approved("owner", "smile")] });
  assert.equal(result.ok, false);
});

test("an approved owner row does not let an agent save a draft", () => {
  assert.equal(listingCreateAllowed({ role: "agent", rows: [approved("owner")] }).ok, false);
});

test("an approved Youverify row for the same role allows the draft", () => {
  assert.equal(listingCreateAllowed({ role: "owner", rows: [approved("owner")] }).ok, true);
  assert.equal(
    listingCreateAllowed({
      role: "agent",
      rows: [approved("agent", "youverify", "rejected"), approved("agent")],
    }).ok,
    true,
  );
});

test("admin is not an identity subject and can still save a dashboard draft", () => {
  assert.equal(listingCreateAllowed({ role: "admin", rows: [] }).ok, true);
});

test("a plain user cannot save a draft", () => {
  assert.equal(listingCreateAllowed({ role: "user", rows: [approved("owner")] }).ok, false);
});
