import type { LatLngBounds } from "leaflet";
import type { PropertyFilters } from "../hooks/usePropertyMap";
import { NIGERIAN_STATES, LAGOS_LGAS } from "./nigerianLocations";

// Property type colors for markers — keyed by the exact `property_type` DB values
export const PROPERTY_TYPE_COLORS = {
  // Residential
  duplex: "#F59E0B",          // Amber
  detached_house: "#F59E0B",  // Amber (same family as duplex)
  terrace: "#FBBF24",         // Yellow-amber
  bungalow: "#FCD34D",        // Light amber
  flat: "#3B82F6",            // Blue
  mini_flat: "#60A5FA",       // Light blue
  self_contained: "#93C5FD",  // Lighter blue
  room_and_parlor: "#BFDBFE", // Pale blue
  penthouse: "#8B5CF6",       // Purple
  single_room: "#A78BFA",     // Light purple
  // Commercial
  shop: "#06B6D4",            // Cyan
  office: "#84CC16",          // Lime
  warehouse: "#6B7280",       // Gray
  showroom: "#14B8A6",        // Teal
  // Hospitality & Events
  hotel: "#F97316",           // Orange-red
  event_center: "#EC4899",    // Pink
  restaurant: "#EF4444",      // Red
  // Land
  residential_land: "#10B981", // Green
  commercial_land: "#059669",  // Dark green
  // Legacy / fallback aliases kept for any old records
  house: "#F59E0B",
  apartment: "#3B82F6",
  land: "#10B981",
  commercial: "#8B5CF6",
} as const;

// Nigerian infrastructure colors
export const INFRASTRUCTURE_COLORS = {
  nepa_stable: "#10B981", // Green
  nepa_intermittent: "#F59E0B", // Orange
  nepa_poor: "#EF4444", // Red
  nepa_none: "#6B7280", // Gray
  water_borehole: "#3B82F6", // Blue
  water_public: "#06B6D4", // Cyan
  internet_fiber: "#8B5CF6", // Purple
  internet_4g: "#10B981", // Green
  security_gated: "#84CC16", // Lime
} as const;

/**
 * Get color for property type marker
 */
export function getPropertyTypeColor(propertyType: string): string {
  return (
    PROPERTY_TYPE_COLORS[propertyType as keyof typeof PROPERTY_TYPE_COLORS] ||
    PROPERTY_TYPE_COLORS.house
  );
}

/**
 * Get property type icon name
 */
export function getPropertyTypeIcon(propertyType: string): string {
  const icons: Record<string, string> = {
    // Residential
    duplex: "home",
    detached_house: "home",
    terrace: "home",
    bungalow: "home",
    flat: "building",
    mini_flat: "building",
    self_contained: "building",
    room_and_parlor: "building",
    penthouse: "building-2",
    single_room: "building",
    // Commercial
    shop: "shopping-bag",
    office: "briefcase",
    warehouse: "warehouse",
    showroom: "briefcase",
    // Hospitality & Events
    hotel: "hotel",
    event_center: "calendar",
    restaurant: "utensils",
    // Land
    residential_land: "map-pin",
    commercial_land: "map-pin",
    // Legacy aliases
    house: "home",
    apartment: "building",
    land: "map-pin",
    commercial: "building-2",
  };
  return icons[propertyType] ?? "home";
}

/**
 * Format price for display on map
 */
export function formatMapPrice(price: number, currency: string = "₦"): string {
  if (price >= 1000000000) {
    // Billions
    return `${currency}${(price / 1000000000).toFixed(1)}B`;
  } else if (price >= 1000000) {
    // Millions
    return `${currency}${(price / 1000000).toFixed(1)}M`;
  } else if (price >= 1000) {
    // Thousands
    return `${currency}${(price / 1000).toFixed(0)}K`;
  }
  return `${currency}${price.toLocaleString()}`;
}

/**
 * Create custom marker icon HTML
 */
export function createMarkerIconHTML(
  propertyType: string,
  isVerified: boolean = false,
  hasBq: boolean = false,
): string {
  const color = getPropertyTypeColor(propertyType);
  const borderColor = isVerified ? "#10B981" : "#FFFFFF";
  const shadowColor = isVerified
    ? "rgba(16, 185, 129, 0.3)"
    : "rgba(0, 0, 0, 0.4)";

  return `
    <div style="
      width: 40px;
      height: 40px;
      background-color: ${color};
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 3px solid ${borderColor};
      box-shadow: 0 4px 12px ${shadowColor};
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    ">
      <span style="
        transform: rotate(45deg);
        color: white;
        font-size: 18px;
        font-weight: bold;
      ">₦</span>
      ${
        isVerified
          ? `
        <div style="
          position: absolute;
          top: -5px;
          right: -5px;
          width: 16px;
          height: 16px;
          background-color: #10B981;
          border-radius: 50%;
          border: 2px solid white;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <span style="
            color: white;
            font-size: 10px;
            font-weight: bold;
          ">✓</span>
        </div>
      `
          : ""
      }
      ${
        hasBq
          ? `
        <div style="
          position: absolute;
          bottom: -5px;
          left: -5px;
          width: 16px;
          height: 16px;
          background-color: #F59E0B;
          border-radius: 50%;
          border: 2px solid white;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <span style="
            color: white;
            font-size: 8px;
            font-weight: bold;
          ">BQ</span>
        </div>
      `
          : ""
      }
    </div>
  `;
}

/**
 * Get price context information
 */
export function getPriceContext(
  price: number,
  propertyType: string,
  state: string,
): string {
  // Placeholder logic - in production, this would query market averages
  const basePrices: Record<string, Record<string, number>> = {
    house: { LA: 15000000, FC: 25000000, KN: 8000000 },
    apartment: { LA: 8000000, FC: 12000000, KN: 4000000 },
    land: { LA: 5000000, FC: 8000000, KN: 2000000 },
  };

  // Hospitality venues use a different pricing model — skip relative market comparison
  if (propertyType === "hotel") return "Quoted per night";
  if (propertyType === "event_center") return "Quoted per day (full venue hire)";

  const avgPrice = basePrices[propertyType]?.[state] || 10000000;

  if (price > avgPrice * 1.2) return "Above market average";
  if (price < avgPrice * 0.8) return "Below market average";
  return "At market average";
}

/**
 * Convert Leaflet bounds to our bounds format
 */
export function leafletBoundsToBounds(leafletBounds: LatLngBounds): {
  north: number;
  south: number;
  east: number;
  west: number;
} {
  return {
    north: leafletBounds.getNorth(),
    south: leafletBounds.getSouth(),
    east: leafletBounds.getEast(),
    west: leafletBounds.getWest(),
  };
}

/**
 * Check if coordinates are valid
 */
export function isValidCoordinates(
  lat: number | null,
  lng: number | null,
): boolean {
  return (
    lat !== null &&
    lng !== null &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

/**
 * Infrastructure filter options
 */
export const INFRASTRUCTURE_FILTERS = {
  nepa_status: [
    {
      value: "stable",
      label: "24/7 Power",
      color: INFRASTRUCTURE_COLORS.nepa_stable,
    },
    {
      value: "intermittent",
      label: "Intermittent",
      color: INFRASTRUCTURE_COLORS.nepa_intermittent,
    },
    { value: "poor", label: "Poor", color: INFRASTRUCTURE_COLORS.nepa_poor },
    {
      value: "none",
      label: "No Power",
      color: INFRASTRUCTURE_COLORS.nepa_none,
    },
    {
      value: "generator_only",
      label: "Generator Only",
      color: INFRASTRUCTURE_COLORS.nepa_none,
    },
  ],
  water_source: [
    {
      value: "borehole",
      label: "Borehole",
      color: INFRASTRUCTURE_COLORS.water_borehole,
    },
    {
      value: "public_water",
      label: "Public Water",
      color: INFRASTRUCTURE_COLORS.water_public,
    },
    { value: "well", label: "Well", color: INFRASTRUCTURE_COLORS.water_public },
    {
      value: "water_vendor",
      label: "Water Vendor",
      color: INFRASTRUCTURE_COLORS.water_public,
    },
  ],
  internet_type: [
    {
      value: "fiber",
      label: "Fiber",
      color: INFRASTRUCTURE_COLORS.internet_fiber,
    },
    {
      value: "starlink",
      label: "Starlink",
      color: INFRASTRUCTURE_COLORS.internet_fiber,
    },
    { value: "4g", label: "4G", color: INFRASTRUCTURE_COLORS.internet_4g },
    { value: "3g", label: "3G", color: INFRASTRUCTURE_COLORS.internet_4g },
  ],
  security_type: [
    {
      value: "gated_community",
      label: "Gated Community",
      color: INFRASTRUCTURE_COLORS.security_gated,
    },
    {
      value: "security_post",
      label: "Security Post",
      color: INFRASTRUCTURE_COLORS.security_gated,
    },
    {
      value: "cctv",
      label: "CCTV",
      color: INFRASTRUCTURE_COLORS.security_gated,
    },
    {
      value: "perimeter_fence",
      label: "Perimeter Fence",
      color: INFRASTRUCTURE_COLORS.security_gated,
    },
  ],
} as const;

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Get the dominant property type in a cluster
 */
export function getDominantPropertyType(properties: any[]): string {
  if (!properties.length) return "house";

  const typeCounts = properties.reduce(
    (acc, prop) => {
      const type = prop.property_type || "house";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const dominantType = Object.entries(typeCounts).reduce((a, b) =>
    typeCounts[a[0]] > typeCounts[b[0]] ? a : b,
  )[0];

  return dominantType;
}

/**
 * Create cluster icon HTML with dominant type and count
 */
export function createClusterIconHTML(
  dominantType: string,
  count: number,
  sizeClass: string,
): string {
  const color = getPropertyTypeColor(dominantType);
  const size = sizeClass === "large" ? 40 : sizeClass === "medium" ? 35 : 30;

  return `
    <div style="
      width: ${size}px;
      height: ${size}px;
      background-color: ${color};
      border-radius: 50%;
      border: 2px solid rgba(255, 255, 255, 0.8);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    ">
      <span style="
        color: white;
        font-size: ${sizeClass === "large" ? 16 : sizeClass === "medium" ? 14 : 12}px;
        font-weight: bold;
      ">${count}</span>
      <div style="
        position: absolute;
        bottom: -2px;
        right: -2px;
        width: 12px;
        height: 12px;
        background-color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <span style="
          font-size: 8px;
          color: ${color};
          font-weight: bold;
        ">₦</span>
      </div>
    </div>
  `;
}

// Re-export location data
export { NIGERIAN_STATES, LAGOS_LGAS };
