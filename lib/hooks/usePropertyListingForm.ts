import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { propertyListingSchema, type PropertyListingValues } from '@/lib/validations/property';

export interface PropertyFormData {
  // Basic Details
  title: string;
  description: string;
  propertyType: string;
  purpose: 'rent' | 'sale' | 'lease' | 'shortlet' | 'location';

  // Location
  state: string;
  lga: string;
  area: string;
  address: string;
  coordinates: { lat: string; lng: string };

  // Property Details
  bedrooms: string;
  bathrooms: string;
  toilets: string;
  size: string;
  yearBuilt: string;

  // Building Details
  floors: string;
  buildingMaterial: string;
  yearRenovated: string;

  // Pricing
  price: string;
  serviceCharge: string;
  cautionFee: string;
  legalFee: string;
  agentFee: string;

  // Features & Amenities
  infrastructure: string[];
  amenities: string[];
  security: string[];

  // Images & Documents
  images: string[];
  documents: any[];

  // Nigerian Specific
  hasBQ: boolean;
  bqType: string;
  bqBathrooms: string;
  bqKitchen: boolean;
  bqSeparateEntrance: boolean;
  bqCondition: string;
  hasNEPA: boolean;
  nepaStatus: 'stable' | 'intermittent' | 'poor' | 'none' | 'generator_only';
  hasInverter: boolean;
  hasSolarPanels: boolean;
  hasWater: boolean;
  waterSource: string;
  waterTankCapacity: string;
  hasWaterTreatment: boolean;
  roadAccessibility: string;
  roadCondition: string;
  parkingSpaces: string;
  kitchenType: string;
  securityHours: string;
  hasSecurityLevy: boolean;
  securityLevyAmount: string;
  isGated: boolean;
  hasGoodRoads: boolean;
  internetType: string;
}

const initialFormData: PropertyFormData = {
  title: '',
  description: '',
  propertyType: '',
  purpose: 'rent',
  state: '',
  lga: '',
  area: '',
  address: '',
  coordinates: { lat: '', lng: '' },
  bedrooms: '',
  bathrooms: '',
  toilets: '',
  size: '',
  yearBuilt: '',
  floors: '',
  buildingMaterial: '',
  yearRenovated: '',
  price: '',
  serviceCharge: '',
  cautionFee: '',
  legalFee: '',
  agentFee: '',
  infrastructure: [],
  amenities: [],
  security: [],
  images: [],
  documents: [],
  hasBQ: false,
  bqType: '',
  bqBathrooms: '',
  bqKitchen: false,
  bqSeparateEntrance: false,
  bqCondition: '',
  hasNEPA: false,
  nepaStatus: 'none',
  hasInverter: false,
  hasSolarPanels: false,
  hasWater: false,
  waterSource: '',
  waterTankCapacity: '',
  hasWaterTreatment: false,
  roadAccessibility: '',
  roadCondition: '',
  parkingSpaces: '',
  kitchenType: '',
  securityHours: '',
  hasSecurityLevy: false,
  securityLevyAmount: '',
  isGated: false,
  hasGoodRoads: false,
  internetType: '',
};

/**
 * Maps amenity display names to schema enum values
 */
function mapAmenityToSchema(amenity: string): string {
  const mapping: Record<string, string> = {
    'Swimming Pool': 'swimming_pool',
    'Gym': 'gym',
    'Playground': 'playground',
    'Garden': 'garden',
    'Parking Spaces': 'parking_spaces',
    'Generator': 'generator',
    'Air Conditioning': 'air_conditioning',
    'Furnished': 'furnished',
    'Balcony': 'balcony',
    'Elevator': 'elevator',
    'Built-in Kitchen': 'built_in_kitchen',
    'Separate Kitchen': 'separate_kitchen',
    'Club House': 'club_house',
    'BBQ Area': 'bbq_area',
    'Tennis Court': 'tennis_court',
    'Basketball Court': 'basketball_court',
    'Sauna': 'sauna',
    'Jacuzzi': 'jacuzzi',
    'Lounge Area': 'lounge_area',
    'Business Center': 'business_center',
  };

  return mapping[amenity] || amenity.toLowerCase().replace(/\s+/g, '_');
}

/**
 * Maps security display names to schema enum values
 */
function mapSecurityToSchema(security: string): string {
  const mapping: Record<string, string> = {
    'Gated Community': 'gated_community',
    'Security Post': 'security_post',
    'CCTV Surveillance': 'cctv',
    'Perimeter Fencing': 'perimeter_fence',
    'Security Guards': 'security_dogs',
    'Access Control': 'estate_security',
  };

  return mapping[security] || security.toLowerCase().replace(/\s+/g, '_');
}

/**
 * Maps property type display names to schema enum values
 */
function mapPropertyTypeToSchema(type: string): string {
  const mapping: Record<string, string> = {
    'Apartment': 'apartment',
    'Duplex': 'duplex',
    'Bungalow': 'bungalow',
    'Boys Quarters (BQ)': 'flat',
    'Self-contained': 'self_contained',
    'Mini Flat': 'mini_flat',
    'Face-me-I-face-you': 'room_and_parlor',
    'Mansion': 'house',
    'Terrace': 'terrace',
    'Semi-detached': 'detached_house',
    'Detached': 'detached_house',
    'Penthouse': 'penthouse',
  };

  return mapping[type] || type.toLowerCase().replace(/\s+/g, '_');
}

/**
 * Transforms form data to match the Zod schema structure
 */
export function transformFormDataToSchema(
  formData: PropertyFormData
): Partial<PropertyListingValues> {
  // Map purpose to listing_type
  const listingTypeMap: Record<string, 'for_rent' | 'for_sale' | 'for_lease' | 'short_let' | 'location' > = {
    rent: 'for_rent',
    sale: 'for_sale',
    lease: 'for_lease',
    shortlet: 'short_let',
    location: 'location',
  };

  // Determine NEPA status
  let nepaStatus: 'stable' | 'intermittent' | 'poor' | 'none' | 'generator_only' = 'none';
  if (formData.hasNEPA) {
    nepaStatus = formData.nepaStatus || 'stable';
  }

  // Determine water source
  let waterSource: 'borehole' | 'public_water' | 'well' | 'water_vendor' | 'none' = 'none';
  if (formData.hasWater && formData.waterSource) {
    waterSource = formData.waterSource as any;
  } else if (formData.infrastructure.includes('Borehole/Water Supply')) {
    waterSource = 'borehole';
  }

  // Map internet type
  let internetType: 'wi_fi' | 'fiber' | 'starlink' | '4g' | '3g' | 'none' = 'none';
  if (formData.internetType) {
    internetType = formData.internetType as any;
  } else if (formData.infrastructure.includes('Internet Connectivity')) {
    internetType = 'wi_fi';
  }

  // Build metadata object
  const metadata: any = {
    utilities: {
      water_source: waterSource,
      water_tank_capacity: formData.waterTankCapacity
        ? parseFloat(formData.waterTankCapacity)
        : undefined,
      has_water_treatment: formData.hasWaterTreatment,
      internet_type: internetType,
    },
    power: {
      nepa_status: nepaStatus,
      has_generator: formData.infrastructure.includes('Generator'),
      has_inverter: formData.hasInverter,
      solar_panels: formData.hasSolarPanels,
    },
    security: {
      security_type: formData.security.map(mapSecurityToSchema),
      security_hours: formData.securityHours || undefined,
      has_security_levy: formData.hasSecurityLevy,
      security_levy_amount: formData.securityLevyAmount
        ? parseFloat(formData.securityLevyAmount)
        : undefined,
    },
    road: {
      road_condition: formData.roadCondition || undefined,
      road_accessibility: formData.roadAccessibility || undefined,
    },
    bq: formData.hasBQ
      ? {
          has_bq: true,
          bq_type: formData.bqType || undefined,
          bq_bathrooms: formData.bqBathrooms
            ? parseInt(formData.bqBathrooms)
            : undefined,
          bq_kitchen: formData.bqKitchen,
          bq_separate_entrance: formData.bqSeparateEntrance,
          bq_condition: formData.bqCondition || undefined,
        }
      : undefined,
    building: {
      floors: formData.floors ? parseInt(formData.floors) : undefined,
      material: formData.buildingMaterial || undefined,
      year_renovated: formData.yearRenovated
        ? parseInt(formData.yearRenovated)
        : undefined,
    },
    fees: {
      service_charge: formData.serviceCharge
        ? parseFloat(formData.serviceCharge)
        : undefined,
      caution_fee: formData.cautionFee ? parseFloat(formData.cautionFee) : undefined,
      legal_fee: formData.legalFee ? parseFloat(formData.legalFee) : undefined,
      agent_fee: formData.agentFee ? parseFloat(formData.agentFee) : undefined,
    },
    amenities: formData.amenities.map(mapAmenityToSchema),
  };

  return {
    title: formData.title,
    description: formData.description,
    property_type: mapPropertyTypeToSchema(formData.propertyType) as any,
    listing_type: listingTypeMap[formData.purpose] || 'for_sale',
    address: formData.address || `${formData.area}, ${formData.lga}`,
    city: formData.lga || formData.area,
    state: formData.state,
    country: 'NG',
    latitude: parseFloat(formData.coordinates.lat) || 0,
    longitude: parseFloat(formData.coordinates.lng) || 0,
    bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : undefined,
    bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : undefined,
    toilets: formData.toilets ? parseInt(formData.toilets) : undefined,
    square_feet: formData.size ? parseFloat(formData.size) : undefined,
    year_built: formData.yearBuilt ? parseInt(formData.yearBuilt) : undefined,
    price: parseFloat(formData.price) || 0,
    price_frequency: formData.purpose === 'rent' ? 'yearly' : 'sale',
    images: formData.images.length > 0 ? formData.images : undefined,
    documents: formData.documents,
  };
}

export interface UsePropertyListingFormReturn {
  formData: PropertyFormData;
  setFormData: React.Dispatch<React.SetStateAction<PropertyFormData>>;
  handleInputChange: (field: string, value: any) => void;
  handleArrayToggle: (field: string, value: string) => void;
  submitForm: (isDraft?: boolean) => Promise<PropertyListingValues | null>;
  isSubmitting: boolean;
  errors: Record<string, string>;
  isValid: boolean;
}

export function usePropertyListingForm(
  onSubmit?: (data: PropertyListingValues) => Promise<void>,
  onSaveDraft?: (data: PropertyFormData) => Promise<void>,
  initialData?: Partial<PropertyFormData>
): UsePropertyListingFormReturn {
  const [formData, setFormData] = React.useState<PropertyFormData>({
    ...initialFormData,
    ...initialData,
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const handleInputChange = React.useCallback((field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error for this field
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const handleArrayToggle = React.useCallback((field: string, value: string) => {
    setFormData((prev) => {
      const currentArray = (prev as any)[field] as string[];
      return {
        ...prev,
        [field]: currentArray.includes(value)
          ? currentArray.filter((item) => item !== value)
          : [...currentArray, value],
      };
    });
  }, []);

  const submitForm = React.useCallback(
    async (isDraft = false) => {
      setIsSubmitting(true);
      setErrors({});

      try {
        if (isDraft) {
          // Save draft without validation
          await onSaveDraft?.(formData);
          return null; // No validated data for drafts
        } else {
          // Transform and validate data
          const transformedData = transformFormDataToSchema(formData);

          // Validate with Zod schema
          const validatedData = propertyListingSchema.parse(transformedData);

          // Return validated data for parent component to handle
          return validatedData;
        }
      } catch (error: any) {
        console.error('Form submission error:', error);

        // Handle Zod validation errors
        if (error?.errors) {
          const zodErrors: Record<string, string> = {};
          error.errors.forEach((err: any) => {
            const field = err.path.join('.');
            zodErrors[field] = err.message;
          });
          setErrors(zodErrors);
        } else {
          setErrors({
            _form: error.message || 'Failed to submit form',
          });
        }
        return null; // Return null on validation error
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, onSubmit, onSaveDraft]
  );

  const isValid = Object.keys(errors).length === 0;

  return {
    formData,
    setFormData,
    handleInputChange,
    handleArrayToggle,
    submitForm,
    isSubmitting,
    errors,
    isValid,
  };
}

// Need to import React for the callback hooks
import * as React from 'react';
