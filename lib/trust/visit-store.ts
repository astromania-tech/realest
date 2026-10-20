import { prisma } from "@/lib/prisma";
import { nextCaseState, type CaseEvent } from "@/lib/trust/case";
import type { VisitGate } from "@/lib/trust/visit";

export type StoredVisit = VisitGate & {
  latitude: number | null;
  longitude: number | null;
  correctionDocumentId: string | null;
  correctionDocumentType: string | null;
  registryReference: string | null;
  registryMatches: boolean | null;
  visitNote: string | null;
};

const EMPTY: StoredVisit = {
  officerId: null,
  visitDay: null,
  checkedInAt: null,
  voidedAt: null,
  photoPath: null,
  distanceMeters: null,
  sawBuilding: null,
  addressMatches: null,
  documentMatches: null,
  openIssue: null,
  caseState: null,
  latitude: null,
  longitude: null,
  correctionDocumentId: null,
  correctionDocumentType: null,
  registryReference: null,
  registryMatches: null,
  visitNote: null,
};

type VisitRow = {
  officer_id: string | null;
  visit_day: string | null;
  checked_in_at: Date | null;
  voided_at: Date | null;
  photo_path: string | null;
  distance_meters: number | null;
  saw_building: boolean | null;
  address_matches: boolean | null;
  document_matches: boolean | null;
  open_issue: string | null;
  case_state: string | null;
  latitude: number | null;
  longitude: number | null;
  correction_document_id: string | null;
  correction_document_type: string | null;
  registry_reference: string | null;
  registry_matches: boolean | null;
  visit_note: string | null;
};

function fromRow(row: VisitRow | undefined): StoredVisit {
  if (!row) return EMPTY;
  return {
    officerId: row.officer_id,
    visitDay: row.visit_day,
    checkedInAt: row.checked_in_at ? row.checked_in_at.toISOString() : null,
    voidedAt: row.voided_at ? row.voided_at.toISOString() : null,
    photoPath: row.photo_path,
    distanceMeters: row.distance_meters === null ? null : Number(row.distance_meters),
    sawBuilding: row.saw_building,
    addressMatches: row.address_matches,
    documentMatches: row.document_matches,
    openIssue: row.open_issue,
    caseState: row.case_state,
    latitude: row.latitude === null ? null : Number(row.latitude),
    longitude: row.longitude === null ? null : Number(row.longitude),
    correctionDocumentId: row.correction_document_id,
    correctionDocumentType: row.correction_document_type,
    registryReference: row.registry_reference,
    registryMatches: row.registry_matches,
    visitNote: row.visit_note,
  };
}

export async function readStoredVisit(propertyId: string): Promise<StoredVisit> {
  const rows = await prisma.$queryRaw<VisitRow[]>`
    select
      p.vetting_officer_id::text as officer_id,
      p.vetting_visit_on::text as visit_day,
      c.checked_in_at,
      c.voided_at,
      c.photo_path,
      c.distance_meters,
      c.saw_building,
      c.address_matches,
      c.document_matches,
      c.open_issue,
      k.state as case_state,
      c.latitude,
      c.longitude,
      c.correction_document_id::text as correction_document_id,
      d.document_type as correction_document_type,
      k.registry_reference,
      k.registry_matches,
      c.note as visit_note
    from public.properties p
    left join public.property_visit_checks c on c.property_id = p.id
    left join public.property_verification_cases k on k.property_id = p.id
    left join public.property_documents d on d.id = c.correction_document_id
    where p.id = ${propertyId}::uuid
  `;
  return fromRow(rows[0]);
}

export async function saveCheckIn(input: {
  propertyId: string;
  officerId: string;
  checkedInAt: string;
  latitude: number;
  longitude: number;
  distanceMeters: number;
  photoPath: string;
  sawBuilding: boolean;
  addressMatches: boolean;
  documentMatches: boolean;
  note: string;
}): Promise<void> {
  await prisma.$executeRaw`
    insert into public.property_visit_checks (
      property_id, officer_id, checked_in_at, latitude, longitude, distance_meters,
      photo_path, saw_building, address_matches, document_matches, note, voided_at
    ) values (
      ${input.propertyId}::uuid,
      ${input.officerId}::uuid,
      ${input.checkedInAt}::timestamptz,
      ${input.latitude},
      ${input.longitude},
      ${input.distanceMeters},
      ${input.photoPath},
      ${input.sawBuilding},
      ${input.addressMatches},
      ${input.documentMatches},
      ${input.note},
      null
    )
    on conflict (property_id) do update set
      officer_id = excluded.officer_id,
      checked_in_at = excluded.checked_in_at,
      latitude = excluded.latitude,
      longitude = excluded.longitude,
      distance_meters = excluded.distance_meters,
      photo_path = excluded.photo_path,
      saw_building = excluded.saw_building,
      address_matches = excluded.address_matches,
      document_matches = excluded.document_matches,
      note = excluded.note,
      voided_at = null
  `;
  await appendEvidence({
    propertyId: input.propertyId,
    layer: "physical",
    body: {
      distanceMeters: input.distanceMeters,
      sawBuilding: input.sawBuilding,
      addressMatches: input.addressMatches,
      documentMatches: input.documentMatches,
      checkedInAt: input.checkedInAt,
      note: input.note,
    },
  });
}

export async function appendEvidence(input: {
  propertyId: string;
  layer: "submitted" | "documentary" | "physical" | "registry";
  body: Record<string, unknown>;
}): Promise<void> {
  const body = JSON.stringify(input.body);
  await prisma.$executeRaw`
    insert into public.property_verification_evidence (property_id, layer, body)
    values (${input.propertyId}::uuid, ${input.layer}, ${body}::jsonb)
  `;
}

export async function openDeskCase(propertyId: string): Promise<void> {
  const rows = await prisma.$queryRaw<Array<{
    address: string;
    city: string | null;
    state: string | null;
    property_type: string;
    description: string | null;
  }>>`
    select address, city, state, property_type, description
    from public.properties
    where id = ${propertyId}::uuid
  `;
  const row = rows[0];
  const address = [row?.address, row?.city, row?.state].filter(Boolean).join(", ");
  const body = JSON.stringify({
    address,
    propertyType: row?.property_type ?? "",
    description: (row?.description ?? "").slice(0, 400),
  });
  await prisma.$executeRaw`
    insert into public.property_verification_cases (property_id, state)
    values (${propertyId}::uuid, 'desk_review')
    on conflict (property_id) do nothing
  `;
  await prisma.$executeRaw`
    insert into public.property_verification_evidence (property_id, layer, body)
    select ${propertyId}::uuid, 'submitted', ${body}::jsonb
    where not exists (
      select 1 from public.property_verification_evidence
      where property_id = ${propertyId}::uuid and layer = 'submitted'
    )
  `;
  await advanceCase(propertyId, "desk");
}

export async function saveRegistryConfirmation(input: {
  propertyId: string;
  reference: string;
  matches: boolean;
}): Promise<void> {
  await prisma.$executeRaw`
    update public.property_verification_cases
    set
      registry_reference = ${input.reference},
      registry_matches = ${input.matches},
      registry_confirmed_at = now()
    where property_id = ${input.propertyId}::uuid
  `;
}

async function rememberState(propertyId: string, state: string): Promise<void> {
  const entry = JSON.stringify([{ state, at: new Date().toISOString() }]);
  await prisma.$executeRaw`
    update public.property_verification_cases
    set state_log = state_log || ${entry}::jsonb
    where property_id = ${propertyId}::uuid
  `;
}

export async function setCaseState(propertyId: string, state: string, claims?: unknown, judgment?: string): Promise<void> {
  if (claims === undefined) {
    await prisma.$executeRaw`
      insert into public.property_verification_cases (property_id, state)
      values (${propertyId}::uuid, ${state})
      on conflict (property_id) do update set state = excluded.state
    `;
  } else {
    const body = JSON.stringify(claims);
    await prisma.$executeRaw`
      insert into public.property_verification_cases (property_id, state, claims, judgment)
      values (${propertyId}::uuid, ${state}, ${body}::jsonb, ${judgment ?? null})
      on conflict (property_id) do update set
        state = excluded.state,
        claims = excluded.claims,
        judgment = excluded.judgment
    `;
  }
  await rememberState(propertyId, state);
}

export async function beginPrecheck(propertyId: string): Promise<void> {
  const current = await readStoredVisit(propertyId);
  if (current.caseState === null || current.caseState === "draft") {
    await setCaseState(propertyId, nextCaseState(current.caseState, "submit"));
  }
  const submitted = await readStoredVisit(propertyId);
  if (submitted.caseState === "submitted") {
    await setCaseState(propertyId, nextCaseState(submitted.caseState, "precheck"));
  }
}

export async function advanceCase(propertyId: string, event: CaseEvent): Promise<string> {
  const current = await readStoredVisit(propertyId);
  const next = nextCaseState(current.caseState, event);
  if (next !== current.caseState) await setCaseState(propertyId, next);
  return next;
}

export type PublicEvidenceRow = {
  layer: string;
  recordedAt: string;
  body: Record<string, unknown>;
};

export async function readPublicCase(propertyId: string): Promise<{
  state: string | null;
  judgment: string | null;
  claims: unknown[];
  evidence: PublicEvidenceRow[];
}> {
  const cases = await prisma.$queryRaw<Array<{ state: string; claims: unknown; judgment: string | null }>>`
    select state, claims, judgment from public.property_verification_cases where property_id = ${propertyId}::uuid
  `;
  const evidence = await prisma.$queryRaw<Array<{ layer: string; recorded_at: Date; body: Record<string, unknown> }>>`
    select layer, recorded_at, body
    from public.property_verification_evidence
    where property_id = ${propertyId}::uuid
    order by recorded_at asc
  `;
  return {
    state: cases[0]?.state ?? null,
    judgment: cases[0]?.judgment ?? null,
    claims: Array.isArray(cases[0]?.claims) ? cases[0].claims : [],
    evidence: evidence.map((row) => ({
      layer: row.layer,
      recordedAt: row.recorded_at.toISOString(),
      body: row.body ?? {},
    })),
  };
}

export async function setOpenIssue(propertyId: string, issue: string): Promise<void> {
  await prisma.$executeRaw`
    insert into public.property_visit_checks (property_id, open_issue)
    values (${propertyId}::uuid, ${issue})
    on conflict (property_id) do update set open_issue = excluded.open_issue
  `;
}

export async function markCorrection(input: {
  propertyId: string;
  documentId: string;
  issue: string;
}): Promise<void> {
  await prisma.$executeRaw`
    update public.properties
    set status = 'pending_correction', updated_at = now()
    where id = ${input.propertyId}::uuid
      and status = 'pending_vetting'
  `;
  await prisma.$executeRaw`
    update public.property_documents
    set verification_status = 'correction_required', updated_at = now()
    where id = ${input.documentId}::uuid
      and property_id = ${input.propertyId}::uuid
  `;
  await prisma.$executeRaw`
    insert into public.property_visit_checks (property_id, open_issue, correction_document_id, voided_at)
    values (${input.propertyId}::uuid, ${input.issue}, ${input.documentId}::uuid, now())
    on conflict (property_id) do update set
      open_issue = excluded.open_issue,
      correction_document_id = excluded.correction_document_id,
      voided_at = now()
  `;
}

export async function resumeAfterCorrection(propertyId: string): Promise<void> {
  await prisma.$executeRaw`
    update public.properties
    set status = 'pending_ml_validation', verification_status = 'pending', updated_at = now()
    where id = ${propertyId}::uuid
      and status = 'pending_correction'
  `;
  await prisma.$executeRaw`
    update public.property_visit_checks
    set open_issue = null, correction_document_id = null
    where property_id = ${propertyId}::uuid
  `;
}
