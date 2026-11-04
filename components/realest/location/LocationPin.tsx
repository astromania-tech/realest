"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Icons for different location pin types
import {
  MapPin,
  Home,
  Building,
  MapPinned,
  Navigation,
  Target
} from "lucide-react";

const locationPinVariants = cva(
  "relative inline-flex items-center justify-center rounded-full border-2 border-surface shadow-lg transition-all duration-200",
  {
    variants: {
      variant: {
        default: [
          "bg-primary text-primary-foreground",
          "hover:bg-primary/90 hover:scale-110",
          "dark:bg-neon-primary dark:text-neon-primary dark:border-background"
        ],
        verified: [
          "bg-success text-success-foreground",
          "hover:bg-success/90 hover:scale-110",
          "ring-2 ring-success/20"
        ],
        pending: [
          "bg-warning text-warning-foreground",
          "hover:bg-warning/90 hover:scale-110",
          "animate-pulse"
        ],
        error: [
          "bg-error text-error-foreground",
          "hover:bg-error/90 hover:scale-110",
          "ring-2 ring-error/20"
        ],
        inactive: [
          "bg-muted text-muted-foreground",
          "hover:bg-muted/80",
          "opacity-60"
        ],
        featured: [
          "bg-gradient-to-br from-primary via-accent to-primary text-primary-foreground",
          "hover:scale-110 hover:shadow-xl",
          "ring-2 ring-primary/30 animate-glow",
          "dark:from-neon-primary dark:via-accent-violet dark:to-neon-primary"
        ]
      },
      size: {
        sm: "w-6 h-6",
        md: "w-8 h-8",
        lg: "w-10 h-10",
        xl: "w-12 h-12"
      },
      pinType: {
        residential: "",
        commercial: "",
        land: "",
        event: "",
        mixed: ""
      },
      interactive: {
        true: "cursor-pointer hover:shadow-xl active:scale-95",
        false: "cursor-default"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      pinType: "residential",
      interactive: false
    }
  }
);

const pinTypeConfig = {
  residential: {
    icon: Home,
    label: "Residential Property",
    color: "primary"
  },
  commercial: {
    icon: Building,
    label: "Commercial Property",
    color: "info"
  },
  land: {
    icon: Target,
    label: "Land/Plot",
    color: "success"
  },
  event: {
    icon: MapPinned,
    label: "Event Center",
    color: "accent"
  },
  mixed: {
    icon: MapPin,
    label: "Mixed Use",
    color: "muted"
  }
} as const;

export interface LocationPinProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof locationPinVariants> {
  coordinates?: [number, number];
  address?: string;
  verified?: boolean;
  confidence?: number; // 0-100 for ML confidence scores
  showTail?: boolean;
  showTooltip?: boolean;
  customIcon?: React.ComponentType<{ className?: string }>;
  onPinClick?: (coordinates?: [number, number]) => void;
}

export function LocationPin({
  className,
  variant,
  size,
  pinType = "residential",
  interactive,
  coordinates,
  address,
  verified,
  confidence,
  showTail = true,
  showTooltip = true,
  customIcon,
  onPinClick,
  onClick,
  ...props
}: LocationPinProps) {
  const config = pinTypeConfig[pinType || "residential"];
  const IconComponent = customIcon || config.icon;

  // Auto-determine variant based on verification status
  const effectiveVariant = variant || (
    verified === true ? "verified" :
    verified === false ? "error" :
    confidence && confidence < 50 ? "pending" :
    "default"
  );

  const handleClick = React.useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (onPinClick) {
      onPinClick(coordinates);
    }
    if (onClick) {
      onClick(e);
    }
  }, [coordinates, onPinClick, onClick]);

  const pinContent = (
    <div
      className={cn("relative inline-flex flex-col items-center")}
      onClick={interactive || onPinClick ? handleClick : undefined}
      {...props}
    >
      {/* Main pin body */}
      <div
        className={cn(
          locationPinVariants({
            variant: effectiveVariant,
            size,
            interactive: interactive || !!onPinClick
          }),
          className
        )}
        role="button"
        tabIndex={interactive || onPinClick ? 0 : -1}
        aria-label={`${config.label}${address ? ` at ${address}` : ''}${verified ? ' (Verified)' : ''}`}
      >
        <IconComponent
          className={cn(
            "shrink-0",
            size === "sm" ? "w-3 h-3" :
            size === "lg" ? "w-5 h-5" :
            size === "xl" ? "w-6 h-6" : "w-4 h-4"
          )}
          aria-hidden="true"
        />

        {/* Confidence indicator for ML-verified locations */}
        {confidence && confidence > 0 && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-info text-white rounded-full flex items-center justify-center text-[8px] font-bold">
            {Math.round(confidence / 10)}
          </div>
        )}
      </div>

      {/* Pin tail/pointer */}
      {showTail && (
        <div
          className={cn(
            "w-0 h-0 border-l-2 border-r-2 border-l-transparent border-r-transparent",
            effectiveVariant === "verified" && "border-t-success",
            effectiveVariant === "pending" && "border-t-warning",
            effectiveVariant === "error" && "border-t-error",
            effectiveVariant === "inactive" && "border-t-muted",
            effectiveVariant === "featured" && "border-t-primary",
            effectiveVariant === "default" && "border-t-primary dark:border-t-neon-primary",
            size === "sm" && "border-t-3",
            size === "md" && "border-t-4",
            size === "lg" && "border-t-5",
            size === "xl" && "border-t-6"
          )}
          style={{
            borderTopWidth: size === "sm" ? "3px" : size === "lg" ? "5px" : size === "xl" ? "6px" : "4px"
          }}
        />
      )}
    </div>
  );

  // If tooltip is disabled, return just the pin
  if (!showTooltip) {
    return pinContent;
  }

  // Return pin with tooltip information
  return (
    <div className="group relative inline-flex">
      {pinContent}

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-popover border border-border rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 min-w-max">
        <div className="text-xs text-popover-foreground">
          <div className="font-semibold mb-1">{config.label}</div>
          {address && (
            <div className="text-muted-foreground mb-1 max-w-48 truncate">
              {address}
            </div>
          )}
          {coordinates && (
            <div className="text-muted-foreground font-mono text-[10px] mb-1">
              {coordinates[0].toFixed(6)}, {coordinates[1].toFixed(6)}
            </div>
          )}
          {verified !== undefined && (
            <div className={cn(
              "font-medium",
              verified ? "text-success" : "text-error"
            )}>
              {verified ? "✓ Verified Location" : "⚠ Unverified Location"}
            </div>
          )}
          {confidence && confidence > 0 && (
            <div className="text-muted-foreground">
              Confidence: {confidence}%
            </div>
          )}
        </div>

        {/* Tooltip arrow */}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-popover border-r border-b border-border rotate-45"></div>
      </div>
    </div>
  );
}

// Preset pin components for different property types
export function ResidentialPin(props: Omit<LocationPinProps, 'pinType'>) {
  return <LocationPin {...props} pinType="residential" />;
}

export function CommercialPin(props: Omit<LocationPinProps, 'pinType'>) {
  return <LocationPin {...props} pinType="commercial" />;
}

export function LandPin(props: Omit<LocationPinProps, 'pinType'>) {
  return <LocationPin {...props} pinType="land" />;
}

export function EventPin(props: Omit<LocationPinProps, 'pinType'>) {
  return <LocationPin {...props} pinType="event" />;
}

export function VerifiedPin(props: Omit<LocationPinProps, 'variant' | 'verified'>) {
  return <LocationPin {...props} variant="verified" verified={true} />;
}

export function FeaturedPin(props: Omit<LocationPinProps, 'variant'>) {
  return <LocationPin {...props} variant="featured" />;
}

// Compound component for multiple location pins
export function LocationPinGroup({
  pins,
  className,
  ...props
}: {
  pins: Array<LocationPinProps & { id: string }>;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-wrap gap-2", className)}
      role="group"
      aria-label="Property location indicators"
      {...props}
    >
      {pins.map(({ id, ...pinProps }) => (
        <LocationPin
          key={id}
          {...pinProps}
        />
      ))}
    </div>
  );
}

// Helper function to determine pin variant based on verification status
export function getPinVariant(
  verified?: boolean,
  confidence?: number
): LocationPinProps['variant'] {
  if (verified === true) return "verified";
  if (verified === false) return "error";
  if (confidence && confidence < 50) return "pending";
  return "default";
}

// Helper function to format coordinates for display
export function formatCoordinates(coordinates: [number, number]): string {
  return `${coordinates[0].toFixed(6)}, ${coordinates[1].toFixed(6)}`;
}

export { locationPinVariants, pinTypeConfig };
