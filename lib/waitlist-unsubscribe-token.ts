import { createHmac, timingSafeEqual } from "node:crypto";

const TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

function secret(): string | null {
  const value =
    process.env.WAITLIST_UNSUBSCRIBE_SECRET ||
    process.env.AUTH_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    null;
  return value && value.length >= 16 ? value : null;
}

function sign(payload: string, key: string): string {
  return createHmac("sha256", key).update(payload, "utf8").digest("base64url");
}

/** Opaque token bound to a waitlist email. Required for public DELETE. */
export function createWaitlistUnsubscribeToken(
  email: string,
  nowMs: number = Date.now(),
): string | null {
  const key = secret();
  if (!key) return null;
  const normalized = email.trim().toLowerCase();
  const exp = String(nowMs + TOKEN_TTL_MS);
  const sig = sign(`${normalized}:${exp}`, key);
  return Buffer.from(`${normalized}:${exp}:${sig}`, "utf8").toString("base64url");
}

export function verifyWaitlistUnsubscribeToken(
  email: string,
  token: string | null | undefined,
  nowMs: number = Date.now(),
): boolean {
  const key = secret();
  if (!key || !token) return false;
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const [tokenEmail, expRaw, sig] = decoded.split(":");
    if (!tokenEmail || !expRaw || !sig) return false;
    const normalized = email.trim().toLowerCase();
    if (tokenEmail !== normalized) return false;
    const exp = Number(expRaw);
    if (!Number.isFinite(exp) || exp < nowMs) return false;
    const expected = sign(`${normalized}:${expRaw}`, key);
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
