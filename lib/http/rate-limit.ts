import { prisma } from "@/lib/prisma";

export const PUBLIC_RATE_LIMIT = 5;
export const PUBLIC_RATE_WINDOW_MS = 60_000;

/**
 * Client IP for rate limits. Only the platform header counts.
 * x-forwarded-for and x-real-ip are caller-supplied, so rotating them
 * would open a new bucket on every request.
 */
export function clientAddress(headers: Headers): string {
  const platform = headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim();
  if (!platform) return "unknown";
  return platform.slice(0, 80);
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
