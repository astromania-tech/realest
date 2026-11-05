import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/auth/require-staff";
import { isStaffAllowedPath, staffHomePath, type StaffRole } from "@/lib/auth/roles";

/**
 * Page gate for Connect staff roles.
 * Non-admin staff hitting blocked paths are sent to their home.
 */
export async function requireStaffPage(pathname?: string) {
  const staff = await requireStaff();
  if (!staff.ok) {
    if (staff.status === 500) {
      throw new Error("Staff role lookup failed");
    }
    redirect(staff.status === 401 ? "/login" : "/");
  }

  if (pathname && staff.role !== "admin" && !isStaffAllowedPath(staff.role as StaffRole, pathname)) {
    redirect(staffHomePath(staff.role));
  }

  return staff;
}
