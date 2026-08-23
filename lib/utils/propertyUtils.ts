// Shared display/formatting helpers for property fields.
// Single source of truth - import from here instead of doing inline string transforms.

// Price Frequency

// Maps DB price_frequency values to human-readable suffixes
const PRICE_FREQUENCY_LABELS: Record<string, string> = {
  nightly: "/night",
  daily: "/day",
  monthly: "/month",
  yearly: "/year",
  annual: "/year",
  sale: "",
};

/**
 * Returns a suffix like "/night", "/day", "/month", "" for a sale.
 * Safe — falls back to the raw value if unknown.
 */
export function formatPriceFrequency(frequency: string | null | undefined): string {
  if (!frequency) return "";
  return PRICE_FREQUENCY_LABELS[frequency] ?? `/${frequency}`;
}

/**
 * Returns a full price string like "₦85,000/night" or "₦15,000,000"
 */
export function formatPrice(
  price: number,
  frequency: string | null | undefined,
  currency = "₦",
): string {
  const suffix = formatPriceFrequency(frequency);
  return `${currency}${price.toLocaleString()}${suffix}`;
}

// Listing Type

const LISTING_TYPE_LABELS: Record<string, string> = {
  location: "Bookable Venue",
  for_rent: "For Rent",
  for_sale: "For Sale",
  for_lease: "For Lease",
  short_let: "Short Let",
};

/**
 * Returns a readable label for listing_type DB values.
 * Falls back to title-casing the raw value.
 */
export function formatListingType(type: string | null | undefined): string {
  if (!type) return "";
  return (
    LISTING_TYPE_LABELS[type] ??
    type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

// Property Type

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  house: "House",
  apartment: "Apartment",
  land: "Land",
  commercial: "Commercial",
  event_center: "Event Center",
  hotel: "Hotel",
  shop: "Shop",
  office: "Office",
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
  warehouse: "Warehouse",
  showroom: "Showroom",
  restaurant: "Restaurant",
  residential_land: "Residential Land",
  commercial_land: "Commercial Land",
  mixed_use_land: "Mixed-Use Land",
  farmland: "Farmland",
};

/**
 * Returns a readable label for property_type DB values.
 * Falls back to title-casing the raw value.
 */
export function formatPropertyType(type: string | null | undefined): string {
  if (!type) return "";
  return (
    PROPERTY_TYPE_LABELS[type] ??
    type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  );
}
