import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("production workflow leaves shipping to the Vercel GitHub app", () => {
  const workflow = readFileSync(".github/workflows/deploy.yml", "utf8");
  assert.equal(workflow.includes("vercel/action@"), false);
  assert.equal(workflow.includes("amondnet/vercel-action"), false);
  assert.equal(workflow.includes("vercel-token"), false);
  assert.match(workflow, /vercel\[bot\]/);
});
