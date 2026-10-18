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
 * Unknown, partial, and unpaid responses stay unavailable so nothing is approved.
 */
export function verdictFromProvider(input: {
  idType: KycIdType;
  providerStatus: string | null;
  companyStatus: string | null;
  referenceId: string | null;
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
    return { action: "approved", referenceId, companyStatus: company };
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

export function verdictFromHttp(idType: KycIdType, httpStatus: number, body: unknown): KycVerdict {
  const fields = extractProviderFields(body);
  const verdict = verdictFromProvider({
    idType,
    providerStatus: fields.providerStatus,
    companyStatus: fields.companyStatus,
    referenceId: fields.referenceId,
  });
  const httpOk = httpStatus >= 200 && httpStatus < 300;
  if (!httpOk || fields.success === false) {
    return verdict.action === "rejected" ? verdict : { action: "unavailable" };
  }
  return verdict;
}
