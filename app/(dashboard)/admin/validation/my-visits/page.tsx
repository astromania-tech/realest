import Link from "next/link";
import { requireStaffPage } from "@/lib/auth/require-staff-page";
import { listMyFieldAssignments } from "@/lib/trust/field-team-store";
import { listMyVisits } from "@/lib/trust/load-case-view";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";

export default async function MyVisitsPage() {
  const staff = await requireStaffPage("/admin/validation/my-visits");
  const [teamAssignments, officerVisits] = await Promise.all([
    listMyFieldAssignments(staff.userId),
    listMyVisits(staff.userId),
  ]);

  const byId = new Map<
    string,
    {
      id: string;
      title: string;
      address: string;
      city: string;
      visitDay: string | null;
      roleOnTeam: string;
      fieldBrief: string | null;
      caseStateLabel: string | null;
      canCheckIn: boolean;
    }
  >();

  for (const item of teamAssignments) {
    byId.set(item.id, {
      id: item.id,
      title: item.title,
      address: item.address,
      city: item.city,
      visitDay: item.visitDay,
      roleOnTeam: item.roleOnTeam,
      fieldBrief: null,
      caseStateLabel: null,
      canCheckIn: item.roleOnTeam === "check_in",
    });
  }
  for (const item of officerVisits) {
    const existing = byId.get(item.id);
    byId.set(item.id, {
      id: item.id,
      title: item.title,
      address: item.address,
      city: item.city,
      visitDay: existing?.visitDay ?? null,
      roleOnTeam: existing?.roleOnTeam ?? "check_in",
      fieldBrief: item.fieldBrief,
      caseStateLabel: item.caseStateLabel,
      canCheckIn: true,
    });
  }

  const visits = Array.from(byId.values());

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
        {visits.map((item) => (
          <article key={item.id} className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
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
              {item.canCheckIn ? (
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
        {visits.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-8 text-center sm:p-10">
            <p className="font-semibold">No field assignments</p>
            <p className="mt-2 text-sm text-muted-foreground">
              You will see a visit here when a supervisor assigns your team leader, or a leader puts you on the team.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
