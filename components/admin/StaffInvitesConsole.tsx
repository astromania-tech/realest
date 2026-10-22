"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StaffInviteForm } from "@/components/admin/StaffInviteForm";
import { StaffInviteModal } from "@/components/realest/validation/StaffInviteModal";
import { STAFF_ROLE_LABELS, type InvitableStaffRole } from "@/lib/auth/staff-invite";

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
          <h2 className="mb-4 font-heading text-lg sm:text-xl">
            Current verification staff ({staff.length})
          </h2>
          {staff.length > 0 ? (
            <div className="space-y-2">
              {staff.map((person) => (
                <div key={person.id} className="rounded-md border border-border p-3 sm:p-4">
                  <p className="break-words font-medium">{person.full_name || "Staff"}</p>
                  <p className="break-all text-sm text-muted-foreground">{person.email}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {STAFF_ROLE_LABELS[person.role as InvitableStaffRole] ?? person.role}
                    {person.lga || person.state
                      ? ` · ${[person.lga, person.state].filter(Boolean).join(", ")}`
                      : " · location not set"}
                    {person.is_active === false ? " · inactive" : ""}
                    {person.created_at
                      ? ` · added ${new Date(person.created_at).toLocaleDateString("en-NG")}`
                      : ""}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No reviewers or field staff yet. Send the first invite.
            </p>
          )}
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
