"use client";

import { memo, useMemo } from "react";
import { Button } from "@/components/ui";
import { CheckCircle, Star, X, AlertCircle } from "lucide-react";

// ============================================================================
// INTERFACES
// ============================================================================

interface PropertyType {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  popular: boolean;
  features: string[];
  category: "residential" | "commercial" | "hospitality" | "land";
}

interface PropertyCategory {
  id: "residential" | "commercial" | "hospitality" | "land";
  name: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

interface PropertyTypeCardProps {
  type: PropertyType;
  isSelected: boolean;
  onClick: () => void;
}

interface PropertyTypeModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCategory: string | null;
  selectedType: string;
  groupedTypes: Record<string, PropertyType[]>;
  onTypeSelect: (typeId: string) => void;
  propertyCategories: Record<string, PropertyCategory>;
  propertyTypesData: PropertyType[];
}

// ============================================================================
// SUBCOMPONENTS
// ============================================================================

const PropertyTypeCard = memo(function PropertyTypeCard({
  type,
  isSelected,
  onClick,
}: PropertyTypeCardProps) {
  return (
    <button
      onClick={onClick}
      className={`cursor-pointer p-4 rounded-lg border-2 transition-all duration-200 text-left ${
        isSelected
          ? `border-primary bg-primary/5`
          : `border-border/30 hover:border-primary/50 hover:bg-primary/5`
      }`}
    >
      <div className="space-y-2">
        {/* Header with Icon & Popular Badge */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2">
            <div
              className={`p-2 rounded-lg shrink-0 ${
                isSelected
                  ? `bg-primary text-primary-foreground`
                  : `bg-primary/10 text-primary`
              }`}
            >
              {type.icon}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">
                {type.name}
              </h3>
              {type.popular && (
                <div className="flex items-center gap-1 mt-1">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span className="text-xs font-semibold text-amber-700">
                    Popular
                  </span>
                </div>
              )}
            </div>
          </div>
          {isSelected && (
            <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-1" />
          )}
        </div>

        {/* Description */}
        <p className="text-xs text-muted-foreground leading-snug">
          {type.description}
        </p>

        {/* Features Preview */}
        <div className="pt-2 space-y-1 border-t border-border/30">
          {type.features.slice(0, 2).map((feature, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-1 h-1 bg-primary rounded-full shrink-0" />
              <span className="text-xs text-muted-foreground">
                {feature}
              </span>
            </div>
          ))}
        </div>
      </div>
    </button>
  );
});

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const PropertyTypeModal = memo(function PropertyTypeModal({
  isOpen,
  onOpenChange,
  selectedCategory,
  selectedType,
  groupedTypes,
  onTypeSelect,
  propertyCategories,
  propertyTypesData,
}: PropertyTypeModalProps) {
  const selectedCategoryData = useMemo(
    () => (selectedCategory ? propertyCategories[selectedCategory] : null),
    [selectedCategory, propertyCategories]
  );

  const selectedTypeData = useMemo(
    () => propertyTypesData.find((t) => t.id === selectedType),
    [selectedType, propertyTypesData]
  );

  const modalTypes = useMemo(
    () => (selectedCategory ? groupedTypes[selectedCategory] || [] : []),
    [selectedCategory, groupedTypes]
  );

  const handleConfirm = () => {
    if (selectedType && selectedTypeData) {
      onOpenChange(false);
    }
  };

  const handleModalClose = () => {
    onOpenChange(false);
  };

  const isConfirmDisabled =
    !selectedType ||
    !selectedTypeData ||
    selectedCategory !== selectedTypeData?.category;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/20 backdrop-blur-xs animate-in fade-in duration-200"
        onClick={handleModalClose}
      >
        {/* Animated Background */}
        <div className="absolute inset-0 bg-linear-to-br from-primary/20 via-primary/10 to-secondary/20" />
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/50 to-transparent" />

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute top-40 right-20 w-32 h-32 bg-secondary/10 rounded-full blur-xl animate-pulse delay-1000" />
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-primary/5 rounded-full blur-xl animate-pulse delay-500" />
      </div>

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[95vh] backdrop-blur-3xl border border-border/50 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300 bg-background flex flex-col">
        {/* Close Button */}
        <button
          onClick={handleModalClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-surface/80 hover:bg-surface border border-border/30 flex items-center justify-center transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>

        {/* Modal Content */}
        <div className="overflow-y-auto flex-1 p-6 sm:p-8">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start gap-4 pr-12">
              {selectedCategoryData && (
                <div className={`p-3 rounded-lg shrink-0 ${selectedCategoryData.bgColor}`}>
                  <div className={`${selectedCategoryData.color}`}>
                    {selectedCategoryData.icon}
                  </div>
                </div>
              )}
              <div className="flex-1">
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                  {selectedCategoryData?.title}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Select from {modalTypes.length} available type
                  {modalTypes.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            {/* Types Grid */}
            {modalTypes.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-center text-muted-foreground">
                  No property types available in this category
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {modalTypes.map((type) => (
                  <PropertyTypeCard
                    key={type.id}
                    type={type}
                    isSelected={selectedType === type.id}
                    onClick={() => onTypeSelect(type.id)}
                  />
                ))}
              </div>
            )}

            {/* Error Message */}
            {!selectedType && (
              <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 shrink-0" />
                <p className="text-xs sm:text-sm text-yellow-700 dark:text-yellow-300">
                  Please select a property type to continue
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-border/30 px-6 sm:px-8 py-4 bg-surface/30 backdrop-blur-sm shrink-0">
          <div className="flex gap-3">
            <Button
              onClick={handleModalClose}
              variant="secondary"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isConfirmDisabled}
              className="flex-1"
            >
              Confirm Selection
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
});
