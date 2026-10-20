import assert from "node:assert/strict";
import test from "node:test";
import { isDashboardNavActive, mobileMoreItems, mobilePrimaryItems } from "@/lib/layout/dashboard-nav";

const agentHrefs = [
  "/agent",
  "/agent/properties",
  "/agent/properties/new",
  "/agent/identity",
  "/setting",
  "/setting/security",
];

test("agent dashboard is only active on the workspace root", () => {
  assert.equal(isDashboardNavActive("/agent", "/agent", agentHrefs), true);
  assert.equal(isDashboardNavActive("/agent/properties", "/agent", agentHrefs), false);
  assert.equal(isDashboardNavActive("/agent/properties", "/agent/properties", agentHrefs), true);
});

test("add property wins over my listings on the new listing path", () => {
  assert.equal(isDashboardNavActive("/agent/properties/new", "/agent/properties/new", agentHrefs), true);
  assert.equal(isDashboardNavActive("/agent/properties/new", "/agent/properties", agentHrefs), false);
});

test("identity stays alone on the identity path", () => {
  assert.equal(isDashboardNavActive("/agent/identity", "/agent/identity", agentHrefs), true);
});

test("small screens get primary bottom tabs and the rest under More", () => {
  const primary = mobilePrimaryItems("agent").map((item) => item.href);
  const more = mobileMoreItems("agent").map((item) => item.href);
  assert.deepEqual(primary, [
    "/agent",
    "/agent/properties",
    "/agent/properties/new",
    "/agent/identity",
  ]);
  assert.ok(more.includes("/setting"));
  assert.ok(more.includes("/setting/security"));
  assert.equal(primary.some((href) => more.includes(href)), false);
});
