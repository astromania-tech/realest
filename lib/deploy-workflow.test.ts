import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("production workflow leaves shipping to the Vercel GitHub app", () => {
  const workflow = readFileSync(".github/workflows/deploy.yml", "utf8");
  assert.equal(workflow.includes("vercel/action@"), false);
  assert.equal(workflow.includes("amondnet/vercel-action"), false);
  assert.equal(workflow.includes("vercel-token"), false);
  assert.match(workflow, /vercel\[bot\]/);
  assert.equal(workflow.includes("ignoreBuildErrors"), false);
  const nextConfig = readFileSync("next.config.mjs", "utf8");
  assert.equal(nextConfig.includes("ignoreBuildErrors"), false);
});

test("Vercel builds directly while local builds load Doppler and npm lifecycle scripts", () => {
  const { scripts } = JSON.parse(readFileSync("package.json", "utf8"));
  assert.equal(scripts.build, "next build");
  assert.equal(scripts["build:local"], "doppler run -- npm run build");
  assert.equal(scripts["dev:local"], "doppler run -- npm run dev");
});
