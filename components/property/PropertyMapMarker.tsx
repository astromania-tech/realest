"use client";

import dynamic from "next/dynamic";
import type { Property } from "@/lib/hooks/usePropertyMap";
import { createMarkerIconHTML, isValidCoordinates } from "@/lib/utils/mapUtils";
import { PropertyMapPopup } from "./PropertyMapPopup";

// Dynamic imports for SSR compatibility
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false },
);

interface PropertyMapMarkerProps {
  property: Property;
  onPropertyClick?: (property: Property) => void;
  selectedPropertyId?: string;
}

export function PropertyMapMarker({
  property,
  onPropertyClick,
  selectedPropertyId,
}: PropertyMapMarkerProps) {
  // Create custom marker icon
  const createCustomIcon = () => {
    if (typeof window === "undefined") return null;

    const isVerified = property.verification_status === "verified";
    const hasBq = (property.property_details as any)?.has_bq || false;
    const iconHtml = createMarkerIconHTML(
      property.property_type,
      isVerified,
      hasBq,
    );

    return new (window as any).L.DivIcon({
      html: iconHtml,
      className: "custom-marker",
      iconSize: [40, 40],
      iconAnchor: [20, 40],
    });
  };

  if (!isValidCoordinates(property.latitude, property.longitude)) {
    return null;
  }

  return (
    <Marker
      position={[property.latitude!, property.longitude!]}
      icon={createCustomIcon()}
      eventHandlers={{
        click: () => onPropertyClick?.(property),
      }}
    >
      <PropertyMapPopup
        property={property}
        selectedPropertyId={selectedPropertyId}
      />
    </Marker>
  );
}
