import Link from "next/link";
import { requireStaffPage } from "@/lib/auth/require-staff-page";
import { listCaseQueue, listMyVisits } from "@/lib/trust/load-case-view";
import type { CaseQueueFilter } from "@/lib/trust/case-view";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Building, CheckCircle, Eye, MapPin, Search, Users2, XCircle } from "lucide-react";

const FILTERS: { id: CaseQueueFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "review", label: "Review" },
  { id: "field", label: "Field" },
  { id: "verified", label: "Verified" },
  { id: "duplicates", label: "Duplicates" },
];

export default async function ValidationPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; q?: string }>;
}) {
  const staff = await requireStaffPage();
  const params = await searchParams;
  const filter = (FILTERS.some((item) => item.id === params.filter)
    ? params.filter
    : "all") as CaseQueueFilter;
  const search = params.q ?? "";

  const [{ items, metrics }, myVisits] = await Promise.all([
    listCaseQueue({ filter, search, limit: 50 }),
    listMyVisits(staff.userId),
  ]);

  return (
    <div>
      <div className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Verification
          </p>
          <h1 className="mt-1 font-heading text-3xl text-[#07402F] dark:text-foreground">
            Case queue
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Monitor work by evidence state, operational priority, and reviewer readiness.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((item) => {
            const href =
              item.id === "all"
                ? `/admin/validation${search ? `?q=${encodeURIComponent(search)}` : ""}`
                : `/admin/validation?filter=${item.id}${search ? `&q=${encodeURIComponent(search)}` : ""}`;
            const active = filter === item.id;
            return (
              <Link
                key={item.id}
                href={href}
                className={
                  active
                    ? "rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground"
                    : "rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent"
                }
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {[
          ["Needs review", metrics.review, Eye],
          ["Field visits", metrics.field, MapPin],
          ["Duplicates", metrics.duplicates, XCircle],
          ["Verified", metrics.verified, CheckCircle],
        ].map(([label, value, Icon]) => {
          const MetricIcon = Icon as typeof CheckCircle;
          return (
            <Card key={label as string}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <MetricIcon className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{value as number}</p>
                    <p className="text-sm text-muted-foreground">{label as string}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <Users2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  Assign field teams
                </p>
                <p className="mt-1 text-sm font-semibold">
                  Team leaders are assigned on Field ops, not this list
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Only listings in pending vetting appear there. Open a case → Field visit, or use
                  Field ops for bulk assign.
                </p>
              </div>
            </div>
            <Link
              href="/admin/validation/field"
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              Open Field ops
            </Link>
          </div>
        </CardContent>
      </Card>

      {myVisits.length > 0 ? (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  My visits
                </p>
                <p className="mt-1 text-sm font-semibold">
                  {myVisits.length} assignment{myVisits.length === 1 ? "" : "s"} on you
                </p>
              </div>
              <Link href="/admin/validation/my-visits" className="text-sm font-semibold text-primary hover:underline">
                Open my visits
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <form className="mb-6 flex max-w-lg items-center gap-2 rounded-xl border border-border bg-card px-3 shadow-sm">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          name="q"
          defaultValue={search}
          placeholder="Search case, address or property"
          className="border-0 bg-transparent shadow-none focus-visible:ring-0"
        />
        {filter !== "all" ? <input type="hidden" name="filter" value={filter} /> : null}
      </form>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="hidden grid-cols-[1.15fr_1.1fr_0.85fr_0.7fr_auto] gap-4 border-b border-border bg-muted px-5 py-3 text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground md:grid">
          <span>Case</span>
          <span>Location</span>
          <span>Workflow</span>
          <span>Coverage</span>
          <span />
        </div>
        {items.map((item) => {
          const needsFieldAssign = item.listingStatus === "pending_vetting" && !item.officerName;
          return (
            <Link
              key={item.id}
              href={
                needsFieldAssign
                  ? `/admin/validation/cases/${item.id}?tab=Field+visit`
                  : `/admin/validation/cases/${item.id}`
              }
              className="grid gap-3 border-b border-border px-5 py-4 transition-colors last:border-b-0 hover:bg-secondary/40 md:grid-cols-[1.15fr_1.1fr_0.85fr_0.7fr_auto] md:items-center md:gap-4"
            >
              <div>
                <p className="font-mono text-xs text-muted-foreground">{item.id.slice(0, 8)}…</p>
                <p className="mt-1 text-sm font-semibold">{item.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{item.priority} priority</p>
              </div>
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {item.address}
              </p>
              <div>
                <Badge variant="secondary">{item.caseStateLabel}</Badge>
                <p className="mt-1 text-xs text-muted-foreground">{item.risk} risk</p>
              </div>
              <div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Evidence</span>
                  <span>{item.evidenceCoverage}%</span>
                </div>
                <Progress value={item.evidenceCoverage} className="mt-2 h-1.5" />
              </div>
              <span className="hidden text-xs font-semibold text-primary md:inline">
                {needsFieldAssign ? "Assign team →" : null}
              </span>
            </Link>
          );
        })}
        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-12 text-center text-sm text-muted-foreground">
            <Building className="h-6 w-6" />
            {filter === "field" ? (
              <>
                <p>No pending vetting cases yet.</p>
                <p className="max-w-sm">
                  Field assign only appears after a listing clears desk review into pending vetting.
                  Use Field ops once those cases exist.
                </p>
                <Link href="/admin/validation/field" className="mt-2 font-semibold text-primary hover:underline">
                  Open Field ops
                </Link>
              </>
            ) : (
              <p>No cases match this queue view.</p>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
