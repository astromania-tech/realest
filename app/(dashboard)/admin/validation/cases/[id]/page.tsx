import { notFound, redirect } from "next/navigation";
import { requireStaffPage } from "@/lib/auth/require-staff-page";
import { staffHomePath } from "@/lib/auth/roles";
import { caseDetailAccess, redactCaseDetailForVisit } from "@/lib/trust/case-access";
import { readFieldTeam } from "@/lib/trust/field-team-store";
import { loadCaseDetail } from "@/lib/trust/load-case-view";
import { badgeWriteAllowed, observationConflicts } from "@/lib/trust/visit";
import { readStoredVisit } from "@/lib/trust/visit-store";
import { CaseDetailConsole } from "@/components/realest/validation/CaseDetailConsole";

export default async function VerificationCasePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id } = await params;
  const { tab } = await searchParams;
  const staff = await requireStaffPage();
  const team = await readFieldTeam(id);
  const access = caseDetailAccess({
    role: staff.role,
    userId: staff.userId,
    teamLeaderId: team?.teamLeaderId ?? null,
    memberIds: team?.memberIds ?? [],
    checkInOfficerId: team?.checkInOfficerId ?? null,
  });
  if (access === "none") redirect(staffHomePath(staff.role));

  const detail = await loadCaseDetail(id);
  if (!detail) notFound();
  const visible = access === "visit" ? redactCaseDetailForVisit(detail) : detail;

  const visit = await readStoredVisit(id);
  const badge = badgeWriteAllowed(visit);
  const conflicts =
    visit.sawBuilding === null ||
    visit.addressMatches === null ||
    visit.documentMatches === null ||
    visit.distanceMeters === null
      ? []
      : observationConflicts({
          sawBuilding: visit.sawBuilding,
          addressMatches: visit.addressMatches,
          documentMatches: visit.documentMatches,
          distanceMeters: visit.distanceMeters,
        });

  return (
    <CaseDetailConsole
      detail={visible}
      detailLevel={access === "visit" ? "visit" : "full"}
      canApprove={badge.ok}
      blockReason={badge.ok ? null : badge.error}
      conflicts={conflicts}
      initialTab={tab ?? null}
    />
  );
}
