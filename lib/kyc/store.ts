import { prisma } from "@/lib/prisma";
import { listingCreateAllowed } from "@/lib/kyc/gate";
import { readKycIdImagePath } from "@/lib/kyc/id-image-store";
import { isKycIdType, YOUVERIFY_PROVIDER } from "@/lib/kyc/types";
import type { KycIdType, KycRow, KycStatus, KycStore, KycSubject } from "@/lib/kyc/types";

type DocumentRecord = {
  idType: KycIdType;
  idLast4: string;
  requestId: string;
  companyStatus: string | null;
  claimDigest: string | null;
  idImagePath: string | null;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

export function readStoredDocuments(value: unknown): DocumentRecord | null {
  const record = asRecord(value);
  if (!record) return null;
  const idType = record.idType;
  const idLast4 = record.idLast4;
  const requestId = record.requestId;
  const companyStatus = record.companyStatus;
  const claimDigest = record.claimDigest;
  if (typeof idType !== "string" || !isKycIdType(idType)) return null;
  if (typeof idLast4 !== "string" || typeof requestId !== "string") return null;
  return {
    idType,
    idLast4,
    requestId,
    companyStatus: typeof companyStatus === "string" ? companyStatus : null,
    claimDigest: typeof claimDigest === "string" && /^[0-9a-f]{64}$/.test(claimDigest) ? claimDigest : null,
    idImagePath: readKycIdImagePath(record.idImagePath),
  };
}

export function kycDocumentsJson(
  row: Pick<KycRow, "idType" | "idLast4" | "requestId" | "companyStatus" | "claimDigest" | "idImagePath">,
) {
  return {
    idType: row.idType,
    idLast4: row.idLast4,
    requestId: row.requestId,
    ...(row.companyStatus ? { companyStatus: row.companyStatus } : {}),
    ...(row.claimDigest ? { claimDigest: row.claimDigest } : {}),
    ...(readKycIdImagePath(row.idImagePath) ? { idImagePath: row.idImagePath } : {}),
  };
}

function toRow(record: {
  id: string;
  user_id: string;
  user_type: string;
  status: string | null;
  kyc_provider: string;
  kyc_reference_id: string | null;
  documents: unknown;
  rejection_reason: string | null;
}): KycRow | null {
  if (record.kyc_provider !== YOUVERIFY_PROVIDER) return null;
  if (record.user_type !== "owner" && record.user_type !== "agent") return null;
  if (record.status !== "pending" && record.status !== "approved" && record.status !== "rejected") return null;
  const documents = readStoredDocuments(record.documents);
  if (!documents) return null;
  return {
    id: record.id,
    userId: record.user_id,
    userType: record.user_type,
    status: record.status,
    provider: YOUVERIFY_PROVIDER,
    referenceId: record.kyc_reference_id,
    requestId: documents.requestId,
    idType: documents.idType,
    idLast4: documents.idLast4,
    companyStatus: documents.companyStatus,
    rejectionReason: record.rejection_reason,
    claimDigest: documents.claimDigest,
    idImagePath: documents.idImagePath,
  };
}

const rowSelect = {
  id: true,
  user_id: true,
  user_type: true,
  status: true,
  kyc_provider: true,
  kyc_reference_id: true,
  documents: true,
  rejection_reason: true,
} as const;

export const prismaKycStore: KycStore = {
  async listForUser(userId) {
    const rows = await prisma.kyc_requests.findMany({
      where: { user_id: userId, kyc_provider: YOUVERIFY_PROVIDER },
      select: rowSelect,
    });
    return rows.flatMap((row) => {
      const mapped = toRow(row);
      return mapped ? [mapped] : [];
    });
  },
  async insert(row) {
    const now = new Date();
    const created = await prisma.kyc_requests.create({
      data: {
        user_id: row.userId,
        user_type: row.userType satisfies KycSubject,
        status: row.status satisfies KycStatus,
        kyc_provider: YOUVERIFY_PROVIDER,
        kyc_reference_id: row.referenceId,
        documents: kycDocumentsJson(row),
        rejection_reason: row.rejectionReason,
        submitted_at: now,
        approved_at: row.status === "approved" ? now : null,
        rejected_at: row.status === "rejected" ? now : null,
        updated_at: now,
      },
      select: rowSelect,
    });
    const mapped = toRow(created);
    if (!mapped) throw new Error("Youverify row was saved without a readable document record.");
    return mapped;
  },
  async findByReference(referenceId) {
    const row = await prisma.kyc_requests.findFirst({
      where: { kyc_reference_id: referenceId, kyc_provider: YOUVERIFY_PROVIDER },
      select: rowSelect,
      orderBy: { created_at: "desc" },
    });
    return row ? toRow(row) : null;
  },
  async findByRequestId(requestId) {
    const row = await prisma.kyc_requests.findFirst({
      where: {
        kyc_provider: YOUVERIFY_PROVIDER,
        documents: { path: ["requestId"], equals: requestId },
      },
      select: rowSelect,
      orderBy: { created_at: "desc" },
    });
    return row ? toRow(row) : null;
  },
  async update(id, patch) {
    const current = await prisma.kyc_requests.findUnique({ where: { id }, select: rowSelect });
    const mapped = current ? toRow(current) : null;
    if (!mapped) throw new Error("Youverify row was not found.");
    const nextDocuments = kycDocumentsJson({
      ...mapped,
      companyStatus: patch.companyStatus === undefined ? mapped.companyStatus : patch.companyStatus,
    });
    const status = patch.status ?? mapped.status;
    const now = new Date();
    const updated = await prisma.kyc_requests.update({
      where: { id },
      data: {
        status,
        kyc_reference_id: patch.referenceId === undefined ? mapped.referenceId : patch.referenceId,
        documents: nextDocuments,
        rejection_reason: patch.rejectionReason === undefined ? mapped.rejectionReason : patch.rejectionReason,
        approved_at: status === "approved" ? now : undefined,
        rejected_at: status === "rejected" ? now : undefined,
        updated_at: now,
      },
      select: rowSelect,
    });
    const next = toRow(updated);
    if (!next) throw new Error("Youverify row was saved without a readable document record.");
    return next;
  },
};

export async function assertListingKyc(userId: string, role: string | null | undefined) {
  const rows = await prisma.kyc_requests.findMany({
    where: { user_id: userId },
    select: { status: true, kyc_provider: true, user_type: true },
  });
  return listingCreateAllowed({ role, rows });
}
