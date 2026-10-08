import { getAuthUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export type RequireAdminResult =
  | { ok: true; userId: string; email: string | undefined }
  | { ok: false; error: string; status: 401 | 403 | 500 };

export type RequireAdminDeps = {
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
 * Session via Supabase Auth; role via Prisma (never supabase.from('users')).
 * DB failures return { ok: false, status: 500 } so callers keep a structured API response.
 */
export async function requireAdmin(
  deps: Partial<RequireAdminDeps> = {},
): Promise<RequireAdminResult> {
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
    if (!row || row.role !== "admin") {
      return { ok: false, error: "Forbidden", status: 403 };
    }
    return { ok: true, userId: user.id, email: user.email ?? undefined };
  } catch (err) {
    console.error("[requireAdmin] Database query failed:", err);
    return { ok: false, error: "Internal server error", status: 500 };
  }
}
