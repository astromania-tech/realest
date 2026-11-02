"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StaffInviteForm } from "@/components/admin/StaffInviteForm";
import { ListPager } from "@/components/realest/ListPager";
import { StaffInviteModal } from "@/components/realest/validation/StaffInviteModal";
import { STAFF_ROLE_LABELS, type InvitableStaffRole } from "@/lib/auth/staff-invite";
import { pageWindow } from "@/lib/ui/page-window";

const PAGE_SIZE = 6;

type StaffRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string;
  created_at: Date | string | null;
  is_active: boolean | null;
  state?: string | null;
  lga?: string | null;
};

export function StaffInvitesConsole({ staff }: { staff: StaffRow[] }) {
  const router = useRouter();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return staff;
    return staff.filter((person) =>
      [person.full_name, person.email, person.role, person.state, person.lga]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }, [query, staff]);

  const window = pageWindow(filtered.length, page, PAGE_SIZE);
  const visible = filtered.slice(window.start, window.end);

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-heading text-lg sm:text-xl">Invite someone</h2>
        <Button
          type="button"
          variant="outline"
          className="w-full sm:w-auto"
          onClick={() => setInviteOpen(true)}
        >
          <UserPlus className="mr-1.5 h-4 w-4" />
          Quick invite
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="min-w-0">
          <StaffInviteForm />
        </div>

        <div className="min-w-0">
          <h2 className="font-heading text-lg sm:text-xl">
            Current verification staff ({staff.length})
          </h2>
          <div className="mt-3 flex items-center gap-2 rounded-md border border-border px-3">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              placeholder="Search name, email, or role"
              className="border-0 bg-transparent shadow-none focus-visible:ring-0"
            />
          </div>
          {visible.length > 0 ? (
            <div className="mt-3 divide-y divide-border overflow-hidden rounded-md border border-border">
              {visible.map((person) => (
                <div key={person.id} className="flex min-w-0 items-center justify-between gap-3 px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{person.full_name || "Staff"}</p>
                    <p className="truncate text-xs text-muted-foreground">{person.email}</p>
                  </div>
                  <p className="max-w-[46%] shrink-0 text-right text-xs text-muted-foreground">
                    {STAFF_ROLE_LABELS[person.role as InvitableStaffRole] ?? person.role}
                    {person.is_active === false ? " · inactive" : ""}
                    <span className="mt-0.5 block truncate">
                      {person.lga || person.state
                        ? [person.lga, person.state].filter(Boolean).join(", ")
                        : "Location not set"}
                    </span>
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              {staff.length === 0
                ? "No reviewers or field staff yet. Send the first invite."
                : "No staff match that search."}
            </p>
          )}
          <ListPager
            page={window.page}
            pageCount={window.pageCount}
            from={window.from}
            to={window.to}
            total={filtered.length}
            onPrev={() => setPage(window.page - 1)}
            onNext={() => setPage(window.page + 1)}
          />
        </div>
      </div>

      <StaffInviteModal
        isOpen={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onInvited={() => router.refresh()}
      />
    </>
  );
}
