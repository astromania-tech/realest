/**
 * Connect staff roles:
 * - admin: super admin (system + sensitive PII)
 * - reviewer: desk verification + case decisions
 * - supervisor: field operations (assign team leaders)
 * - team_leader: build case field team
 * - team_member: physical visit / check-in when designated
 */

export const STAFF_ROLES = [
  "admin",
  "reviewer",
  "supervisor",
  "team_leader",
  "team_member",
] as const;

export type StaffRole = (typeof STAFF_ROLES)[number];

export function isStaffRole(role: string | null | undefined): role is StaffRole {
  return (
    role === "admin" ||
    role === "reviewer" ||
    role === "supervisor" ||
    role === "team_leader" ||
    role === "team_member"
  );
}

export function isAdminRole(role: string | null | undefined): boolean {
  return role === "admin";
}

export function isReviewerRole(role: string | null | undefined): boolean {
  return role === "reviewer";
}

/** Who may GPS check in (synced to vetting_officer_id). */
export function isAssignableOfficerRole(role: string | null | undefined): boolean {
  return isStaffRole(role);
}

export const ADMIN_ONLY_PATH_PREFIXES = [
  "/admin/users",
  "/admin/subadmins",
  "/admin/staff",
  "/admin/cms",
  "/admin/emails",
  "/admin/settings",
  "/admin/support",
  "/admin/content",
  "/admin/analytics",
  "/admin/agents",
] as const;

/** Verification surfaces shared by desk/field staff (not marketplace). */
export const VERIFICATION_PATH_PREFIXES = [
  "/admin/validation",
  "/field/visit",
] as const;

export function isAdminOnlyPath(pathname: string): boolean {
  return ADMIN_ONLY_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function isVerificationPath(pathname: string): boolean {
  if (pathname.startsWith("/field/visit")) return true;
  return pathname === "/admin/validation" || pathname.startsWith("/admin/validation/");
}

/**
 * Role → allowed path check for staff shell.
 * Admin: everything. Others: verification paths only (plus notifications).
 */
export function isStaffAllowedPath(role: StaffRole, pathname: string): boolean {
  if (role === "admin") return true;
  if (
    pathname.startsWith("/api/notifications") ||
    pathname === "/notifications" ||
    pathname.startsWith("/admin/validation/inbox")
  ) {
    return true;
  }
  if (!isVerificationPath(pathname) && pathname.startsWith("/admin")) {
    return false;
  }
  if (role === "team_member") {
    return (
      pathname.startsWith("/admin/validation/my-visits") ||
      pathname.startsWith("/admin/validation/inbox") ||
      pathname.startsWith("/field/visit") ||
      pathname.startsWith("/admin/validation/cases/")
    );
  }
  if (role === "team_leader") {
    return (
      isVerificationPath(pathname) &&
      !pathname.startsWith("/admin/users")
    );
  }
  // reviewer + supervisor: full validation tree, not admin-only
  if (isAdminOnlyPath(pathname)) return false;
  if (pathname === "/admin" || pathname === "/admin/") return false;
  return isVerificationPath(pathname);
}

export function staffHomePath(role: StaffRole): string {
  switch (role) {
    case "admin":
      return "/admin";
    case "reviewer":
      return "/admin/validation";
    case "supervisor":
      return "/admin/validation/field";
    case "team_leader":
      return "/admin/validation/field";
    case "team_member":
      return "/admin/validation/my-visits";
    default:
      return "/admin/validation";
  }
}

export const REVIEWER_HIDDEN_PROFILE_FIELDS = ["email", "phone"] as const;

export const SENSITIVE_ADMIN_CAPABILITIES = [
  "owner_agent_email_phone",
  "kyc_id_images_nin_bvn_cac_raw",
  "user_suspend_ban_moderation",
  "subadmin_manage",
  "email_campaigns_audiences_recipients",
  "waitlist_pii_export",
  "cms_user_lists_with_contact",
  "system_status_internals",
] as const;

/** @deprecated use isStaffAllowedPath */
export function isReviewerAllowedPath(pathname: string): boolean {
  return isStaffAllowedPath("reviewer", pathname);
}
