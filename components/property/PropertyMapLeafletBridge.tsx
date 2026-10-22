"use client";

/**
 * Leaflet hook consumers that must sit under MapContainer.
 * Kept in a separate module so PropertyMap can dynamic-import them and avoid
 * a static react-leaflet edge into the parent chunk.
 */
import { useEffect } from "react";
import { useMap, useMapEvents } from "react-leaflet";
import { leafletBoundsToBounds } from "@/lib/utils/mapUtils";

export function HeatmapLayer({
  points,
  options,
}: {
  points: [number, number, number][];
  options: Record<string, unknown>;
}) {
  const map = useMap();

  useEffect(() => {
    if (!map || !points.length) return;

    // @ts-expect-error leaflet.heat attaches at runtime
    const heatLayer = (window as any).L.heatLayer(points, options);
    map.addLayer(heatLayer);

    return () => {
      if (map.hasLayer(heatLayer)) {
        map.removeLayer(heatLayer);
      }
    };
  }, [map, points, options]);

  return null;
}

export function MapEventHandler({
  onBoundsChange,
  onZoomChange,
}: {
  onBoundsChange: (bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  }) => void;
  onZoomChange?: (zoom: number) => void;
}) {
  useMapEvents({
    moveend: (e) => {
      const leafletBounds = e.target.getBounds();
      onBoundsChange(leafletBoundsToBounds(leafletBounds));
    },
    zoomend: (e) => {
      const leafletBounds = e.target.getBounds();
      const currentZoom = e.target.getZoom();
      onBoundsChange(leafletBoundsToBounds(leafletBounds));
      onZoomChange?.(currentZoom);
    },
  });

  return null;
}

export function MapController({
  bounds,
}: {
  bounds: { north: number; south: number; east: number; west: number };
}) {
  const leafletMap = useMap();

  useEffect(() => {
    if (!leafletMap) return;

    const leafletBounds = new (window as any).L.LatLngBounds(
      [bounds.south, bounds.west],
      [bounds.north, bounds.east],
    );

    try {
      const current = leafletMap.getBounds();
      const almostEqual = (a: number, b: number, eps = 1e-6) =>
        Math.abs(a - b) <= eps;

      if (
        current &&
        almostEqual(current.getNorth(), leafletBounds.getNorth()) &&
        almostEqual(current.getSouth(), leafletBounds.getSouth()) &&
        almostEqual(current.getEast(), leafletBounds.getEast()) &&
        almostEqual(current.getWest(), leafletBounds.getWest())
      ) {
        return;
      }

      leafletMap.fitBounds(leafletBounds);
    } catch {
      leafletMap.fitBounds(leafletBounds);
    }
  }, [bounds, leafletMap]);

  return null;
}
