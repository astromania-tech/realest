import { idImageMatchFromBody } from "@/lib/kyc/id-image";
import { companyClaimDigest, extractRegistryRecord, personClaimDigest, type DetailMatch } from "@/lib/kyc/match";
import { extractProviderFields, verdictFromProvider } from "@/lib/kyc/verdict";
import { YOUVERIFY_PROVIDER, type KycRow, type KycStore } from "@/lib/kyc/types";

const HANDLED_EVENTS = new Set([
  "identity.verification.completed",
  "identity.completed",
  "company.verification.completed",
  "kyb.completed",
  "business.verification.completed",
]);

export async function applyYouverifyWebhook(
  payload: unknown,
  store: KycStore,
): Promise<"updated" | "ignored"> {
  const rootEvent = extractProviderFields(payload).event;
  if (!rootEvent || !HANDLED_EVENTS.has(rootEvent)) return "ignored";

  const fields = extractProviderFields(payload);
  const row =
    (fields.referenceId ? await store.findByReference(fields.referenceId) : null) ??
    (fields.requestId ? await store.findByRequestId(fields.requestId) : null);
  if (!row || row.status !== "pending" || row.provider !== YOUVERIFY_PROVIDER) return "ignored";

  const verdict = verdictFromProvider({
    idType: row.idType,
    providerStatus: fields.providerStatus,
    companyStatus: fields.companyStatus,
    referenceId: fields.referenceId ?? row.referenceId,
    detailMatch: detailMatchForPending(row, payload),
    idImageMatch: idImageMatchFromBody(payload),
  });
  if (verdict.action === "unavailable" || verdict.action === "pending") return "ignored";

  await store.update(row.id, {
    status: verdict.action,
    referenceId: verdict.referenceId ?? row.referenceId,
    rejectionReason: verdict.action === "rejected" ? verdict.reason : null,
    companyStatus: verdict.action === "approved" ? (verdict.companyStatus ?? null) : row.companyStatus,
  });
  return "updated";
}

function detailMatchForPending(row: KycRow, payload: unknown): DetailMatch {
  if (!row.claimDigest) return "incomplete";
  const registry = extractRegistryRecord(payload);
  const found =
    row.idType === "cac"
      ? registry.companyName
        ? companyClaimDigest(registry.companyName)
        : null
      : registry.firstName && registry.lastName && registry.dateOfBirth
        ? personClaimDigest({
            firstName: registry.firstName,
            lastName: registry.lastName,
            dateOfBirth: registry.dateOfBirth,
          })
        : null;
  if (!found) return "incomplete";
  return found === row.claimDigest ? "match" : "mismatch";
}
