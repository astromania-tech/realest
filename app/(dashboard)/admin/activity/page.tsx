import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/require-admin";
import { listStaffActivity, STAFF_ACTIVITY_PAGE_SIZE } from "@/lib/admin/load-staff-activity";
import { activityScope } from "@/lib/admin/staff-activity";
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

  return (
    <div className="min-w-0">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
        Admin only
      </p>
      <h1 className="mt-1 font-heading text-2xl text-[#07402F] dark:text-foreground sm:text-3xl">
        Staff activity
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Every recorded staff action, newest first. Case timelines still show the latest 40 for that property.
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
        <div className="hidden grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_9.5rem] gap-4 border-b border-border bg-muted px-5 py-3 text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground md:grid">
          <span>Who</span>
          <span>Action</span>
          <span>When</span>
        </div>
        {items.map((item) => {
          const when = item.createdAt
            ? new Date(item.createdAt).toLocaleString("en-NG", { timeZone: "Africa/Lagos" })
            : "";
          return (
            <div
              key={item.id}
              className="grid min-w-0 gap-1 border-b border-border px-4 py-3 last:border-b-0 sm:px-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_9.5rem] md:items-center md:gap-4"
              style={{ contentVisibility: "auto", containIntrinsicSize: "auto 72px" }}
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{item.actorName}</p>
                <p className="truncate text-xs text-muted-foreground">{item.actorEmail}</p>
              </div>
              <div className="min-w-0">
                {item.href ? (
                  <Link href={item.href} className="break-words text-sm font-semibold text-primary hover:underline">
                    {item.title}
                  </Link>
                ) : (
                  <p className="break-words text-sm font-semibold">{item.title}</p>
                )}
                {item.detail ? <p className="truncate text-xs text-muted-foreground">{item.detail}</p> : null}
              </div>
              <p className="text-xs text-muted-foreground md:text-right">{when}</p>
            </div>
          );
        })}
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
