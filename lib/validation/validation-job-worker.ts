import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/prisma/client";
import { readValidationAsset, type ValidationAssetSource } from "@/lib/validation/validation-assets";
import { haversineMeters } from "@/lib/trust/compare";
import { selectDuplicateMatches } from "@/lib/trust/matches";
import { readTrustFile, resolveTrustReaderUrl } from "@/lib/trust/client";
import { photoHashesCollide } from "@/lib/trust/hash";
import { loadDuplicateCandidates } from "@/lib/trust/candidates";
import { mediaMissingHash, persistablePhotoHashes, storedHashes } from "@/lib/trust/photo-store";
import { propertiesWithinRadius } from "@/lib/geo/properties-within-radius";
import { decideTrust, photoChecks, readerUnavailableDecision } from "@/lib/trust/policy";
import { explainFraud } from "@/lib/trust/fraud";
import { VALIDATION_JOB_MAX_ATTEMPTS, VALIDATION_JOB_STALE_MINUTES } from "@/lib/validation/job-claim";
import { DUPLICATE_CANDIDATE_STATUSES, DUPLICATE_RADIUS_METERS, EXIF_PIN_TOLERANCE_METERS, type DocumentFact, type ImageFact } from "@/lib/trust/types";

type ValidationJobKind = "document" | "image" | "duplicate" | "property";

type ValidationJobRow = {
  id: string;
  property_id: string;
  job_kind: ValidationJobKind;
  status: string;
  attempts: number;
  retry_count: number;
  source: string;
  last_error: string | null;
  failure_reason: string | null;
  final_property_status: string | null;
  queued_at: string;
  started_at: string | null;
  finished_at: string | null;
  updated_at: string;
  next_retry_at: string | null;
  request_payload: Prisma.JsonValue | null;
  result: Prisma.JsonValue | null;
};

type ValidationJobContext = {
  job: ValidationJobRow;
  property: {
    id: string;
    title: string;
    description: string | null;
    address: string;
    city: string;
    state: string | null;
    property_type: string;
    listing_type: string;
    price: number;
    latitude: number | string | null;
    longitude: number | string | null;
  };
  documents: Array<{
    id: string;
    document_type: string;
    document_url: string;
    file_name: string;
    file_size: number | null;
  }>;
  media: Array<{
    id: string;
    media_type: string;
    media_url: string;
    file_name: string;
    display_order: number | null;
  }>;
  candidates: Array<{
    id: string;
    title: string;
    address: string;
    property_type: string;
    description: string | null;
    latitude: number | string | null;
    longitude: number | string | null;
    price: number | string | null;
    status: string;
  }>;
};

type ValidationSummary = {
  finalStatus: "pending_vetting" | "rejected" | "pending_ml_validation" | "pending_duplicate_review" | null;
  confidence: number;
  decision: "pass" | "review" | "reject";
  reason: string;
  documentResults: Array<Record<string, unknown>>;
  imageResults: Array<Record<string, unknown>>;
  duplicateResult: Record<string, unknown>;
  flags: string[];
};

export type ValidationJobPayload =
  | {
      kind: "document";
      source: ValidationAssetSource;
      propertyId: string;
      documentType: string;
    }
  | {
      kind: "image";
      source: ValidationAssetSource;
      propertyId: string;
      propertyType: string;
    }
  | {
      kind: "duplicate";
      propertyId: string;
      images: string[];
      location: { lat: number; lng: number };
      description: string;
      address: string;
      propertyType: string;
    }
  | {
      kind: "property";
      propertyId: string;
    };

function duplicateSignals(
  address: string,
  latitude: number | null,
  longitude: number | null,
  candidates: ValidationJobContext["candidates"],
) {
  const matches = selectDuplicateMatches({
    address,
    latitude,
    longitude,
    candidates: candidates.map((candidate) => ({
      id: candidate.id,
      address: candidate.address,
      latitude: toNumber(candidate.latitude),
      longitude: toNumber(candidate.longitude),
      status: candidate.status,
    })),
  });
  const meters = matches.flatMap((match) => (match.meters === null ? [] : [match.meters]));
  const matchedPropertyIds = [...new Set(matches.map((match) => match.id))];
  return {
    exactAddressMatch: matches.some((match) => match.reason === "duplicate_address"),
    nearestOtherListingMeters: meters.length === 0 ? null : Math.min(...meters),
    nearbyIds: matchedPropertyIds,
    matchedPropertyIds,
  };
}

function toNumber(value: number | string | null): number | null {
  if (value === null) {
    return null;
  }

  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

async function fetchBytes(source: ValidationAssetSource): Promise<{ bytes: Buffer; mimeType: string }> {
  const resolved = await readValidationAsset(source);
  return { bytes: resolved.buffer, mimeType: resolved.mimeType };
}

const MEDIA_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function persistStoredPhotoHashes(facts: Array<{ mediaId: string; dHashHex: string | null | undefined }>) {
  for (const fact of persistablePhotoHashes(facts)) {
    if (!MEDIA_UUID.test(fact.mediaId)) continue;
    await prisma.$executeRaw`
      update public.property_media
      set d_hash = ${fact.dHashHex}
      where id = ${fact.mediaId}::uuid
    `;
  }
}

async function photoHashesForProperties(propertyIds: string[]): Promise<string[]> {
  const ids = [...new Set(propertyIds)].filter((id) => MEDIA_UUID.test(id));
  if (ids.length === 0) return [];
  const rows = await prisma.$queryRaw<Array<{ id: string; media_url: string; d_hash: string | null }>>(Prisma.sql`
    select id::text as id, media_url, d_hash
    from public.property_media
    where property_id::text in (${Prisma.join(ids)})
  `);
  const known = storedHashes(rows.map((row) => ({ dHashHex: row.d_hash })));
  const missing = mediaMissingHash(rows.map((row) => ({ id: row.id, media_url: row.media_url, dHashHex: row.d_hash })));
  const read: string[] = [];
  for (const media of missing) {
    try {
      const { bytes, mimeType } = await fetchBytes({ kind: "url", fileUrl: media.media_url });
      const envelope = await readTrustFile({ kind: "image", mimeType, bytes });
      const hash = envelope.image?.dHashHex ?? null;
      if (!hash) continue;
      read.push(hash);
      await persistStoredPhotoHashes([{ mediaId: media.id, dHashHex: hash }]);
    } catch {
      continue;
    }
  }
  return [...known, ...read];
}

async function loadValidationContext(jobId: string): Promise<ValidationJobContext | null> {
  const jobs = await prisma.$queryRaw<Array<ValidationJobRow>>(Prisma.sql`
    select
      j.id,
      j.property_id,
      j.job_kind,
      j.status,
      j.attempts,
      j.retry_count,
      j.source,
      j.last_error,
      j.failure_reason,
      j.final_property_status,
      j.queued_at,
      j.started_at,
      j.finished_at,
      j.updated_at,
      j.next_retry_at,
      j.request_payload,
      j.result
    from public.property_validation_jobs j
    where j.id = ${jobId}::uuid
    limit 1
  `);

  const job = jobs[0];
  if (!job) {
    return null;
  }

  const property = await prisma.properties.findUnique({
    where: { id: job.property_id },
    select: {
      id: true,
      title: true,
      description: true,
      address: true,
      city: true,
      state: true,
      property_type: true,
      listing_type: true,
      price: true,
      latitude: true,
      longitude: true,
    },
  });

  if (!property) {
    return null;
  }

  const [documents, media, candidates] = await Promise.all([
    prisma.property_documents.findMany({
      where: { property_id: job.property_id },
      select: { id: true, document_type: true, document_url: true, file_name: true, file_size: true },
    }),
    prisma.property_media.findMany({
      where: { property_id: job.property_id },
      select: { id: true, media_type: true, media_url: true, file_name: true, display_order: true },
    }),
    loadDuplicateCandidates({
      propertyId: job.property_id,
      latitude: property.latitude === null ? null : Number(property.latitude),
      longitude: property.longitude === null ? null : Number(property.longitude),
      withinRadius: propertiesWithinRadius,
      loadByIds: (ids) =>
        prisma.properties.findMany({
          where: {
            id: { in: ids },
            status: { in: [...DUPLICATE_CANDIDATE_STATUSES] },
          },
          select: {
            id: true,
            title: true,
            address: true,
            property_type: true,
            description: true,
            latitude: true,
            longitude: true,
            price: true,
            status: true,
          },
        }),
    }),
  ]);

  return {
    job,
    property: {
      id: property.id,
      title: property.title,
      description: property.description,
      address: property.address,
      city: property.city,
      state: property.state,
      property_type: property.property_type,
      listing_type: property.listing_type,
      price: Number(property.price),
      latitude: property.latitude === null ? null : Number(property.latitude),
      longitude: property.longitude === null ? null : Number(property.longitude),
    },
    documents,
    media,
    candidates: candidates.map((candidate) => ({
      ...candidate,
      latitude: candidate.latitude === null ? null : Number(candidate.latitude),
      longitude: candidate.longitude === null ? null : Number(candidate.longitude),
      price: candidate.price === null ? null : Number(candidate.price),
    })),
  };
}

async function processDocumentJob(job: ValidationJobRow, payload: Extract<ValidationJobPayload, { kind: "document" }>) {
  if (!resolveTrustReaderUrl()) {
    const trust = readerUnavailableDecision();
    return {
      finalPropertyStatus: null,
      result: { job_kind: job.job_kind, document_type: payload.documentType, source: payload.source, trust },
      confidence: 0,
      decision: trust.decision,
      flags: trust.hardBlocks,
    };
  }
  const { bytes, mimeType } = await fetchBytes(payload.source);
  const envelope = await readTrustFile({
    kind: "document",
    mimeType,
    bytes,
    claimedDocumentType: payload.documentType,
  });
  const fact = envelope.document ?? unreadDocument(payload.documentType, "unsupported_type");
  const blocked = !fact.readable || !fact.typeMatch;
  return {
    finalPropertyStatus: null,
    result: { job_kind: job.job_kind, document_type: payload.documentType, source: payload.source, fact, limitations: envelope.limitations },
    confidence: blocked ? 0 : 1,
    decision: blocked ? "reject" : "review",
    flags: blocked ? [fact.readerError ? "document_unreadable" : "document_type_mismatch"] : [],
  };
}

async function processImageJob(job: ValidationJobRow, payload: Extract<ValidationJobPayload, { kind: "image" }>) {
  if (!resolveTrustReaderUrl()) {
    const trust = readerUnavailableDecision();
    return {
      finalPropertyStatus: null,
      result: { job_kind: job.job_kind, property_type: payload.propertyType, source: payload.source, trust },
      confidence: 0,
      decision: trust.decision,
      flags: trust.hardBlocks,
    };
  }
  const { bytes, mimeType } = await fetchBytes(payload.source);
  const envelope = await readTrustFile({ kind: "image", mimeType, bytes });
  const fact = envelope.image ?? unreadImage("unsupported_type");
  const photo = fact.readable && !fact.readerError && fact.dHashHex ? photoChecks(fact) : { hardBlocks: ["photo_unreadable"], flags: [] };
  const flags = [...photo.hardBlocks, ...photo.flags];
  const blocked = photo.hardBlocks.length > 0;
  return {
    finalPropertyStatus: null,
    result: { job_kind: job.job_kind, property_type: payload.propertyType, source: payload.source, fact, limitations: envelope.limitations },
    confidence: blocked ? 0 : 0.5,
    decision: blocked ? "reject" : "review",
    flags,
  };
}

async function processDuplicateJob(job: ValidationJobRow, payload: Extract<ValidationJobPayload, { kind: "duplicate" }>, property: ValidationJobContext["property"], candidates: ValidationJobContext["candidates"]) {
  if (!resolveTrustReaderUrl()) {
    const trust = readerUnavailableDecision();
    return {
      finalPropertyStatus: null,
      result: { job_kind: job.job_kind, property_id: property.id, trust },
      confidence: 0,
      decision: trust.decision,
      flags: trust.hardBlocks,
    };
  }
  const propertyLat = toNumber(property.latitude);
  const propertyLng = toNumber(property.longitude);
  const pinLat = payload.location?.lat ?? propertyLat;
  const pinLng = payload.location?.lng ?? propertyLng;
  const { exactAddressMatch, nearestOtherListingMeters, nearbyIds, matchedPropertyIds } = duplicateSignals(
    payload.address || property.address,
    pinLat,
    pinLng,
    candidates,
  );
  const ownHashes: string[] = [];
  for (const imageUrl of payload.images.slice(0, 8)) {
    try {
      const { bytes, mimeType } = await fetchBytes({ kind: "url", fileUrl: imageUrl });
      const envelope = await readTrustFile({ kind: "image", mimeType, bytes });
      if (envelope.image?.dHashHex) ownHashes.push(envelope.image.dHashHex);
    } catch {
      continue;
    }
  }
  let photoHashCollision = false;
  if (ownHashes.length > 0 && nearbyIds.length > 0) {
    const otherHashes = await photoHashesForProperties(nearbyIds);
    photoHashCollision = photoHashesCollide(ownHashes, otherHashes);
  }
  const duplicatePin = nearestOtherListingMeters !== null && nearestOtherListingMeters <= DUPLICATE_RADIUS_METERS;
  const hardBlocks = [
    exactAddressMatch ? "duplicate_address" : null,
    duplicatePin ? "duplicate_pin" : null,
    photoHashCollision ? "duplicate_photo" : null,
  ].filter((block): block is string => Boolean(block));
  return {
    finalPropertyStatus: hardBlocks.length > 0 ? "pending_duplicate_review" : null,
    result: {
      job_kind: job.job_kind,
      property_id: property.id,
      exactAddressMatch,
      nearestOtherListingMeters,
      matchedPropertyIds,
      images: payload.images,
    },
    confidence: hardBlocks.length > 0 ? 0 : 1,
    decision: hardBlocks.length > 0 ? "reject" : "review",
    flags: hardBlocks,
  };
}

function unreadDocument(claimedType: string, readerError: string): DocumentFact {
  return {
    detectedType: "unknown",
    claimedType,
    typeMatch: false,
    fields: { holderName: null, plotOrTitleNumber: null, locationText: null, issueDate: null },
    textExcerpt: "",
    readable: false,
    readerError,
  };
}

function unreadImage(readerError: string): ImageFact {
  return {
    sha256: "",
    dHashHex: null,
    propertyPhoto: "unknown",
    propertyPhotoReason: null,
    exifGps: null,
    width: null,
    height: null,
    readable: false,
    readerError,
  };
}

async function processPropertyJob(job: ValidationJobRow, context: ValidationJobContext) {
  if (!resolveTrustReaderUrl()) {
    const trust = readerUnavailableDecision();
    return {
      finalStatus: null,
      confidence: 0,
      decision: trust.decision,
      reason: "The trust reader is not configured, so this listing stays in ML review.",
      documentResults: [],
      imageResults: [],
      duplicateResult: {},
      flags: trust.hardBlocks,
      trust,
    };
  }

  const owner = await prisma.properties.findUnique({
    where: { id: context.property.id },
    select: { owners: { select: { profiles: { select: { full_name: true } } } } },
  });
  const documents: DocumentFact[] = [];
  const images: ImageFact[] = [];
  const documentResults: Array<Record<string, unknown>> = [];
  const imageResults: Array<Record<string, unknown>> = [];

  for (const document of context.documents) {
    const claimedType = document.document_type || "title_deed";
    try {
      const { bytes, mimeType } = await fetchBytes({ kind: "url", fileUrl: document.document_url });
      const envelope = await readTrustFile({
        kind: "document",
        mimeType,
        bytes,
        claimedDocumentType: claimedType,
      });
      const fact = envelope.document ?? unreadDocument(claimedType, "unsupported_type");
      documents.push(fact);
      documentResults.push({ document_id: document.id, ...fact });
    } catch (error) {
      const fact = unreadDocument(claimedType, error instanceof Error ? error.message : "trust_reader_unavailable");
      documents.push(fact);
      documentResults.push({ document_id: document.id, ...fact });
    }
  }

  for (const media of context.media) {
    try {
      const { bytes, mimeType } = await fetchBytes({ kind: "url", fileUrl: media.media_url });
      const envelope = await readTrustFile({
        kind: "image",
        mimeType,
        bytes,
      });
      const fact = envelope.image ?? unreadImage("unsupported_type");
      images.push(fact);
      imageResults.push({ media_id: media.id, ...fact });
    } catch (error) {
      const fact = unreadImage(error instanceof Error ? error.message : "trust_reader_unavailable");
      images.push(fact);
      imageResults.push({ media_id: media.id, ...fact });
    }
  }

  await persistStoredPhotoHashes(
    imageResults.flatMap((result) => {
      const mediaId = result.media_id;
      const dHashHex = result.dHashHex;
      if (typeof mediaId !== "string") return [];
      return [{ mediaId, dHashHex: typeof dHashHex === "string" ? dHashHex : null }];
    }),
  );

  const propertyLat = toNumber(context.property.latitude);
  const propertyLng = toNumber(context.property.longitude);
  const { exactAddressMatch, nearestOtherListingMeters, nearbyIds, matchedPropertyIds } = duplicateSignals(
    context.property.address,
    propertyLat,
    propertyLng,
    context.candidates,
  );

  const ownHashes = images.flatMap((image) => (image.dHashHex ? [image.dHashHex] : []));
  let photoHashCollision = false;
  if (ownHashes.length > 0 && nearbyIds.length > 0) {
    const otherHashes = await photoHashesForProperties(nearbyIds);
    photoHashCollision = photoHashesCollide(ownHashes, otherHashes);
  }

  const exifFarFromPin = images.some((image) => {
    if (!image.exifGps || propertyLat === null || propertyLng === null) return false;
    return haversineMeters(propertyLat, propertyLng, image.exifGps.lat, image.exifGps.lng) > EXIF_PIN_TOLERANCE_METERS;
  });

  const trust = decideTrust({
    listingType: context.property.listing_type,
    propertyType: context.property.property_type,
    accountName: owner?.owners?.profiles.full_name ?? null,
    address: [context.property.address, context.property.city, context.property.state].filter(Boolean).join(", "),
    documents,
    images,
    exactAddressMatch,
    nearestOtherListingMeters,
    photoHashCollision,
    exifFarFromPin,
  });
  const fraud = explainFraud(trust);

  return {
    finalStatus: trust.recommendedQueue === "pending_duplicate_review" ? "pending_duplicate_review" : null,
    confidence: trust.decision === "pass" ? 1 : trust.decision === "review" ? 0.5 : 0,
    decision: trust.decision,
    reason: fraud.find((finding) => finding.blocksVetting)?.explanation ?? fraud[0]?.explanation ?? "No conflict was found in the files. A person at the pin still writes RealEST Verified.",
    documentResults,
    imageResults,
    duplicateResult: { exactAddressMatch, nearestOtherListingMeters, photoHashCollision, matchedPropertyIds },
    flags: [...trust.hardBlocks, ...trust.flags],
    fraud,
    trust,
    jobId: job.id,
  };
}

async function persistJobOutcome(jobId: string, status: string, payload: { result: Record<string, unknown>; finalPropertyStatus: string | null; error?: string | null }) {
  if (status === "failed") {
    await prisma.$executeRaw`
      update public.property_validation_jobs
      set
        status = 'failed',
        result = ${JSON.stringify(payload.result)}::jsonb,
        final_property_status = ${payload.finalPropertyStatus},
        failure_reason = ${payload.error ?? null},
        last_error = ${payload.error ?? null},
        retry_count = retry_count + 1,
        next_retry_at = case
          when attempts >= ${VALIDATION_JOB_MAX_ATTEMPTS} then null
          else now() + (least(30, power(2, greatest(attempts - 1, 0)))::int * interval '1 minute')
        end,
        finished_at = now(),
        updated_at = now()
      where id = ${jobId}::uuid
        and status = 'processing'
    `;
    return;
  }

  await prisma.$executeRaw`
    update public.property_validation_jobs
    set
      status = ${status},
      result = ${JSON.stringify(payload.result)}::jsonb,
      final_property_status = ${payload.finalPropertyStatus},
      failure_reason = ${payload.error ?? null},
      last_error = ${payload.error ?? null},
      next_retry_at = null,
      finished_at = now(),
      updated_at = now()
    where id = ${jobId}::uuid
      and status = 'processing'
  `;
}

export async function claimValidationJobs(input: { limit: number; jobId?: string }): Promise<string[]> {
  const idFilter = input.jobId ? Prisma.sql`and id = ${input.jobId}::uuid` : Prisma.empty;
  const rows = await prisma.$queryRaw<Array<{ id: string }>>(Prisma.sql`
    with picked as (
      select id
      from public.property_validation_jobs
      where attempts < ${VALIDATION_JOB_MAX_ATTEMPTS}
        and (
          (status = 'queued' and coalesce(next_retry_at, now()) <= now())
          or (status = 'failed' and next_retry_at is not null and next_retry_at <= now())
          or (
            status = 'processing'
            and updated_at <= now() - (${VALIDATION_JOB_STALE_MINUTES} * interval '1 minute')
          )
        )
        ${idFilter}
      order by queued_at asc
      for update skip locked
      limit ${input.limit}
    )
    update public.property_validation_jobs as job
    set
      status = 'processing',
      attempts = job.attempts + 1,
      started_at = coalesce(job.started_at, now()),
      updated_at = now(),
      last_error = null,
      next_retry_at = null
    from picked
    where job.id = picked.id
    returning job.id
  `);
  return rows.map((row) => row.id);
}

async function retireExhaustedJobs() {
  await prisma.$executeRaw`
    update public.property_validation_jobs
    set
      status = 'failed',
      failure_reason = coalesce(failure_reason, 'retry limit reached'),
      last_error = coalesce(last_error, 'retry limit reached'),
      next_retry_at = null,
      finished_at = coalesce(finished_at, now()),
      updated_at = now()
    where status = 'processing'
      and attempts >= ${VALIDATION_JOB_MAX_ATTEMPTS}
      and updated_at <= now() - (${VALIDATION_JOB_STALE_MINUTES} * interval '1 minute')
  `;
}

export async function enqueueValidationJob(input: { propertyId: string; jobKind: ValidationJobKind; source: string; requestPayload: ValidationJobPayload; requestedBy?: string | null }) {
  const inserted = await prisma.$queryRaw<Array<{ id: string; status: string; queued_at: string }>>(Prisma.sql`
    insert into public.property_validation_jobs (
      property_id,
      job_kind,
      source,
      status,
      attempts,
      retry_count,
      request_payload,
      requested_by
    ) values (
      ${input.propertyId}::uuid,
      ${input.jobKind},
      ${input.source},
      'queued',
      0,
      0,
      ${JSON.stringify(input.requestPayload)}::jsonb,
      ${input.requestedBy ?? null}::uuid
    )
    returning id, status, queued_at
  `);

  return inserted[0];
}

export async function getValidationJob(jobId: string) {
  const rows = await prisma.$queryRaw<Array<Record<string, unknown>>>(Prisma.sql`
    select
      j.id,
      j.property_id,
      j.job_kind,
      j.status,
      j.attempts,
      j.retry_count,
      j.source,
      j.last_error,
      j.failure_reason,
      j.final_property_status,
      j.queued_at,
      j.started_at,
      j.finished_at,
      j.updated_at,
      j.next_retry_at,
      j.request_payload,
      j.result,
      p.title as property_title,
      p.address as property_address,
      p.city as property_city,
      p.state as property_state,
      p.property_type,
      p.listing_type,
      p.price::text as property_price,
      p.status as property_status
    from public.property_validation_jobs j
    join public.properties p on p.id = j.property_id
    where j.id = ${jobId}::uuid
    limit 1
  `);

  return rows[0] ?? null;
}

export async function processValidationJob(jobId: string) {
  const claimed = await claimValidationJobs({ limit: 1, jobId });
  if (claimed.length !== 1) return { ok: true, skipped: true };
  return finishClaimedValidationJob(jobId);
}

export async function finishClaimedValidationJob(jobId: string) {
  const context = await loadValidationContext(jobId);
  if (!context || context.job.status !== "processing") {
    return { ok: true, skipped: true };
  }

  const payload = context.job.request_payload as ValidationJobPayload | null;
  if (!payload) {
    await persistJobOutcome(jobId, "failed", {
      result: { error: "Missing validation payload" },
      finalPropertyStatus: null,
      error: "Missing validation payload",
    });
    return { ok: false, error: "Missing validation payload" };
  }

  try {
    let outcome: { finalPropertyStatus: string | null; result: Record<string, unknown>; confidence: number; decision: string; flags: string[] };

    if (payload.kind === "document") {
      outcome = await processDocumentJob(context.job, payload);
    } else if (payload.kind === "image") {
      outcome = await processImageJob(context.job, payload);
    } else if (payload.kind === "duplicate") {
      outcome = await processDuplicateJob(context.job, payload, context.property, context.candidates);
    } else {
      const summary = await processPropertyJob(context.job, context);
      outcome = {
        finalPropertyStatus: summary.finalStatus,
        result: {
          ...summary,
          job_kind: context.job.job_kind,
        },
        confidence: summary.confidence,
        decision: summary.decision,
        flags: summary.flags,
      };
    }

    await persistJobOutcome(jobId, "completed", {
      result: {
        ...outcome.result,
        confidence: outcome.confidence,
        decision: outcome.decision,
        flags: outcome.flags,
      },
      finalPropertyStatus: outcome.finalPropertyStatus,
    });

    if ((payload.kind === "property" || payload.kind === "duplicate") && outcome.finalPropertyStatus === "pending_duplicate_review") {
      await prisma.properties.updateMany({
        where: {
          id: context.property.id,
          status: { in: ["pending_ml_validation", "pending_vetting"] },
        },
        data: { status: "pending_duplicate_review", updated_at: new Date() },
      });
    }

    return { ok: true, jobId, status: "completed" };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown validation error";
    await persistJobOutcome(jobId, "failed", {
      result: { error: message },
      finalPropertyStatus: null,
      error: message,
    });
    return { ok: false, error: message };
  }
}

export async function runValidationWorkerOnce() {
  await retireExhaustedJobs();
  const claimed = await claimValidationJobs({ limit: 10 });
  const results = [] as Array<{ id: string; result: Awaited<ReturnType<typeof finishClaimedValidationJob>> }>;
  for (const id of claimed) {
    results.push({ id, result: await finishClaimedValidationJob(id) });
  }
  return results;
}
