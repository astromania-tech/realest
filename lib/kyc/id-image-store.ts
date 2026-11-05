import { createServiceClient } from "@/lib/supabase/service";
import type { RequireAdminResult } from "@/lib/auth/require-admin";

export const KYC_IDENTITY_BUCKET = "kyc-identity";
export const KYC_ID_IMAGE_URL_SECONDS = 300;

const ID_IMAGE_PATH = /^[A-Za-z0-9_-]{1,80}\/[A-Za-z0-9_-]{1,80}\.(jpg|png|webp)$/;

export type IdImageSaveInput = {
  userId: string;
  requestId: string;
  bytes: Buffer;
  contentType: string;
  extension: "jpg" | "png" | "webp";
};

export type IdImageSaver = {
  save(input: IdImageSaveInput): Promise<{ path: string }>;
};

export function kycIdImagePath(userId: string, requestId: string, extension: "jpg" | "png" | "webp"): string | null {
  const path = `${userId}/${requestId}.${extension}`;
  return ID_IMAGE_PATH.test(path) ? path : null;
}

export function readKycIdImagePath(value: unknown): string | null {
  return typeof value === "string" && ID_IMAGE_PATH.test(value) ? value : null;
}

export function supabaseIdImageSaver(): IdImageSaver {
  return {
    async save(input) {
      const path = kycIdImagePath(input.userId, input.requestId, input.extension);
      if (!path) throw new Error("Identity photo path is not valid.");
      const client = createServiceClient();
      const result = await client.storage.from(KYC_IDENTITY_BUCKET).upload(path, input.bytes, {
        contentType: input.contentType,
        upsert: false,
      });
      if (result.error) throw new Error("Identity photo storage rejected the file.");
      return { path };
    },
  };
}

export async function signKycIdImage(path: string): Promise<string | null> {
  if (!readKycIdImagePath(path)) return null;
  const client = createServiceClient();
  const signed = await client.storage.from(KYC_IDENTITY_BUCKET).createSignedUrl(path, KYC_ID_IMAGE_URL_SECONDS);
  if (signed.error || !signed.data?.signedUrl) return null;
  return signed.data.signedUrl;
}

export async function openKycIdImage(input: {
  admin: RequireAdminResult;
  idImagePath: string | null;
  sign: (path: string) => Promise<string | null>;
}): Promise<{ ok: true; url: string } | { ok: false; status: 401 | 403 | 404 | 500; error: string }> {
  if (!input.admin.ok) {
    return { ok: false, status: input.admin.status, error: input.admin.error };
  }
  const path = readKycIdImagePath(input.idImagePath);
  if (!path) return { ok: false, status: 404, error: "No identity photo is stored for this check." };
  const url = await input.sign(path);
  if (!url) return { ok: false, status: 500, error: "The identity photo could not be opened." };
  return { ok: true, url };
}
