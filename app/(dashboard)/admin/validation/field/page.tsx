import { redirect } from "next/navigation";
import { requireStaffPage } from "@/lib/auth/require-staff-page";
import { staffHomePath } from "@/lib/auth/roles";
import { fieldOpsQueueScope } from "@/lib/trust/case-access";
import { listFieldOpsQueue } from "@/lib/trust/field-team-store";
import { FieldOpsConsole } from "@/components/realest/validation/FieldOpsConsole";

export default async function FieldOpsPage() {
  const staff = await requireStaffPage("/admin/validation/field");
  const scope = fieldOpsQueueScope(staff.role);
  if (scope === "none") redirect(staffHomePath(staff.role));
  const items = await listFieldOpsQueue({
    leaderId: scope === "led" ? staff.userId : undefined,
  });

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
        {items.length === 40 ? (
          <p className="mt-3 text-xs text-muted-foreground">
            Showing the first 40 pending visits.
          </p>
        ) : null}
      </div>

      <FieldOpsConsole items={items} />
    </div>
  );
}
