import { decideTrust, type TrustListingInput } from "@/lib/trust/policy";
import type { DocumentFact, ImageFact } from "@/lib/trust/types";

export function documentFact(overrides: Partial<DocumentFact> = {}): DocumentFact {
  return {
    detectedType: "certificate_of_occupancy",
    claimedType: "title_deed",
    typeMatch: true,
    fields: {
      holderName: "Ada Lovelace",
      plotOrTitleNumber: "12",
      locationText: "Lekki, Lagos",
      issueDate: "12 March 2020",
    },
    textExcerpt: "certificate of occupancy",
    readable: true,
    readerError: null,
    ...overrides,
  };
}

export function imageFact(overrides: Partial<ImageFact> = {}): ImageFact {
  return {
    sha256: "abc",
    dHashHex: "0000000000000000",
    propertyPhoto: "yes",
    propertyPhotoReason: "building",
    exifGps: null,
    width: 800,
    height: 600,
    readable: true,
    readerError: null,
    ...overrides,
  };
}

export function cleanListing(overrides: Partial<TrustListingInput> = {}): TrustListingInput {
  return {
    listingType: "for_sale",
    propertyType: "house",
    accountName: "Ada Lovelace",
    address: "12 Admiralty Way, Lekki, Lagos",
    documents: [documentFact()],
    images: [imageFact()],
    exactAddressMatch: false,
    nearestOtherListingMeters: 800,
    photoHashCollision: false,
    exifFarFromPin: false,
    ...overrides,
  };
}

export const trustFixtures = {
  swappedDeed: () =>
    decideTrust(cleanListing({
      documents: [documentFact({
        detectedType: "lease_agreement",
        claimedType: "title_deed",
        typeMatch: false,
        fields: { holderName: "Grace Hopper", plotOrTitleNumber: null, locationText: "Wuse, Abuja", issueDate: null },
      })],
    })),
  unreadableDeed: () =>
    decideTrust(cleanListing({
      documents: [documentFact({ readable: false, readerError: "low_text", typeMatch: false, detectedType: "unknown" })],
    })),
  repeatedPin: () => decideTrust(cleanListing({ nearestOtherListingMeters: 12 })),
  repeatedPhoto: () => decideTrust(cleanListing({ photoHashCollision: true })),
  screenshot: () =>
    decideTrust(cleanListing({
      images: [imageFact({ propertyPhoto: "no", propertyPhotoReason: "screenshot" })],
    })),
  clean: () => decideTrust(cleanListing()),
};
