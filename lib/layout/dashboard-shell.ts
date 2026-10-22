/** Desktop sidebar widths used by dashboard and admin shells. */
export const DASHBOARD_SIDEBAR_EXPANDED = "md:ml-64";
export const DASHBOARD_SIDEBAR_COLLAPSED = "md:ml-16";
export const ADMIN_SIDEBAR_EXPANDED = "md:ml-65";
export const ADMIN_SIDEBAR_COLLAPSED = "md:ml-15";

/**
 * Shared responsive chrome for authenticated pages.
 * Sidebar docks at `md`, so dense grids wait until `lg` or cards crush.
 */
export const DASHBOARD_PAGE_PAD =
  "min-w-0 w-full overflow-x-clip px-4 py-4 pb-28 sm:px-6 md:pb-4";
export const ADMIN_PAGE_PAD =
  "min-w-0 w-full overflow-x-clip p-4 pb-28 sm:p-6 md:pb-6";
export const DASHBOARD_PAGE_HEADER =
  "mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-start sm:justify-between sm:gap-4";
export const DASHBOARD_STATS_GRID =
  "mb-6 grid grid-cols-2 gap-3 sm:mb-8 sm:gap-4 lg:grid-cols-4";
export const DASHBOARD_CONTENT_GRID =
  "grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6";
export const DASHBOARD_TABLE_WRAP = "w-full min-w-0 overflow-x-auto";

export function dashboardMainOffset(isCollapsed: boolean): string {
  return [
    "min-w-0 w-full flex-1 transition-all duration-300 ease-out ml-0",
    isCollapsed ? DASHBOARD_SIDEBAR_COLLAPSED : DASHBOARD_SIDEBAR_EXPANDED,
  ].join(" ");
}

export function adminMainOffset(isCollapsed: boolean): string {
  return [
    "min-w-0 w-full flex-1 transition-all duration-300 ease-out ml-0",
    isCollapsed ? ADMIN_SIDEBAR_COLLAPSED : ADMIN_SIDEBAR_EXPANDED,
  ].join(" ");
}

/**
 * Full-chrome boot screen only on cold start (no role yet).
 * Once a role is known, keep the shell mounted during soft navigations / quiet revalidations.
 */
export function shellBlocksOnUserLoad(input: {
  isLoading: boolean;
  hasRole: boolean;
}): boolean {
  return input.isLoading && !input.hasRole;
}

/** Block useUser UI only on first hydrate when there is no cached profile to show. */
export function userInitShouldBlockUi(input: {
  alreadyInitialized: boolean;
  hasCachedProfile: boolean;
}): boolean {
  return !input.alreadyInitialized && !input.hasCachedProfile;
}
