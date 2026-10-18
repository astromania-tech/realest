import { createHmac, timingSafeEqual } from "node:crypto";

export function youverifySignatureHex(rawBody: string, secret: string): string {
  return createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
}

/**
 * Youverify sends x-yv-signature as the HMAC-SHA256 hex of the raw body.
 * The secret is the API token. A missing secret never verifies.
 */
export function youverifySignatureValid(rawBody: string, header: string | null, secret: string): boolean {
  const key = secret.trim();
  if (!key || !header) return false;
  const presented = header.startsWith("sha256=") ? header.slice("sha256=".length) : header;
  if (!/^[0-9a-f]{64}$/i.test(presented)) return false;
  const computed = youverifySignatureHex(rawBody, key);
  const left = Buffer.from(presented, "hex");
  const right = Buffer.from(computed, "hex");
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}
