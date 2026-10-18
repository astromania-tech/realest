import assert from "node:assert/strict";
import { trustFixtures } from "../../lib/trust/fixtures.ts";

const cases = [
  {
    id: "swapped-deed",
    run: trustFixtures.swappedDeed,
    allowsVetting: false,
    block: "document_type_mismatch",
    queue: "pending_ml_validation",
  },
  {
    id: "unreadable-deed",
    run: trustFixtures.unreadableDeed,
    allowsVetting: false,
    block: "document_unreadable",
    queue: "pending_ml_validation",
  },
  {
    id: "repeated-pin",
    run: trustFixtures.repeatedPin,
    allowsVetting: false,
    block: "duplicate_pin",
    queue: "pending_duplicate_review",
  },
  {
    id: "screenshot",
    run: trustFixtures.screenshot,
    allowsVetting: false,
    block: "photo_screenshot",
    queue: "pending_ml_validation",
  },
  {
    id: "clean-stops-for-a-person",
    run: trustFixtures.clean,
    allowsVetting: true,
    block: null,
    queue: "pending_ml_validation",
  },
];

let failed = 0;
for (const item of cases) {
  const decision = item.run();
  const blockOk = item.block === null ? decision.hardBlocks.length === 0 : decision.hardBlocks.includes(item.block);
  const ok = decision.allowsVetting === item.allowsVetting && decision.recommendedQueue === item.queue && blockOk;
  if (!ok) {
    failed += 1;
    console.error(item.id, decision);
  } else {
    console.log(`pass ${item.id}`);
  }
}

assert.equal(failed, 0);
console.log(`trust model eval ${cases.length - failed}/${cases.length}`);
