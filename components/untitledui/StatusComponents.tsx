"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

// ================================================================
// PROGRESS INDICATORS
// ================================================================

interface ProgressRingProps {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  color?: "default" | "success" | "warning" | "danger" | "neon" | "violet";
  showValue?: boolean;
  className?: string;
}

export function ProgressRing({
  value,
  max = 100,
  size = "md",
  color = "default",
  showValue = false,
  className,
}: ProgressRingProps) {
  const percentage = Math.min((value / max) * 100, 100);
  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  const colorClasses = {
    default: "text-brand-violet",
    success: "text-success",
    warning: "text-warning",
    danger: "text-error",
    neon: "text-brand-neon",
    violet: "text-brand-violet",
  };

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center",
        sizeClasses[size],
        className,
      )}
    >
      <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke="currentColor"
          strokeWidth="8"
          fill="transparent"
          className="text-muted opacity-20"
        />
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke="currentColor"
          strokeWidth="8"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={cn(
            "transition-all duration-300 ease-out",
            colorClasses[color],
          )}
        />
      </svg>
      {showValue && (
        <span
          className={cn(
            "absolute font-mono font-semibold",
            size === "sm" ? "text-xs" : size === "md" ? "text-sm" : "text-base",
          )}
        >
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  );
}

// ================================================================
// STATUS DOTS
// ================================================================

const statusDotVariants = cva(
  "inline-flex items-center justify-center rounded-full transition-all duration-200",
  {
    variants: {
      status: {
        online: "bg-success",
        offline: "bg-gray-400",
        away: "bg-warning",
        busy: "bg-error",
        verified: "bg-success animate-pulse",
        pending: "bg-warning animate-pulse",
        error: "bg-error",
        default: "bg-muted-foreground",
      },
      size: {
        xs: "w-1.5 h-1.5",
        sm: "w-2 h-2",
        md: "w-3 h-3",
        lg: "w-4 h-4",
      },
    },
    defaultVariants: {
      status: "default",
      size: "sm",
    },
  },
);

interface StatusDotProps extends VariantProps<typeof statusDotVariants> {
  className?: string;
}

export function StatusDot({ status, size, className }: StatusDotProps) {
  return (
    <span
      className={cn(statusDotVariants({ status, size }), className)}
      aria-hidden="true"
    />
  );
}

// Status dot with label
interface StatusIndicatorProps extends StatusDotProps {
  label: string;
  position?: "left" | "right";
}

export function StatusIndicator({
  label,
  position = "right",
  className,
  ...props
}: StatusIndicatorProps) {
  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      {position === "left" && <StatusDot {...props} />}
      <span className="text-sm font-medium">{label}</span>
      {position === "right" && <StatusDot {...props} />}
    </div>
  );
}

// ================================================================
// LOADING STATES
// ================================================================

export function LoadingDots({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center space-x-1", className)}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-1.5 h-1.5 bg-brand-violet rounded-full animate-pulse"
          style={{
            animationDelay: `${i * 0.2}s`,
            animationDuration: "1s",
          }}
        />
      ))}
    </div>
  );
}

export function LoadingSpinner({
  size = "md",
  color = "default",
  className,
}: {
  size?: "sm" | "md" | "lg";
  color?: "default" | "neon" | "violet" | "white";
  className?: string;
}) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  const colorClasses = {
    default: "text-brand-violet",
    neon: "text-brand-neon",
    violet: "text-brand-violet",
    white: "text-white",
  };

  return (
    <svg
      className={cn(
        "animate-spin",
        sizeClasses[size],
        colorClasses[color],
        className,
      )}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

// ================================================================
// ALERT BANNERS
// ================================================================

const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm transition-all duration-200",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground border-border",
        success: "bg-success/10 text-success border-success/20",
        warning: "bg-warning/10 text-warning-dark border-warning/20",
        error: "bg-error/10 text-error border-error/20",
        info: "bg-info/10 text-info border-info/20",
        neon: "bg-brand-neon/10 text-brand-dark border-brand-neon/20",
        violet: "bg-brand-violet/10 text-brand-violet border-brand-violet/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

interface AlertBannerProps extends VariantProps<typeof alertVariants> {
  children: React.ReactNode;
  title?: string;
  icon?: React.ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

export function AlertBanner({
  children,
  title,
  icon,
  dismissible = false,
  onDismiss,
  variant,
  className,
}: AlertBannerProps) {
  const iconMap = {
    success: "✅",
    warning: "⚠️",
    error: "❌",
    info: "ℹ️",
    neon: "⚡",
    violet: "🔮",
    default: "📢",
  };

  const defaultIcon = iconMap[variant || "default"];

  return (
    <div className={cn(alertVariants({ variant }), className)} role="alert">
      <div className="flex items-start gap-3">
        {(icon || defaultIcon) && (
          <span className="shrink-0 text-base" aria-hidden="true">
            {icon || defaultIcon}
          </span>
        )}
        <div className="flex-1 space-y-1">
          {title && <h4 className="font-semibold font-heading">{title}</h4>}
          <div className="font-body">{children}</div>
        </div>
        {dismissible && (
          <button
            onClick={onDismiss}
            className="shrink-0 text-lg opacity-70 hover:opacity-100 transition-opacity"
            aria-label="Dismiss alert"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}

// ================================================================
// PROPERTY-SPECIFIC STATUS COMPONENTS
// ================================================================

// Verification Progress Component
interface VerificationProgressProps {
  step: number;
  totalSteps: number;
  steps: string[];
  className?: string;
}

export function VerificationProgress({
  step,
  totalSteps,
  steps,
  className,
}: VerificationProgressProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h4 className="font-heading font-semibold">Property Verification</h4>
        <span className="text-sm text-muted-foreground">
          {step}/{totalSteps} Complete
        </span>
      </div>

      <div className="space-y-3">
        {steps.map((stepName, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber <= step;
          const isCurrent = stepNumber === step + 1;

          return (
            <div key={index} className="flex items-center gap-3">
              <div
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                  isCompleted
                    ? "bg-color-success text-white"
                    : isCurrent
                      ? "bg-brand-violet text-white animate-pulse"
                      : "bg-muted text-muted-foreground",
                )}
              >
                {isCompleted ? "✓" : stepNumber}
              </div>
              <span
                className={cn(
                  "text-sm font-medium",
                  isCompleted
                    ? "text-color-success"
                    : isCurrent
                      ? "text-foreground"
                      : "text-muted-foreground",
                )}
              >
                {stepName}
              </span>
            </div>
          );
        })}
      </div>

      <div className="w-full bg-muted rounded-full h-2">
        <div
          className="bg-linear-to-r from-brand-violet to-brand-neon h-2 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${(step / totalSteps) * 100}%` }}
        />
      </div>
    </div>
  );
}

// Property Availability Indicator
interface AvailabilityIndicatorProps {
  status: "available" | "pending" | "rented" | "sold";
  lastUpdated?: string;
  className?: string;
}

export function AvailabilityIndicator({
  status,
  lastUpdated,
  className,
}: AvailabilityIndicatorProps) {
  const statusConfig = {
    available: {
      color: "verified" as const,
      label: "Available Now",
      icon: "🟢",
    },
    pending: {
      color: "pending" as const,
      label: "Application Pending",
      icon: "🟡",
    },
    rented: {
      color: "offline" as const,
      label: "Currently Rented",
      icon: "🔵",
    },
    sold: {
      color: "error" as const,
      label: "Sold",
      icon: "🔴",
    },
  };

  const config = statusConfig[status];

  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <StatusDot status={config.color} size="sm" />
      <div className="flex flex-col">
        <span className="text-sm font-medium">{config.label}</span>
        {lastUpdated && (
          <span className="text-xs text-muted-foreground">
            Updated {lastUpdated}
          </span>
        )}
      </div>
    </div>
  );
}

// Nigerian Market Infrastructure Indicator
interface InfrastructureIndicatorProps {
  hasNEPA: boolean;
  hasWater: boolean;
  hasInternet: boolean;
  hasGoodRoads: boolean;
  hasInverter?: boolean;
  hasSolarPanels?: boolean;
  hasWaterTreatment?: boolean;
  hasWaterTank?: boolean;
  className?: string;
}

export function InfrastructureIndicator({
  hasNEPA,
  hasWater,
  hasInternet,
  hasGoodRoads,
  hasInverter = false,
  hasSolarPanels = false,
  hasWaterTreatment = false,
  hasWaterTank = false,
  className,
}: InfrastructureIndicatorProps) {
  const infrastructure = [
    { name: "NEPA/Power", available: hasNEPA, icon: "⚡" },
    { name: "Inverter", available: hasInverter, icon: "🔋" },
    { name: "Solar Panels", available: hasSolarPanels, icon: "☀️" },
    { name: "Water Supply", available: hasWater, icon: "💧" },
    { name: "Water Tank", available: hasWaterTank, icon: "🪣" },
    { name: "Water Treatment", available: hasWaterTreatment, icon: "🧼" },
    { name: "Internet", available: hasInternet, icon: "📶" },
    { name: "Good Roads", available: hasGoodRoads, icon: "🛣️" },
  ];

  return (
    <div className={cn("space-y-2", className)}>
      <h5 className="text-sm font-semibold font-heading">Infrastructure</h5>
      <div className="grid grid-cols-2 gap-2">
        {infrastructure.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <StatusDot
              status={item.available ? "verified" : "offline"}
              size="xs"
            />
            <span
              className={cn(
                "text-xs",
                item.available ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {item.icon} {item.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ================================================================
// TOAST NOTIFICATIONS
// ================================================================

interface ToastProps {
  title?: string;
  description: string;
  variant?: "default" | "success" | "warning" | "error";
  duration?: number;
  onClose?: () => void;
  className?: string;
}

export function Toast({
  title,
  description,
  variant = "default",
  onClose,
  className,
}: ToastProps) {
  const variantStyles = {
    default: "bg-background border-border",
    success: "bg-success/10 border-success/20 text-success",
    warning: "bg-warning/10 border-warning/20 text-warning-dark",
    error: "bg-error/10 border-error/20 text-error",
  };

  const icons = {
    default: "📢",
    success: "✅",
    warning: "⚠️",
    error: "❌",
  };

  return (
    <div
      className={cn(
        "relative flex w-full max-w-sm items-center space-x-4 rounded-lg border p-4 shadow-lg",
        "animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-5",
        variantStyles[variant],
        className,
      )}
    >
      <span className="text-lg" aria-hidden="true">
        {icons[variant]}
      </span>
      <div className="flex-1 space-y-1">
        {title && (
          <div className="text-sm font-semibold font-heading">{title}</div>
        )}
        <div className="text-sm opacity-90">{description}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="absolute right-2 top-2 opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Close notification"
        >
          <span className="text-lg">×</span>
        </button>
      )}
    </div>
  );
}

// Property-specific toast variants
export function PropertySavedToast({ onClose }: { onClose?: () => void }) {
  return (
    <Toast
      variant="success"
      title="Property Saved"
      description="Added to your saved properties list"
      onClose={onClose}
    />
  );
}

export function VerificationCompleteToast({
  onClose,
}: {
  onClose?: () => void;
}) {
  return (
    <Toast
      variant="success"
      title="Verification Complete"
      description="Your property is now verified and live on RealEST"
      onClose={onClose}
    />
  );
}

export function ContactRequestToast({ onClose }: { onClose?: () => void }) {
  return (
    <Toast
      variant="default"
      title="Contact Request Sent"
      description="The property owner will get back to you soon"
      onClose={onClose}
    />
  );
}
