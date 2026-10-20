import { prisma } from "@/lib/prisma";

export const PUBLIC_RATE_LIMIT = 5;
export const PUBLIC_RATE_WINDOW_MS = 60_000;

export function clientAddress(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const raw = forwarded || headers.get("x-real-ip") || "unknown";
  return raw.slice(0, 80);
}

export function rateWindowStart(now: Date, windowMs: number): Date {
  return new Date(Math.floor(now.getTime() / windowMs) * windowMs);
}

export function rateLimitAllows(hitsAfterIncrement: number, limit: number): boolean {
  return hitsAfterIncrement <= limit;
}

export async function consumeRateLimit(input: {
  bucket: string;
  subject: string;
  limit?: number;
  windowMs?: number;
  now?: Date;
}): Promise<{ allowed: boolean }> {
  const limit = input.limit ?? PUBLIC_RATE_LIMIT;
  const windowMs = input.windowMs ?? PUBLIC_RATE_WINDOW_MS;
  const windowStart = rateWindowStart(input.now ?? new Date(), windowMs);
  const rows = await prisma.$queryRaw<Array<{ hits: number }>>`
    insert into public.api_rate_limits (bucket, subject, window_start, hits)
    values (${input.bucket}, ${input.subject}, ${windowStart}, 1)
    on conflict (bucket, subject, window_start)
    do update set hits = public.api_rate_limits.hits + 1
    returning hits
  `;
  const hits = Number(rows[0]?.hits ?? limit + 1);
  return { allowed: rateLimitAllows(hits, limit) };
}
