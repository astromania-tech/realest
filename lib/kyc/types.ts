export const YOUVERIFY_PROVIDER = "youverify";

export const YOUVERIFY_SANDBOX_URL = "https://api.sandbox.youverify.co";
export const YOUVERIFY_PRODUCTION_URL = "https://api.youverify.co";

export type KycIdType = "nin" | "bvn" | "cac";
export type KycSubject = "owner" | "agent";
export type KycStatus = "pending" | "approved" | "rejected";

export type ListingKycRow = {
  status: string | null;
  kyc_provider: string;
  user_type: string;
};

export type KycRow = {
  id: string;
  userId: string;
  userType: KycSubject;
  status: KycStatus;
  provider: typeof YOUVERIFY_PROVIDER;
  referenceId: string | null;
  requestId: string;
  idType: KycIdType;
  idLast4: string;
  companyStatus: string | null;
  rejectionReason: string | null;
  claimDigest: string | null;
  idImagePath: string | null;
};

export type KycStore = {
  listForUser(userId: string): Promise<KycRow[]>;
  insert(row: Omit<KycRow, "id">): Promise<KycRow>;
  findByReference(referenceId: string): Promise<KycRow | null>;
  findByRequestId(requestId: string): Promise<KycRow | null>;
  update(
    id: string,
    patch: Partial<Pick<KycRow, "status" | "referenceId" | "companyStatus" | "rejectionReason">>,
  ): Promise<KycRow>;
};

export type KycVerdict =
  | { action: "approved"; referenceId: string; companyStatus?: string }
  | {
      action: "rejected";
      referenceId: string | null;
      reason: "not_found" | "verification_failed" | "company_not_active" | "details_mismatch" | "id_image_mismatch";
    }
  | { action: "pending"; referenceId: string }
  | { action: "unavailable" };

export function isKycIdType(value: string): value is KycIdType {
  return value === "nin" || value === "bvn" || value === "cac";
}

export function isKycSubject(value: string | null | undefined): value is KycSubject {
  return value === "owner" || value === "agent";
}
