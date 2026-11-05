export const VALIDATION_JOB_MAX_ATTEMPTS = 5;
export const VALIDATION_JOB_STALE_MINUTES = 10;
export const VALIDATION_JOB_MAX_BACKOFF_MINUTES = 30;

export type ClaimSnapshot = {
  status: string;
  attempts: number;
  nextRetryAt: Date | null;
  updatedAt: Date;
};

export function retryDelayMinutes(attempts: number): number | null {
  if (attempts >= VALIDATION_JOB_MAX_ATTEMPTS) return null;
  const delay = 2 ** Math.max(0, attempts - 1);
  return Math.min(VALIDATION_JOB_MAX_BACKOFF_MINUTES, delay);
}

export function jobIsClaimable(row: ClaimSnapshot, now: Date): boolean {
  if (row.attempts >= VALIDATION_JOB_MAX_ATTEMPTS) return false;
  if (row.status === "queued") {
    return row.nextRetryAt === null || row.nextRetryAt.getTime() <= now.getTime();
  }
  if (row.status === "failed") {
    return row.nextRetryAt !== null && row.nextRetryAt.getTime() <= now.getTime();
  }
  if (row.status === "processing") {
    return now.getTime() - row.updatedAt.getTime() >= VALIDATION_JOB_STALE_MINUTES * 60_000;
  }
  return false;
}
