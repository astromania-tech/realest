import Link from "next/link";
import { redirect } from "next/navigation";
import { requireStaffPage } from "@/lib/auth/require-staff-page";
import { listMyFieldAssignments } from "@/lib/trust/field-team-store";
import { ListPager } from "@/components/realest/ListPager";
import { pageWindow, parsePage } from "@/lib/ui/page-window";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";

const PAGE_SIZE = 5;

function visitsHref(page: number) {
  return page > 1 ? `/admin/validation/my-visits?page=${page}` : "/admin/validation/my-visits";
}

export default async function MyVisitsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const staff = await requireStaffPage("/admin/validation/my-visits");
  const params = await searchParams;
  const requested = parsePage(params.page);
  const { items, total, page } = await listMyFieldAssignments(staff.userId, {
    page: requested,
    pageSize: PAGE_SIZE,
  });
  if (params.page && requested !== page) redirect(visitsHref(page));
  const window = pageWindow(total, page, PAGE_SIZE);

  return (
    <div className="mx-auto min-w-0 max-w-4xl">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
        Field workspace
      </p>
      <h1 className="mt-1 font-heading text-2xl text-[#07402F] dark:text-foreground sm:text-3xl">
        My visits
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Cases where you lead, join, or check in. Only the check-in officer can write GPS at the pin.
      </p>

      <div className="mt-6 space-y-4 sm:space-y-5">
        {items.map((item) => (
          <article
            key={item.id}
            className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5"
            style={{ contentVisibility: "auto", containIntrinsicSize: "auto 180px" }}
          >
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:gap-4">
              <div className="min-w-0">
                <p className="font-mono text-xs text-muted-foreground">{item.id.slice(0, 8)}…</p>
                <h2 className="mt-2 break-words text-lg font-semibold sm:text-xl">{item.title}</h2>
                <p className="mt-2 flex items-start gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                  <span className="break-words">
                    {item.address}, {item.city}
                  </span>
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {item.visitDay ?? "Day TBD"} · {item.roleOnTeam}
                </p>
              </div>
              {item.caseStateLabel ? (
                <Badge variant="secondary" className="w-fit shrink-0">
                  {item.caseStateLabel}
                </Badge>
              ) : null}
            </div>
            {item.fieldBrief ? (
              <div className="mt-4 rounded-xl border border-border p-3 sm:mt-5 sm:p-4">
                <p className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">
                  Verification brief
                </p>
                <p className="mt-2 text-sm leading-6">{item.fieldBrief}</p>
              </div>
            ) : null}
            <div className="mt-4 flex flex-col gap-2 sm:mt-5 sm:flex-row sm:flex-wrap">
              {item.roleOnTeam === "check_in" ? (
                <Link
                  className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 sm:w-auto"
                  href={`/field/visit/${item.id}`}
                >
                  Open phone check-in
                </Link>
              ) : null}
              <Link
                className="inline-flex w-full items-center justify-center rounded-md border border-border px-4 py-2.5 text-sm font-semibold hover:bg-accent sm:w-auto"
                href={`/admin/validation/cases/${item.id}`}
              >
                Case record
              </Link>
            </div>
          </article>
        ))}
        {total === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-8 text-center sm:p-10">
            <p className="font-semibold">No field assignments</p>
            <p className="mt-2 text-sm text-muted-foreground">
              You will see a visit here when a supervisor assigns your team leader, or a leader puts you on the team.
            </p>
          </div>
        ) : null}
      </div>
      <ListPager
        page={window.page}
        pageCount={window.pageCount}
        from={window.from}
        to={window.to}
        total={total}
        prevHref={window.page > 1 ? visitsHref(window.page - 1) : null}
        nextHref={window.page < window.pageCount ? visitsHref(window.page + 1) : null}
      />
    </div>
  );
}
