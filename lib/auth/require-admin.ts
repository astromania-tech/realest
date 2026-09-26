import { getAuthUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export type RequireAdminResult =
  | { ok: true; userId: string; email: string | undefined }
  | { ok: false; error: string; status: 401 | 403 };

/**
 * Session via Supabase Auth; role via Prisma (never supabase.from('users')).
 */
export async function requireAdmin(): Promise<RequireAdminResult> {
  const {
    data: { user },
  } = await getAuthUser();

  if (!user) {
    return { ok: false, error: "Unauthorized", status: 401 };
  }

  const row = await prisma.users.findUnique({
    where: { id: user.id },
    select: { role: true },
  });

  if (!row || row.role !== "admin") {
    return { ok: false, error: "Forbidden", status: 403 };
  }

  return { ok: true, userId: user.id, email: user.email };
}
