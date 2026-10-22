import { getAuthUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { isStaffRole, type StaffRole } from "@/lib/auth/roles";

export type RequireStaffResult =
  | { ok: true; userId: string; email: string | undefined; role: StaffRole }
  | { ok: false; error: string; status: 401 | 403 | 500 };

export type RequireStaffDeps = {
  getAuthUser: () => Promise<{
    data: { user: { id: string; email?: string | null } | null };
  }>;
  findUserRole: (userId: string) => Promise<{ role: string } | null>;
};

async function defaultFindUserRole(userId: string) {
  return prisma.users.findUnique({
    where: { id: userId },
    select: { role: true },
  });
}

/**
 * Session via Supabase Auth; role via Prisma.
 * Allows admin (super admin) or reviewer (verification staff).
 * DB failures return status 500, not a throw.
 */
export async function requireStaff(
  deps: Partial<RequireStaffDeps> = {},
): Promise<RequireStaffResult> {
  const auth = deps.getAuthUser ?? getAuthUser;
  const findUserRole = deps.findUserRole ?? defaultFindUserRole;

  const {
    data: { user },
  } = await auth();

  if (!user) {
    return { ok: false, error: "Unauthorized", status: 401 };
  }

  try {
    const row = await findUserRole(user.id);
    if (!row || !isStaffRole(row.role)) {
      return { ok: false, error: "Forbidden", status: 403 };
    }
    return {
      ok: true,
      userId: user.id,
      email: user.email ?? undefined,
      role: row.role,
    };
  } catch (err) {
    console.error("[requireStaff] Database query failed:", err);
    return { ok: false, error: "Internal server error", status: 500 };
  }
}
