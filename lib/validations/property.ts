import { z } from "zod";

// Regex for Nigerian phone numbers (+234 or 080...)
const phoneRegex = /^(\+234|0)[789][01]\d{8}$/;

// Validation schemas for Nigerian market requirements
const MetadataSchema = z.object({
  utilities: z.object({
    water_source: z.enum(["borehole", "public_water", "well", "water_vendor", "none"]).optional(),
    water_tank_capacity: z.coerce.number().positive().optional(),
    has_water_treatment: z.boolean().optional(),
    internet_type: z.enum(["wi_fi", "fiber", "starlink", "4g", "3g", "none"]).optional()
  }).optional(),
  amenities: z.array(z.enum([
    "swimming_pool", "gym", "playground", "club_house",
    "bbq_area", "tennis_court", "basketball_court", "sauna",
    "jacuzzi", "garden", "lounge_area", "business_center", 
    "parking_spaces", "generator", "air_conditioning",
    "furnished", "balcony", "elevator", "built_in_kitchen",
    "separate_kitchen",
  ])).optional(),
  power: z.object({
    nepa_status: z.enum(["stable", "intermittent", "poor", "none", "generator_only"], {
        required_error: "Please select power availability status"
    }).optional(),
    power_source: z.string().optional(),
    has_generator: z.boolean().optional(),
    has_inverter: z.boolean().optional(),
    solar_panels: z.boolean().optional(),
  }).optional(),
  city: z.string().optional(),
  security: z.object({
    security_type: z.array(z.enum([
      "gated_community", "security_post", "cctv", 
      "perimeter_fence", "security_dogs", "estate_security"
    ])).optional(),
    security_hours: z.enum(["24/7", "day_only", "night_only", "none"]).optional(),
    has_security_levy: z.boolean().optional(),
    security_levy_amount: z.coerce.number().positive().optional()
  }).optional(),
  road: z.object({
    road_condition: z.enum(["paved", "tarred", "untarred", "bad"]).optional(),
    road_accessibility: z.enum(["all_year", "dry_season_only", "limited"]).optional(),
  }),
  bq: z.object({
    has_bq: z.boolean().optional(),
    bq_type: z.enum(["self_contained", "room_and_parlor", "single_room", "multiple_rooms"]).optional(),
    bq_bathrooms: z.coerce.number().min(0).optional(),
    bq_kitchen: z.boolean().optional(),
    bq_separate_entrance: z.boolean().optional(),
    bq_condition: z.enum(["excellent", "good", "fair", "needs_renovation"]).optional()
  }).optional(),
  building: z.object({
    floors: z.coerce.number().min(1).optional(),
    material: z.enum([
      "concrete", "wood", "steel", "brick", "stone", 
      "mud", "bamboo", "thatched_roof", "other"
    ]).optional(),
    year_renovated: z.coerce.number().min(1900).max(new Date().getFullYear()).optional()
  }).optional(),
  fees: z.object({
    service_charge: z.coerce.number().min(0).optional(),
    caution_fee: z.coerce.number().min(0).optional(),
    legal_fee: z.coerce.number().min(0).optional(),
    agent_fee: z.coerce.number().min(0).optional(),
  }).optional()
}).passthrough();

export const propertyListingSchema = z.object({
  // 1. Basic Information (Root Level)
  title: z.string().min(10, "Title must be at least 10 characters").max(100),
  description: z.string().min(50, "Description must be at least 50 characters"),
  property_type: z.enum([
    "house", "apartment", "land", "commercial", "event_center", 
    "hotel", "shop", "office", "duplex", "bungalow", "flat", 
    "self_contained", "mini_flat", "room_and_parlor", 
    "single_room", "penthouse", "terrace", "detached_house", 
    "warehouse", "showroom", "restaurant", "residential_land", 
    "commercial_land", "mixed_use_land", "farmland"
  ]),
  listing_type: z.enum(["for_rent", "for_sale", "for_lease", "short_let", "location"]),
  listing_source: z.enum(["owner", "agent"]).default("owner"),

  // 2. Location (Flattened for PostGIS)
  address: z.string().min(5, "Full address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "Select a valid state"), 
  postal_code: z.string().min(4).max(10).optional(),
  country: z.string().default("NG"),
  latitude: z.coerce.number().min(-90).max(90), 
  longitude: z.coerce.number().min(-180).max(180),

  // 3. Property Dimensions & Specifications
  bedrooms: z.coerce.number().min(0).optional(),
  bathrooms: z.coerce.number().min(0).optional(),
  toilets: z.coerce.number().min(0).optional(),
  square_feet: z.coerce.number().min(1).optional(),
  year_built: z.coerce.number().min(1900).max(new Date().getFullYear()).optional(),

  // 4. Pricing
  price: z.coerce.number().min(1000, "Price must be at least ₦1,000"),
  price_frequency: z.enum(["monthly", "yearly", "sale", "nightly", "daily"]).default("sale"),
  
  // 5. Status
  status: z.enum(["draft", "active", "inactive", "sold", "rented", "pending_ml_validation"]).default("draft"),
  verification_status: z.enum(["pending", "verified", "rejected"]).default("pending"),
 
  // 6. Images & Docs
  // Images (Array of strings/paths from signed-url)
  images: z.array(z.string().min(1, "Image path required"))
    .min(1, "At least one property image is required")
    .max(20, "Maximum 20 images allowed")
    .optional(),

  // Documents
  documents: z.array(z.any()).optional(),
});

export const propertyDetailsSchema = z.object({
  parking_spaces: z.coerce.number().int().min(0).optional(),
  has_pool: z.boolean().optional(),
  has_garage: z.boolean().optional(),
  has_garden: z.boolean().optional(),
  heating_type: z.string().optional(),
  cooling_type: z.string().optional(),
  flooring_type: z.string().optional(),
  roof_type: z.string().optional(),
  foundation_type: z.string().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
  metadata: MetadataSchema.optional(),
  amenities: z.any().optional(),
  features: z.any().optional()
});

export type PropertyListingValues = z.infer<typeof propertyListingSchema>;

// Draft schema with minimal requirements (for Step 5 auto-save)
export const propertyDraftSchema = z.object({
  // Minimal required fields that user must provide
  title: z.string().min(1, "Title is required").max(100),
  property_type: z.enum([
    "house", "apartment", "land", "commercial", "event_center", 
    "hotel", "shop", "office", "duplex", "bungalow", "flat", 
    "self_contained", "mini_flat", "room_and_parlor", 
    "single_room", "penthouse", "terrace", "detached_house", 
    "warehouse", "showroom", "restaurant", "residential_land", 
    "commercial_land", "mixed_use_land", "farmland"
  ]),
  listing_type: z.enum(["for_rent", "for_sale", "for_lease", "short_let", "location"]),
  price: z.coerce.number().min(0),
  address: z.string().min(1),
  city: z.string().min(1),
  
  // Optional fields that may be empty in draft
  description: z.string().optional(),
  state: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().default("NG"),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  
  bedrooms: z.coerce.number().min(0).optional(),
  bathrooms: z.coerce.number().min(0).optional(),
  toilets: z.coerce.number().min(0).optional(),
  square_feet: z.coerce.number().min(1).optional(),
  year_built: z.coerce.number().min(1900).max(new Date().getFullYear()).optional(),
  
  price_frequency: z.enum(["monthly", "yearly", "sale", "nightly", "daily"]).default("sale"),
  listing_source: z.enum(["owner", "agent"]).default("owner"),
  
  status: z.enum(["draft", "active", "inactive", "sold", "rented", "pending_ml_validation"]).default("draft"),
  verification_status: z.enum(["pending", "verified", "rejected"]).default("pending"),
  
  images: z.array(z.string()).optional(),
  documents: z.array(z.any()).optional(),
});

export type PropertyDraftValues = z.infer<typeof propertyDraftSchema>;

// Property Media Schema (for property_media table)
export const propertyMediaSchema = z.object({
  property_id: z.string().uuid("Invalid property ID"),
  media_type: z.enum(["image", "video"]),
  media_url: z.string().url("Invalid media URL"),
  file_name: z.string().min(1, "File name is required"),
  display_order: z.number().int().min(0).default(0),
  is_featured: z.boolean().default(false),
});

export type PropertyMediaValues = z.infer<typeof propertyMediaSchema>;

// Property Document Schema (for property_documents table)
export const propertyDocumentSchema = z.object({
  property_id: z.string().uuid("Invalid property ID"),
  document_type: z.enum([
    "title_deed",
    "building_permit",
    "energy_certificate",
    "survey",
    "inspection_report",
    "other"
  ]),
  document_url: z.string().url("Invalid document URL"),
  file_name: z.string().min(1, "File name is required"),
  file_size: z.number().int().positive().optional(),
  verification_status: z.enum(["pending", "verified", "rejected"]).default("pending"),
  verified_by: z.string().uuid().optional(),
  verified_at: z.string().datetime().optional(),
  notes: z.string().optional(),
});

export type PropertyDocumentValues = z.infer<typeof propertyDocumentSchema>;
