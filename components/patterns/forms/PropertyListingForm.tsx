"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { RealEstButton } from "@/components/heroui/RealEstButton";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  LoadingSpinner,
  ProgressRing,
} from "@/components/untitledui/StatusComponents";
import { usePropertyListingForm } from "@/lib/hooks/usePropertyListingForm";
import { useFileUpload } from "@/lib/hooks/useFileUpload";
import type { PropertyListingValues } from "@/lib/validations/property";

interface PropertyListingFormProps {
  onSubmit?: (data: PropertyListingValues) => Promise<void>;
  onSaveDraft?: (data: any) => Promise<void>;
  initialData?: any;
  className?: string;
  propertyId?: string;
}

export function PropertyListingForm({
  onSubmit,
  onSaveDraft,
  initialData,
  className,
  propertyId,
}: PropertyListingFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;
  const [draftPropertyId, setDraftPropertyId] = useState<string | undefined>(propertyId);
  const [isDraftCreating, setIsDraftCreating] = useState(false);

  // Use custom form hook with validation
  const {
    formData,
    handleInputChange,
    handleArrayToggle,
    submitForm,
    isSubmitting,
    errors,
    isValid,
  } = usePropertyListingForm(onSubmit, onSaveDraft, initialData);

  // Use file upload hook for images
  const imageUpload = useFileUpload({
    bucket: 'property-media',
    propertyId: draftPropertyId,
    maxFiles: 20,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  });

  // Use file upload hook for documents
  const documentUpload = useFileUpload({
    bucket: 'property-documents',
    propertyId: draftPropertyId,
    maxFiles: 10,
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ],
  });

  // Sync uploaded image URLs to form data
  React.useEffect(() => {
    const imageUrls = imageUpload.files
      .filter(f => !f.isUploading && !f.error && f.publicUrl)
      .map(f => f.publicUrl);
    if (imageUrls.length > 0) {
      handleInputChange('images', imageUrls);
    }
  }, [imageUpload.files, handleInputChange]);

  // Sync uploaded document URLs to form data
  React.useEffect(() => {
    const docUrls = documentUpload.files
      .filter(f => !f.isUploading && !f.error && f.publicUrl)
      .map(f => ({ url: f.publicUrl, name: f.file.name }));
    if (docUrls.length > 0) {
      handleInputChange('documents', docUrls);
    }
  }, [documentUpload.files, handleInputChange]);

  // Create draft property when user reaches Step 5 (images) or Step 6 (documents)
  React.useEffect(() => {
    async function createDraftProperty() {
      if (draftPropertyId || isDraftCreating || propertyId) return; // Already have draft or editing existing
      if (currentStep < 5) return; // Only create when reaching file upload steps

      setIsDraftCreating(true);
      try {
        // Use transform function to map property type correctly
        const mapPropertyType = (type: string) => {
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
        };

        const response = await fetch('/api/properties', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            // Minimal required fields for draft (propertyDraftSchema)
            title: formData.title || 'Draft Property',
            property_type: mapPropertyType(formData.propertyType) || 'house',
            listing_type: formData.purpose === 'rent' ? 'for_rent' : 'for_sale',
            price: Number(formData.price) || 0,
            address: formData.address || 'Draft Address',
            city: formData.lga || formData.area || 'Lagos',
            
            // Optional fields (can be empty for draft)
            description: formData.description || '',
            state: formData.state || '',
            latitude: parseFloat(formData.coordinates?.lat) || undefined,
            longitude: parseFloat(formData.coordinates?.lng) || undefined,
            country: 'NG',
            
            status: 'draft',
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to create draft property');
        }

        const { property } = await response.json();
        console.log('✅ Draft property created successfully:', property.id);
        console.log('📄 Draft property data:', property);
        setDraftPropertyId(property.id);
        
        // Persist to localStorage for recovery
        localStorage.setItem('draftPropertyId', property.id);
      } catch (error) {
        console.error('Failed to create draft property:', error);
        alert('Unable to save property draft. Please check your internet connection and try again.');
      } finally {
        setIsDraftCreating(false);
      }
    }

    createDraftProperty();
    }, [currentStep, draftPropertyId, isDraftCreating, propertyId]);
  // Recover draft property ID from localStorage on mount
  React.useEffect(() => {
    if (!propertyId && !draftPropertyId) {
      const savedDraftId = localStorage.getItem('draftPropertyId');
      if (savedDraftId) {
        // Validate that the draft property still exists
        fetch(`/api/properties/${savedDraftId}`)
          .then(res => {
            if (res.ok) {
              setDraftPropertyId(savedDraftId);
              console.log('✅ Recovered draft property from localStorage:', savedDraftId);
            } else {
              console.warn('⚠️ Stale draft property ID in localStorage, clearing:', savedDraftId);
              localStorage.removeItem('draftPropertyId');
            }
          })
          .catch(err => {
            console.error('❌ Error validating draft property:', err);
            localStorage.removeItem('draftPropertyId');
          });
      }
    }
  }, [propertyId, draftPropertyId]);

  const nigerianStates = [
    "Abia",
    "Adamawa",
    "Akwa Ibom",
    "Anambra",
    "Bauchi",
    "Bayelsa",
    "Benue",
    "Borno",
    "Cross River",
    "Delta",
    "Ebonyi",
    "Edo",
    "Ekiti",
    "Enugu",
    "FCT",
    "Gombe",
    "Imo",
    "Jigawa",
    "Kaduna",
    "Kano",
    "Katsina",
    "Kebbi",
    "Kogi",
    "Kwara",
    "Lagos",
    "Nasarawa",
    "Niger",
    "Ogun",
    "Ondo",
    "Osun",
    "Oyo",
    "Plateau",
    "Rivers",
    "Sokoto",
    "Taraba",
    "Yobe",
    "Zamfara",
  ];

  const propertyTypes = [
    "Apartment",
    "Duplex",
    "Bungalow",
    "Boys Quarters (BQ)",
    "Self-contained",
    "Mini Flat",
    "Face-me-I-face-you",
    "Mansion",
    "Terrace",
    "Semi-detached",
    "Detached",
    "Penthouse",
  ];

  const infrastructureOptions = [
    "NEPA/Power Supply",
    "Inverter",
    "Solar Panels",
    "Borehole/Water Supply",
    "Water Tank",
    "Water Treatment System",
    "Internet Connectivity",
    "Good Road Network",
    "Road Accessibility",
    "Drainage System",
    "Street Lighting",
  ];

  const amenityOptions = [
    "Swimming Pool",
    "Gym",
    "Playground",
    "Garden",
    "Parking Spaces",
    "Generator",
    "Air Conditioning",
    "Furnished",
    "Balcony",
    "Elevator",
    "Built-in Kitchen",
    "Separate Kitchen",
  ];

  const securityOptions = [
    "Gated Community",
    "Security Post",
    "CCTV Surveillance",
    "Perimeter Fencing",
    "Security Guards",
    "Access Control",
  ];

  const bqTypes = [
    "self_contained",
    "room_and_parlor",
    "single_room",
    "multiple_rooms",
  ];

  const bqConditions = ["excellent", "good", "fair", "needs_renovation"];

  const buildingMaterials = [
    "concrete",
    "brick",
    "wood",
    "steel",
    "glass",
    "other",
  ];

  const roadAccessibilityOptions = ["all_year", "dry_season_only", "limited"];

  const kitchenTypes = ["built_in", "separate", "none"];

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFormSubmit = async (isDraft = false) => {
    try {
      // Step 1: Validate and prepare property data
      const validatedData = await submitForm(isDraft);
      if (!validatedData) return; // Validation failed

      // Step 2: Update draft property or create new one
      const propertyResponse = await fetch(
        draftPropertyId ? `/api/properties/${draftPropertyId}` : '/api/properties',
        {
          method: draftPropertyId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...validatedData,
            status: 'pending_ml_validation', // Update status from draft to pending
          }),
        }
      );

      if (!propertyResponse.ok) {
        const errorData = await propertyResponse.json();
        throw new Error(errorData.error || 'Failed to publish property');
      }

      const { data: createdProperty } = await propertyResponse.json();
      const newPropertyId = draftPropertyId || createdProperty.id;

      // Step 3: Record uploaded images in property_media table
      const mediaInsertErrors: string[] = [];
      for (const uploadedFile of imageUpload.files) {
        if (uploadedFile.publicUrl && !uploadedFile.error) {
          try {
            const mediaResponse = await fetch(`/api/properties/${newPropertyId}/media`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                media_url: uploadedFile.publicUrl,
                file_name: uploadedFile.file.name,
                media_type: 'image',
                is_featured: imageUpload.files.indexOf(uploadedFile) === 0, // First image is featured
              }),
            });
            
            if (!mediaResponse.ok) {
              const errorData = await mediaResponse.json();
              console.error('Media metadata insertion failed:', errorData);
              mediaInsertErrors.push(`${uploadedFile.file.name}: ${errorData.error || 'Failed to record'}`);
            } else {
              console.log('Media metadata recorded:', uploadedFile.file.name);
            }
          } catch (error) {
            console.error('Media metadata insertion error:', error);
            mediaInsertErrors.push(`${uploadedFile.file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }
      }
      
      if (mediaInsertErrors.length > 0) {
        console.warn('Some media metadata failed to record:', mediaInsertErrors);
      }

      // Step 4: Record uploaded documents in property_documents table
      const docInsertErrors: string[] = [];
      for (const uploadedDoc of documentUpload.files) {
        if (uploadedDoc.publicUrl && !uploadedDoc.error) {
          try {
            const docResponse = await fetch(`/api/properties/${newPropertyId}/documents`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                document_url: uploadedDoc.publicUrl,
                file_name: uploadedDoc.file.name,
                document_type: 'other', // You may want to add document type selection in the form
              }),
            });
            
            if (!docResponse.ok) {
              const errorData = await docResponse.json();
              console.error('Document metadata insertion failed:', errorData);
              docInsertErrors.push(`${uploadedDoc.file.name}: ${errorData.error || 'Failed to record'}`);
            } else {
              console.log('Document metadata recorded:', uploadedDoc.file.name);
            }
          } catch (error) {
            console.error('Document metadata insertion error:', error);
            docInsertErrors.push(`${uploadedDoc.file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }
      }
      
      if (docInsertErrors.length > 0) {
        console.warn('Some document metadata failed to record:', docInsertErrors);
      }

      // Step 5: Call the onSubmit callback if provided (for parent component handling)
      if (onSubmit) {
        await onSubmit(validatedData);
      }

      // Success - clear draft from localStorage
      localStorage.removeItem('draftPropertyId');
      console.log('Property published successfully:', newPropertyId);
    } catch (error) {
      console.error('Property submission error:', error);
      // Error is already handled by submitForm for validation errors
      // This catches API errors
      if (error instanceof Error) {
        alert(`Failed to publish property: ${error.message}`);
      }
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-heading font-semibold">
              Basic Property Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Property Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="e.g. Modern 3BR Apartment in Lekki Phase 1"
                  className="w-full p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Make it descriptive and appealing
                </p>
                {errors.title && (
                  <p className="text-xs text-destructive mt-1">{errors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Property Type *
                </label>
                <select
                  value={formData.propertyType}
                  onChange={(e) =>
                    handleInputChange("propertyType", e.target.value)
                  }
                  className="w-full p-3 border border-input rounded-lg bg-background"
                  required
                >
                  <option value="">Select property type</option>
                  {propertyTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Purpose *
                </label>
                <select
                  value={formData.purpose}
                  onChange={(e) => handleInputChange("purpose", e.target.value)}
                  className="w-full p-3 border border-input rounded-lg bg-background"
                  required
                >
                  <option value="rent">For Rent</option>
                  <option value="sale">For Sale</option>
                  <option value="lease">For Lease</option>
                  <option value="shortlet">Short Let</option>
                  <option value="location">Location Only</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Property Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="Describe the property, neighborhood, and special features..."
                  rows={4}
                  className="w-full p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring resize-none"
                  required
                />
                {errors.description && (
                  <p className="text-xs text-destructive mt-1">{errors.description}</p>
                )}
              </div>
            </div>

            {errors._form && (
              <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
                <p className="text-sm text-destructive">{errors._form}</p>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-heading font-semibold">
              Location Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  State *
                </label>
                <select
                  value={formData.state}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                  className="w-full p-3 border border-input rounded-lg bg-background"
                  required
                >
                  <option value="">Select state</option>
                  {nigerianStates.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">LGA *</label>
                <input
                  type="text"
                  value={formData.lga}
                  onChange={(e) => handleInputChange("lga", e.target.value)}
                  placeholder="Local Government Area"
                  className="w-full p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Area/District *
                </label>
                <input
                  type="text"
                  value={formData.area}
                  onChange={(e) => handleInputChange("area", e.target.value)}
                  placeholder="e.g. Lekki Phase 1, Victoria Island"
                  className="w-full p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Street Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="Street name and number"
                  className="w-full p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  GPS Coordinates (Optional)
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={formData.coordinates.lat}
                    onChange={(e) =>
                      handleInputChange("coordinates", {
                        ...formData.coordinates,
                        lat: e.target.value,
                      })
                    }
                    placeholder="Latitude"
                    className="w-full p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring"
                  />
                  <input
                    type="text"
                    value={formData.coordinates.lng}
                    onChange={(e) =>
                      handleInputChange("coordinates", {
                        ...formData.coordinates,
                        lng: e.target.value,
                      })
                    }
                    placeholder="Longitude"
                    className="w-full p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  GPS coordinates help with property verification
                </p>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-heading font-semibold">
              Property Specifications
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Bedrooms
                </label>
                <select
                  value={formData.bedrooms}
                  onChange={(e) =>
                    handleInputChange("bedrooms", e.target.value)
                  }
                  className="w-full p-3 border border-input rounded-lg bg-background"
                >
                  <option value="">Select</option>
                  <option value="0">Studio</option>
                  <option value="1">1 Bedroom</option>
                  <option value="2">2 Bedrooms</option>
                  <option value="3">3 Bedrooms</option>
                  <option value="4">4 Bedrooms</option>
                  <option value="5">5+ Bedrooms</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Bathrooms
                </label>
                <select
                  value={formData.bathrooms}
                  onChange={(e) =>
                    handleInputChange("bathrooms", e.target.value)
                  }
                  className="w-full p-3 border border-input rounded-lg bg-background"
                >
                  <option value="">Select</option>
                  <option value="1">1 Bathroom</option>
                  <option value="2">2 Bathrooms</option>
                  <option value="3">3 Bathrooms</option>
                  <option value="4">4+ Bathrooms</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Toilets
                </label>
                <select
                  value={formData.toilets}
                  onChange={(e) => handleInputChange("toilets", e.target.value)}
                  className="w-full p-3 border border-input rounded-lg bg-background"
                >
                  <option value="">Select</option>
                  <option value="1">1 Toilet</option>
                  <option value="2">2 Toilets</option>
                  <option value="3">3 Toilets</option>
                  <option value="4">4+ Toilets</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Property Size
                </label>
                <input
                  type="text"
                  value={formData.size}
                  onChange={(e) => handleInputChange("size", e.target.value)}
                  placeholder="e.g. 120 sqm"
                  className="w-full p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Year Built
                </label>
                <input
                  type="number"
                  value={formData.yearBuilt}
                  onChange={(e) =>
                    handleInputChange("yearBuilt", e.target.value)
                  }
                  placeholder="e.g. 2020"
                  min="1950"
                  max={new Date().getFullYear()}
                  className="w-full p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Number of Floors
                </label>
                <input
                  type="number"
                  value={formData.floors}
                  onChange={(e) => handleInputChange("floors", e.target.value)}
                  placeholder="e.g. 2"
                  min="1"
                  className="w-full p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Building Material
                </label>
                <select
                  value={formData.buildingMaterial}
                  onChange={(e) =>
                    handleInputChange("buildingMaterial", e.target.value)
                  }
                  className="w-full p-3 border border-input rounded-lg bg-background"
                >
                  <option value="">Select material</option>
                  {buildingMaterials.map((material) => (
                    <option key={material} value={material}>
                      {material.charAt(0).toUpperCase() + material.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Year Renovated
                </label>
                <input
                  type="number"
                  value={formData.yearRenovated}
                  onChange={(e) =>
                    handleInputChange("yearRenovated", e.target.value)
                  }
                  placeholder="e.g. 2022"
                  min="1950"
                  max={new Date().getFullYear()}
                  className="w-full p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            {/* Nigerian-Specific Features */}
            <div className="space-y-4">
              <h4 className="text-lg font-heading font-medium">
                Nigerian Property Features
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.hasBQ}
                    onChange={(e) =>
                      handleInputChange("hasBQ", e.target.checked)
                    }
                    className="rounded border-input"
                  />
                  <span className="text-sm">Has Boys Quarters (BQ)</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.hasNEPA}
                    onChange={(e) =>
                      handleInputChange("hasNEPA", e.target.checked)
                    }
                    className="rounded border-input"
                  />
                  <span className="text-sm">NEPA/Power Supply</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.hasInverter}
                    onChange={(e) =>
                      handleInputChange("hasInverter", e.target.checked)
                    }
                    className="rounded border-input"
                  />
                  <span className="text-sm">Inverter</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.hasSolarPanels}
                    onChange={(e) =>
                      handleInputChange("hasSolarPanels", e.target.checked)
                    }
                    className="rounded border-input"
                  />
                  <span className="text-sm">Solar Panels</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.hasWater}
                    onChange={(e) =>
                      handleInputChange("hasWater", e.target.checked)
                    }
                    className="rounded border-input"
                  />
                  <span className="text-sm">Water Supply</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.hasWaterTreatment}
                    onChange={(e) =>
                      handleInputChange("hasWaterTreatment", e.target.checked)
                    }
                    className="rounded border-input"
                  />
                  <span className="text-sm">Water Treatment</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isGated}
                    onChange={(e) =>
                      handleInputChange("isGated", e.target.checked)
                    }
                    className="rounded border-input"
                  />
                  <span className="text-sm">Gated Community</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.hasGoodRoads}
                    onChange={(e) =>
                      handleInputChange("hasGoodRoads", e.target.checked)
                    }
                    className="rounded border-input"
                  />
                  <span className="text-sm">Good Road Network</span>
                </label>
              </div>

              {/* Boys Quarters Details */}
              {formData.hasBQ && (
                <div className="space-y-4 border-t pt-4">
                  <h5 className="text-md font-heading font-medium">
                    Boys Quarters Details
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        BQ Type
                      </label>
                      <select
                        value={formData.bqType}
                        onChange={(e) =>
                          handleInputChange("bqType", e.target.value)
                        }
                        className="w-full p-3 border border-input rounded-lg bg-background"
                      >
                        <option value="">Select type</option>
                        {bqTypes.map((type) => (
                          <option key={type} value={type}>
                            {type
                              .replace("_", " ")
                              .replace(/\b\w/g, (l) => l.toUpperCase())}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        BQ Bathrooms
                      </label>
                      <input
                        type="number"
                        value={formData.bqBathrooms}
                        onChange={(e) =>
                          handleInputChange("bqBathrooms", e.target.value)
                        }
                        placeholder="e.g. 1"
                        min="0"
                        className="w-full p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        BQ Condition
                      </label>
                      <select
                        value={formData.bqCondition}
                        onChange={(e) =>
                          handleInputChange("bqCondition", e.target.value)
                        }
                        className="w-full p-3 border border-input rounded-lg bg-background"
                      >
                        <option value="">Select condition</option>
                        {bqConditions.map((condition) => (
                          <option key={condition} value={condition}>
                            {condition.charAt(0).toUpperCase() +
                              condition.slice(1).replace("_", " ")}
                          </option>
                        ))}
                      </select>
                    </div>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.bqKitchen}
                        onChange={(e) =>
                          handleInputChange("bqKitchen", e.target.checked)
                        }
                        className="rounded border-input"
                      />
                      <span className="text-sm">BQ Kitchen</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.bqSeparateEntrance}
                        onChange={(e) =>
                          handleInputChange(
                            "bqSeparateEntrance",
                            e.target.checked,
                          )
                        }
                        className="rounded border-input"
                      />
                      <span className="text-sm">Separate Entrance</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Additional Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Water Tank Capacity (Liters)
                  </label>
                  <input
                    type="number"
                    value={formData.waterTankCapacity}
                    onChange={(e) =>
                      handleInputChange("waterTankCapacity", e.target.value)
                    }
                    placeholder="e.g. 2000"
                    min="0"
                    className="w-full p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Parking Spaces
                  </label>
                  <input
                    type="number"
                    value={formData.parkingSpaces}
                    onChange={(e) =>
                      handleInputChange("parkingSpaces", e.target.value)
                    }
                    placeholder="e.g. 2"
                    min="0"
                    className="w-full p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Kitchen Type
                  </label>
                  <select
                    value={formData.kitchenType}
                    onChange={(e) =>
                      handleInputChange("kitchenType", e.target.value)
                    }
                    className="w-full p-3 border border-input rounded-lg bg-background"
                  >
                    <option value="">Select type</option>
                    {kitchenTypes.map((type) => (
                      <option key={type} value={type}>
                        {type
                          .replace("_", " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-heading font-semibold">
              Pricing Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  {formData.purpose === "rent" ? "Annual Rent" : "Sale Price"}{" "}
                  (₦) *
                </label>
                <input
                  type="text"
                  value={formData.price}
                  onChange={(e) => handleInputChange("price", e.target.value)}
                  placeholder="e.g. 2,500,000"
                  className="w-full p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring"
                  required
                />
              </div>

              {formData.purpose === "rent" && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Service Charge (₦/year)
                    </label>
                    <input
                      type="text"
                      value={formData.serviceCharge}
                      onChange={(e) =>
                        handleInputChange("serviceCharge", e.target.value)
                      }
                      placeholder="e.g. 300,000"
                      className="w-full p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Caution Fee (₦)
                    </label>
                    <input
                      type="text"
                      value={formData.cautionFee}
                      onChange={(e) =>
                        handleInputChange("cautionFee", e.target.value)
                      }
                      placeholder="e.g. 500,000"
                      className="w-full p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Legal Fee (₦)
                    </label>
                    <input
                      type="text"
                      value={formData.legalFee}
                      onChange={(e) =>
                        handleInputChange("legalFee", e.target.value)
                      }
                      placeholder="e.g. 200,000"
                      className="w-full p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Agent Fee (₦)
                    </label>
                    <input
                      type="text"
                      value={formData.agentFee}
                      onChange={(e) =>
                        handleInputChange("agentFee", e.target.value)
                      }
                      placeholder="e.g. 300,000"
                      className="w-full p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">Total Initial Payment</h4>
              <div className="text-2xl font-bold text-brand-violet">
                ₦
                {(
                  parseInt(formData.price.replace(/,/g, "") || "0") +
                  parseInt(formData.cautionFee.replace(/,/g, "") || "0") +
                  parseInt(formData.legalFee.replace(/,/g, "") || "0") +
                  parseInt(formData.agentFee.replace(/,/g, "") || "0")
                ).toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">
                {formData.purpose === "rent"
                  ? "First year payment"
                  : "Purchase price"}
              </p>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-heading font-semibold">
              Features & Amenities
            </h3>

            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-heading font-medium mb-4">
                  Infrastructure
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {infrastructureOptions.map((option) => (
                    <label key={option} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.infrastructure.includes(option)}
                        onChange={() =>
                          handleArrayToggle("infrastructure", option)
                        }
                        className="rounded border-input"
                      />
                      <span className="text-sm">{option}</span>
                    </label>
                  ))}
                </div>

                {/* Road Accessibility */}
                <div className="mt-4">
                  <label className="block text-sm font-medium mb-2">
                    Road Accessibility
                  </label>
                  <select
                    value={formData.roadAccessibility}
                    onChange={(e) =>
                      handleInputChange("roadAccessibility", e.target.value)
                    }
                    className="w-full p-3 border border-input rounded-lg bg-background"
                  >
                    <option value="">Select accessibility</option>
                    {roadAccessibilityOptions.map((option) => (
                      <option key={option} value={option}>
                        {option
                          .replace("_", " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-heading font-medium mb-4">
                  Amenities
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {amenityOptions.map((option) => (
                    <label key={option} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.amenities.includes(option)}
                        onChange={() => handleArrayToggle("amenities", option)}
                        className="rounded border-input"
                      />
                      <span className="text-sm">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-lg font-heading font-medium mb-4">
                  Security Features
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {securityOptions.map((option) => (
                    <label key={option} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.security.includes(option)}
                        onChange={() => handleArrayToggle("security", option)}
                        className="rounded border-input"
                      />
                      <span className="text-sm">{option}</span>
                    </label>
                  ))}
                </div>

                {/* Security Details */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Security Hours
                    </label>
                    <select
                      value={formData.securityHours}
                      onChange={(e) =>
                        handleInputChange("securityHours", e.target.value)
                      }
                      className="w-full p-3 border border-input rounded-lg bg-background"
                    >
                      <option value="">Select hours</option>
                      <option value="24/7">24/7</option>
                      <option value="day_only">Day Only</option>
                      <option value="night_only">Night Only</option>
                      <option value="none">None</option>
                    </select>
                  </div>

                  <label className="flex items-center gap-2 md:col-span-1">
                    <input
                      type="checkbox"
                      checked={formData.hasSecurityLevy}
                      onChange={(e) =>
                        handleInputChange("hasSecurityLevy", e.target.checked)
                      }
                      className="rounded border-input"
                    />
                    <span className="text-sm">Security Levy</span>
                  </label>

                  {formData.hasSecurityLevy && (
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Levy Amount (₦)
                      </label>
                      <input
                        type="text"
                        value={formData.securityLevyAmount}
                        onChange={(e) =>
                          handleInputChange(
                            "securityLevyAmount",
                            e.target.value,
                          )
                        }
                        placeholder="e.g. 50000"
                        className="w-full p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-heading font-semibold">
              Images & Documents
            </h3>

            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-heading font-medium mb-4">
                  Property Images *
                </h4>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <div className="text-4xl mb-4">📸</div>
                  <p className="text-lg font-medium mb-2">
                    Upload Property Photos
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload high-quality images of your property. First image
                    will be the cover photo.
                  </p>
                  <input
                    type="file"
                    id="image-upload"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => {
                      if (e.target.files) {
                        imageUpload.uploadFiles(e.target.files);
                      }
                    }}
                    className="hidden"
                  />
                  <RealEstButton
                    variant="tertiary"
                    onClick={() => document.getElementById('image-upload')?.click()}
                    isLoading={imageUpload.isUploading}
                  >
                    {imageUpload.isUploading ? 'Uploading...' : 'Choose Files'}
                  </RealEstButton>
                  <p className="text-xs text-muted-foreground mt-2">
                    Accepted formats: JPG, PNG, WebP. Max 10MB per image.
                  </p>
                </div>

                {/* Display uploaded images */}
                {imageUpload.files.length > 0 && (
                  <div className="mt-4 grid grid-cols-3 gap-4">
                    {imageUpload.files.map((file, index) => (
                      <div key={index} className="relative group">
                        {file.publicUrl && !file.error && (
                          <img
                            src={file.publicUrl}
                            alt={file.file.name}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        )}
                        {file.isUploading && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                            <div className="text-center">
                              <LoadingSpinner size="sm" />
                              {file.progress !== undefined && (
                                <p className="text-white text-xs mt-2">{Math.round(file.progress)}%</p>
                              )}
                            </div>
                          </div>
                        )}
                        {file.error && (
                          <div className="w-full h-32 bg-destructive/10 border border-destructive rounded-lg flex items-center justify-center">
                            <p className="text-xs text-destructive text-center px-2">
                              {file.error}
                            </p>
                          </div>
                        )}
                        {!file.isUploading && !file.error && (
                          <button
                            onClick={() => imageUpload.removeFile(index)}
                            className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Display image upload errors */}
                {imageUpload.errors.length > 0 && (
                  <div className="mt-4 p-3 bg-destructive/10 border border-destructive rounded-lg">
                    {imageUpload.errors.map((error, index) => (
                      <p key={index} className="text-sm text-destructive">
                        {error}
                      </p>
                    ))}
                  </div>
                )}

                {errors.images && (
                  <p className="text-xs text-destructive mt-2">{errors.images}</p>
                )}
              </div>

              <div>
                <h4 className="text-lg font-heading font-medium mb-4">
                  Documents (Optional)
                </h4>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <div className="text-4xl mb-4">📄</div>
                  <p className="text-lg font-medium mb-2">
                    Upload Property Documents
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Certificate of Occupancy, Survey Plan, Building Plan, etc.
                  </p>
                  <input
                    type="file"
                    id="document-upload"
                    multiple
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => {
                      if (e.target.files) {
                        documentUpload.uploadFiles(e.target.files);
                      }
                    }}
                    className="hidden"
                  />
                  <RealEstButton
                    variant="tertiary"
                    onClick={() => document.getElementById('document-upload')?.click()}
                    isLoading={documentUpload.isUploading}
                  >
                    {documentUpload.isUploading ? 'Uploading...' : 'Choose Documents'}
                  </RealEstButton>
                  <p className="text-xs text-muted-foreground mt-2">
                    Accepted formats: PDF, DOC, DOCX. Max 5MB per document.
                  </p>
                </div>

                {/* Display uploaded documents */}
                {documentUpload.files.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {documentUpload.files.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">📄</span>
                          <span className="text-sm font-medium">{file.file.name}</span>
                        </div>
                        {file.isUploading && (
                          <div className="flex items-center gap-2">
                            <LoadingSpinner size="sm" />
                            {file.progress !== undefined && (
                              <span className="text-xs text-muted-foreground">{Math.round(file.progress)}%</span>
                            )}
                          </div>
                        )}
                        {file.error && (
                          <span className="text-xs text-destructive">{file.error}</span>
                        )}
                        {!file.isUploading && !file.error && (
                          <button
                            onClick={() => documentUpload.removeFile(index)}
                            className="text-destructive hover:text-destructive/80"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Display document upload errors */}
                {documentUpload.errors.length > 0 && (
                  <div className="mt-4 p-3 bg-destructive/10 border border-destructive rounded-lg">
                    {documentUpload.errors.map((error, index) => (
                      <p key={index} className="text-sm text-destructive">
                        {error}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={cn("max-w-4xl mx-auto", className)}>
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-3xl font-heading font-bold">
            List Your Property
          </h2>
          <div className="flex items-center gap-2">
            <ProgressRing
              value={(currentStep / totalSteps) * 100}
              size="md"
              color="violet"
              showValue
            />
            <span className="text-sm text-muted-foreground">
              Step {currentStep} of {totalSteps}
            </span>
          </div>
        </div>

        {/* Step Indicators */}
        <div className="flex items-center gap-4 mb-6">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div key={i} className="flex items-center">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all",
                  i + 1 <= currentStep
                    ? "bg-brand-violet text-white"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {i + 1}
              </div>
              {i < totalSteps - 1 && (
                <div
                  className={cn(
                    "w-12 h-1 mx-2 rounded transition-all",
                    i + 1 < currentStep ? "bg-brand-violet" : "bg-muted",
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-card border border-border rounded-xl p-8 mb-8">
        {renderStepContent()}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <div>
          {currentStep > 1 && (
            <RealEstButton variant="tertiary" onClick={prevStep}>
              ← Previous
            </RealEstButton>
          )}
        </div>

        <div className="flex items-center gap-4">
          <RealEstButton
            variant="ghost"
            onClick={() => handleFormSubmit(true)}
            isLoading={isSubmitting}
          >
            Save Draft
          </RealEstButton>

          {currentStep < totalSteps ? (
            <RealEstButton variant="neon" onClick={nextStep}>
              Next →
            </RealEstButton>
          ) : (
            <RealEstButton
              variant="neon"
              onClick={() => handleFormSubmit(false)}
              isLoading={isSubmitting}
              disabled={!isValid && !isSubmitting}
            >
              {isSubmitting ? "Publishing..." : "Publish Listing"}
            </RealEstButton>
          )}
        </div>
      </div>
    </div>
  );
}
