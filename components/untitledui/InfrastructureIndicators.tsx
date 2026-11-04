"use client";

import React from "react";
import clsx from "clsx";

export type InfrastructureType =
  | "power"
  | "water"
  | "security"
  | "internet"
  | "bq";

export type InfrastructureStatus =
  | "stable"
  | "intermittent"
  | "poor"
  | "none"
  | "generator_only"
  | "inverter"
  | "solar_panels"
  | "borehole"
  | "public_water"
  | "well"
  | "water_vendor"
  | "water_tank"
  | "water_treatment"
  | "fiber"
  | "starlink"
  | "4g"
  | "3g"
  | "gated"
  | "security_post"
  | "cctv"
  | "perimeter"
  | "available"
  | "not_available"
  | "separate_entrance"
  | "shared"
  | "24/7"
  | "day_only"
  | "night_only"
  | "security_levy";

interface IndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  type: InfrastructureType;
  status: InfrastructureStatus;
  label?: string;
}

const typeIcons: Record<InfrastructureType, string> = {
  power: "⚡",
  water: "💧",
  security: "🛡️",
  internet: "📡",
  bq: "🏠",
};

const typeLabels: Record<InfrastructureType, string> = {
  power: "Power",
  water: "Water",
  security: "Security",
  internet: "Internet",
  bq: "BQ",
};

function colorFor(type: InfrastructureType, status: InfrastructureStatus) {
  switch (type) {
    case "power":
      if (
        status === "stable" ||
        status === "inverter" ||
        status === "solar_panels"
      )
        return "text-success";
      if (status === "intermittent" || status === "generator_only")
        return "text-warning";
      return "text-destructive";
    case "water":
      if (status === "water_tank" || status === "water_treatment")
        return "text-success";
      return status === "none" ? "text-destructive" : "text-success";
    case "security":
      if (status === "24/7" || status === "security_levy")
        return "text-success";
      return status === "none" ? "text-destructive" : "text-success";
    case "internet":
      return status === "none" ? "text-destructive" : "text-success";
    case "bq":
      return status === "not_available"
        ? "text-muted-foreground"
        : "text-success";
    default:
      return "text-foreground";
  }
}

export function InfrastructureIndicator({
  type,
  status,
  label,
  className,
  ...rest
}: IndicatorProps) {
  const icon = typeIcons[type];
  const color = colorFor(type, status);
  const resolvedLabel = label ?? `${typeLabels[type]}: ${statusLabel(status)}`;

  return (
    <div
      className={clsx(
        "inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-medium",
        className,
      )}
      {...rest}
    >
      <span aria-hidden className={clsx(color)}>
        {icon}
      </span>
      <span className={clsx("text-foreground", color)}>{resolvedLabel}</span>
    </div>
  );
}

function statusLabel(status: InfrastructureStatus) {
  switch (status) {
    case "stable":
      return "Stable";
    case "intermittent":
      return "Intermittent";
    case "generator_only":
      return "Generator";
    case "poor":
      return "Poor";
    case "none":
      return "None";
    case "inverter":
      return "Inverter";
    case "solar_panels":
      return "Solar Panels";
    case "borehole":
      return "Borehole";
    case "public_water":
      return "Public";
    case "well":
      return "Well";
    case "water_vendor":
      return "Vendor";
    case "water_tank":
      return "Water Tank";
    case "water_treatment":
      return "Water Treatment";
    case "fiber":
      return "Fiber";
    case "starlink":
      return "Starlink";
    case "4g":
      return "4G";
    case "3g":
      return "3G";
    case "gated":
      return "Gated";
    case "security_post":
      return "Security Post";
    case "cctv":
      return "CCTV";
    case "perimeter":
      return "Perimeter";
    case "available":
      return "Available";
    case "not_available":
      return "Not Available";
    case "separate_entrance":
      return "Separate Entrance";
    case "shared":
      return "Shared";
    case "24/7":
      return "24/7";
    case "day_only":
      return "Day Only";
    case "night_only":
      return "Night Only";
    case "security_levy":
      return "Security Levy";
    default:
      return String(status);
  }
}

export function InfrastructureIndicatorGroup({
  children,
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx("flex flex-wrap gap-2", className)} {...rest}>
      {children}
    </div>
  );
}
