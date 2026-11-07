import { caseStateLabel } from "@/lib/trust/case";
import type { ClaimFinding, ClaimStatus } from "@/lib/trust/claims";
import type { FraudFinding } from "@/lib/trust/fraud";

export type CaseQueueFilter = "all" | "review" | "field" | "verified" | "duplicates";

export type CaseRisk = "Low" | "Medium" | "High" | "Critical";
export type CasePriority = "Standard" | "High";

export type CaseFindingRow = {
  id: string;
  claim: string;
  submitted: string;
  observation: string;
  status: "confirmed" | "review" | "contradicted" | "unverified";
};

export type CaseEvidenceRow = {
  id: string;
  title: string;
  kind: string;
  capturedAt: string;
  layer: string;
  supports: string;
};

export type CaseAuditRow = {
  id: string;
  time: string;
  title: string;
  detail: string;
};

export type CaseQueueItem = {
  id: string;
  title: string;
  address: string;
  city: string;
  listingStatus: string;
  caseState: string | null;
  caseStateLabel: string;
  risk: CaseRisk;
  priority: CasePriority;
  evidenceCoverage: number;
  officerName: string | null;
  ownerName: string | null;
  submittedAt: string | null;
  fieldBrief: string | null;
};

export type CaseDetailView = CaseQueueItem & {
  description: string | null;
  propertyType: string;
  priceNaira: string;
  verificationStatus: string;
  judgment: string | null;
  findings: CaseFindingRow[];
  evidence: CaseEvidenceRow[];
  audit: CaseAuditRow[];
  documents: Array<{ id: string; document_type: string; file_name: string; document_url: string }>;
  media: Array<{ id: string; file_name: string; media_url: string }>;
  visit: {
    officerId: string | null;
    visitDay: string | null;
    checkedInAt: string | null;
    distanceMeters: number | null;
    sawBuilding: boolean | null;
    addressMatches: boolean | null;
    documentMatches: boolean | null;
    openIssue: string | null;
    registryReference: string | null;
    registryMatches: boolean | null;
  };
  trustAllowsVetting: boolean;
  hardBlocks: string[];
  flags: string[];
};

const CLAIM_STATUS_UI: Record<ClaimStatus, CaseFindingRow["status"]> = {
  supported: "confirmed",
  insufficient: "review",
  contradicted: "contradicted",
  unverified: "unverified",
};

export function claimFindingToRow(finding: ClaimFinding, index: number): CaseFindingRow {
  return {
    id: `CL-${finding.point}-${index}`,
    claim: finding.claim,
    submitted: finding.point,
    observation: finding.evidence,
    status: CLAIM_STATUS_UI[finding.status] ?? "unverified",
  };
}

export function fraudFindingToRow(finding: FraudFinding, index: number): CaseFindingRow {
  return {
    id: `FR-${finding.code}-${index}`,
    claim: finding.claim,
    submitted: finding.code,
    observation: finding.evidence,
    status:
      finding.status === "contradicted"
        ? "contradicted"
        : finding.status === "unverified"
          ? "unverified"
          : "review",
  };
}

export function deriveCaseRisk(input: {
  hardBlocks: string[];
  flags: string[];
  openIssue: string | null;
  listingStatus: string;
}): CaseRisk {
  if (input.openIssue?.trim() || input.hardBlocks.length >= 3) return "Critical";
  if (input.hardBlocks.length > 0 || input.listingStatus === "pending_duplicate_review") return "High";
  if (input.flags.length > 0) return "Medium";
  return "Low";
}

export function deriveCasePriority(risk: CaseRisk, listingStatus: string): CasePriority {
  if (risk === "High" || risk === "Critical") return "High";
  if (listingStatus === "pending_duplicate_review" || listingStatus === "pending_ml_validation") return "High";
  return "Standard";
}

export function deriveEvidenceCoverage(input: {
  evidenceCount: number;
  documentCount: number;
  hasCheckIn: boolean;
  claimCount: number;
  supportedClaims: number;
}): number {
  let score = 20;
  score += Math.min(30, input.documentCount * 10);
  score += Math.min(20, input.evidenceCount * 5);
  if (input.hasCheckIn) score += 20;
  if (input.claimCount > 0) {
    score += Math.round((input.supportedClaims / input.claimCount) * 10);
  }
  return Math.max(0, Math.min(100, score));
}

export function matchesCaseQueueFilter(
  item: Pick<CaseQueueItem, "listingStatus" | "caseState">,
  filter: CaseQueueFilter,
): boolean {
  if (filter === "all") return true;
  if (filter === "review") {
    return (
      item.listingStatus === "pending_ml_validation" ||
      item.caseState === "human_review" ||
      item.caseState === "desk_review" ||
      item.caseState === "reconciliation"
    );
  }
  if (filter === "field") {
    return (
      item.listingStatus === "pending_vetting" ||
      item.caseState === "field_assigned" ||
      item.caseState === "field_in_progress" ||
      item.caseState === "field_complete"
    );
  }
  if (filter === "verified") {
    return item.listingStatus === "live" || item.caseState === "verified";
  }
  if (filter === "duplicates") {
    return item.listingStatus === "pending_duplicate_review";
  }
  return true;
}

export function buildFieldBrief(input: {
  judgment: string | null;
  fraudSummary: string | null;
  hardBlocks: string[];
  flags: string[];
}): string | null {
  const parts = [input.judgment, input.fraudSummary].filter(
    (part): part is string => Boolean(part?.trim()),
  );
  if (input.hardBlocks.length > 0) {
    parts.push(`Hard blocks: ${input.hardBlocks.join(", ")}.`);
  } else if (input.flags.length > 0) {
    parts.push(`Flags for the visit: ${input.flags.join(", ")}.`);
  }
  if (parts.length === 0) return null;
  return parts.join(" ");
}

export function queueItemLabels(caseState: string | null, listingStatus: string) {
  return {
    caseStateLabel: caseStateLabel(caseState) || listingStatus,
  };
}
