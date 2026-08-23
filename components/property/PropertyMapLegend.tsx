import { Card } from "@/components/ui/card";
import {
  Home,
  Building2,
  Hotel,
  Calendar,
  MapPin,
  Briefcase,
} from "lucide-react";
import { getPropertyTypeColor } from "@/lib/utils/mapUtils";

interface PropertyMapLegendProps {
  showLegend: boolean;
  filteredProperties: any[];
}

// ─── Category → DB `property_type` mapping ──────────────────────────────────
// These must match the exact strings stored in the `property_type` column.
const LEGEND_CATEGORIES = [
  {
    key: "residential",
    label: "Residential",
    icon: Home,
    // All Nigerian residential variants
    types: [
      "duplex",
      "detached_house",
      "terrace",
      "bungalow",
      "penthouse",
      "flat",
      "mini_flat",
      "self_contained",
      "room_and_parlor",
      "single_room",
      // Legacy aliases (just in case)
      "house",
      "apartment",
    ],
    // Use the colour of the most representative type
    colorType: "duplex",
  },
  {
    key: "commercial",
    label: "Commercial",
    icon: Briefcase,
    types: ["shop", "office", "warehouse", "showroom", "commercial"],
    colorType: "office",
  },
  {
    key: "hotel",
    label: "Hotel",
    icon: Hotel,
    types: ["hotel"],
    colorType: "hotel",
  },
  {
    key: "event_center",
    label: "Event / Hospitality",
    icon: Calendar,
    types: ["event_center", "restaurant"],
    colorType: "event_center",
  },
  {
    key: "land",
    label: "Land",
    icon: MapPin,
    types: ["residential_land", "commercial_land", "land"],
    colorType: "residential_land",
  },
] as const;
// ────────────────────────────────────────────────────────────────────────────

export function PropertyMapLegend({
  showLegend,
  filteredProperties,
}: PropertyMapLegendProps) {
  if (!showLegend) return null;

  return (
    <Card className="absolute bottom-6 right-6 p-4 z-10 bg-background/95 backdrop-blur-sm border-border/50">
      <h4 className="font-semibold mb-3 text-sm">Property Types</h4>
      <div className="space-y-2">
        {LEGEND_CATEGORIES.map(({ key, label, icon: Icon, types, colorType }) => {
          const count = filteredProperties.filter((p) =>
            (types as readonly string[]).includes(p.property_type as string),
          ).length;
          return (
            <div key={key} className="flex items-center gap-2 text-sm">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: getPropertyTypeColor(colorType) }}
              />
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span>{label}</span>
              <span className="text-muted-foreground ml-auto pl-2">
                ({count})
              </span>
            </div>
          );
        })}
        {/* Total */}
        <div className="flex items-center gap-2 text-sm border-t border-border/40 pt-2 mt-1">
          <Building2 className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
          <span className="text-muted-foreground">Total visible</span>
          <span className="ml-auto pl-2 font-medium">{filteredProperties.length}</span>
        </div>
      </div>
    </Card>
  );
}

