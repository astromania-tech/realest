"use client";

import dynamic from "next/dynamic";
import type { Property } from "@/lib/hooks/usePropertyMap";
import { getPriceContext } from "@/lib/utils/mapUtils";
import { formatPrice, formatListingType } from "@/lib/utils/propertyUtils";

// Dynamic imports for SSR compatibility
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});

interface PropertyMapPopupProps {
  property: Property;
  selectedPropertyId?: string;
}

export function PropertyMapPopup({
  property,
  selectedPropertyId,
}: PropertyMapPopupProps) {
  if (selectedPropertyId !== property.id) return null;

  return (
    <Popup>
      <div className="p-4 min-w-[280px]">
        <h3 className="text-lg font-bold mb-2">{property.title}</h3>
        <p className="text-sm text-muted-foreground mb-2">
          {property.address}, {property.city}, {property.state || ""}
        </p>
        <p className="text-xl font-bold text-primary mb-2">
          {formatPrice(property.price, property.price_frequency)}
          <span className="text-sm font-normal text-muted-foreground ml-1">· {formatListingType(property.listing_type)}</span>
        </p>
        <p className="text-sm text-muted-foreground mb-2">
          {getPriceContext(
            property.price,
            property.property_type,
            property.state || "",
          )}
        </p>
        {(property.bedrooms || property.bathrooms || property.square_feet) && (
          <div className="flex gap-4 text-sm text-muted-foreground">
            {property.bedrooms && (
              <span>{property.bedrooms} beds</span>
            )}
            {property.bathrooms && (
              <span>{property.bathrooms} baths</span>
            )}
            {property.square_feet && (
              <span>{property.square_feet} sqft</span>
            )}
          </div>
        )}
      </div>
    </Popup>
  );
}
