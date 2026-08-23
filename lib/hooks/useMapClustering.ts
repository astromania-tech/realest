"use client";

import { useMemo } from "react";
import {
  getDominantPropertyType,
  createClusterIconHTML,
} from "@/lib/utils/mapUtils";

export interface ClusterOptions {
  chunkedLoading: boolean;
  chunkInterval: number;
  chunkDelay: number;
  spiderfyOnMaxZoom: boolean;
  showCoverageOnHover: boolean;
  zoomToBoundsOnClick: boolean;
  iconCreateFunction: (cluster: any) => any;
}

export function useMapClustering(): ClusterOptions {
  const clusterOptions = useMemo(
    () => ({
      chunkedLoading: true,
      chunkInterval: 200,
      chunkDelay: 50,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      iconCreateFunction: (cluster: any) => {
        if (typeof window === "undefined") return null;

        const childMarkers = cluster.getAllChildMarkers();
        const properties = childMarkers
          .map((marker: any) => marker.options.property)
          .filter(Boolean);

        // Analyze cluster properties for dominant characteristics
        const dominantType = getDominantPropertyType(properties);
        const childCount = cluster.getChildCount();

        // Determine cluster size class
        let sizeClass = "small";
        if (childCount >= 100) {
          sizeClass = "large";
        } else if (childCount >= 10) {
          sizeClass = "medium";
        }

        // Create cluster icon with dominant type and count
        const iconHtml = createClusterIconHTML(
          dominantType,
          childCount,
          sizeClass,
        );

        return new (window as any).L.DivIcon({
          html: iconHtml,
          className: `marker-cluster marker-cluster-${sizeClass}`,
          iconSize: new (window as any).L.Point(40, 40),
        });
      },
    }),
    [],
  );

  return clusterOptions;
}
