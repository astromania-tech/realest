export const VISIT_PHOTO_MAX_BYTES = 1_000_000;
export const VISIT_EVIDENCE_BUCKET = "visit-evidence";

const PATH = /^[0-9a-f-]{36}\/[0-9a-f-]{36}\.(jpg|png|webp)$/i;

export function visitPhotoPath(propertyId: string, photoId: string, extension: "jpg" | "png" | "webp"): string | null {
  const path = `${propertyId}/${photoId}.${extension}`;
  return PATH.test(path) ? path : null;
}

export function readVisitPhoto(base64: string):
  | { ok: true; bytes: Buffer; extension: "jpg" | "png" | "webp"; contentType: string }
  | { ok: false; error: string } {
  const payload = base64.includes(",") ? base64.slice(base64.indexOf(",") + 1) : base64;
  let bytes: Buffer;
  try {
    bytes = Buffer.from(payload, "base64");
  } catch {
    return { ok: false, error: "The gate photo could not be read." };
  }
  if (bytes.length === 0 || bytes.length > VISIT_PHOTO_MAX_BYTES) {
    return { ok: false, error: "The gate photo must be a JPEG, PNG, or WebP under 1 MB." };
  }
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { ok: true, bytes, extension: "jpg", contentType: "image/jpeg" };
  }
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    return { ok: true, bytes, extension: "png", contentType: "image/png" };
  }
  if (
    bytes.length > 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return { ok: true, bytes, extension: "webp", contentType: "image/webp" };
  }
  return { ok: false, error: "The gate photo must be a JPEG, PNG, or WebP under 1 MB." };
}
