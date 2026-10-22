import { requireStaffPage } from "@/lib/auth/require-staff-page";
import { StaffInbox } from "@/components/realest/validation/StaffInbox";

export default async function StaffInboxPage() {
  await requireStaffPage("/admin/validation/inbox");
  return <StaffInbox />;
}
