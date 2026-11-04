import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/prisma/client";
import { readValidationAsset, type ValidationAssetSource } from "@/lib/validation/validation-assets";
import { detectDuplicateCandidates, validateDocumentBuffer, validateImageBuffer } from "@/lib/validation/ml-validation";

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
  }>;
};

type ValidationSummary = {
  finalStatus: "pending_vetting" | "rejected" | "pending_ml_validation";
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

function clampScore(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function normalizeText(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function tokenize(value: string): Set<string> {
  return new Set(normalizeText(value).split(" ").filter((word) => word.length > 2));
}

function jaccardScore(left: string, right: string): number {
  const leftTokens = tokenize(left);
  const rightTokens = tokenize(right);
  if (leftTokens.size === 0 || rightTokens.size === 0) {
    return 0;
  }

  let intersection = 0;
  for (const token of leftTokens) {
    if (rightTokens.has(token)) {
      intersection += 1;
    }
  }

  const union = leftTokens.size + rightTokens.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

function toNumber(value: number | string | null): number | null {
  if (value === null) {
    return null;
  }

  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function haversineDistanceKm(leftLat: number, leftLng: number, rightLat: number, rightLng: number): number {
  const earthRadiusKm = 6371;
  const latDelta = ((rightLat - leftLat) * Math.PI) / 180;
  const lngDelta = ((rightLng - leftLng) * Math.PI) / 180;
  const a =
    Math.sin(latDelta / 2) ** 2 +
    Math.cos((leftLat * Math.PI) / 180) *
      Math.cos((rightLat * Math.PI) / 180) *
      Math.sin(lngDelta / 2) ** 2;
  return 2 * earthRadiusKm * Math.asin(Math.sqrt(a));
}

async function fetchBytes(source: ValidationAssetSource): Promise<{ bytes: Buffer; mimeType: string }> {
  const resolved = await readValidationAsset(source);
  return { bytes: resolved.buffer, mimeType: resolved.mimeType };
}

function duplicateCandidateSummary(property: ValidationJobContext["property"], candidates: ValidationJobContext["candidates"]) {
  const scoredMatches = candidates.map((candidate) => {
    const titleScore = jaccardScore(property.title, candidate.title);
    const addressScore = jaccardScore(property.address, candidate.address);
    const descriptionScore = property.description && candidate.description ? jaccardScore(property.description, candidate.description) : 0;
    const propertyTypeScore = normalizeText(property.property_type) === normalizeText(candidate.property_type) ? 1 : 0.35;

    let locationScore = 0;
    const propertyLat = toNumber(property.latitude);
    const propertyLng = toNumber(property.longitude);
    const candidateLat = toNumber(candidate.latitude);
    const candidateLng = toNumber(candidate.longitude);

    if (propertyLat !== null && propertyLng !== null && candidateLat !== null && candidateLng !== null) {
      const distanceKm = haversineDistanceKm(propertyLat, propertyLng, candidateLat, candidateLng);
      locationScore = distanceKm < 0.25 ? 1 : distanceKm < 1 ? 0.9 : distanceKm < 3 ? 0.65 : distanceKm < 10 ? 0.35 : 0;
    }

    const priceLeft = toNumber(property.price);
    const priceRight = toNumber(candidate.price);
    const priceScore = priceLeft !== null && priceRight !== null ? clampScore(1 - Math.min(Math.abs(priceLeft - priceRight) / Math.max(priceLeft, priceRight, 1), 1)) : 0.5;

    const confidence = clampScore(
      titleScore * 0.26 +
        addressScore * 0.24 +
        descriptionScore * 0.14 +
        locationScore * 0.2 +
        priceScore * 0.08 +
        propertyTypeScore * 0.08,
    );

    const matchType = confidence >= 0.8 ? "combined" : locationScore >= 0.7 ? "location" : addressScore >= titleScore ? "description" : "image";

    return {
      id: candidate.id,
      title: candidate.title,
      address: candidate.address,
      similarityScore: Math.round(confidence * 100) / 100,
      matchType,
      details: `title=${titleScore.toFixed(2)}, address=${addressScore.toFixed(2)}, description=${descriptionScore.toFixed(2)}, location=${locationScore.toFixed(2)}`,
    };
  });

  const matchedProperties = scoredMatches.filter((match) => match.similarityScore >= 0.8).sort((left, right) => right.similarityScore - left.similarityScore);

  return {
    isDuplicate: matchedProperties.length > 0,
    confidence: matchedProperties[0]?.similarityScore ?? 0,
    matchedProperties,
    checks: {
      titleSimilarity: Math.max(...scoredMatches.map((match) => match.similarityScore), 0),
      locationProximity: matchedProperties[0]?.matchType === "location" ? matchedProperties[0].similarityScore : 0,
      textSimilarity: matchedProperties[0]?.similarityScore ?? 0,
      metadataSimilarity: matchedProperties[0]?.similarityScore ?? 0,
    },
  };
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
    prisma.properties.findMany({
      where: {
        id: { not: job.property_id },
        status: { in: ["live", "pending_vetting", "pending_ml_validation"] },
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
      },
      take: 50,
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
  const { bytes, mimeType } = await fetchBytes(payload.source);
  const result = await validateDocumentBuffer(bytes, mimeType, payload.documentType);
  return {
    finalPropertyStatus: null,
    result: {
      ...result,
      job_kind: job.job_kind,
      document_type: payload.documentType,
      source: payload.source,
    },
    confidence: result.confidence,
    decision: result.isValid ? "pass" : "reject",
    flags: result.issues,
  };
}

async function processImageJob(job: ValidationJobRow, payload: Extract<ValidationJobPayload, { kind: "image" }>) {
  const { bytes, mimeType } = await fetchBytes(payload.source);
  const result = await validateImageBuffer(bytes, mimeType, payload.propertyType);
  return {
    finalPropertyStatus: null,
    result: {
      ...result,
      job_kind: job.job_kind,
      property_type: payload.propertyType,
      source: payload.source,
    },
    confidence: result.confidence,
    decision: result.isValid ? "pass" : "reject",
    flags: result.issues,
  };
}

async function processDuplicateJob(job: ValidationJobRow, payload: Extract<ValidationJobPayload, { kind: "duplicate" }>, property: ValidationJobContext["property"], candidates: ValidationJobContext["candidates"]) {
  const duplicateResult = duplicateCandidateSummary(
    property,
    candidates,
  );

  return {
    finalPropertyStatus: duplicateResult.isDuplicate ? "rejected" : null,
    result: {
      ...duplicateResult,
      job_kind: job.job_kind,
      property_id: property.id,
      images: payload.images,
      location: payload.location,
      description: payload.description,
      address: payload.address,
      propertyType: payload.propertyType,
    },
    confidence: duplicateResult.confidence,
    decision: duplicateResult.isDuplicate ? "reject" : "pass",
    flags: duplicateResult.isDuplicate ? ["duplicate-detected"] : [],
  };
}

async function processPropertyJob(job: ValidationJobRow, context: ValidationJobContext) {
  const documentResults: Array<Record<string, unknown>> = [];
  const imageResults: Array<Record<string, unknown>> = [];
  const flags: string[] = [];

  for (const document of context.documents) {
    try {
      const expectedType = document.document_type || "title_deed";
      const { bytes, mimeType } = await fetchBytes({ kind: "url", fileUrl: document.document_url });
      const result = await validateDocumentBuffer(bytes, mimeType, expectedType);
      documentResults.push({ document_id: document.id, ...result, expectedType });

      if (!result.isValid) {
        flags.push(`document:${document.file_name}`);
      }
    } catch (error) {
      flags.push(`document_fetch:${document.file_name}`);
      documentResults.push({
        document_id: document.id,
        isValid: false,
        confidence: 0,
        issues: [error instanceof Error ? error.message : "Failed to validate document"],
      });
    }
  }

  for (const media of context.media) {
    try {
      const { bytes, mimeType } = await fetchBytes({ kind: "url", fileUrl: media.media_url });
      const result = await validateImageBuffer(bytes, mimeType, context.property.property_type);
      imageResults.push({ media_id: media.id, ...result });

      if (!result.isValid) {
        flags.push(`image:${media.file_name}`);
      }
    } catch (error) {
      flags.push(`image_fetch:${media.file_name}`);
      imageResults.push({
        media_id: media.id,
        isValid: false,
        confidence: 0,
        issues: [error instanceof Error ? error.message : "Failed to validate image"],
      });
    }
  }

  const duplicateResult = duplicateCandidateSummary(context.property, context.candidates);
  const documentFailures = documentResults.filter((result) => result.isValid === false || Number(result.confidence ?? 0) < 0.7);
  const imageFailures = imageResults.filter((result) => result.isValid === false || Number(result.confidence ?? 0) < 0.7);
  const hardDuplicate = duplicateResult.isDuplicate && duplicateResult.confidence >= 0.8;
  const hardValidationFailure = documentFailures.length > 0 || imageFailures.length > 0;

  let finalStatus: ValidationSummary["finalStatus"] = "pending_vetting";
  let decision: ValidationSummary["decision"] = "pass";
  let reason = "Validation passed and property is ready for human vetting.";

  if (hardDuplicate) {
    finalStatus = "rejected";
    decision = "reject";
    reason = "High-confidence duplicate detected.";
  } else if (hardValidationFailure) {
    finalStatus = "rejected";
    decision = "reject";
    reason = "One or more documents or images failed validation.";
  } else if (documentResults.length === 0 || imageResults.length === 0) {
    finalStatus = "pending_vetting";
    decision = "review";
    reason = "Validation passed, but the listing has limited supporting evidence.";
  }

  const aggregateConfidence = clampScore(
    (documentResults.reduce((acc, result) => acc + Number(result.confidence ?? 0), 0) / Math.max(documentResults.length, 1)) * 0.38 +
      (imageResults.reduce((acc, result) => acc + Number(result.confidence ?? 0), 0) / Math.max(imageResults.length, 1)) * 0.32 +
      (1 - Math.min(duplicateResult.confidence, 1)) * 0.3,
  );

  return {
    finalStatus,
    confidence: Math.round(aggregateConfidence * 100) / 100,
    decision,
    reason,
    documentResults,
    imageResults,
    duplicateResult,
    flags,
  };
}

async function persistJobOutcome(jobId: string, status: string, payload: { result: Record<string, unknown>; finalPropertyStatus: string | null; error?: string | null }) {
  await prisma.$executeRaw`
    update public.property_validation_jobs
    set
      status = ${status},
      result = ${JSON.stringify(payload.result)}::jsonb,
      final_property_status = ${payload.finalPropertyStatus},
      failure_reason = ${payload.error ?? null},
      last_error = ${payload.error ?? null},
      finished_at = now(),
      updated_at = now()
    where id = ${jobId}::uuid
  `;
}

async function markJobProcessing(jobId: string) {
  await prisma.$executeRaw`
    update public.property_validation_jobs
    set
      status = 'processing',
      attempts = attempts + 1,
      started_at = coalesce(started_at, now()),
      updated_at = now(),
      last_error = null
    where id = ${jobId}::uuid
      and status in ('queued', 'failed')
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
  const context = await loadValidationContext(jobId);
  if (!context || context.job.status === "processing" || context.job.status === "completed") {
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

  await markJobProcessing(jobId);

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
  const queuedJobs = await prisma.$queryRaw<Array<{ id: string }>>(Prisma.sql`
    select id
    from public.property_validation_jobs
    where status in ('queued', 'failed')
      and coalesce(next_retry_at, now()) <= now()
    order by queued_at asc
    limit 10
  `);

  const results = [] as Array<{ id: string; result: Awaited<ReturnType<typeof processValidationJob>> }>;
  for (const job of queuedJobs) {
    results.push({ id: job.id, result: await processValidationJob(job.id) });
  }

  return results;
}
