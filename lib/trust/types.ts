export const TRUST_CONTRACT_VERSION = "1.1.0";
export const DUPLICATE_RADIUS_METERS = 50;
export const EXIF_PIN_TOLERANCE_METERS = 500;
export const PHOTO_HASH_HAMMING_MAX = 8;

export const DUPLICATE_CANDIDATE_STATUSES = [
  "live",
  "pending_vetting",
  "pending_ml_validation",
  "pending_duplicate_review",
] as const;

export const TITLE_DOCUMENT_TYPES = [
  "title_deed",
  "certificate_of_occupancy",
  "deed_of_assignment",
] as const;

export const SURVEY_DOCUMENT_TYPES = ["survey", "survey_plan"] as const;

export const RENT_AUTHORITY_DOCUMENT_TYPES = [
  "lease_agreement",
  "power_of_attorney",
  "title_deed",
  "certificate_of_occupancy",
  "deed_of_assignment",
] as const;

export type DocumentFields = {
  holderName: string | null;
  plotOrTitleNumber: string | null;
  locationText: string | null;
  issueDate: string | null;
};

export type DocumentFact = {
  detectedType: string;
  claimedType: string;
  typeMatch: boolean;
  fields: DocumentFields;
  textExcerpt: string;
  readable: boolean;
  readerError: string | null;
};

export type ImageFact = {
  sha256: string;
  dHashHex: string | null;
  propertyPhoto: "unknown" | "no" | "yes";
  propertyPhotoReason:
    | "screenshot"
    | "text_dense"
    | "flat"
    | "document_page"
    | "not_a_scene"
    | "building"
    | "land"
    | null;
  exifGps: { lat: number; lng: number } | null;
  width: number | null;
  height: number | null;
  readable: boolean;
  readerError: string | null;
};

export type TrustExpansion = {
  id: string;
  status: "unavailable" | "on";
  affectsDecision: boolean;
  note: string;
};

export type TrustReadEnvelope = {
  reader: "realest-trust-reader";
  contractVersion: typeof TRUST_CONTRACT_VERSION;
  kind: "document" | "image";
  document: DocumentFact | null;
  image: ImageFact | null;
  expansions: TrustExpansion[];
  limitations: string[];
};

export type TrustDecisionName = "pass" | "review" | "reject";

export type TrustDecision = {
  decision: TrustDecisionName;
  hardBlocks: string[];
  flags: string[];
  allowsVetting: boolean;
  recommendedQueue: "pending_ml_validation" | "pending_duplicate_review";
  limitations: string[];
};
