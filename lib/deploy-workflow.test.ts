import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("production deploy uses a published Vercel action", () => {
  const workflow = readFileSync(".github/workflows/deploy.yml", "utf8");
  assert.equal(workflow.includes("vercel/action@"), false);
  assert.match(workflow, /uses: amondnet\/vercel-action@v42\.3\.0/);
  assert.match(workflow, /vercel-args: '--prod'/);
  assert.match(workflow, /steps\.vercel-deploy\.outputs\.preview-url/);
  assert.equal(workflow.includes("steps.vercel-deploy.outputs.deployment-url"), false);
});
