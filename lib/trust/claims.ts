import { holderNameAgrees, locationTextAgrees } from "@/lib/trust/compare";
import { landRegistryMode, registryTitleFinding, type RegistryConfirmation } from "@/lib/trust/registry";

export type ClaimStatus = "supported" | "contradicted" | "unverified" | "insufficient";

export type ClaimPoint = "address_document" | "address_visit" | "building_visit" | "holder" | "title";

export type ClaimFinding = {
  point: ClaimPoint;
  status: ClaimStatus;
  claim: string;
  evidence: string;
};

export type ClaimInput = {
  listingAddress: string;
  accountName: string | null;
  documentLocation: string | null;
  documentHolder: string | null;
  officer: {
    note: string | null;
    addressMatches: boolean | null;
    sawBuilding: boolean | null;
    documentMatches: boolean | null;
  } | null;
  registry?: RegistryConfirmation | null;
};

function noteAgrees(note: string | null, address: string): boolean | null {
  if (!note?.trim()) return null;
  return locationTextAgrees(note, address);
}

export function reconcileClaims(input: ClaimInput): ClaimFinding[] {
  const officer = input.officer;
  const note = noteAgrees(officer?.note ?? null, input.listingAddress);
  const addressDocument: ClaimFinding = !input.documentLocation
    ? {
        point: "address_document",
        status: "insufficient",
        claim: "The document names the listing address.",
        evidence: "The document has no location text.",
      }
    : locationTextAgrees(input.documentLocation, input.listingAddress)
      ? {
          point: "address_document",
          status: "supported",
          claim: "The document names the listing address.",
          evidence: "The location text agrees with the listing address.",
        }
      : {
          point: "address_document",
          status: "contradicted",
          claim: "The document names the listing address.",
          evidence: "The location text and the listing address do not agree.",
        };

  let addressVisit: ClaimFinding;
  if (!officer) {
    addressVisit = {
      point: "address_visit",
      status: "unverified",
      claim: "The officer stood at the listing address.",
      evidence: "No officer note has been recorded.",
    };
  } else if (note === null) {
    addressVisit = {
      point: "address_visit",
      status: "insufficient",
      claim: "The officer stood at the listing address.",
      evidence: "The officer did not write what they saw.",
    };
  } else if (officer.addressMatches === false || note === false) {
    addressVisit = {
      point: "address_visit",
      status: "contradicted",
      claim: "The officer stood at the listing address.",
      evidence: "The officer's note or answer does not match the listing address.",
    };
  } else {
    addressVisit = {
      point: "address_visit",
      status: "supported",
      claim: "The officer stood at the listing address.",
      evidence: "The officer's note and answer agree with the listing address.",
    };
  }

  let buildingVisit: ClaimFinding;
  if (!officer) {
    buildingVisit = {
      point: "building_visit",
      status: "unverified",
      claim: "The building in the listing is at the pin.",
      evidence: "No officer has recorded the building.",
    };
  } else if (!officer.note?.trim()) {
    buildingVisit = {
      point: "building_visit",
      status: "insufficient",
      claim: "The building in the listing is at the pin.",
      evidence: "The officer did not write what they saw.",
    };
  } else if (officer.sawBuilding !== true) {
    buildingVisit = {
      point: "building_visit",
      status: "contradicted",
      claim: "The building in the listing is at the pin.",
      evidence: "The officer did not see the building.",
    };
  } else {
    buildingVisit = {
      point: "building_visit",
      status: "supported",
      claim: "The building in the listing is at the pin.",
      evidence: "The officer wrote that the building was there.",
    };
  }

  let holder: ClaimFinding;
  if (!input.documentHolder || !input.accountName) {
    holder = {
      point: "holder",
      status: "insufficient",
      claim: "The document holder is the account.",
      evidence: "The document or the account has no name to compare.",
    };
  } else if (!holderNameAgrees(input.documentHolder, input.accountName)) {
    holder = {
      point: "holder",
      status: "contradicted",
      claim: "The document holder is the account.",
      evidence: "The holder text and the account name do not agree.",
    };
  } else {
    holder = {
      point: "holder",
      status: "supported",
      claim: "The document holder is the account.",
      evidence: "The holder text and the account name agree.",
    };
  }

  const title = registryTitleFinding({
    confirmation: input.registry ?? null,
    mode: landRegistryMode(),
  });

  return [addressDocument, addressVisit, buildingVisit, holder, title];
}

export function claimsBlockBadge(findings: ClaimFinding[]): string | null {
  const contradicted = findings.find((finding) => finding.status === "contradicted");
  if (contradicted) return contradicted.evidence;
  const visit = findings.filter((finding) => finding.point === "address_visit" || finding.point === "building_visit");
  if (visit.some((finding) => finding.status !== "supported")) {
    return "Reconciliation is not ready for human review.";
  }
  const title = findings.find((finding) => finding.point === "title");
  if (title?.status !== "supported") {
    return title?.evidence ?? "A person has not confirmed the registry file.";
  }
  return null;
}

export function claimsBrief(findings: ClaimFinding[]): string {
  const counts = { supported: 0, contradicted: 0, unverified: 0, insufficient: 0 };
  for (const finding of findings) {
    if (finding.status in counts) counts[finding.status] += 1;
  }
  const title = findings.find((finding) => finding.point === "title");
  const titleLine = title?.status === "supported"
    ? "A person confirmed the registry file."
    : "Title is not proved until a person confirms the registry file.";
  return `${counts.supported} supported, ${counts.contradicted} contradicted, ${counts.unverified} unverified, ${counts.insufficient} short of evidence. ${titleLine}`;
}

export function documentClaimFields(result: unknown): { location: string | null; holder: string | null } {
  if (!result || typeof result !== "object" || !("documentResults" in result)) {
    return { location: null, holder: null };
  }
  const documents = (result as { documentResults?: unknown }).documentResults;
  if (!Array.isArray(documents)) return { location: null, holder: null };
  for (const document of documents) {
    if (!document || typeof document !== "object" || !("fields" in document)) continue;
    const fields = (document as { fields?: { locationText?: unknown; holderName?: unknown } }).fields;
    const location = typeof fields?.locationText === "string" ? fields.locationText : null;
    const holder = typeof fields?.holderName === "string" ? fields.holderName : null;
    if (location || holder) return { location, holder };
  }
  return { location: null, holder: null };
}
