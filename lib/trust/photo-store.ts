const DHASH = /^[0-9a-f]{16}$/i;

export function persistablePhotoHashes(
  facts: Array<{ mediaId: string; dHashHex: string | null | undefined }>,
): Array<{ mediaId: string; dHashHex: string }> {
  const saved: Array<{ mediaId: string; dHashHex: string }> = [];
  for (const fact of facts) {
    if (!fact.dHashHex || !DHASH.test(fact.dHashHex)) continue;
    saved.push({ mediaId: fact.mediaId, dHashHex: fact.dHashHex.toLowerCase() });
  }
  return saved;
}

export function storedHashes(rows: Array<{ dHashHex: string | null }>): string[] {
  return rows.flatMap((row) => (row.dHashHex && DHASH.test(row.dHashHex) ? [row.dHashHex.toLowerCase()] : []));
}

export function mediaMissingHash<T extends { dHashHex: string | null }>(rows: T[]): T[] {
  return rows.filter((row) => !row.dHashHex || !DHASH.test(row.dHashHex));
}
