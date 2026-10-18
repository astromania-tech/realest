import { randomUUID } from "node:crypto";
import { isKycIdType, isKycSubject, YOUVERIFY_PROVIDER, YOUVERIFY_PRODUCTION_URL, YOUVERIFY_SANDBOX_URL } from "@/lib/kyc/types";
import type { KycIdType, KycRow, KycStore, KycSubject } from "@/lib/kyc/types";
import { identityLast4, normalizeIdentityNumber, verdictFromHttp } from "@/lib/kyc/verdict";
import { personBadgeFromKyc, type PersonBadge } from "@/lib/kyc/person-badge";

const ALLOWED_BASES = new Set([YOUVERIFY_SANDBOX_URL, YOUVERIFY_PRODUCTION_URL]);

export type YouverifyEnv = {
  YOUVERIFY_BASE_URL?: string;
  YOUVERIFY_SECRET_KEY?: string;
};

export function resolveYouverifyBaseUrl(env: YouverifyEnv): string | null {
  const raw = env.YOUVERIFY_BASE_URL?.trim() || YOUVERIFY_SANDBOX_URL;
  const normalized = raw.replace(/\/$/, "");
  return ALLOWED_BASES.has(normalized) ? normalized : null;
}

export type SubmitResult =
  | {
      ok: true;
      status: KycRow["status"];
      kycRequestId: string;
      created: boolean;
      personBadge: PersonBadge;
      reason: string | null;
    }
  | { ok: false; status: 400 | 403 | 502 | 503; error: string };

function endpoint(base: string, idType: KycIdType): string {
  if (idType === "cac") return `${base}/v2/api/verifications/ng/company/basic`;
  return `${base}/v2/api/identity/ng/${idType}`;
}

function requestBody(idType: KycIdType, idNumber: string, requestId: string): Record<string, unknown> {
  if (idType === "cac") {
    return { registrationNumber: idNumber, isConsent: true };
  }
  return { id: idNumber, isSubjectConsent: true, metadata: { requestId } };
}

export async function submitYouverifyIdentity(
  input: {
    userId: string;
    role: string | null | undefined;
    idType: string;
    idNumber: string;
    consent: boolean;
  },
  deps: {
    store: KycStore;
    env: YouverifyEnv;
    fetchImpl?: typeof fetch;
    newId?: () => string;
  },
): Promise<SubmitResult> {
  if (!isKycSubject(input.role)) {
    return { ok: false, status: 403, error: "Only an owner or an agent can verify identity." };
  }
  const role: KycSubject = input.role;
  const existing = await deps.store.listForUser(input.userId);
  const approved = existing.find((row) => row.userType === role && row.status === "approved" && row.provider === YOUVERIFY_PROVIDER);
  if (approved) {
    return {
      ok: true,
      status: "approved",
      kycRequestId: approved.id,
      created: false,
      personBadge: "verified",
      reason: null,
    };
  }

  if (!isKycIdType(input.idType)) {
    return { ok: false, status: 400, error: "An owner verifies with NIN or BVN. An agent verifies with CAC." };
  }
  const idType = input.idType;
  const kindMatches = role === "owner" ? idType === "nin" || idType === "bvn" : idType === "cac";
  if (!kindMatches) {
    return { ok: false, status: 400, error: "An owner verifies with NIN or BVN. An agent verifies with CAC." };
  }
  if (input.consent !== true) {
    return { ok: false, status: 400, error: "Consent is required before Youverify can check this identity." };
  }
  const idNumber = normalizeIdentityNumber(idType, input.idNumber);
  if (!idNumber) {
    return { ok: false, status: 400, error: "That identity number is not valid." };
  }

  const base = resolveYouverifyBaseUrl(deps.env);
  const secret = deps.env.YOUVERIFY_SECRET_KEY?.trim() ?? "";
  if (!base || !secret) {
    return { ok: false, status: 503, error: "Youverify is not configured." };
  }

  const requestId = (deps.newId ?? randomUUID)();
  const fetchImpl = deps.fetchImpl ?? fetch;
  let httpStatus = 0;
  let json: unknown = null;
  try {
    const response = await fetchImpl(endpoint(base, idType), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        token: secret,
      },
      body: JSON.stringify(requestBody(idType, idNumber, requestId)),
      signal: AbortSignal.timeout(20_000),
    });
    httpStatus = response.status;
    json = await response.json().catch(() => null);
  } catch {
    return { ok: false, status: 502, error: "Youverify is unavailable. Nothing was saved." };
  }

  const verdict = verdictFromHttp(idType, httpStatus, json);
  if (verdict.action === "unavailable") {
    return { ok: false, status: 502, error: "Youverify is unavailable. Nothing was saved." };
  }

  const row = await deps.store.insert({
    userId: input.userId,
    userType: role,
    status: verdict.action,
    provider: YOUVERIFY_PROVIDER,
    referenceId: verdict.referenceId,
    requestId,
    idType,
    idLast4: identityLast4(idNumber),
    companyStatus: verdict.action === "approved" ? (verdict.companyStatus ?? null) : null,
    rejectionReason: verdict.action === "rejected" ? verdict.reason : null,
  });
  const reason = verdict.action === "rejected" ? verdict.reason : null;
  return {
    ok: true,
    status: row.status,
    kycRequestId: row.id,
    created: true,
    personBadge: personBadgeFromKyc(role, [
      { user_type: role, kyc_provider: YOUVERIFY_PROVIDER, status: row.status, rejection_reason: reason },
    ]),
    reason,
  };
}
