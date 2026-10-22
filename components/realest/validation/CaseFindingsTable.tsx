import { Check, CircleAlert, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CaseFindingRow } from "@/lib/trust/case-view";

function FindingPill({ status }: { status: CaseFindingRow["status"] }) {
  const configs = {
    confirmed: ["Confirmed", Check, "bg-success/15 text-success border-success/20"],
    review: ["Needs review", CircleAlert, "bg-warning/15 text-warning border-warning/20"],
    contradicted: ["Contradicted", X, "bg-destructive/10 text-destructive border-destructive/20"],
    unverified: ["Unverified", CircleAlert, "bg-muted text-muted-foreground border-border"],
  } as const;
  const [label, Icon, classes] = configs[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold", classes)}>
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}

export function CaseFindingsTable({ findings }: { findings: CaseFindingRow[] }) {
  if (findings.length === 0) {
    return <p className="p-5 text-sm text-muted-foreground">Findings appear after desk or field reconciliation.</p>;
  }
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      {findings.map((finding) => (
        <div
          key={finding.id}
          className="grid gap-2 border-b border-border p-4 last:border-0 md:grid-cols-[1fr_1fr_1fr_auto] md:items-center"
        >
          <p className="text-sm font-semibold">{finding.claim}</p>
          <p className="text-sm text-muted-foreground">{finding.submitted}</p>
          <p className="text-sm text-muted-foreground">{finding.observation}</p>
          <FindingPill status={finding.status} />
        </div>
      ))}
    </div>
  );
}
