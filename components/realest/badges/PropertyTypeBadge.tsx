// realest\components\realest\badges\PropertyTypeBadge.tsx
"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Icons for different property types
import {
  Home,
  Building,
  MapPin,
  Building2,
  Calendar,
  Hotel,
  ShoppingBag,
  Briefcase,
  Warehouse,
  Store,
  ChefHat,
  Trees,
  Factory,
  Castle,
  Building as BuildingIcon,
} from "lucide-react";

export type PropertyType =
  // Broad categories
  | 'house'
  | 'apartment'
  | 'land'
  | 'commercial'
  | 'event_center'
  | 'hotel'
  | 'shop'
  | 'office'
  // Nigerian residential subtypes
  | 'duplex'
  | 'bungalow'
  | 'flat'
  | 'self_contained'
  | 'mini_flat'
  | 'room_and_parlor'
  | 'single_room'
  | 'penthouse'
  | 'terrace'
  | 'detached_house'
  // Commercial subtypes
  | 'warehouse'
  | 'showroom'
  // Event/Hospitality subtypes
  | 'restaurant'
  // Land subtypes
  | 'residential_land'
  | 'commercial_land'
  | 'mixed_use_land'
  | 'farmland'
  // Additional Nigerian types
  | 'boys_quarters'
  | 'face_me_i_face_you'
  | 'mansion'
  | 'estate_property'
  | 'individual_house';

const propertyTypeBadgeVariants = cva(
  "inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border transition-all duration-200 whitespace-nowrap",
  {
    variants: {
      type: {
        // Broad categories with semantic colors
        house: [
          "bg-success/10 text-success border-success/20",
          "hover:bg-success/15 hover:border-success/30",
          "dark:bg-success/15 dark:text-success-foreground dark:border-success/40"
        ],
        apartment: [
          "bg-info/10 text-info border-info/20",
          "hover:bg-info/15 hover:border-info/30",
          "dark:bg-info/15 dark:text-info-foreground dark:border-info/40"
        ],
        land: [
          "bg-warning/10 text-warning border-warning/20",
          "hover:bg-warning/15 hover:border-warning/30",
          "dark:bg-warning/15 dark:text-warning-foreground dark:border-warning/40"
        ],
        commercial: [
          "bg-accent-violet/10 text-accent-violet border-accent-violet/20",
          "hover:bg-accent-violet/15 hover:border-accent-violet/30",
          "dark:bg-accent-violet/15 dark:text-accent-violet-foreground dark:border-accent-violet/40"
        ],
        event_center: [
          "bg-accent-violet/10 text-accent-violet border-accent-violet/20",
          "hover:bg-accent-violet/15 hover:border-accent-violet/30",
          "dark:bg-accent-violet/15 dark:text-accent-violet-foreground dark:border-accent-violet/40"
        ],
        hotel: [
          "bg-accent-violet/10 text-accent-violet border-accent-violet/20",
          "hover:bg-accent-violet/15 hover:border-accent-violet/30",
          "dark:bg-accent-violet/15 dark:text-accent-violet-foreground dark:border-accent-violet/40"
        ],
        shop: [
          "bg-secondary/10 text-secondary border-secondary/20",
          "hover:bg-secondary/15 hover:border-secondary/30",
          "dark:bg-secondary/15 dark:text-secondary-foreground dark:border-secondary/40"
        ],
        office: [
          "bg-secondary/10 text-secondary border-secondary/20",
          "hover:bg-secondary/15 hover:border-secondary/30",
          "dark:bg-secondary/15 dark:text-secondary-foreground dark:border-secondary/40"
        ],
        // Nigerian residential subtypes (inherit from parent categories)
        duplex: [
          "bg-success/10 text-success border-success/20",
          "hover:bg-success/15 hover:border-success/30",
          "dark:bg-success/15 dark:text-success-foreground dark:border-success/40"
        ],
        bungalow: [
          "bg-success/10 text-success border-success/20",
          "hover:bg-success/15 hover:border-success/30",
          "dark:bg-success/15 dark:text-success-foreground dark:border-success/40"
        ],
        flat: [
          "bg-info/10 text-info border-info/20",
          "hover:bg-info/15 hover:border-info/30",
          "dark:bg-info/15 dark:text-info-foreground dark:border-info/40"
        ],
        self_contained: [
          "bg-info/10 text-info border-info/20",
          "hover:bg-info/15 hover:border-info/30",
          "dark:bg-info/15 dark:text-info-foreground dark:border-info/40"
        ],
        mini_flat: [
          "bg-info/10 text-info border-info/20",
          "hover:bg-info/15 hover:border-info/30",
          "dark:bg-info/15 dark:text-info-foreground dark:border-info/40"
        ],
        room_and_parlor: [
          "bg-info/10 text-info border-info/20",
          "hover:bg-info/15 hover:border-info/30",
          "dark:bg-info/15 dark:text-info-foreground dark:border-info/40"
        ],
        single_room: [
          "bg-info/10 text-info border-info/20",
          "hover:bg-info/15 hover:border-info/30",
          "dark:bg-info/15 dark:text-info-foreground dark:border-info/40"
        ],
        penthouse: [
          "bg-info/10 text-info border-info/20",
          "hover:bg-info/15 hover:border-info/30",
          "dark:bg-info/15 dark:text-info-foreground dark:border-info/40"
        ],
        terrace: [
          "bg-success/10 text-success border-success/20",
          "hover:bg-success/15 hover:border-success/30",
          "dark:bg-success/15 dark:text-success-foreground dark:border-success/40"
        ],
        detached_house: [
          "bg-success/10 text-success border-success/20",
          "hover:bg-success/15 hover:border-success/30",
          "dark:bg-success/15 dark:text-success-foreground dark:border-success/40"
        ],
        // Commercial subtypes
        warehouse: [
          "bg-secondary/10 text-secondary border-secondary/20",
          "hover:bg-secondary/15 hover:border-secondary/30",
          "dark:bg-secondary/15 dark:text-secondary-foreground dark:border-secondary/40"
        ],
        showroom: [
          "bg-secondary/10 text-secondary border-secondary/20",
          "hover:bg-secondary/15 hover:border-secondary/30",
          "dark:bg-secondary/15 dark:text-secondary-foreground dark:border-secondary/40"
        ],
        // Event/Hospitality subtypes
        restaurant: [
          "bg-accent-violet/10 text-accent-violet border-accent-violet/20",
          "hover:bg-accent-violet/15 hover:border-accent-violet/30",
          "dark:bg-accent-violet/15 dark:text-accent-violet-foreground dark:border-accent-violet/40"
        ],
        // Land subtypes
        residential_land: [
          "bg-warning/10 text-warning border-warning/20",
          "hover:bg-warning/15 hover:border-warning/30",
          "dark:bg-warning/15 dark:text-warning-foreground dark:border-warning/40"
        ],
        commercial_land: [
          "bg-warning/10 text-warning border-warning/20",
          "hover:bg-warning/15 hover:border-warning/30",
          "dark:bg-warning/15 dark:text-warning-foreground dark:border-warning/40"
        ],
        mixed_use_land: [
          "bg-warning/10 text-warning border-warning/20",
          "hover:bg-warning/15 hover:border-warning/30",
          "dark:bg-warning/15 dark:text-warning-foreground dark:border-warning/40"
        ],
        farmland: [
          "bg-warning/10 text-warning border-warning/20",
          "hover:bg-warning/15 hover:border-warning/30",
          "dark:bg-warning/15 dark:text-warning-foreground dark:border-warning/40"
        ],
        // Additional Nigerian types
        boys_quarters: [
          "bg-success/10 text-success border-success/20",
          "hover:bg-success/15 hover:border-success/30",
          "dark:bg-success/15 dark:text-success-foreground dark:border-success/40"
        ],
        face_me_i_face_you: [
          "bg-success/10 text-success border-success/20",
          "hover:bg-success/15 hover:border-success/30",
          "dark:bg-success/15 dark:text-success-foreground dark:border-success/40"
        ],
        mansion: [
          "bg-success/10 text-success border-success/20",
          "hover:bg-success/15 hover:border-success/30",
          "dark:bg-success/15 dark:text-success-foreground dark:border-success/40"
        ],
        estate_property: [
          "bg-success/10 text-success border-success/20",
          "hover:bg-success/15 hover:border-success/30",
          "dark:bg-success/15 dark:text-success-foreground dark:border-success/40"
        ],
        individual_house: [
          "bg-success/10 text-success border-success/20",
          "hover:bg-success/15 hover:border-success/30",
          "dark:bg-success/15 dark:text-success-foreground dark:border-success/40"
        ]
      },
      size: {
        sm: "px-2 py-1 text-[10px] gap-1",
        md: "px-3 py-1.5 text-xs gap-1.5",
        lg: "px-4 py-2 text-sm gap-2"
      },
      variant: {
        default: "",
        outline: "bg-transparent border-2",
        solid: "border-transparent",
        ghost: "bg-transparent border-transparent hover:bg-muted/50"
      }
    },
    defaultVariants: {
      type: "house",
      size: "md",
      variant: "default"
    }
  }
);

const typeIcons: Record<PropertyType, React.ComponentType<{ className?: string }>> = {
  // Broad categories
  house: Home,
  apartment: Building,
  land: MapPin,
  commercial: Building2,
  event_center: Calendar,
  hotel: Hotel,
  shop: ShoppingBag,
  office: Briefcase,
  // Nigerian residential subtypes
  duplex: Home,
  bungalow: Home,
  flat: Building,
  self_contained: Building,
  mini_flat: Building,
  room_and_parlor: Building,
  single_room: Building,
  penthouse: Building,
  terrace: Home,
  detached_house: Home,
  // Commercial subtypes
  warehouse: Warehouse,
  showroom: Store,
  // Event/Hospitality subtypes
  restaurant: ChefHat,
  // Land subtypes
  residential_land: MapPin,
  commercial_land: MapPin,
  mixed_use_land: MapPin,
  farmland: Trees,
  // Additional Nigerian types
  boys_quarters: Home,
  face_me_i_face_you: Home,
  mansion: Castle,
  estate_property: BuildingIcon,
  individual_house: Home,
};

const typeLabels: Record<PropertyType, string> = {
  // Broad categories
  house: "House",
  apartment: "Apartment",
  land: "Land",
  commercial: "Commercial",
  event_center: "Event Center",
  hotel: "Hotel",
  shop: "Shop",
  office: "Office",
  // Nigerian residential subtypes
  duplex: "Duplex",
  bungalow: "Bungalow",
  flat: "Flat",
  self_contained: "Self-Contained",
  mini_flat: "Mini Flat",
  room_and_parlor: "Room & Parlor",
  single_room: "Single Room",
  penthouse: "Penthouse",
  terrace: "Terrace",
  detached_house: "Detached House",
  // Commercial subtypes
  warehouse: "Warehouse",
  showroom: "Showroom",
  // Event/Hospitality subtypes
  restaurant: "Restaurant",
  // Land subtypes
  residential_land: "Residential Land",
  commercial_land: "Commercial Land",
  mixed_use_land: "Mixed Use Land",
  farmland: "Farmland",
  // Additional Nigerian types
  boys_quarters: "Boys Quarters",
  face_me_i_face_you: "Face Me I Face You",
  mansion: "Mansion",
  estate_property: "Estate Property",
  individual_house: "Individual House",
};

export interface PropertyTypeBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof propertyTypeBadgeVariants> {
  type: PropertyType;
  showIcon?: boolean;
  showTooltip?: boolean;
  customLabel?: string;
}

export function PropertyTypeBadge({
  className,
  type,
  size,
  variant,
  showIcon = true,
  showTooltip = true,
  customLabel,
  ...props
}: PropertyTypeBadgeProps) {
  const Icon = typeIcons[type];
  const label = customLabel || typeLabels[type];

  const badgeContent = (
    <span
      className={cn(
        propertyTypeBadgeVariants({ type, size, variant }),
        className
      )}
      role="status"
      aria-label={`Property type: ${label}`}
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
          <div className="font-semibold mb-1">Property Type</div>
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

// Preset badge components for common property types
export function HouseBadge(props: Omit<PropertyTypeBadgeProps, 'type'>) {
  return <PropertyTypeBadge {...props} type="house" />;
}

export function ApartmentBadge(props: Omit<PropertyTypeBadgeProps, 'type'>) {
  return <PropertyTypeBadge {...props} type="apartment" />;
}

export function LandBadge(props: Omit<PropertyTypeBadgeProps, 'type'>) {
  return <PropertyTypeBadge {...props} type="land" />;
}

export function CommercialBadge(props: Omit<PropertyTypeBadgeProps, 'type'>) {
  return <PropertyTypeBadge {...props} type="commercial" />;
}

export function HotelBadge(props: Omit<PropertyTypeBadgeProps, 'type'>) {
  return <PropertyTypeBadge {...props} type="hotel" />;
}

export function OfficeBadge(props: Omit<PropertyTypeBadgeProps, 'type'>) {
  return <PropertyTypeBadge {...props} type="office" />;
}

export function DuplexBadge(props: Omit<PropertyTypeBadgeProps, 'type'>) {
  return <PropertyTypeBadge {...props} type="duplex" />;
}

export function BungalowBadge(props: Omit<PropertyTypeBadgeProps, 'type'>) {
  return <PropertyTypeBadge {...props} type="bungalow" />;
}

export function SelfContainedBadge(props: Omit<PropertyTypeBadgeProps, 'type'>) {
  return <PropertyTypeBadge {...props} type="self_contained" />;
}

export function BoysQuartersBadge(props: Omit<PropertyTypeBadgeProps, 'type'>) {
  return <PropertyTypeBadge {...props} type="boys_quarters" />;
}

export function ResidentialLandBadge(props: Omit<PropertyTypeBadgeProps, 'type'>) {
  return <PropertyTypeBadge {...props} type="residential_land" />;
}

export function CommercialLandBadge(props: Omit<PropertyTypeBadgeProps, 'type'>) {
  return <PropertyTypeBadge {...props} type="commercial_land" />;
}

export { propertyTypeBadgeVariants };
