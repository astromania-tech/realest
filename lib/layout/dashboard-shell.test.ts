import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import {
  DASHBOARD_PAGE_HEADER,
  DASHBOARD_STATS_GRID,
  DASHBOARD_TABLE_WRAP,
  adminMainOffset,
  dashboardMainOffset,
} from "@/lib/layout/dashboard-shell";

test("dashboard and admin main columns leave full width on small screens", () => {
  assert.match(dashboardMainOffset(false), /\bml-0\b/);
  assert.match(dashboardMainOffset(false), /\bmd:ml-64\b/);
  assert.match(dashboardMainOffset(true), /\bmd:ml-16\b/);
  assert.match(adminMainOffset(false), /\bml-0\b/);
  assert.match(adminMainOffset(false), /\bmd:ml-65\b/);
  assert.match(adminMainOffset(true), /\bmd:ml-15\b/);
});

test("small screens use bottom navigation instead of a side drawer", () => {
  const dashboard = readFileSync("components/layout/DashboardLayout.tsx", "utf8");
  const sidebar = readFileSync("components/layout/DashboardSidebar.tsx", "utf8");
  const mobile = readFileSync("components/layout/DashboardMobileNav.tsx", "utf8");
  const admin = readFileSync("components/layout/AdminLayout.tsx", "utf8");
  assert.match(dashboard, /DashboardMobileNav/);
  assert.match(dashboard, /DASHBOARD_PAGE_PAD|pb-28/);
  assert.doesNotMatch(dashboard, /mobileNavOpen/);
  assert.match(sidebar, /hidden/);
  assert.match(sidebar, /md:flex/);
  assert.doesNotMatch(sidebar, /mobileOpen/);
  assert.match(mobile, /fixed inset-x-0 bottom-0/);
  assert.match(mobile, /More/);
  assert.match(admin, /DashboardMobileNav/);
});

test("dense dashboard grids wait until lg so sidebar does not crush cards", () => {
  assert.match(DASHBOARD_STATS_GRID, /grid-cols-2/);
  assert.match(DASHBOARD_STATS_GRID, /lg:grid-cols-4/);
  assert.doesNotMatch(DASHBOARD_STATS_GRID, /md:grid-cols-4/);
  assert.match(DASHBOARD_PAGE_HEADER, /flex-col/);
  assert.match(DASHBOARD_PAGE_HEADER, /sm:flex-row/);
  assert.match(DASHBOARD_TABLE_WRAP, /overflow-x-auto/);
});

test("mobile header uses hamburger menu for account overlay", () => {
  const header = readFileSync("components/layout/DashboardHeader.tsx", "utf8");
  const admin = readFileSync("components/layout/AdminHeader.tsx", "utf8");
  assert.match(header, /\bMenu\b/);
  assert.match(header, /aria-label=\"Open menu\"/);
  assert.match(admin, /\bMenu\b/);
  assert.match(admin, /aria-label=\"Open menu\"/);
});
