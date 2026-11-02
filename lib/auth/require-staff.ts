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
  findUserRole: (
    userId: string,
  ) => Promise<{ role: string; is_active?: boolean; deleted_at?: Date | null } | null>;
};

async function defaultFindUserRole(userId: string) {
  return prisma.users.findUnique({
    where: { id: userId },
    select: { role: true, is_active: true, deleted_at: true },
  });
}

function staffAccountClosed(row: {
  is_active?: boolean;
  deleted_at?: Date | null;
}): boolean {
  return row.is_active === false || Boolean(row.deleted_at);
}

/**
 * Session via Supabase Auth; role via Prisma.
 * Allows admin, reviewer, supervisor, team_leader, and team_member.
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
    if (!row || !isStaffRole(row.role) || staffAccountClosed(row)) {
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
