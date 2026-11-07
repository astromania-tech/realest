import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/require-admin";
import { listInvitedStaff } from "@/lib/auth/invite-staff";
import { readStaffOpsLocation } from "@/lib/trust/officer-ops";
import { StaffInvitesConsole } from "@/components/admin/StaffInvitesConsole";

export default async function StaffInvitesPage() {
  const admin = await requireAdmin();
  if (!admin.ok) {
    redirect(admin.status === 401 ? "/login?redirect=/admin/staff" : "/");
  }

  const rows = await listInvitedStaff();
  const staff = rows.map((person) => {
    const ops = readStaffOpsLocation(person);
    return {
      id: person.id,
      full_name: person.full_name,
      email: person.email,
      role: person.role,
      created_at: person.created_at,
      is_active: person.is_active,
      state: ops?.state ?? null,
      lga: ops?.lga ?? null,
    };
  });

  return (
    <div className="min-w-0 space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
          Admin only
        </p>
        <h1 className="mt-1 font-heading text-2xl text-[#07402F] dark:text-foreground sm:text-3xl">
          Staff invites
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Invite reviewers and field officers with operating state and LGA. Assignment prefers free
          officers in the same state as the property.
        </p>
      </div>

      <StaffInvitesConsole staff={staff} />
    </div>
  );
}
