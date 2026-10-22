"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, Users2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FieldTeamManageModal } from "@/components/realest/validation/FieldTeamManageModal";

export type FieldOpsItem = {
  id: string;
  title: string;
  address: string;
  city: string;
  visitDay: string | null;
  teamLeaderName: string | null;
  confirmed: boolean;
  officerName: string | null;
};

export function FieldOpsConsole({ items }: { items: FieldOpsItem[] }) {
  const [active, setActive] = useState<FieldOpsItem | null>(null);

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="hidden grid-cols-[1.2fr_1fr_0.8fr_0.7fr_auto] gap-4 border-b border-border bg-muted px-5 py-3 text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground md:grid">
          <span>Property</span>
          <span>Location</span>
          <span>Leader</span>
          <span>Team</span>
          <span>Actions</span>
        </div>
        {items.map((item) => (
          <div
            key={item.id}
            className="grid min-w-0 gap-3 border-b border-border px-4 py-4 last:border-b-0 sm:px-5 md:grid-cols-[1.2fr_1fr_0.8fr_0.7fr_auto] md:items-center md:gap-4"
          >
            <div className="min-w-0">
              <Link
                href={`/admin/validation/cases/${item.id}`}
                className="truncate text-sm font-semibold text-foreground hover:underline"
              >
                {item.title}
              </Link>
              <p className="mt-1 text-xs text-muted-foreground">{item.visitDay ?? "Visit day open"}</p>
            </div>
            <p className="flex min-w-0 items-start gap-1.5 text-sm text-muted-foreground">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
              <span className="break-words">
                {item.address}, {item.city}
              </span>
            </p>
            <p className="min-w-0 text-sm">
              <span className="text-xs text-muted-foreground md:hidden">Leader: </span>
              {item.teamLeaderName ?? "No leader"}
            </p>
            <p className="min-w-0 text-sm">
              <span className="text-xs text-muted-foreground md:hidden">Team: </span>
              {item.confirmed
                ? item.officerName
                  ? `Check-in: ${item.officerName}`
                  : "Confirmed"
                : "Awaiting confirm"}
            </p>
            <div className="flex flex-col gap-2 sm:flex-row md:flex-col lg:flex-row">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
                onClick={() => setActive(item)}
              >
                <Users2 className="mr-1.5 h-3.5 w-3.5" />
                {item.teamLeaderName ? "Manage team" : "Assign leader"}
              </Button>
              <Link
                href={`/admin/validation/cases/${item.id}`}
                className="inline-flex h-8 w-full items-center justify-center rounded-md px-3 text-xs font-medium text-muted-foreground hover:bg-accent sm:w-auto"
              >
                Open case
              </Link>
            </div>
          </div>
        ))}
        {items.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground sm:p-12">
            No pending vetting cases need a field team.
          </div>
        ) : null}
      </div>

      <FieldTeamManageModal
        isOpen={Boolean(active)}
        onClose={() => setActive(null)}
        propertyId={active?.id ?? null}
        propertyTitle={active?.title}
      />
    </>
  );
}
