import type { DetailMatch } from "@/lib/kyc/match";

export const ID_IMAGE_MAX_BYTES = 1_000_000;

export const ID_IMAGE_ERROR =
  "Upload a JPEG, PNG, or WebP photo of the face on this ID. Maximum size is 1 MB.";

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function isJpeg(bytes: Uint8Array): boolean {
  return bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
}

function isPng(bytes: Uint8Array): boolean {
  return (
    bytes.length > 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  );
}

function isWebp(bytes: Uint8Array): boolean {
  return (
    bytes.length > 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  );
}

export function readIdImage(raw: string): {
  base64: string;
  bytes: Buffer;
  contentType: "image/jpeg" | "image/png" | "image/webp";
  extension: "jpg" | "png" | "webp";
} | null {
  const payload = raw.trim().replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/u, "");
  if (!payload || !/^[A-Za-z0-9+/]+={0,2}$/u.test(payload)) return null;
  const bytes = Buffer.from(payload, "base64");
  if (bytes.length === 0 || bytes.length > ID_IMAGE_MAX_BYTES) return null;
  if (isJpeg(bytes)) return { base64: payload, bytes, contentType: "image/jpeg", extension: "jpg" };
  if (isPng(bytes)) return { base64: payload, bytes, contentType: "image/png", extension: "png" };
  if (isWebp(bytes)) return { base64: payload, bytes, contentType: "image/webp", extension: "webp" };
  return null;
}

/**
 * Youverify sets selfieValidation when the check runs.
 * The pass is validations.selfie.selfieVerification.match.
 */
export function idImageMatchFromBody(body: unknown): DetailMatch {
  const root = asRecord(body);
  const data = asRecord(root?.data) ?? root;
  const validations = asRecord(data?.validations);
  const selfie = asRecord(validations?.selfie);
  const verification = asRecord(selfie?.selfieVerification);
  if (verification?.match === true) return "match";
  if (verification?.match === false) return "mismatch";
  return "incomplete";
}
