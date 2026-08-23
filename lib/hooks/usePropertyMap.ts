"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";
import type { RealtimeChannel } from "@supabase/supabase-js";

/**
 * Property row joined with its relations as returned by Supabase.
 *
 * Key layout facts (from prisma/schema.prisma):
 *  - bedrooms / bathrooms / square_feet / year_built  →  on the `properties` table directly
 *  - Nigerian infra (has_bq, nepa_status, water_source, internet_type, security_type)
 *    →  stored in  property_details[].metadata  (JSON column, NOT direct columns)
 *  - property_details is a one-to-many relation   →  returns as an array
 */
export type PropertyDetailMetadata = {
  has_bq?: boolean;
  nepa_status?: string;
  water_source?: string;
  internet_type?: string;
  security_type?: string[];
  [key: string]: unknown;
};

export type Property = Database["public"]["Tables"]["properties"]["Row"] & {
  property_details: (Database["public"]["Tables"]["property_details"]["Row"] & {
    metadata: PropertyDetailMetadata | null;
  })[];
  property_media: Database["public"]["Tables"]["property_media"]["Row"][];
  owners: {
    profiles: Pick<
      Database["public"]["Tables"]["profiles"]["Row"],
      "full_name" | "avatar_url" | "phone"
    > | null;
  } | null;
  agents: {
    profiles: Pick<
      Database["public"]["Tables"]["profiles"]["Row"],
      "full_name" | "avatar_url" | "phone"
    > | null;
  } | null;
};

export interface PropertyFilters {
  propertyType?: string;
  listingType?: string;
  state?: string;
  lga?: string; // no DB column — used only for display/label mapping
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  // Nigerian infra filters — live in property_details.metadata JSON
  // These are applied client-side after the query (PostgREST can't filter nested JSON)
  hasBq?: boolean;
  nepaStatus?: string;
  waterSource?: string;
  internetType?: string;
  securityTypes?: string[];
}

interface UsePropertyMapOptions {
  bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  center?: {
    lat: number;
    lng: number;
  };
  radius?: number; // in kilometers
  filters?: PropertyFilters;
  limit?: number;
  zoom?: number; // Map zoom level for progressive loading
  enabled?: boolean;
}

interface UsePropertyMapReturn {
  properties: Property[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function usePropertyMap({
  bounds,
  center,
  radius,
  filters,
  limit,
  zoom = 11,
  enabled = true,
}: UsePropertyMapOptions = {}): UsePropertyMapReturn {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Progressive loading: adjust limit based on zoom level
  const getProgressiveLimit = (zoomLevel: number, baseLimit?: number) => {
    if (baseLimit) return baseLimit;
    if (zoomLevel <= 8) return 50;
    if (zoomLevel <= 10) return 100;
    if (zoomLevel <= 12) return 200;
    return 500;
  };

  const fetchProperties = useCallback(async () => {
    if (!enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const progressiveLimit = getProgressiveLimit(zoom, limit);

      let query = supabase
        .from("properties")
        .select(
          `
          *,
          property_details (*),
          property_media (*),
          owners (profiles (full_name, avatar_url, phone)),
          agents (profiles (full_name, avatar_url, phone))
        `,
        )
        .eq("status", "live")
        .eq("verification_status", "verified")
        .order("created_at", { ascending: false })
        .limit(progressiveLimit);

      // Geospatial bounds filtering
      if (bounds) {
        query = query
          .gte("latitude", bounds.south)
          .lte("latitude", bounds.north)
          .gte("longitude", bounds.west)
          .lte("longitude", bounds.east);
      }

      // Server-side filters (direct columns on `properties` table)
      if (filters) {
        if (filters.propertyType) {
          query = query.eq("property_type", filters.propertyType);
        }
        if (filters.listingType) {
          query = query.eq("listing_type", filters.listingType);
        }
        if (filters.state) {
          query = query.ilike("state", filters.state);
        }
        if (filters.minPrice !== undefined) {
          query = query.gte("price", filters.minPrice);
        }
        if (filters.maxPrice !== undefined) {
          query = query.lte("price", filters.maxPrice);
        }
        // bedrooms / bathrooms are on the `properties` table (NOT property_details)
        if (filters.bedrooms !== undefined) {
          query = query.gte("bedrooms", filters.bedrooms);
        }
        if (filters.bathrooms !== undefined) {
          query = query.gte("bathrooms", filters.bathrooms);
        }
        // NOTE: lga has no column on `properties` — skipped at query level
      }

      const { data, error: queryError } = await query;

      if (queryError) throw queryError;

      // Filter out properties without valid coordinates
      let validProperties = (data || []).filter(
        (p) => p.latitude !== null && p.longitude !== null,
      ) as Property[];

      // Client-side post-filter: Nigerian infra attributes live in
      // property_details[0].metadata (JSON) — cannot be filtered server-side
      // via standard PostgREST without raw SQL functions.
      if (filters) {
        const { hasBq, nepaStatus, waterSource, internetType, securityTypes } = filters;
        const needsMetaFilter = hasBq !== undefined || nepaStatus || waterSource || internetType || (securityTypes && securityTypes.length > 0);

        if (needsMetaFilter) {
          validProperties = validProperties.filter((p) => {
            const meta = p.property_details?.[0]?.metadata ?? {};

            if (hasBq !== undefined && meta.has_bq !== hasBq) return false;
            if (nepaStatus && meta.nepa_status !== nepaStatus) return false;
            if (waterSource && meta.water_source !== waterSource) return false;
            if (internetType && meta.internet_type !== internetType) return false;
            if (securityTypes && securityTypes.length > 0) {
              const propSecurity: string[] = Array.isArray(meta.security_type)
                ? (meta.security_type as string[])
                : [];
              const hasOverlap = securityTypes.some((s) => propSecurity.includes(s));
              if (!hasOverlap) return false;
            }

            return true;
          });
        }
      }

      setProperties(validProperties);
    } catch (err) {
      console.error("Error fetching properties for map:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch properties",
      );
    } finally {
      setIsLoading(false);
    }
  }, [bounds, center, radius, filters, limit, zoom, enabled]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  // Real-time updates
  useEffect(() => {
    if (!enabled) return;

    const supabase = createClient();
    const channel: RealtimeChannel = supabase
      .channel("properties-map-updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "properties" },
        () => { fetchProperties(); },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [enabled]);

  return {
    properties,
    isLoading,
    error,
    refetch: fetchProperties,
  };
}
