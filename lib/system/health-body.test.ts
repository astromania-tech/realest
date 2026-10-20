import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { publicHealthBody } from "@/lib/system/health-body";

test("the public health body is only ok or unavailable", () => {
  assert.deepEqual(publicHealthBody(true), { status: "ok" });
  assert.deepEqual(publicHealthBody(false), { status: "unavailable" });
  assert.equal(JSON.stringify(publicHealthBody(false)).includes("error"), false);
});

test("health and status routes keep counts behind an admin check", () => {
  const health = readFileSync("app/api/system/health/route.ts", "utf8");
  const status = readFileSync("app/api/system/status/route.ts", "utf8");
  assert.match(health, /requireAdmin/);
  assert.match(health, /publicHealthBody/);
  assert.match(status, /requireAdmin/);
  assert.match(status, /publicHealthBody/);
  assert.equal(health.includes("err.message"), false);
  assert.equal(status.includes("statsError.message"), false);
});
