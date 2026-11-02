/**
 * The fraud copy explains the same codes the policy already raises.
 *
 *   npx tsx evals/fraud-findings/run.ts
 */
import assert from "node:assert/strict";
import { explainFraud, fraudSummary } from "../../lib/trust/fraud.ts";

const cases = [
  {
    id: "duplicate-pin-is-a-conflict",
    run: () => explainFraud({ hardBlocks: ["duplicate_pin"], flags: [] })[0]?.status === "contradicted",
  },
  {
    id: "scene-without-gps-is-explained",
    run: () => {
      const finding = explainFraud({ hardBlocks: [], flags: ["photo_not_tied_to_pin"] })[0];
      return finding?.status === "contradicted" && finding.blocksVetting === false;
    },
  },
  {
    id: "unlabeled-photo-blocks",
    run: () => explainFraud({ hardBlocks: ["photo_classifier_unavailable"], flags: [] })[0]?.blocksVetting === true,
  },
  {
    id: "reader-down-does-not-pass",
    run: () => explainFraud({ hardBlocks: ["trust_reader_unavailable"], flags: [] })[0]?.blocksVetting === true,
  },
  {
    id: "summary-does-not-write-the-badge",
    run: () => fraudSummary(explainFraud({ hardBlocks: ["duplicate_photo"], flags: ["holder_name_mismatch"] })).includes("RealEST Verified is not written"),
  },
];

let failed = 0;
for (const item of cases) {
  if (!item.run()) {
    failed += 1;
    console.error(`FAIL ${item.id}`);
  } else {
    console.log(`pass ${item.id}`);
  }
}
assert.equal(failed, 0);
console.log(`fraud findings eval ${cases.length - failed}/${cases.length}`);
