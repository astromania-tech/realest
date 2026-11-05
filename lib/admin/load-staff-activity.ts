import { prisma } from "@/lib/prisma";
import { pageWindow } from "@/lib/ui/page-window";
import { activityHref, activityLabel } from "@/lib/admin/staff-activity";

export const STAFF_ACTIVITY_PAGE_SIZE = 12;

export type StaffActivityRow = {
  id: string;
  actorName: string;
  actorEmail: string | null;
  title: string;
  detail: string | null;
  href: string | null;
  createdAt: string | null;
};

export async function listStaffActivity(input: {
  page: number;
  actorId?: string;
}): Promise<{ items: StaffActivityRow[]; total: number; page: number }> {
  const where = input.actorId ? { actor_id: input.actorId } : {};
  const total = await prisma.admin_audit_log.count({ where });
  const window = pageWindow(total, input.page, STAFF_ACTIVITY_PAGE_SIZE);
  const rows = await prisma.admin_audit_log.findMany({
    where,
    orderBy: { created_at: "desc" },
    skip: window.start,
    take: STAFF_ACTIVITY_PAGE_SIZE,
    select: {
      id: true,
      action: true,
      target_id: true,
      metadata: true,
      created_at: true,
      profiles: { select: { full_name: true, email: true } },
    },
  });

  return {
    total,
    page: window.page,
    items: rows.map((row) => {
      const label = activityLabel(row.action, row.metadata);
      return {
        id: row.id,
        actorName: row.profiles.full_name || "Staff",
        actorEmail: row.profiles.email,
        title: label.title,
        detail: label.detail,
        href: activityHref(row.action, row.target_id),
        createdAt: row.created_at ? row.created_at.toISOString() : null,
      };
    }),
  };
}
