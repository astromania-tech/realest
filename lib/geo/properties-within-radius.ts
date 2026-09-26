import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/prisma/client";

export type PropertyWithinRadiusRow = { id: string };

export class InvalidGeoQueryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidGeoQueryError";
  }
}

/** Validate numeric geo args before they reach PostGIS (defense in depth). */
export function assertValidGeoQuery(params: {
  lat: number;
  lng: number;
  radiusKm: number;
}): void {
  const { lat, lng, radiusKm } = params;
  if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
    throw new InvalidGeoQueryError("latitude must be a finite number between -90 and 90");
  }
  if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
    throw new InvalidGeoQueryError("longitude must be a finite number between -180 and 180");
  }
  if (!Number.isFinite(radiusKm) || radiusKm <= 0 || radiusKm > 1000) {
    throw new InvalidGeoQueryError("radiusKm must be a finite number between 0 and 1000");
  }
}

/**
 * Calls the PostGIS SQL function via Prisma parameterized `$queryRaw` (not string concat).
 * Expected SQL: properties_within_radius(lat float, lng float, radius_km float)
 */
export async function propertiesWithinRadius(params: {
  lat: number;
  lng: number;
  radiusKm: number;
  excludePropertyId?: string;
}): Promise<PropertyWithinRadiusRow[]> {
  assertValidGeoQuery(params);
  const { lat, lng, radiusKm, excludePropertyId } = params;

  if (excludePropertyId) {
    if (
      typeof excludePropertyId !== "string" ||
      !/^[0-9a-f-]{36}$/i.test(excludePropertyId)
    ) {
      throw new InvalidGeoQueryError("excludePropertyId must be a UUID");
    }
    return prisma.$queryRaw<PropertyWithinRadiusRow[]>(Prisma.sql`
      SELECT id::text AS id
      FROM properties_within_radius(${lat}, ${lng}, ${radiusKm})
      WHERE id::text <> ${excludePropertyId}
    `);
  }

  return prisma.$queryRaw<PropertyWithinRadiusRow[]>(Prisma.sql`
    SELECT id::text AS id
    FROM properties_within_radius(${lat}, ${lng}, ${radiusKm})
  `);
}
