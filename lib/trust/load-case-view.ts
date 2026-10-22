import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/prisma/client";
import { readTrustDecision } from "@/lib/trust/gate";
import { fraudSummary, readFraudFindings } from "@/lib/trust/fraud";
import type { ClaimFinding } from "@/lib/trust/claims";
import { evidenceLines } from "@/lib/trust/case";
import { readPublicCase, readStoredVisit } from "@/lib/trust/visit-store";
import {
  caseQueueBaseStatusSql,
  caseQueueFilterSql,
  caseQueueSearchSql,
} from "@/lib/trust/case-queue-sql";
import {
  buildFieldBrief,
  claimFindingToRow,
  deriveCasePriority,
  deriveCaseRisk,
  deriveEvidenceCoverage,
  fraudFindingToRow,
  queueItemLabels,
  type CaseDetailView,
  type CaseQueueFilter,
  type CaseQueueItem,
} from "@/lib/trust/case-view";

type PropertyQueueRow = {
  id: string;
  title: string;
  address: string;
  city: string;
  state: string | null;
  status: string;
  verification_status: string;
  created_at: Date | null;
  owner_name: string | null;
  officer_name: string | null;
  case_state: string | null;
  judgment: string | null;
  claims: unknown;
  evidence_count: number;
  document_count: number;
  has_check_in: boolean;
  open_issue: string | null;
};

function asClaims(raw: unknown): ClaimFinding[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (row): row is ClaimFinding =>
      Boolean(row) &&
      typeof row === "object" &&
      "point" in row &&
      "status" in row &&
      "claim" in row &&
      "evidence" in row,
  );
}

function toQueueItem(row: PropertyQueueRow): CaseQueueItem {
  const claims = asClaims(row.claims);
  const supported = claims.filter((c) => c.status === "supported").length;
  const risk = deriveCaseRisk({
    hardBlocks: [],
    flags: [],
    openIssue: row.open_issue,
    listingStatus: row.status,
  });
  const coverage = deriveEvidenceCoverage({
    evidenceCount: Number(row.evidence_count) || 0,
    documentCount: Number(row.document_count) || 0,
    hasCheckIn: Boolean(row.has_check_in),
    claimCount: claims.length,
    supportedClaims: supported,
  });
  const labels = queueItemLabels(row.case_state, row.status);
  return {
    id: row.id,
    title: row.title,
    address: row.address,
    city: [row.city, row.state].filter(Boolean).join(", "),
    listingStatus: row.status,
    caseState: row.case_state,
    caseStateLabel: labels.caseStateLabel,
    risk,
    priority: deriveCasePriority(risk, row.status),
    evidenceCoverage: coverage,
    officerName: row.officer_name,
    ownerName: row.owner_name,
    submittedAt: row.created_at ? row.created_at.toISOString() : null,
    fieldBrief: row.judgment,
  };
}

const QUEUE_SELECT = Prisma.sql`
  p.id::text as id,
  p.title,
  p.address,
  p.city,
  p.state,
  p.status,
  p.verification_status,
  p.created_at,
  pr.full_name as owner_name,
  ou.full_name as officer_name,
  k.state as case_state,
  k.judgment,
  k.claims,
  coalesce((select count(*)::int from public.property_verification_evidence e where e.property_id = p.id), 0) as evidence_count,
  coalesce((select count(*)::int from public.property_documents d where d.property_id = p.id), 0) as document_count,
  (c.checked_in_at is not null) as has_check_in,
  c.open_issue
`;

const QUEUE_FROM = Prisma.sql`
  from public.properties p
  left join public.owners o on o.id = p.owner_id
  left join public.profiles pr on pr.id = o.profile_id
  left join public.users ou on ou.id = p.vetting_officer_id
  left join public.property_verification_cases k on k.property_id = p.id
  left join public.property_visit_checks c on c.property_id = p.id
`;

async function loadCaseQueueMetrics(): Promise<Record<string, number>> {
  const base = caseQueueBaseStatusSql();
  const [row] = await prisma.$queryRaw<
    Array<{
      total: number;
      review: number;
      field: number;
      verified: number;
      duplicates: number;
    }>
  >(Prisma.sql`
    select
      count(*)::int as total,
      count(*) filter (where
        p.status = 'pending_ml_validation'
        or k.state in ('human_review', 'desk_review', 'reconciliation')
      )::int as review,
      count(*) filter (where
        p.status = 'pending_vetting'
        or k.state in ('field_assigned', 'field_in_progress', 'field_complete')
      )::int as field,
      count(*) filter (where
        p.status = 'live' or k.state = 'verified'
      )::int as verified,
      count(*) filter (where
        p.status = 'pending_duplicate_review'
      )::int as duplicates
    from public.properties p
    left join public.property_verification_cases k on k.property_id = p.id
    where ${base}
  `);

  return {
    total: row?.total ?? 0,
    review: row?.review ?? 0,
    field: row?.field ?? 0,
    verified: row?.verified ?? 0,
    duplicates: row?.duplicates ?? 0,
  };
}

export async function listCaseQueue(input: {
  filter: CaseQueueFilter;
  search: string;
  limit?: number;
}): Promise<{ items: CaseQueueItem[]; metrics: Record<string, number> }> {
  const take = Math.max(1, Math.min(input.limit ?? 50, 200));
  const filterSql = caseQueueFilterSql(input.filter);
  const searchSql = caseQueueSearchSql(input.search);
  const base = caseQueueBaseStatusSql();

  const [rows, metrics] = await Promise.all([
    prisma.$queryRaw<PropertyQueueRow[]>(Prisma.sql`
      select ${QUEUE_SELECT}
      ${QUEUE_FROM}
      where ${base}
      ${filterSql}
      ${searchSql}
      order by p.created_at asc nulls last
      limit ${take}
    `),
    loadCaseQueueMetrics(),
  ]);

  return { items: rows.map(toQueueItem), metrics };
}

export async function loadCaseDetail(propertyId: string): Promise<CaseDetailView | null> {
  const property = await prisma.properties.findFirst({
    where: { id: propertyId },
    select: {
      id: true,
      title: true,
      description: true,
      price: true,
      property_type: true,
      address: true,
      city: true,
      state: true,
      status: true,
      verification_status: true,
      created_at: true,
      owners: { select: { profiles: { select: { full_name: true } } } },
      property_documents: {
        select: { id: true, document_type: true, file_name: true, document_url: true },
        take: 30,
      },
      property_media: {
        select: { id: true, file_name: true, media_url: true },
        take: 12,
      },
    },
  });
  if (!property) return null;

  const [visit, record, job, auditRows] = await Promise.all([
    readStoredVisit(property.id),
    readPublicCase(property.id),
    prisma.property_validation_jobs.findFirst({
      where: {
        property_id: property.id,
        job_kind: "property",
        source: "trust-reader",
        status: "completed",
      },
      orderBy: { queued_at: "desc" },
      select: { result: true },
    }),
    prisma.admin_audit_log.findMany({
      where: { target_id: property.id },
      orderBy: { created_at: "desc" },
      take: 40,
      select: { id: true, action: true, created_at: true, metadata: true },
    }),
  ]);

  const trust = readTrustDecision(job?.result);
  const fraud = readFraudFindings(job?.result, trust);
  const hardBlocks = trust?.hardBlocks ?? [];
  const flags = trust?.flags ?? [];

  const officerRow = visit.officerId
    ? await prisma.users.findUnique({
        where: { id: visit.officerId },
        select: { full_name: true },
      })
    : null;

  const claims = asClaims(record.claims);
  const findings =
    claims.length > 0 ? claims.map(claimFindingToRow) : fraud.map(fraudFindingToRow);

  const risk = deriveCaseRisk({
    hardBlocks,
    flags,
    openIssue: visit.openIssue,
    listingStatus: property.status,
  });

  const evidence = record.evidence.map((row, index) => {
    const lines = evidenceLines(row.layer, row.body);
    return {
      id: `EV-${index + 1}`,
      title: row.layer,
      kind: row.layer,
      capturedAt: row.recordedAt,
      layer: row.layer,
      supports: lines.map((line) => `${line.label}: ${line.value}`).join("; ") || "Case evidence",
    };
  });

  const audit = auditRows.map((row) => ({
    id: row.id,
    time: row.created_at
      ? new Date(row.created_at).toLocaleString("en-NG", { timeZone: "Africa/Lagos" })
      : "",
    title: row.action,
    detail:
      row.metadata && typeof row.metadata === "object" && row.metadata !== null
        ? JSON.stringify(row.metadata).slice(0, 180)
        : "Staff action",
  }));

  const labels = queueItemLabels(record.state, property.status);
  const coverage = deriveEvidenceCoverage({
    evidenceCount: evidence.length,
    documentCount: property.property_documents.length,
    hasCheckIn: Boolean(visit.checkedInAt),
    claimCount: claims.length,
    supportedClaims: claims.filter((c) => c.status === "supported").length,
  });

  return {
    id: property.id,
    title: property.title,
    address: property.address,
    city: [property.city, property.state].filter(Boolean).join(", "),
    listingStatus: property.status,
    caseState: record.state,
    caseStateLabel: labels.caseStateLabel,
    risk,
    priority: deriveCasePriority(risk, property.status),
    evidenceCoverage: coverage,
    officerName: officerRow?.full_name ?? null,
    ownerName: property.owners?.profiles.full_name ?? null,
    submittedAt: property.created_at ? property.created_at.toISOString() : null,
    fieldBrief: buildFieldBrief({
      judgment: record.judgment,
      fraudSummary: fraudSummary(fraud),
      hardBlocks,
      flags,
    }),
    description: property.description,
    propertyType: property.property_type,
    priceNaira: `₦${Number(property.price).toLocaleString("en-NG")}`,
    verificationStatus: property.verification_status,
    judgment: record.judgment,
    findings,
    evidence,
    audit,
    documents: property.property_documents,
    media: property.property_media,
    visit: {
      officerId: visit.officerId,
      visitDay: visit.visitDay,
      checkedInAt: visit.checkedInAt,
      distanceMeters: visit.distanceMeters,
      sawBuilding: visit.sawBuilding,
      addressMatches: visit.addressMatches,
      documentMatches: visit.documentMatches,
      openIssue: visit.openIssue,
      registryReference: visit.registryReference,
      registryMatches: visit.registryMatches,
    },
    trustAllowsVetting: trust?.allowsVetting ?? false,
    hardBlocks,
    flags,
  };
}

export async function listMyVisits(officerId: string): Promise<CaseQueueItem[]> {
  const rows = await prisma.$queryRaw<PropertyQueueRow[]>`
    select
      p.id::text as id,
      p.title,
      p.address,
      p.city,
      p.state,
      p.status,
      p.verification_status,
      p.created_at,
      pr.full_name as owner_name,
      ou.full_name as officer_name,
      k.state as case_state,
      k.judgment,
      k.claims,
      coalesce((select count(*)::int from public.property_verification_evidence e where e.property_id = p.id), 0) as evidence_count,
      coalesce((select count(*)::int from public.property_documents d where d.property_id = p.id), 0) as document_count,
      (c.checked_in_at is not null) as has_check_in,
      c.open_issue
    from public.properties p
    left join public.owners o on o.id = p.owner_id
    left join public.profiles pr on pr.id = o.profile_id
    left join public.users ou on ou.id = p.vetting_officer_id
    left join public.property_verification_cases k on k.property_id = p.id
    left join public.property_visit_checks c on c.property_id = p.id
    where p.status = 'pending_vetting'
      and p.vetting_officer_id = ${officerId}::uuid
    order by p.vetting_visit_on asc nulls last
    limit 50
  `;
  return rows.map(toQueueItem);
}
