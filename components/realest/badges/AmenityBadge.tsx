// realest\components\realest\badges\AmenityBadge.tsx
"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Icons for different amenity types
import {
  Zap,
  Droplets,
  Shield,
  Wifi,
  Home,
  Car,
  Waves,
  Dumbbell,
  ChefHat,
  Building,
  Route as Road,
  Clock,
  DollarSign,
} from "lucide-react";

export type AmenityType =
  | "power"
  | "water"
  | "security"
  | "internet"
  | "boys_quarters"
  | "parking"
  | "pool"
  | "gym"
  | "kitchen"
  | "building"
  | "road"
  | "generator"
  | "inverter"
  | "solar"
  | "water_tank"
  | "water_treatment";

export type AmenityStatus =
  // Power
  | "stable"
  | "intermittent"
  | "poor"
  | "none"
  | "generator_only"
  | "available"
  // Water
  | "borehole"
  | "public_water"
  | "well"
  | "water_vendor"
  // Internet
  | "fiber"
  | "starlink"
  | "4g"
  | "3g"
  // Security
  | "gated_community"
  | "security_post"
  | "cctv"
  | "perimeter_fence"
  | "security_dogs"
  | "estate_security"
  | "24/7"
  | "day_only"
  | "night_only"
  // BQ
  | "self_contained"
  | "room_and_parlor"
  | "single_room"
  | "multiple_rooms"
  | "excellent"
  | "good"
  | "fair"
  | "needs_renovation"
  // Building
  | "concrete"
  | "brick"
  | "wood"
  | "steel"
  | "glass"
  // Road
  | "paved"
  | "tarred"
  | "untarred"
  | "bad"
  | "all_year"
  | "dry_season_only"
  | "limited"
  // Kitchen
  | "built_in"
  | "separate"
  // Generic
  | "yes"
  | "no";

const amenityBadgeVariants = cva(
  "inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full border transition-all duration-200 whitespace-nowrap",
  {
    variants: {
      type: {
        power: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
        water: "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950 dark:text-cyan-300 dark:border-cyan-800",
        security: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800",
        internet: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800",
        boys_quarters: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800",
        parking: "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-300 dark:border-gray-800",
        pool: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
        gym: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
        kitchen: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800",
        building: "bg-stone-50 text-stone-700 border-stone-200 dark:bg-stone-950 dark:text-stone-300 dark:border-stone-800",
        road: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
        generator: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800",
        inverter: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800",
        solar: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800",
        water_tank: "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950 dark:text-cyan-300 dark:border-cyan-800",
        water_treatment: "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950 dark:text-teal-300 dark:border-teal-800",
      },
      size: {
        sm: "px-2 py-0.5 text-[10px] gap-0.5",
        md: "px-2.5 py-1 text-xs gap-1",
        lg: "px-3 py-1.5 text-sm gap-1.5"
      },
      variant: {
        default: "",
        outline: "bg-transparent border-2",
        solid: "border-transparent",
        ghost: "bg-transparent border-transparent hover:bg-muted/50"
      }
    },
    defaultVariants: {
      size: "md",
      variant: "default"
    }
  }
);

const typeIcons: Record<AmenityType, React.ComponentType<{ className?: string }>> = {
  power: Zap,
  water: Droplets,
  security: Shield,
  internet: Wifi,
  boys_quarters: Home,
  parking: Car,
  pool: Waves,
  gym: Dumbbell,
  kitchen: ChefHat,
  building: Building,
  road: Road,
  generator: Zap,
  inverter: Zap,
  solar: Zap,
  water_tank: Droplets,
  water_treatment: Droplets,
};

const typeLabels: Record<AmenityType, string> = {
  power: "Power",
  water: "Water",
  security: "Security",
  internet: "Internet",
  boys_quarters: "Boys Quarters",
  parking: "Parking",
  pool: "Swimming Pool",
  gym: "Gym",
  kitchen: "Kitchen",
  building: "Building",
  road: "Road",
  generator: "Generator",
  inverter: "Inverter",
  solar: "Solar Panels",
  water_tank: "Water Tank",
  water_treatment: "Water Treatment",
};

function getStatusLabel(type: AmenityType, status: AmenityStatus, value?: string | number): string {
  // Handle numeric values (like parking spaces, water tank capacity)
  if (typeof value === 'number') {
    switch (type) {
      case 'parking':
        return `${value} Space${value !== 1 ? 's' : ''}`;
      case 'water_tank':
        return `${value}L Tank`;
      default:
        return `${value}`;
    }
  }

  // Handle specific status labels
  switch (status) {
    // Power
    case "stable": return "Stable NEPA";
    case "intermittent": return "Intermittent";
    case "poor": return "Poor Supply";
    case "none": return "No Power";
    case "generator_only": return "Generator Only";
    case "available": return "Available";

    // Water
    case "borehole": return "Borehole";
    case "public_water": return "Public Water";
    case "well": return "Well";
    case "water_vendor": return "Vendor";

    // Internet
    case "fiber": return "Fiber";
    case "starlink": return "Starlink";
    case "4g": return "4G";
    case "3g": return "3G";

    // Security
    case "gated_community": return "Gated Community";
    case "security_post": return "Security Post";
    case "cctv": return "CCTV";
    case "perimeter_fence": return "Perimeter Fence";
    case "security_dogs": return "Security Dogs";
    case "estate_security": return "Estate Security";
    case "24/7": return "24/7 Security";
    case "day_only": return "Day Security";
    case "night_only": return "Night Security";

    // BQ
    case "self_contained": return "Self-Contained BQ";
    case "room_and_parlor": return "Room & Parlor BQ";
    case "single_room": return "Single Room BQ";
    case "multiple_rooms": return "Multiple Rooms BQ";
    case "excellent": return "Excellent BQ";
    case "good": return "Good BQ";
    case "fair": return "Fair BQ";
    case "needs_renovation": return "BQ Needs Renovation";

    // Building
    case "concrete": return "Concrete";
    case "brick": return "Brick";
    case "wood": return "Wood";
    case "steel": return "Steel";
    case "glass": return "Glass";

    // Road
    case "paved": return "Paved Road";
    case "tarred": return "Tarred Road";
    case "untarred": return "Untarred Road";
    case "bad": return "Bad Road";
    case "all_year": return "All Year Access";
    case "dry_season_only": return "Dry Season Only";
    case "limited": return "Limited Access";

    // Kitchen
    case "built_in": return "Built-in Kitchen";
    case "separate": return "Separate Kitchen";

    // Generic
    case "yes": return "Yes";
    case "no": return "No";

    default:
    return (status as string).replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
  }
}

export interface AmenityBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof amenityBadgeVariants> {
  type: AmenityType;
  status: AmenityStatus;
  value?: string | number;
  showIcon?: boolean;
  showTooltip?: boolean;
  customLabel?: string;
}

export function AmenityBadge({
  className,
  type,
  status,
  value,
  size,
  variant,
  showIcon = true,
  showTooltip = true,
  customLabel,
  ...props
}: AmenityBadgeProps) {
  const Icon = typeIcons[type];
  const label = customLabel || getStatusLabel(type, status, value);

  const badgeContent = (
    <span
      className={cn(
        amenityBadgeVariants({ type, size, variant }),
        className
      )}
      role="status"
      aria-label={`${typeLabels[type]}: ${label}`}
      {...props}
    >
      {showIcon && (
        <Icon
          className={cn(
            "shrink-0",
            size === "sm" ? "w-3 h-3" : size === "lg" ? "w-4 h-4" : "w-3.5 h-3.5"
          )}
          aria-hidden="true"
        />
      )}
      <span className="font-medium truncate">
        {label}
      </span>
    </span>
  );

  // If tooltip is disabled, return just the badge
  if (!showTooltip) {
    return badgeContent;
  }

  // Return badge with tooltip information
  return (
    <div className="group relative inline-flex">
      {badgeContent}

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-popover border border-border rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 min-w-max">
        <div className="text-xs text-popover-foreground">
          <div className="font-semibold mb-1">{typeLabels[type]}</div>
          <div className="text-muted-foreground">
            {label}
          </div>
        </div>

        {/* Tooltip arrow */}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-popover border-r border-b border-border rotate-45"></div>
      </div>
    </div>
  );
}

// Preset badge components for common amenities
export function PowerBadge({ status, ...props }: Omit<AmenityBadgeProps, 'type'> & { status: AmenityStatus }) {
  return <AmenityBadge {...props} type="power" status={status} />;
}

export function WaterBadge({ status, ...props }: Omit<AmenityBadgeProps, 'type'> & { status: AmenityStatus }) {
  return <AmenityBadge {...props} type="water" status={status} />;
}

export function SecurityBadge({ status, ...props }: Omit<AmenityBadgeProps, 'type'> & { status: AmenityStatus }) {
  return <AmenityBadge {...props} type="security" status={status} />;
}

export function InternetBadge({ status, ...props }: Omit<AmenityBadgeProps, 'type'> & { status: AmenityStatus }) {
  return <AmenityBadge {...props} type="internet" status={status} />;
}

export function BoysQuartersBadge({ status, ...props }: Omit<AmenityBadgeProps, 'type'> & { status: AmenityStatus }) {
  return <AmenityBadge {...props} type="boys_quarters" status={status} />;
}

export function ParkingBadge({ value, ...props }: Omit<AmenityBadgeProps, 'type' | 'status'> & { value: number }) {
  return <AmenityBadge {...props} type="parking" status="available" value={value} />;
}

export function PoolBadge(props: Omit<AmenityBadgeProps, 'type' | 'status'>) {
  return <AmenityBadge {...props} type="pool" status="available" />;
}

export function GymBadge(props: Omit<AmenityBadgeProps, 'type' | 'status'>) {
  return <AmenityBadge {...props} type="gym" status="available" />;
}

export function GeneratorBadge(props: Omit<AmenityBadgeProps, 'type' | 'status'>) {
  return <AmenityBadge {...props} type="generator" status="available" />;
}

export function InverterBadge(props: Omit<AmenityBadgeProps, 'type' | 'status'>) {
  return <AmenityBadge {...props} type="inverter" status="available" />;
}

export function SolarBadge(props: Omit<AmenityBadgeProps, 'type' | 'status'>) {
  return <AmenityBadge {...props} type="solar" status="available" />;
}

export function WaterTankBadge({ value, ...props }: Omit<AmenityBadgeProps, 'type' | 'status'> & { value: number }) {
  return <AmenityBadge {...props} type="water_tank" status="available" value={value} />;
}

export function WaterTreatmentBadge(props: Omit<AmenityBadgeProps, 'type' | 'status'>) {
  return <AmenityBadge {...props} type="water_treatment" status="available" />;
}

// Compound component for multiple amenity badges
export function AmenityBadgeGroup({
  amenities,
  className,
  showTooltip = true,
  maxDisplay = 5,
  ...props
}: {
  amenities: Array<{
    type: AmenityType;
    status: AmenityStatus;
    value?: string | number;
    showIcon?: boolean;
    customLabel?: string;
  }>;
  className?: string;
  showTooltip?: boolean;
  maxDisplay?: number;
} & React.HTMLAttributes<HTMLDivElement>) {
  const displayAmenities = amenities.slice(0, maxDisplay);
  const remainingCount = amenities.length - maxDisplay;

  return (
    <div
      className={cn("flex flex-wrap gap-1.5", className)}
      role="group"
      aria-label="Property amenities"
      {...props}
    >
      {displayAmenities.map((amenity, index) => (
        <AmenityBadge
          key={`${amenity.type}-${amenity.status}-${index}`}
          {...amenity}
          showTooltip={showTooltip}
          size="sm"
        />
      ))}
      {remainingCount > 0 && (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-muted text-muted-foreground border border-border">
          +{remainingCount} more
        </span>
      )}
    </div>
  );
}

// Helper function to convert property data to amenity badges
export function createAmenityBadges(propertyData: any): Array<{
  type: AmenityType;
  status: AmenityStatus;
  value?: string | number;
}> {
  const amenities: Array<{
    type: AmenityType;
    status: AmenityStatus;
    value?: string | number;
  }> = [];

  // Power & Electricity
  if (propertyData.nepa_status) {
    amenities.push({ type: "power", status: propertyData.nepa_status });
  }
  if (propertyData.has_generator) {
    amenities.push({ type: "generator", status: "available" });
  }
  if (propertyData.has_inverter) {
    amenities.push({ type: "inverter", status: "available" });
  }
  if (propertyData.solar_panels) {
    amenities.push({ type: "solar", status: "available" });
  }

  // Water
  if (propertyData.water_source) {
    amenities.push({ type: "water", status: propertyData.water_source });
  }
  if (propertyData.water_tank_capacity) {
    amenities.push({ type: "water_tank", status: "available", value: propertyData.water_tank_capacity });
  }
  if (propertyData.has_water_treatment) {
    amenities.push({ type: "water_treatment", status: "available" });
  }

  // Internet
  if (propertyData.internet_type) {
    amenities.push({ type: "internet", status: propertyData.internet_type });
  }

  // Security
  if (propertyData.security_type) {
    propertyData.security_type.forEach((securityType: string) => {
      amenities.push({ type: "security", status: securityType as AmenityStatus });
    });
  }

  // Boys Quarters
  if (propertyData.has_bq) {
    amenities.push({ type: "boys_quarters", status: propertyData.bq_type || "available" });
  }

  // Parking
  if (propertyData.parking_spaces && propertyData.parking_spaces > 0) {
    amenities.push({ type: "parking", status: "available", value: propertyData.parking_spaces });
  }

  // Pool & Gym (from amenities array or direct fields)
  if (propertyData.has_pool || (propertyData.amenities && propertyData.amenities.includes("Swimming Pool"))) {
    amenities.push({ type: "pool", status: "available" });
  }
  if (propertyData.has_gym || (propertyData.amenities && propertyData.amenities.includes("Gym"))) {
    amenities.push({ type: "gym", status: "available" });
  }

  return amenities;
}

export { amenityBadgeVariants };
