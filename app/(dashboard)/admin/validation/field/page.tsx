import { redirect } from "next/navigation";
import { requireStaffPage } from "@/lib/auth/require-staff-page";
import { staffHomePath } from "@/lib/auth/roles";
import { fieldOpsQueueScope } from "@/lib/trust/case-access";
import { listFieldOpsQueue } from "@/lib/trust/field-team-store";
import { FieldOpsConsole } from "@/components/realest/validation/FieldOpsConsole";
import { ListPager } from "@/components/realest/ListPager";
import { pageWindow, parsePage } from "@/lib/ui/page-window";

const PAGE_SIZE = 8;

function fieldHref(page: number) {
  return page > 1 ? `/admin/validation/field?page=${page}` : "/admin/validation/field";
}

export default async function FieldOpsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const staff = await requireStaffPage("/admin/validation/field");
  const scope = fieldOpsQueueScope(staff.role);
  if (scope === "none") redirect(staffHomePath(staff.role));
  const requested = parsePage((await searchParams).page);
  const { items, total, page } = await listFieldOpsQueue({
    limit: PAGE_SIZE,
    page: requested,
    leaderId: scope === "led" ? staff.userId : undefined,
  });
  if ((await searchParams).page && requested !== page) redirect(fieldHref(page));
  const window = pageWindow(total, page, PAGE_SIZE);

  return (
    <div className="min-w-0">
      <div className="mb-6 sm:mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
          Field operations
        </p>
        <h1 className="mt-1 font-heading text-2xl text-[#07402F] dark:text-foreground sm:text-3xl">
          Team visits
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          {scope === "led"
            ? "Teams you lead. Confirm members and the check-in officer. Only that officer writes GPS at the pin."
            : "Assign a team leader per case from the list, or open the case. The leader confirms members and the check-in officer. Only the check-in officer writes GPS at the pin."}
        </p>
      </div>

      <FieldOpsConsole items={items} />
      <ListPager
        page={window.page}
        pageCount={window.pageCount}
        from={window.from}
        to={window.to}
        total={total}
        prevHref={window.page > 1 ? fieldHref(window.page - 1) : null}
        nextHref={window.page < window.pageCount ? fieldHref(window.page + 1) : null}
      />
    </div>
  );
}
