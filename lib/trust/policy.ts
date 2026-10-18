import { holderNameAgrees, locationTextAgrees } from "@/lib/trust/compare";
import {
  DUPLICATE_RADIUS_METERS,
  RENT_AUTHORITY_DOCUMENT_TYPES,
  SURVEY_DOCUMENT_TYPES,
  TITLE_DOCUMENT_TYPES,
  type DocumentFact,
  type ImageFact,
  type TrustDecision,
} from "@/lib/trust/types";

const LIMITATIONS = [
  "The reader does not certify a land-registry original.",
  "RealEST Verified is written only when a person approves the field visit.",
  "A photo is not treated as proof of the building until the classifier slot is on.",
];

export type TrustListingInput = {
  listingType: string;
  propertyType: string;
  accountName: string | null;
  address: string;
  documents: DocumentFact[];
  images: ImageFact[];
  exactAddressMatch: boolean;
  nearestOtherListingMeters: number | null;
  photoHashCollision: boolean;
  exifFarFromPin: boolean;
};

function isRent(listingType: string): boolean {
  return listingType === "for_rent" || listingType === "for_lease" || listingType === "short_let";
}

function slotSatisfied(documents: DocumentFact[], accepted: readonly string[]): boolean {
  return documents.some((document) => {
    if (!document.readable || !document.typeMatch) return false;
    return accepted.includes(document.claimedType) && accepted.includes(document.detectedType);
  });
}

export function decideTrust(input: TrustListingInput): TrustDecision {
  const hardBlocks: string[] = [];
  const flags: string[] = [];
  const land = input.propertyType === "land";
  const titleNeeded = land || !isRent(input.listingType);
  const rentNeeded = isRent(input.listingType) && !land;

  if (input.documents.length === 0) hardBlocks.push("document_missing");

  for (const document of input.documents) {
    if (!document.readable || document.readerError) {
      hardBlocks.push("document_unreadable");
      continue;
    }
    if (!document.typeMatch) hardBlocks.push("document_type_mismatch");
    if (!holderNameAgrees(document.fields.holderName, input.accountName)) flags.push("holder_name_mismatch");
    if (!locationTextAgrees(document.fields.locationText, input.address)) flags.push("location_text_mismatch");
  }

  if (titleNeeded && !slotSatisfied(input.documents, TITLE_DOCUMENT_TYPES)) {
    hardBlocks.push("document_missing");
  }
  if (land && !slotSatisfied(input.documents, SURVEY_DOCUMENT_TYPES)) {
    hardBlocks.push("survey_missing");
  }
  if (rentNeeded && !slotSatisfied(input.documents, RENT_AUTHORITY_DOCUMENT_TYPES)) {
    hardBlocks.push("document_missing");
  }

  if (input.images.length === 0) hardBlocks.push("photo_missing");
  for (const image of input.images) {
    if (!image.readable || image.readerError || !image.dHashHex) {
      hardBlocks.push("photo_unreadable");
      continue;
    }
    if (image.propertyPhotoReason === "screenshot") {
      hardBlocks.push("photo_screenshot");
      continue;
    }
    if (image.propertyPhotoReason === "text_dense") {
      hardBlocks.push("photo_not_property");
      continue;
    }
    flags.push("photo_classifier_unavailable");
  }
  if (input.exifFarFromPin) flags.push("exif_far_from_pin");

  if (input.exactAddressMatch) hardBlocks.push("duplicate_address");
  if (input.nearestOtherListingMeters !== null && input.nearestOtherListingMeters <= DUPLICATE_RADIUS_METERS) {
    hardBlocks.push("duplicate_pin");
  }
  if (input.photoHashCollision) hardBlocks.push("duplicate_photo");

  const uniqueBlocks = [...new Set(hardBlocks)];
  const uniqueFlags = [...new Set(flags)];
  const duplicateOnly = uniqueBlocks.length > 0 && uniqueBlocks.every((block) => block.startsWith("duplicate_"));
  let decision: TrustDecision["decision"] = "pass";
  if (uniqueBlocks.length > 0) decision = "reject";
  else if (uniqueFlags.length > 0) decision = "review";

  return {
    decision,
    hardBlocks: uniqueBlocks,
    flags: uniqueFlags,
    allowsVetting: uniqueBlocks.length === 0,
    recommendedQueue: duplicateOnly ? "pending_duplicate_review" : "pending_ml_validation",
    limitations: LIMITATIONS,
  };
}

export function readerUnavailableDecision(): TrustDecision {
  return {
    decision: "reject",
    hardBlocks: ["trust_reader_unavailable"],
    flags: [],
    allowsVetting: false,
    recommendedQueue: "pending_ml_validation",
    limitations: LIMITATIONS,
  };
}
