import { redirect } from "next/navigation";
import { requireStaffPage } from "@/lib/auth/require-staff-page";

export default async function VettingReportRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireStaffPage();
  const { id } = await params;
  redirect(`/admin/validation/cases/${id}`);
}
