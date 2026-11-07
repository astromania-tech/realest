import type { TrustDecision } from "@/lib/trust/types";

export type FraudStatus = "contradicted" | "unverified" | "insufficient";

export type FraudFinding = {
  code: string;
  claim: string;
  evidence: string;
  status: FraudStatus;
  explanation: string;
  blocksVetting: boolean;
};

const COPY: Record<string, Omit<FraudFinding, "code">> = {
  document_missing: {
    claim: "The listing includes the document this property type requires.",
    evidence: "No readable document of the required type was stored.",
    status: "insufficient",
    explanation: "A sale or land listing needs a title document. A rent listing needs a rent-authority document. Land also needs a survey. Vetting stays closed until that file is replaced.",
    blocksVetting: true,
  },
  document_unreadable: {
    claim: "The uploaded document can be read.",
    evidence: "The reader could not extract text from the file.",
    status: "insufficient",
    explanation: "An unreadable scan is not evidence. Vetting stays closed until a readable file is uploaded.",
    blocksVetting: true,
  },
  document_type_mismatch: {
    claim: "The file is the document type the lister selected.",
    evidence: "The text in the file does not match the selected type.",
    status: "contradicted",
    explanation: "The lister and the document disagree about what the file is. Vetting stays closed.",
    blocksVetting: true,
  },
  survey_missing: {
    claim: "The land listing includes a survey.",
    evidence: "No readable survey was stored.",
    status: "insufficient",
    explanation: "Land without a survey is not ready for a visit.",
    blocksVetting: true,
  },
  photo_missing: {
    claim: "The listing includes a photo of the property.",
    evidence: "No photo was stored.",
    status: "insufficient",
    explanation: "There is nothing to compare with the pin or with other listings.",
    blocksVetting: true,
  },
  photo_unreadable: {
    claim: "The photo can be hashed and read.",
    evidence: "The reader could not use the file.",
    status: "insufficient",
    explanation: "A broken image cannot be checked for a duplicate or a screenshot.",
    blocksVetting: true,
  },
  photo_screenshot: {
    claim: "The photo was taken of the property.",
    evidence: "The image looks like a screenshot.",
    status: "contradicted",
    explanation: "A screenshot is not a photograph of a building. Vetting stays closed.",
    blocksVetting: true,
  },
  photo_not_property: {
    claim: "The photo shows a building or a plot.",
    evidence: "scene-1 read a blank, a document page, a text image, or a file with no scene.",
    status: "contradicted",
    explanation: "That file is not a property photo. Vetting stays closed until it is replaced.",
    blocksVetting: true,
  },
  duplicate_address: {
    claim: "This is the only listing at this address.",
    evidence: "Another listing already uses the same address.",
    status: "contradicted",
    explanation: "One physical property is one listing. This address is already in review or live.",
    blocksVetting: true,
  },
  duplicate_pin: {
    claim: "The pin is not on top of another listing.",
    evidence: "Another listing is within 50 metres.",
    status: "contradicted",
    explanation: "A second pin inside 50 metres is treated as the same place until a person separates them.",
    blocksVetting: true,
  },
  duplicate_photo: {
    claim: "The photo belongs to this listing.",
    evidence: "The photo hash matches a photo on a nearby listing.",
    status: "contradicted",
    explanation: "The same picture is already used nearby. A different angle of the same house is not what this check catches.",
    blocksVetting: true,
  },
  holder_name_mismatch: {
    claim: "The name on the document is the account name.",
    evidence: "The holder text and the account name do not agree.",
    status: "contradicted",
    explanation: "This does not prove fraud by itself. The admin must write a note before the visit.",
    blocksVetting: false,
  },
  location_text_mismatch: {
    claim: "The place named in the document is the listing address.",
    evidence: "The location text and the address do not agree.",
    status: "contradicted",
    explanation: "The document and the listing name different places. The admin must write a note before the visit.",
    blocksVetting: false,
  },
  exif_far_from_pin: {
    claim: "The photo was taken at the pin.",
    evidence: "The camera GPS is more than 500 metres from the pin.",
    status: "contradicted",
    explanation: "The file says it was taken somewhere else. Phone GPS can be wrong, so this is a flag, not a block.",
    blocksVetting: false,
  },
  photo_not_tied_to_pin: {
    claim: "This photo was taken at the listing pin.",
    evidence: "scene-1 saw a building or a plot, and the file has no GPS.",
    status: "contradicted",
    explanation: "The picture has the structure of a property. It is not tied to the pin. The visit is what ties it, and the admin must write a note.",
    blocksVetting: false,
  },
  photo_classifier_unavailable: {
    claim: "The photo was classified.",
    evidence: "scene-1 did not return a label.",
    status: "insufficient",
    explanation: "An unclassified photo is not a pass. Vetting stays closed until the reader labels it.",
    blocksVetting: true,
  },
  trust_reader_unavailable: {
    claim: "The listing files were checked.",
    evidence: "The reader did not return facts.",
    status: "insufficient",
    explanation: "A missed check is not a pass. Vetting stays closed until the reader runs.",
    blocksVetting: true,
  },
};

export function explainFraud(trust: Pick<TrustDecision, "hardBlocks" | "flags">): FraudFinding[] {
  const blocks = new Set(trust.hardBlocks);
  return [...trust.hardBlocks, ...trust.flags].map((code) => {
    const known = COPY[code];
    if (!known) {
      return {
        code,
        claim: "This check passed.",
        evidence: "The reader returned a code the reviewer copy does not know.",
        status: blocks.has(code) ? "contradicted" : "unverified",
        explanation: "The listing stays in review until this code is understood.",
        blocksVetting: blocks.has(code),
      };
    }
    return { code, ...known, blocksVetting: blocks.has(code) };
  });
}

const STATUS_LABELS: Record<FraudFinding["status"], string> = {
  contradicted: "Contradicted",
  unverified: "Unverified",
  insufficient: "Insufficient",
};

export function fraudStatusLabel(status: FraudFinding["status"]): string {
  return STATUS_LABELS[status];
}

export function fraudSummary(findings: FraudFinding[]): string {
  const blocked = findings.filter((finding) => finding.blocksVetting).length;
  const conflicts = findings.filter((finding) => finding.status === "contradicted" && !finding.blocksVetting).length;
  const unverified = findings.filter((finding) => finding.status === "unverified").length;
  if (findings.length === 0) {
    return "No conflict was found in the files. A person at the pin still writes RealEST Verified.";
  }
  if (blocked === 0) {
    return `${conflicts} conflict${conflicts === 1 ? "" : "s"} need a note. ${unverified} check${unverified === 1 ? " is" : "s are"} unverified. A person at the pin still writes RealEST Verified.`;
  }
  return `${blocked} conflict${blocked === 1 ? "" : "s"} block the visit. ${unverified} check${unverified === 1 ? " is" : "s are"} unverified. RealEST Verified is not written from this result.`;
}

export function readFraudFindings(result: unknown, trust: Pick<TrustDecision, "hardBlocks" | "flags"> | null): FraudFinding[] {
  if (result && typeof result === "object" && "fraud" in result && Array.isArray((result as { fraud?: unknown }).fraud)) {
    return (result as { fraud: FraudFinding[] }).fraud;
  }
  if (!trust) return [];
  return explainFraud(trust);
}
