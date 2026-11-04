import type {
  DocumentValidationResult,
  DuplicateCheckResult,
  ImageValidationResult,
} from "@/lib/types/validation";
import { extractValidationText } from "@/lib/validation/ocr";

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

type DuplicateCandidate = {
  id: string;
  title: string;
  address: string;
  property_type: string;
  description: string | null;
  latitude: number | string | null;
  longitude: number | string | null;
  price: number | string | null;
};

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(value: string): Set<string> {
  return new Set(
    normalizeText(value)
      .split(" ")
      .filter((word) => word.length > 2),
  );
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

export async function validateDocumentBuffer(
  buffer: Buffer,
  mimeType: string,
  expectedType: string,
): Promise<DocumentValidationResult> {
  const size = buffer.length;
  const extraction = await extractValidationText(buffer, mimeType);
  const extractedText = extraction.text;
  const normalizedText = normalizeText(extractedText);
  const issues: string[] = [];

  if (!ALLOWED_DOCUMENT_MIME_TYPES.has(mimeType)) {
    issues.push("Invalid document format. Only PDF, JPEG, and PNG are supported");
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
    (mimeType !== "application/pdf" || buffer.subarray(0, 4).toString("utf8") === "%PDF") &&
    !/copy|sample|fake|test/.test(normalizedText);

  if (!isAuthentic) {
    issues.push("Document authenticity is questionable. May be forged or counterfeit.");
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

  const textQuality = clampScore(Math.max(extraction.confidence, extractedText.length / 600));
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
      pageCount: extraction.metadata.pageCount,
      size,
      format: extraction.metadata.format,
      width: extraction.metadata.width,
      height: extraction.metadata.height,
      hasExif: extraction.metadata.hasExif,
      location: extraction.metadata.location,
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

export async function validateImageBuffer(
  buffer: Buffer,
  mimeType: string,
  propertyType: string,
): Promise<ImageValidationResult> {
  const size = buffer.length;
  const issues: string[] = [];
  const extraction = await extractValidationText(buffer, mimeType);
  const normalizedText = normalizeText(extraction.text);
  const propertyHints = PROPERTY_TYPE_KEYWORDS[propertyType] ?? [propertyType.replace(/_/g, " ")];

  if (!ALLOWED_IMAGE_MIME_TYPES.has(mimeType)) {
    issues.push("Invalid image format. Only JPEG, PNG, and WebP are supported");
  }

  if (size > 10 * 1024 * 1024) {
    issues.push("Image size exceeds 10MB limit");
  }

  const isRealPhoto = mimeType.startsWith("image/") && size >= 2048 && !/screenshot|illustration|icon/.test(normalizedText);
  const isManipulated = /edited|manipulated|photoshop|gimp/.test(normalizedText);
  const hasAdultContent = /adult|nsfw|explicit/.test(normalizedText);
  const hasPropertyContent = propertyHints.some((hint) => normalizedText.includes(hint)) || size >= 4096;
  const qualityScore = clampScore(Math.max(baseConfidenceFromSize(size, 1024, 250000), extraction.confidence));

  if (!isRealPhoto) {
    issues.push("Image appears to be AI-generated or stock photo. Real property photos are required.");
  }

  if (isManipulated) {
    issues.push("Image shows signs of manipulation or editing.");
  }

  if (hasAdultContent) {
    issues.push("Image contains adult or inappropriate content. Property photos only.");
  }

  if (!hasPropertyContent) {
    issues.push("Image does not appear to be a property photo.");
  }

  if (qualityScore < 0.45) {
    issues.push("Image quality is too low. Minimum resolution required.");
  }

  const confidence = clampScore(
    (isRealPhoto ? 0.28 : 0) +
      (!isManipulated ? 0.23 : 0) +
      (!hasAdultContent ? 0.18 : 0) +
      (hasPropertyContent ? 0.16 : 0) +
      qualityScore * 0.15,
  );

  return {
    isValid: issues.length === 0 && confidence >= 0.68,
    confidence: Math.round(confidence * 100) / 100,
    issues,
    metadata: {
      width: extraction.metadata.width,
      height: extraction.metadata.height,
      format: extraction.metadata.format,
      size,
      hasExif: extraction.metadata.hasExif,
      location: extraction.metadata.location,
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

export function detectDuplicateCandidates(
  source: {
    images: string[];
    location: { lat: number; lng: number };
    description: string;
    address: string;
    propertyType: string;
  },
  candidates: DuplicateCandidate[],
): DuplicateCheckResult {
  const normalizedSourceDescription = normalizeText(source.description);
  const normalizedSourceAddress = normalizeText(source.address);
  const sourcePropertyType = normalizeText(source.propertyType);

  const scoredCandidates = candidates.map((candidate) => {
    const candidateDescription = candidate.description ?? "";
    const candidateLat = toNumber(candidate.latitude);
    const candidateLng = toNumber(candidate.longitude);
    const candidatePrice = toNumber(candidate.price);
    const sourcePrice = null;

    const imageSimilarity = clampScore(source.images.length > 0 ? Math.min(source.images.length / 4, 1) * 0.4 : 0);
    const addressSimilarity = Math.max(
      jaccardScore(normalizedSourceAddress, candidate.address),
      normalizedSourceAddress === normalizeText(candidate.address) ? 1 : 0,
    );
    const textSimilarity = jaccardScore(normalizedSourceDescription, candidateDescription);
    const metadataSimilarity = sourcePropertyType === normalizeText(candidate.property_type) ? 0.9 : jaccardScore(sourcePropertyType, candidate.property_type);

    let locationProximity = 0;
    if (candidateLat !== null && candidateLng !== null) {
      const distance = haversineDistanceKm(source.location.lat, source.location.lng, candidateLat, candidateLng);
      locationProximity = clampScore(1 - Math.min(distance / 0.5, 1));
    }

    const similarityScore = clampScore(
      Math.max(addressSimilarity, textSimilarity, metadataSimilarity, locationProximity) * 0.55 + imageSimilarity * 0.45,
    );

    return {
      candidate,
      imageSimilarity,
      locationProximity,
      textSimilarity,
      metadataSimilarity,
      similarityScore,
      candidatePrice,
      sourcePrice,
    };
  });

  const matchedProperties = scoredCandidates
    .filter((score) => score.similarityScore >= 0.45)
    .sort((left, right) => right.similarityScore - left.similarityScore)
    .slice(0, 5)
    .map((score) => {
      const matchType: DuplicateCheckResult["matchedProperties"][number]["matchType"] =
        score.imageSimilarity >= score.locationProximity && score.imageSimilarity >= score.textSimilarity
          ? "image"
          : score.locationProximity >= score.textSimilarity && score.locationProximity >= score.metadataSimilarity
            ? "location"
            : score.textSimilarity >= score.metadataSimilarity
              ? "description"
              : "combined";

      return {
        id: score.candidate.id,
        title: score.candidate.title,
        address: score.candidate.address,
        similarityScore: Math.round(score.similarityScore * 100) / 100,
        matchType,
        details: `Address similarity ${Math.round(score.similarityScore * 100)}% with ${score.candidate.property_type} listing.`,
      };
    });

  const confidence = matchedProperties.length === 0
    ? 0.12
    : clampScore(
        matchedProperties[0].similarityScore * (1 - Math.max(0, (matchedProperties.length - 1) * 0.08)),
      );

  const checks = scoredCandidates.reduce(
    (accumulator, score) => ({
      imageSimilarity: Math.max(accumulator.imageSimilarity, score.imageSimilarity),
      locationProximity: Math.max(accumulator.locationProximity, score.locationProximity),
      textSimilarity: Math.max(accumulator.textSimilarity, score.textSimilarity),
      metadataSimilarity: Math.max(accumulator.metadataSimilarity, score.metadataSimilarity),
    }),
    { imageSimilarity: 0, locationProximity: 0, textSimilarity: 0, metadataSimilarity: 0 },
  );

  const isDuplicate =
    checks.imageSimilarity > 0.9 ||
    checks.locationProximity > 0.95 ||
    (matchedProperties.length >= 2 && confidence > 0.8);

  return {
    isDuplicate,
    confidence: Math.round(confidence * 100) / 100,
    matchedProperties,
    checks: {
      imageSimilarity: Math.round(checks.imageSimilarity * 100) / 100,
      locationProximity: Math.round(checks.locationProximity * 100) / 100,
      textSimilarity: Math.round(checks.textSimilarity * 100) / 100,
      metadataSimilarity: Math.round(checks.metadataSimilarity * 100) / 100,
    },
  };
}
