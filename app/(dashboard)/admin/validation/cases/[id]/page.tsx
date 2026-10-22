import { notFound } from "next/navigation";
import { requireStaffPage } from "@/lib/auth/require-staff-page";
import { prisma } from "@/lib/prisma";
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
  await requireStaffPage();

  const detail = await loadCaseDetail(id);
  if (!detail) notFound();

  const [officers, visit] = await Promise.all([
    prisma.users.findMany({
      where: {
        role: { in: ["admin", "reviewer", "supervisor", "team_leader", "team_member"] },
        is_active: true,
        deleted_at: null,
      },
      select: { id: true, full_name: true },
      orderBy: { full_name: "asc" },
    }),
    readStoredVisit(id),
  ]);

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
      detail={detail}
      officers={officers}
      canApprove={badge.ok}
      blockReason={badge.ok ? null : badge.error}
      conflicts={conflicts}
      initialTab={tab ?? null}
    />
  );
}
