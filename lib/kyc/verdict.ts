import { idImageMatchFromBody } from "@/lib/kyc/id-image";
import { extractRegistryRecord, matchClaimToRegistry, type DetailMatch, type PersonClaim } from "@/lib/kyc/match";
import type { KycIdType, KycVerdict } from "@/lib/kyc/types";

export function normalizeIdentityNumber(idType: KycIdType, raw: string): string | null {
  const compact = raw.replace(/\s+/g, "").toUpperCase();
  if (idType === "nin" || idType === "bvn") {
    return /^\d{11}$/.test(compact) ? compact : null;
  }
  return /^(RC|BN|IT|LP|LLP)\d{3,12}$/.test(compact) ? compact : null;
}

export function identityLast4(normalized: string): string {
  return normalized.slice(-4);
}

/**
 * Map a Youverify data.status onto a kyc_requests write.
 * `found` is a registry hit. Approval also requires detailMatch `match`.
 * A missing comparison stays unavailable so nothing is approved.
 */
export function verdictFromProvider(input: {
  idType: KycIdType;
  providerStatus: string | null;
  companyStatus: string | null;
  referenceId: string | null;
  detailMatch?: DetailMatch;
  idImageMatch?: DetailMatch;
}): KycVerdict {
  const status = input.providerStatus?.trim().toLowerCase() ?? "";
  const referenceId = input.referenceId?.trim() || null;

  if (status === "pending") {
    return referenceId ? { action: "pending", referenceId } : { action: "unavailable" };
  }
  if (status === "not_found") {
    return { action: "rejected", referenceId, reason: "not_found" };
  }
  if (status === "failed") {
    return { action: "rejected", referenceId, reason: "verification_failed" };
  }
  if (status !== "found") {
    return { action: "unavailable" };
  }
  if (!referenceId) return { action: "unavailable" };

  if (input.idType === "cac") {
    const company = input.companyStatus?.trim().toUpperCase() ?? "";
    if (!company) return { action: "unavailable" };
    if (company !== "ACTIVE") {
      return { action: "rejected", referenceId, reason: "company_not_active" };
    }
  }

  if (input.detailMatch !== "match") {
    if (input.detailMatch === "mismatch") {
      return { action: "rejected", referenceId, reason: "details_mismatch" };
    }
    return { action: "unavailable" };
  }

  if (input.idType === "cac") {
    return {
      action: "approved",
      referenceId,
      companyStatus: input.companyStatus?.trim().toUpperCase(),
    };
  }

  if (input.idImageMatch !== "match") {
    if (input.idImageMatch === "mismatch") {
      return { action: "rejected", referenceId, reason: "id_image_mismatch" };
    }
    return { action: "unavailable" };
  }

  return { action: "approved", referenceId };
}

type ProviderFields = {
  providerStatus: string | null;
  companyStatus: string | null;
  referenceId: string | null;
  requestId: string | null;
  event: string | null;
  success: boolean | undefined;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function readString(record: Record<string, unknown> | null, key: string): string | null {
  const value = record?.[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function extractProviderFields(body: unknown): ProviderFields {
  const root = asRecord(body);
  const data = asRecord(root?.data) ?? root;
  const metadata = asRecord(data?.metadata);
  const success = root?.success;
  return {
    providerStatus: readString(data, "status"),
    companyStatus: readString(data, "companyStatus"),
    referenceId: readString(data, "id"),
    requestId: readString(metadata, "requestId"),
    event: readString(root, "event"),
    success: typeof success === "boolean" ? success : undefined,
  };
}

export function verdictFromHttp(
  idType: KycIdType,
  httpStatus: number,
  body: unknown,
  claim: { person: PersonClaim | null; companyName: string | null },
): KycVerdict {
  const fields = extractProviderFields(body);
  const verdict = verdictFromProvider({
    idType,
    providerStatus: fields.providerStatus,
    companyStatus: fields.companyStatus,
    referenceId: fields.referenceId,
    detailMatch: matchClaimToRegistry(idType, claim, extractRegistryRecord(body)),
    idImageMatch: idImageMatchFromBody(body),
  });
  const httpOk = httpStatus >= 200 && httpStatus < 300;
  if (!httpOk || fields.success === false) {
    return verdict.action === "rejected" ? verdict : { action: "unavailable" };
  }
  return verdict;
}
