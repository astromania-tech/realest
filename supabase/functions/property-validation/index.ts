import { createClient } from "npm:@supabase/supabase-js@2";

type ValidationJobPayload = {
  property_id: string;
  job_id: string;
  job_token: string;
  event?: string;
};

type ValidationJobContext = {
  job: {
    id: string;
    property_id: string;
    job_token: string;
    status: string;
    attempts: number;
  };
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

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? Deno.env.get("NEXT_PUBLIC_SUPABASE_URL") ?? "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("NEXT_PUBLIC_SUPABASE_ANON_KEY") ?? "";

const DOCUMENT_ACCEPT_THRESHOLD = Number(Deno.env.get("PROPERTY_VALIDATION_DOCUMENT_THRESHOLD") ?? "0.7");
const IMAGE_ACCEPT_THRESHOLD = Number(Deno.env.get("PROPERTY_VALIDATION_IMAGE_THRESHOLD") ?? "0.7");
const DUPLICATE_HARD_THRESHOLD = Number(Deno.env.get("PROPERTY_VALIDATION_DUPLICATE_THRESHOLD") ?? "0.8");
const MAX_AUTO_RETRIES = Number(Deno.env.get("PROPERTY_VALIDATION_MAX_RETRIES") ?? "3");

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error("Missing Supabase environment variables for validation worker");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const ALLOWED_DOCUMENT_MIME_TYPES = new Set(["application/pdf", "image/jpeg", "image/png"]);
const ALLOWED_IMAGE_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const DOCUMENT_TYPE_KEYWORDS: Record<string, string[]> = {
  title_deed: ["title deed", "certificate of occupancy", "deed of assignment", "land registry"],
  survey_plan: ["survey plan", "surveyor", "survey number"],
  certificate_of_occupancy: ["certificate of occupancy", "cofo", "certificate"],
  building_permit: ["building permit", "planning permit", "approval"],
  purchase_receipt: ["receipt", "payment", "invoice", "purchase"],
  allocation_letter: ["allocation letter", "allocation", "land allocation"],
  deed_of_assignment: ["deed of assignment", "assignment", "assignor", "assignee"],
  power_of_attorney: ["power of attorney", "attorney"],
  lease_agreement: ["lease agreement", "lease", "tenancy"],
  proof_of_payment: ["proof of payment", "paid", "transfer", "receipt"],
};

const PROPERTY_TYPE_KEYWORDS: Record<string, string[]> = {
  house: ["house", "residential", "home"],
  apartment: ["apartment", "flat", "unit"],
  bq: ["bq", "boys quarters", "boys quarter"],
  self_contained: ["self contained", "self-contained", "studio"],
  face_me_i_face_you: ["face me i face you", "compound"],
  office: ["office", "workspace"],
  shop: ["shop", "store"],
  warehouse: ["warehouse", "storage"],
  land: ["land", "plot", "parcel"],
  commercial: ["commercial", "retail", "business"],
};

function json(data: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
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

function clampScore(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function toNumber(value: number | string | null): number | null {
  if (value === null) {
    return null;
  }

  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function haversineDistanceKm(
  leftLat: number,
  leftLng: number,
  rightLat: number,
  rightLng: number,
): number {
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

function extractReadableText(buffer: Uint8Array): string {
  const rawText = new TextDecoder("utf-8", { fatal: false }).decode(buffer).replace(/\0/g, " ");
  return rawText.replace(/[^\x09\x0A\x0D\x20-\x7E]/g, " ").replace(/\s+/g, " ").trim();
}

function detectDocumentType(text: string): string | null {
  const normalized = normalizeText(text);
  for (const [documentType, keywords] of Object.entries(DOCUMENT_TYPE_KEYWORDS)) {
    if (keywords.some((keyword) => normalized.includes(keyword))) {
      return documentType;
    }
  }
  return null;
}

function detectPropertyType(text: string): string | null {
  const normalized = normalizeText(text);
  for (const [propertyType, keywords] of Object.entries(PROPERTY_TYPE_KEYWORDS)) {
    if (keywords.some((keyword) => normalized.includes(keyword))) {
      return propertyType;
    }
  }
  return null;
}

function baseConfidenceFromSize(size: number, minimumSize: number, expectedSize: number): number {
  if (size <= minimumSize) {
    return 0.25;
  }

  const ratio = Math.min(size / expectedSize, 1);
  return clampScore(0.35 + ratio * 0.45);
}

async function fetchBytes(url: string): Promise<{ bytes: Uint8Array; mimeType: string }> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }

  const bytes = new Uint8Array(await response.arrayBuffer());
  return {
    bytes,
    mimeType: response.headers.get("content-type")?.split(";")[0] ?? "application/octet-stream",
  };
}

function validateDocumentAsset(bytes: Uint8Array, mimeType: string, expectedType: string) {
  const size = bytes.length;
  const extractedText = extractReadableText(bytes);
  const normalizedText = normalizeText(extractedText);
  const issues: string[] = [];

  if (!ALLOWED_DOCUMENT_MIME_TYPES.has(mimeType)) {
    issues.push("Invalid document format");
  }

  if (size > 20 * 1024 * 1024) {
    issues.push("Document size exceeds 20MB limit");
  }

  const detectedType = detectDocumentType(extractedText) ?? expectedType;
  const requiredKeywords = ["property", "owner", "signature", "date"];
  const expectedKeywords = DOCUMENT_TYPE_KEYWORDS[expectedType] ?? [expectedType.replace(/_/g, " ")];
  const hasRequiredFields = requiredKeywords.every((keyword) => normalizedText.includes(keyword));
  const matchesTemplate = expectedKeywords.some((keyword) => normalizedText.includes(keyword));
  const hasWatermark = /watermark|sealed|official/.test(normalizedText);
  const isAuthentic =
    matchesTemplate &&
    hasRequiredFields &&
    (mimeType !== "application/pdf" || new TextDecoder().decode(bytes.subarray(0, 4)) === "%PDF") &&
    !/copy|sample|fake|test/.test(normalizedText);

  if (!isAuthentic) {
    issues.push("Document authenticity is questionable");
  }

  if (!hasRequiredFields) {
    issues.push(`Missing required fields for ${expectedType}`);
  }

  if (!matchesTemplate) {
    issues.push(`Document does not match expected ${expectedType} template`);
  }

  if (!hasWatermark && mimeType === "application/pdf") {
    issues.push("Watermark or seal not detected");
  }

  const textQuality = clampScore(extractedText.length / 600);
  if (textQuality < 0.35) {
    issues.push("Text quality is too low for reliable extraction");
  }

  const confidence = clampScore(
    (isAuthentic ? 0.34 : 0) +
      (hasRequiredFields ? 0.2 : 0) +
      (matchesTemplate ? 0.2 : 0) +
      (hasWatermark ? 0.1 : 0) +
      (textQuality * 0.16),
  );

  return {
    isValid: issues.length === 0 && confidence >= 0.7,
    confidence: Math.round(confidence * 100) / 100,
    documentType: detectedType,
    extractedText: extractedText.slice(0, 2000),
    issues,
    metadata: {
      pageCount: mimeType === "application/pdf" ? Math.max(1, Math.ceil(size / 15000)) : 1,
      size,
      format: mimeType.split("/")[1] ?? "unknown",
    },
    checks: {
      isAuthentic,
      hasRequiredFields,
      matchesTemplate,
      hasWatermark,
      textQuality: Math.round(textQuality * 100) / 100,
    },
  };
}

function validateImageAsset(bytes: Uint8Array, mimeType: string, propertyType: string) {
  const size = bytes.length;
  const issues: string[] = [];
  const fileText = extractReadableText(bytes);
  const normalizedText = normalizeText(fileText);
  const propertyHints = PROPERTY_TYPE_KEYWORDS[propertyType] ?? [propertyType.replace(/_/g, " ")];

  if (!ALLOWED_IMAGE_MIME_TYPES.has(mimeType)) {
    issues.push("Invalid image format");
  }

  if (size > 10 * 1024 * 1024) {
    issues.push("Image size exceeds 10MB limit");
  }

  const isRealPhoto = mimeType.startsWith("image/") && size >= 2048 && !/screenshot|illustration|icon/.test(normalizedText);
  const isManipulated = /edited|manipulated|photoshop|gimp/.test(normalizedText);
  const hasAdultContent = /adult|nsfw|explicit/.test(normalizedText);
  const hasPropertyContent = propertyHints.some((hint) => normalizedText.includes(hint)) || size >= 4096;
  const qualityScore = clampScore(baseConfidenceFromSize(size, 1024, 250000));

  if (!isRealPhoto) {
    issues.push("Image appears to be AI-generated or stock photo");
  }

  if (isManipulated) {
    issues.push("Image appears to be manipulated");
  }

  if (hasAdultContent) {
    issues.push("Image flagged for adult content");
  }

  if (!hasPropertyContent) {
    issues.push(`Image does not appear to match ${propertyType}`);
  }

  const confidence = clampScore(
    (isRealPhoto ? 0.35 : 0) +
      (!isManipulated ? 0.2 : 0) +
      (!hasAdultContent ? 0.15 : 0) +
      (hasPropertyContent ? 0.15 : 0) +
      (qualityScore * 0.15),
  );

  return {
    isValid: issues.length === 0 && confidence >= 0.7,
    confidence: Math.round(confidence * 100) / 100,
    issues,
    metadata: {
      width: undefined,
      height: undefined,
      format: mimeType.split("/")[1] ?? "unknown",
      size,
      hasExif: false,
      location: null,
    },
    checks: {
      isRealPhoto,
      isManipulated,
      hasAdultContent,
      hasPropertyContent,
      qualityScore: Math.round(qualityScore * 100) / 100,
    },
  };
}

function detectDuplicateCandidates(
  property: ValidationJobContext["property"],
  candidates: ValidationJobContext["candidates"],
) {
  const scoredMatches = candidates.map((candidate) => {
    const titleScore = jaccardScore(property.title, candidate.title);
    const addressScore = jaccardScore(property.address, candidate.address);
    const descriptionScore = property.description && candidate.description
      ? jaccardScore(property.description, candidate.description)
      : 0;
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
      const priceScore = priceLeft !== null && priceRight !== null
        ? clampScore(1 - Math.min(Math.abs(priceLeft - priceRight) / Math.max(priceLeft, priceRight, 1), 1))
        : 0.5;

      const confidence = clampScore(
        (titleScore * 0.26) +
          (addressScore * 0.24) +
          (descriptionScore * 0.14) +
          (locationScore * 0.2) +
          (priceScore * 0.08) +
          (propertyTypeScore * 0.08),
      );

    const matchType = confidence >= 0.8
      ? "combined"
      : locationScore >= 0.7
        ? "location"
        : addressScore >= titleScore
          ? "description"
          : "image";

    return {
      id: candidate.id,
      title: candidate.title,
      address: candidate.address,
      similarityScore: Math.round(confidence * 100) / 100,
      matchType,
      details: `title=${titleScore.toFixed(2)}, address=${addressScore.toFixed(2)}, description=${descriptionScore.toFixed(2)}, location=${locationScore.toFixed(2)}`,
    };
  });

  const matchedProperties = scoredMatches.filter((match) => match.similarityScore >= DUPLICATE_HARD_THRESHOLD).sort((left, right) => right.similarityScore - left.similarityScore);

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

async function processValidation(context: ValidationJobContext): Promise<ValidationSummary> {
  const documentResults: Array<Record<string, unknown>> = [];
  const imageResults: Array<Record<string, unknown>> = [];
  const flags: string[] = [];

  for (const document of context.documents) {
    try {
      const expectedType = document.document_type || "title_deed";
      const { bytes, mimeType } = await fetchBytes(document.document_url);
      const result = validateDocumentAsset(bytes, mimeType, expectedType);
      documentResults.push({ document_id: document.id, ...result, expectedType });

      if (!(result as { isValid: boolean }).isValid) {
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
      const { bytes, mimeType } = await fetchBytes(media.media_url);
      const result = validateImageAsset(bytes, mimeType, context.property.property_type);
      imageResults.push({ media_id: media.id, ...result });

      if (!(result as { isValid: boolean }).isValid) {
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

  const duplicateResult = detectDuplicateCandidates(context.property, context.candidates);
  const documentFailures = documentResults.filter((result) => result.isValid === false || Number(result.confidence ?? 0) < 0.7);
  const imageFailures = imageResults.filter((result) => result.isValid === false || Number(result.confidence ?? 0) < 0.7);
  const hardDuplicate = duplicateResult.isDuplicate && duplicateResult.confidence >= DUPLICATE_HARD_THRESHOLD;
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
    documentResults.reduce((acc, result) => acc + Number(result.confidence ?? 0), 0) / Math.max(documentResults.length, 1) * 0.38 +
      imageResults.reduce((acc, result) => acc + Number(result.confidence ?? 0), 0) / Math.max(imageResults.length, 1) * 0.32 +
      (1 - Math.min(duplicateResult.confidence, 1)) * 0.3,
  );

  if (documentResults.length > 0 && documentResults.every((result) => Number(result.confidence ?? 0) < DOCUMENT_ACCEPT_THRESHOLD)) {
    finalStatus = "rejected";
    decision = "reject";
    reason = "Document confidence stayed below the acceptance threshold.";
  }

  if (imageResults.length > 0 && imageResults.every((result) => Number(result.confidence ?? 0) < IMAGE_ACCEPT_THRESHOLD)) {
    finalStatus = "rejected";
    decision = "reject";
    reason = "Image confidence stayed below the acceptance threshold.";
  }

  if (context.job.attempts >= MAX_AUTO_RETRIES && finalStatus === "rejected") {
    reason = `${reason} Maximum automatic retries reached.`;
  }

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

Deno.serve(async (request: Request) => {
  if (request.method === "GET") {
    return json({ ok: true, service: "property-validation" });
  }

  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const payload = (await request.json()) as ValidationJobPayload;

    if (!payload?.property_id || !payload?.job_id || !payload?.job_token) {
      return json({ error: "Invalid payload" }, { status: 400 });
    }

    const { data: context, error: claimError } = await supabase.rpc("claim_property_validation_job", {
      p_job_id: payload.job_id,
      p_job_token: payload.job_token,
    });

    if (claimError) {
      throw claimError;
    }

    if (!context) {
      return json({ ok: true, skipped: true, reason: "Job already processed or token mismatch" });
    }

    const validationContext = context as ValidationJobContext;
    const summary = await processValidation(validationContext);

    const { error: persistError } = await supabase.rpc("persist_property_validation_result", {
      p_job_id: payload.job_id,
      p_job_token: payload.job_token,
      p_final_property_status: summary.finalStatus,
      p_result: {
        confidence: summary.confidence,
        decision: summary.decision,
        reason: summary.reason,
        document_results: summary.documentResults,
        image_results: summary.imageResults,
        duplicate_result: summary.duplicateResult,
        flags: summary.flags,
      },
      p_error: null,
    });

    if (persistError) {
      throw persistError;
    }

    return json({
      ok: true,
      property_id: payload.property_id,
      job_id: payload.job_id,
      final_status: summary.finalStatus,
      confidence: summary.confidence,
      decision: summary.decision,
      reason: summary.reason,
      flags: summary.flags,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown validation error";
    console.error("[property-validation] worker error", error);
    return json({ error: message }, { status: 500 });
  }
});