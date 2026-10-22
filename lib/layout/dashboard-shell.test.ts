import assert from "node:assert/strict";
import test from "node:test";
import { existsSync, readFileSync } from "node:fs";
import {
  DASHBOARD_PAGE_HEADER,
  DASHBOARD_STATS_GRID,
  DASHBOARD_TABLE_WRAP,
  adminMainOffset,
  dashboardMainOffset,
  shellBlocksOnUserLoad,
  userInitShouldBlockUi,
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

test("shell only blocks chrome on cold boot before a role exists", () => {
  assert.equal(shellBlocksOnUserLoad({ isLoading: true, hasRole: false }), true);
  assert.equal(shellBlocksOnUserLoad({ isLoading: true, hasRole: true }), false);
  assert.equal(shellBlocksOnUserLoad({ isLoading: false, hasRole: false }), false);
});

test("user init only blocks UI on first hydrate without cache", () => {
  assert.equal(
    userInitShouldBlockUi({ alreadyInitialized: false, hasCachedProfile: false }),
    true,
  );
  assert.equal(
    userInitShouldBlockUi({ alreadyInitialized: false, hasCachedProfile: true }),
    false,
  );
  assert.equal(
    userInitShouldBlockUi({ alreadyInitialized: true, hasCachedProfile: false }),
    false,
  );
});

test("admin and dashboard keep shell mounted after role hydrate", () => {
  const admin = readFileSync("components/layout/AdminLayout.tsx", "utf8");
  const dashboard = readFileSync("components/layout/DashboardLayout.tsx", "utf8");
  assert.match(admin, /shellBlocksOnUserLoad/);
  assert.match(dashboard, /shellBlocksOnUserLoad/);
  assert.doesNotMatch(admin, /if \(isLoading\) \{\s*return/);
  assert.doesNotMatch(dashboard, /if \(isLoading\) \{\s*return/);
});

test("dashboard segments expose instant loading UI", () => {
  assert.equal(existsSync("app/(dashboard)/admin/loading.tsx"), true);
  assert.equal(existsSync("app/(dashboard)/loading.tsx"), true);
  const adminLoading = readFileSync("app/(dashboard)/admin/loading.tsx", "utf8");
  assert.match(adminLoading, /DashboardPageSkeleton/);
});

test("user state is a shared provider so layouts do not each cold-boot", () => {
  const userHook = readFileSync("lib/hooks/useUser.tsx", "utf8");
  const root = readFileSync("app/layout.tsx", "utf8");
  assert.match(userHook, /export function UserProvider/);
  assert.match(userHook, /UserContext/);
  assert.match(userHook, /hydratedUserId/);
  assert.match(root, /UserProvider/);
});

test("admin sidebar uses plain Link nav without nested Button", () => {
  const sidebar = readFileSync("components/layout/AdminSidebar.tsx", "utf8");
  assert.match(sidebar, /Plain <Link> only/);
  assert.doesNotMatch(
    sidebar,
    /<Link[^>]*>\s*<Button/,
  );
  assert.match(sidebar, /prefetch/);
});

test("admin layout keeps chrome after first staff hydrate", () => {
  const admin = readFileSync("components/layout/AdminLayout.tsx", "utf8");
  assert.match(admin, /stickyStaffRole/);
});

test("dashboard layout keeps chrome after first role hydrate", () => {
  const dashboard = readFileSync("components/layout/DashboardLayout.tsx", "utf8");
  assert.match(dashboard, /stickyRole/);
  assert.match(dashboard, /displayRole/);
});

test("staff header logo uses role home path not hard /admin", () => {
  const header = readFileSync("components/layout/AdminHeader.tsx", "utf8");
  assert.match(header, /staffHomePath/);
  assert.doesNotMatch(header, /href=\"\/admin\"/);
  assert.doesNotMatch(header, /window\.location\.href/);
});

test("dashboard sidebar uses plain Link nav with prefetch", () => {
  const sidebar = readFileSync("components/layout/DashboardSidebar.tsx", "utf8");
  assert.doesNotMatch(sidebar, /<Link[^>]*>\s*<Button/);
  assert.match(sidebar, /prefetch/);
});

test("admin breadcrumbs soft-navigate via Next Link", () => {
  const admin = readFileSync("components/layout/AdminLayout.tsx", "utf8");
  assert.match(admin, /BreadcrumbLink asChild/);
  assert.match(admin, /<Link href=\{item\.href\} prefetch>/);
});

test("non-admin staff sidebar does not link to marketplace settings", () => {
  const sidebar = readFileSync("components/layout/AdminSidebar.tsx", "utf8");
  assert.match(sidebar, /userRole === \"admin\"/);
  assert.match(sidebar, /\/admin\/settings/);
  assert.doesNotMatch(sidebar, /href=\"\/settings\"/);
});
