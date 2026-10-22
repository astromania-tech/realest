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

test("reviewer mobile tabs stay on verification paths only", () => {
  const primary = mobilePrimaryItems("reviewer").map((item) => item.href);
  const more = mobileMoreItems("reviewer").map((item) => item.href);
  assert.ok(primary.includes("/admin/validation"));
  assert.ok(primary.includes("/admin/validation/inbox"));
  assert.equal(primary.includes("/admin/users"), false);
  assert.equal(more.includes("/admin/users"), false);
  assert.equal(more.includes("/admin/emails"), false);
  assert.equal(more.includes("/admin/validation/ml"), false);
  assert.equal(more.includes("/admin/validation/vetting"), false);
  assert.equal(primary.includes("/admin/validation/ml"), false);
  assert.equal(primary.includes("/admin/validation/vetting"), false);
});

test("team member primary tabs are my visits and inbox", () => {
  const primary = mobilePrimaryItems("team_member").map((item) => item.href);
  assert.deepEqual(primary, ["/admin/validation/my-visits", "/admin/validation/inbox"]);
});

test("case queue is not sticky over field ops, my visits, or inbox", () => {
  const adminHrefs = [
    "/admin",
    "/admin/validation",
    "/admin/validation/field",
    "/admin/validation/my-visits",
    "/admin/validation/inbox",
    "/admin/staff",
  ];
  assert.equal(isDashboardNavActive("/admin/validation", "/admin/validation", adminHrefs), true);
  assert.equal(
    isDashboardNavActive("/admin/validation/field", "/admin/validation", adminHrefs),
    false,
  );
  assert.equal(
    isDashboardNavActive("/admin/validation/field", "/admin/validation/field", adminHrefs),
    true,
  );
  assert.equal(
    isDashboardNavActive("/admin/validation/my-visits", "/admin/validation", adminHrefs),
    false,
  );
  assert.equal(
    isDashboardNavActive("/admin/validation/inbox", "/admin/validation", adminHrefs),
    false,
  );
  assert.equal(
    isDashboardNavActive("/admin/validation/cases/abc", "/admin/validation", adminHrefs),
    true,
  );
});

