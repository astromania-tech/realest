import assert from "node:assert/strict";
import test from "node:test";
import { explainFraud, fraudStatusLabel, fraudSummary, readFraudFindings } from "@/lib/trust/fraud";

test("a duplicate pin is explained as a conflict and blocks the visit", () => {
  const findings = explainFraud({ hardBlocks: ["duplicate_pin"], flags: [] });
  assert.equal(findings[0]?.status, "contradicted");
  assert.equal(findings[0]?.blocksVetting, true);
  assert.equal(fraudStatusLabel(findings[0]?.status ?? "contradicted"), "Contradicted");
  assert.match(findings[0]?.explanation ?? "", /50 metres/);
  assert.match(fraudSummary(findings), /block the visit/);
});

test("a scene without GPS is a named conflict and an unlabeled photo blocks the visit", () => {
  const untied = explainFraud({ hardBlocks: [], flags: ["photo_not_tied_to_pin"] });
  assert.equal(untied[0]?.status, "contradicted");
  assert.equal(untied[0]?.blocksVetting, false);
  assert.match(untied[0]?.explanation ?? "", /not tied to the pin/);
  const unlabeled = explainFraud({ hardBlocks: ["photo_classifier_unavailable"], flags: [] });
  assert.equal(unlabeled[0]?.blocksVetting, true);
  assert.match(fraudSummary(unlabeled), /block the visit/);
});

test("a stored fraud list is what the reviewer reads", () => {
  const stored = explainFraud({ hardBlocks: ["photo_screenshot"], flags: [] });
  const read = readFraudFindings({ fraud: stored }, { hardBlocks: [], flags: [] });
  assert.equal(read[0]?.code, "photo_screenshot");
  assert.equal(readFraudFindings({}, { hardBlocks: ["trust_reader_unavailable"], flags: [] })[0]?.blocksVetting, true);
});
