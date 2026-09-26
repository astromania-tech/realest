import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/prisma/client";

export type PropertyWithinRadiusRow = { id: string };

/**
 * Calls the PostGIS SQL function via Prisma (not supabase.rpc).
 * Expected SQL: properties_within_radius(lat float, lng float, radius_km float)
 * Optional exclude is applied in SQL after the function returns.
 */
export async function propertiesWithinRadius(params: {
  lat: number;
  lng: number;
  radiusKm: number;
  excludePropertyId?: string;
}): Promise<PropertyWithinRadiusRow[]> {
  const { lat, lng, radiusKm, excludePropertyId } = params;

  if (excludePropertyId) {
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
