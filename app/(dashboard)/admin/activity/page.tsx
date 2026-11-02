import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/require-admin";
import { listStaffActivity, STAFF_ACTIVITY_PAGE_SIZE } from "@/lib/admin/load-staff-activity";
import { activityClock, activityScope, groupActivityByDay } from "@/lib/admin/staff-activity";
import { ListPager } from "@/components/realest/ListPager";
import { pageWindow, parsePage } from "@/lib/ui/page-window";

function activityPageHref(scope: "all" | "mine", page: number) {
  const params = new URLSearchParams();
  if (scope === "mine") params.set("scope", "mine");
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/admin/activity?${query}` : "/admin/activity";
}

export default async function StaffActivityPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; scope?: string }>;
}) {
  const admin = await requireAdmin();
  if (!admin.ok) {
    redirect(admin.status === 401 ? "/login?redirect=/admin/activity" : "/");
  }

  const params = await searchParams;
  const scope = activityScope(params.scope);
  const requested = parsePage(params.page);
  const { items, total, page } = await listStaffActivity({
    page: requested,
    actorId: scope === "mine" ? admin.userId : undefined,
  });
  if (params.page && requested !== page) redirect(activityPageHref(scope, page));
  const window = pageWindow(total, page, STAFF_ACTIVITY_PAGE_SIZE);
  const groups = groupActivityByDay(items);

  return (
    <div className="min-w-0">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
        Admin only
      </p>
      <h1 className="mt-1 font-heading text-2xl text-[#07402F] dark:text-foreground sm:text-3xl">
        Staff activity
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Each page is grouped by day, newest first. Case timelines still show the latest 40 for that property.
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        <Link
          href="/admin/activity"
          className={
            scope === "all"
              ? "rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground"
              : "rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent"
          }
        >
          Everyone
        </Link>
        <Link
          href="/admin/activity?scope=mine"
          className={
            scope === "mine"
              ? "rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground"
              : "rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent"
          }
        >
          Mine
        </Link>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="hidden grid-cols-[4.5rem_minmax(0,0.9fr)_minmax(0,1.5fr)] gap-4 border-b border-border bg-muted px-5 py-3 text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground md:grid">
          <span>When</span>
          <span>Who</span>
          <span>Action</span>
        </div>
        {groups.map((group) => (
          <section key={group.day}>
            <h2 className="border-b border-border bg-muted/70 px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#07402F] dark:text-foreground sm:px-5">
              {group.day}
            </h2>
            {group.items.map((item) => (
              <div
                key={item.id}
                className="grid min-w-0 grid-cols-[4.5rem_minmax(0,1fr)] gap-x-3 gap-y-1 border-b border-border px-4 py-2.5 last:border-b-0 sm:px-5 md:grid-cols-[4.5rem_minmax(0,0.9fr)_minmax(0,1.5fr)] md:items-center md:gap-4"
                style={{ contentVisibility: "auto", containIntrinsicSize: "auto 56px" }}
              >
                <p className="text-xs font-medium tabular-nums text-muted-foreground">
                  {activityClock(item.createdAt)}
                </p>
                <p className="min-w-0 truncate text-sm font-medium" title={item.actorEmail || undefined}>
                  {item.actorName}
                </p>
                <div className="col-span-2 min-w-0 md:col-span-1">
                  {item.href ? (
                    <Link href={item.href} className="break-words text-sm font-semibold text-primary hover:underline">
                      {item.title}
                    </Link>
                  ) : (
                    <p className="break-words text-sm font-semibold">{item.title}</p>
                  )}
                  {item.detail ? <p className="truncate text-xs text-muted-foreground">{item.detail}</p> : null}
                </div>
              </div>
            ))}
          </section>
        ))}
        {items.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-muted-foreground">
            {scope === "mine" ? "You have no recorded actions yet." : "No staff actions recorded yet."}
          </p>
        ) : null}
      </div>

      <ListPager
        page={window.page}
        pageCount={window.pageCount}
        from={window.from}
        to={window.to}
        total={total}
        prevHref={window.page > 1 ? activityPageHref(scope, window.page - 1) : null}
        nextHref={window.page < window.pageCount ? activityPageHref(scope, window.page + 1) : null}
      />
    </div>
  );
}
