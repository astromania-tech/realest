export function haversineMeters(leftLat: number, leftLng: number, rightLat: number, rightLng: number): number {
  const earthRadiusMeters = 6371000;
  const latDelta = ((rightLat - leftLat) * Math.PI) / 180;
  const lngDelta = ((rightLng - leftLng) * Math.PI) / 180;
  const a =
    Math.sin(latDelta / 2) ** 2 +
    Math.cos((leftLat * Math.PI) / 180) *
      Math.cos((rightLat * Math.PI) / 180) *
      Math.sin(lngDelta / 2) ** 2;
  return 2 * earthRadiusMeters * Math.asin(Math.sqrt(a));
}

export function normalizeAddress(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

export function addressesMatch(left: string, right: string): boolean {
  const a = normalizeAddress(left);
  const b = normalizeAddress(right);
  return a.length > 0 && a === b;
}

export function locationTextAgrees(locationText: string | null, listingAddress: string): boolean {
  if (!locationText) return true;
  const location = normalizeAddress(locationText);
  const tokens = normalizeAddress(listingAddress).split(" ").filter((token) => token.length > 3);
  if (tokens.length === 0) return true;
  return tokens.some((token) => location.includes(token));
}

export function holderNameAgrees(holderName: string | null, accountName: string | null): boolean {
  if (!holderName || !accountName) return true;
  const holder = new Set(normalizeAddress(holderName).split(" ").filter((token) => token.length > 2));
  const account = normalizeAddress(accountName).split(" ").filter((token) => token.length > 2);
  if (holder.size === 0 || account.length === 0) return true;
  return account.some((token) => holder.has(token));
}
