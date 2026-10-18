import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/require-admin";

export async function requireAdminPage() {
  const admin = await requireAdmin();
  if (admin.ok) return admin;
  if (admin.status === 500) {
    throw new Error("Admin role lookup failed");
  }
  redirect(admin.status === 401 ? "/login" : "/");
}
