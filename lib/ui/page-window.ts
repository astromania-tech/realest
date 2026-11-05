/** One page of a long list. Page numbers are 1-based and clamped. */
export function parsePage(raw: string | string[] | undefined): number {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const n = Number(value);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.floor(n);
}

export function pageWindow(total: number, page: number, pageSize: number) {
  const size = Math.max(1, Math.floor(pageSize));
  const safeTotal = Math.max(0, Math.floor(Number.isFinite(total) ? total : 0));
  const pageCount = Math.max(1, Math.ceil(safeTotal / size));
  const current = Math.min(Math.max(1, Math.floor(page) || 1), pageCount);
  const start = (current - 1) * size;
  const end = Math.min(start + size, safeTotal);
  return {
    page: current,
    pageCount,
    pageSize: size,
    start,
    end,
    from: safeTotal === 0 ? 0 : start + 1,
    to: end,
  };
}
