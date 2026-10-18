import assert from "node:assert/strict";
import test from "node:test";
import { personBadgeFromKyc, personKycMessage, personKycReason } from "@/lib/kyc/person-badge";

const row = (userType: string, status: string, provider = "youverify", rejection_reason: string | null = null) => ({
  user_type: userType,
  kyc_provider: provider,
  status,
  rejection_reason,
});

test("a matched Youverify row assigns the person badge", () => {
  assert.equal(personBadgeFromKyc("owner", [row("owner", "approved")]), "verified");
  assert.equal(personKycMessage("verified", null).includes("not a listing"), true);
});

test("a miss does not assign the person badge", () => {
  assert.equal(personBadgeFromKyc("owner", [row("owner", "rejected", "youverify", "not_found")]), "rejected");
  assert.equal(personKycReason("owner", [row("owner", "rejected", "youverify", "not_found")]), "not_found");
  assert.equal(personKycMessage("rejected", "not_found"), "Youverify did not find this record.");
  assert.equal(personKycMessage("rejected", "company_not_active"), "Youverify found the company, and it is not active.");
});

test("another provider and the other role do not assign this person's badge", () => {
  assert.equal(personBadgeFromKyc("owner", [row("owner", "approved", "smile")]), "none");
  assert.equal(personBadgeFromKyc("agent", [row("owner", "approved")]), "none");
});

test("an older rejection stays hidden once a later match exists", () => {
  const rows = [row("agent", "rejected", "youverify", "company_not_active"), row("agent", "approved")];
  assert.equal(personBadgeFromKyc("agent", rows), "verified");
  assert.equal(personKycReason("agent", rows), null);
});
