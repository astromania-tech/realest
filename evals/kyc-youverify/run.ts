/**
 * Deterministic eval: a listing draft opens only after Youverify approves the matching identity.
 *
 *   npx tsx evals/kyc-youverify/run.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { listingCreateAllowed } from "../../lib/kyc/gate.ts";
import { memoryKycStore } from "../../lib/kyc/memory-store.ts";
import { personBadgeFromKyc } from "../../lib/kyc/person-badge.ts";
import { submitYouverifyIdentity } from "../../lib/kyc/submit.ts";
import { verdictFromProvider } from "../../lib/kyc/verdict.ts";

const cases: Array<{ id: string; run: () => boolean | Promise<boolean> }> = [
  {
    id: "owner-missing-row",
    run: () => listingCreateAllowed({ role: "owner", rows: [] }).ok === false,
  },
  {
    id: "owner-pending-row",
    run: () =>
      listingCreateAllowed({
        role: "owner",
        rows: [{ user_type: "owner", kyc_provider: "youverify", status: "pending" }],
      }).ok === false,
  },
  {
    id: "owner-rejected-row",
    run: () =>
      listingCreateAllowed({
        role: "owner",
        rows: [{ user_type: "owner", kyc_provider: "youverify", status: "rejected" }],
      }).ok === false,
  },
  {
    id: "other-provider-approved",
    run: () =>
      listingCreateAllowed({
        role: "owner",
        rows: [{ user_type: "owner", kyc_provider: "smile", status: "approved" }],
      }).ok === false,
  },
  {
    id: "owner-youverify-approved",
    run: () =>
      listingCreateAllowed({
        role: "owner",
        rows: [{ user_type: "owner", kyc_provider: "youverify", status: "approved" }],
      }).ok === true,
  },
  {
    id: "agent-cannot-reuse-owner-approval",
    run: () =>
      listingCreateAllowed({
        role: "agent",
        rows: [{ user_type: "owner", kyc_provider: "youverify", status: "approved" }],
      }).ok === false,
  },
  {
    id: "found-person-approves",
    run: () =>
      verdictFromProvider({ idType: "bvn", providerStatus: "found", companyStatus: null, referenceId: "yv" }).action ===
      "approved",
  },
  {
    id: "not-found-does-not-approve",
    run: () =>
      verdictFromProvider({ idType: "nin", providerStatus: "not_found", companyStatus: null, referenceId: "yv" }).action ===
      "rejected",
  },
  {
    id: "unknown-status-writes-nothing",
    run: () =>
      verdictFromProvider({ idType: "nin", providerStatus: "manual_review", companyStatus: null, referenceId: "yv" })
        .action === "unavailable",
  },
  {
    id: "cac-inactive-rejects",
    run: () =>
      verdictFromProvider({ idType: "cac", providerStatus: "found", companyStatus: "SUSPENDED", referenceId: "yv" })
        .action === "rejected",
  },
  {
    id: "found-without-reference-writes-nothing",
    run: () =>
      verdictFromProvider({ idType: "nin", providerStatus: "found", companyStatus: null, referenceId: "  " }).action ===
      "unavailable",
  },
  {
    id: "submit-does-not-store-nin",
    run: async () => {
      const nin = "12345678901";
      const store = memoryKycStore();
      const result = await submitYouverifyIdentity(
        { userId: "user_1", role: "owner", idType: "nin", idNumber: nin, consent: true },
        {
          store,
          env: { YOUVERIFY_SECRET_KEY: "sandbox-secret" },
          fetchImpl: async () =>
            new Response(
              JSON.stringify({
                success: true,
                data: { id: "yv_eval", status: "found", idNumber: nin, firstName: "Ada" },
              }),
              { status: 200 },
            ),
        },
      );
      return result.ok === true && result.status === "approved" && !JSON.stringify(store.rows).includes(nin);
    },
  },
  {
    id: "provider-outage-does-not-invent-approval",
    run: async () => {
      const store = memoryKycStore();
      const result = await submitYouverifyIdentity(
        { userId: "user_1", role: "owner", idType: "nin", idNumber: "12345678901", consent: true },
        {
          store,
          env: { YOUVERIFY_SECRET_KEY: "sandbox-secret" },
          fetchImpl: async () => new Response("nope", { status: 500 }),
        },
      );
      return result.ok === false && store.rows.length === 0;
    },
  },
  {
    id: "matched-person-is-not-a-verified-listing",
    run: () => {
      const matched =
        personBadgeFromKyc("owner", [{ user_type: "owner", kyc_provider: "youverify", status: "approved" }]) ===
        "verified";
      const writer = readFileSync("lib/kyc/submit.ts", "utf8");
      return matched && !writer.includes("verification_status") && !writer.includes("agents.update");
    },
  },
  {
    id: "both-create-routes-call-the-gate",
    run: () => {
      for (const path of ["app/api/properties/route.ts", "app/api/dashboard/listings/route.ts"]) {
        const source = readFileSync(path, "utf8");
        const kycAt = source.indexOf("assertListingKyc");
        const createAt = source.indexOf("prisma.properties.create");
        if (kycAt < 0 || createAt < kycAt) return false;
      }
      return true;
    },
  },
];

async function main() {
  let failed = 0;
  for (const item of cases) {
    const ok = await item.run();
    if (!ok) {
      failed += 1;
      console.error(`FAIL ${item.id}`);
    } else {
      console.log(`pass ${item.id}`);
    }
  }

  assert.equal(failed, 0);
  console.log(`kyc youverify eval ${cases.length - failed}/${cases.length}`);
}

main();
