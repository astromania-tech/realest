import { DUPLICATE_RADIUS_METERS } from "@/lib/trust/types";

export const DUPLICATE_RADIUS_KM = DUPLICATE_RADIUS_METERS / 1000;

type RadiusRow = { id: string };

/**
 * Duplicate candidates are the PostGIS pin hits inside 50 metres.
 * A listing with no coordinates has no pin candidates.
 */
export async function loadDuplicateCandidates<T extends { id: string }>(input: {
  propertyId: string;
  latitude: number | null;
  longitude: number | null;
  withinRadius: (params: {
    lat: number;
    lng: number;
    radiusKm: number;
    excludePropertyId?: string;
  }) => Promise<RadiusRow[]>;
  loadByIds: (ids: string[]) => Promise<T[]>;
}): Promise<T[]> {
  if (input.latitude === null || input.longitude === null) return [];
  const rows = await input.withinRadius({
    lat: input.latitude,
    lng: input.longitude,
    radiusKm: DUPLICATE_RADIUS_KM,
    excludePropertyId: input.propertyId,
  });
  const ids = [...new Set(rows.map((row) => row.id).filter((id) => id && id !== input.propertyId))];
  if (ids.length === 0) return [];
  const loaded = await input.loadByIds(ids);
  const allowed = new Set(ids);
  return loaded.filter((row) => allowed.has(row.id));
}
