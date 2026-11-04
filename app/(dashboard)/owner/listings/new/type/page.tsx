"use client";

import { useState, useMemo, useTransition, useEffect, memo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Card, 
  CardContent,
  Button,
} from "@/components/ui";
import { PropertyTypeModal } from "@/components/property/PropertyTypeModal";
import {
  ArrowLeft,
  Home,
  Building,
  Hotel,
  Briefcase,
  CheckCircle,
  Star,
  MapPin,
  Utensils,
  Warehouse,
  X,
} from "lucide-react";

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

// ============================================================================
// CONSTANTS - Moved outside component to prevent recreation on every render
// ============================================================================

const PROPERTY_CATEGORIES: Record<string, PropertyCategory> = {
  residential: {
    id: "residential",
    name: "Residential",
    title: "Residential Properties",
    icon: <Home className="w-6 h-6" />,
    color: "text-[var(--primary)]",
    bgColor: "bg-[var(--primary)]/5",
  },
  commercial: {
    id: "commercial",
    name: "Commercial",
    title: "Commercial Properties",
    icon: <Briefcase className="w-6 h-6" />,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  hospitality: {
    id: "hospitality",
    name: "Event & Hospitality",
    title: "Event & Hospitality",
    icon: <Hotel className="w-6 h-6" />,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  land: {
    id: "land",
    name: "Land",
    title: "Land & Plots",
    icon: <MapPin className="w-6 h-6" />,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
  },
};

const PROPERTY_TYPES_DATA: PropertyType[] = [
  // RESIDENTIAL
  {
    id: "duplex",
    name: "Duplex",
    description: "2-story family homes with modern amenities",
    icon: <Home className="w-8 h-8" />,
    popular: true,
    category: "residential",
    features: [
      "Perfect for families",
      "Boys Quarters option",
      "Higher rental yields",
      "Gated community suitable",
    ],
  },
  {
    id: "flat",
    name: "Flat/Apartment",
    description: "Modern apartment units in urban areas with amenities",
    icon: <Building className="w-8 h-8" />,
    popular: true,
    category: "residential",
    features: [
      "Urban convenience",
      "24/7 backup power",
      "Professional tenants",
      "Lower maintenance",
    ],
  },
  {
    id: "detached_house",
    name: "Detached House",
    description: "Standalone family houses with exclusive land",
    icon: <Home className="w-8 h-8" />,
    popular: true,
    category: "residential",
    features: [
      "Complete privacy",
      "Large outdoor space",
      "Family-oriented",
      "Investment potential",
    ],
  },
  {
    id: "bungalow",
    name: "Bungalow",
    description: "Single-story homes ideal for comfortable living",
    icon: <Home className="w-8 h-8" />,
    popular: false,
    category: "residential",
    features: [
      "Accessible design",
      "Easy maintenance",
      "Modest footprint",
      "Great for retirees",
    ],
  },
  {
    id: "mini_flat",
    name: "Mini Flat",
    description: "1 bedroom + kitchenette compact units",
    icon: <Building className="w-8 h-8" />,
    popular: false,
    category: "residential",
    features: [
      "Affordable pricing",
      "Low maintenance",
      "Quick rental turnover",
      "Entry-level investment",
    ],
  },
  {
    id: "self_contained",
    name: "Self-Contained",
    description: "Studio apartments with private facilities",
    icon: <Building className="w-8 h-8" />,
    popular: false,
    category: "residential",
    features: [
      "Complete privacy",
      "All-in-one layout",
      "Popular with professionals",
      "Modern amenities",
    ],
  },
  {
    id: "room_and_parlor",
    name: "Room & Parlor",
    description: "1 bedroom + living room units at affordable prices",
    icon: <Building className="w-8 h-8" />,
    popular: false,
    category: "residential",
    features: [
      "Budget-friendly",
      "Separate living space",
      "Quick rental potential",
      "Growing demand",
    ],
  },
  {
    id: "penthouse",
    name: "Penthouse",
    description: "Luxury top-floor units with premium features",
    icon: <Building className="w-8 h-8" />,
    popular: false,
    category: "residential",
    features: [
      "Premium location",
      "Exclusive amenities",
      "High-end clientele",
      "Premium pricing",
    ],
  },
  {
    id: "terrace",
    name: "Terrace/Townhouse",
    description: "Connected row houses with modern design",
    icon: <Home className="w-8 h-8" />,
    popular: false,
    category: "residential",
    features: [
      "Modern architecture",
      "Compact efficiency",
      "Community feel",
      "Mid-range pricing",
    ],
  },
  {
    id: "single_room",
    name: "Single Room",
    description: "Individual rooms with shared facilities",
    icon: <Building className="w-8 h-8" />,
    popular: false,
    category: "residential",
    features: [
      "Most affordable",
      "Young professional market",
      "Quick turnovers",
      "Easy management",
    ],
  },

  // COMMERCIAL
  {
    id: "shop",
    name: "Shop",
    description: "Ground-floor retail spaces for businesses",
    icon: <Briefcase className="w-8 h-8" />,
    popular: false,
    category: "commercial",
    features: [
      "High foot traffic",
      "Prime location",
      "Business tenants",
      "Commercial lease rates",
    ],
  },
  {
    id: "office",
    name: "Office Space",
    description: "Commercial office buildings and suites",
    icon: <Briefcase className="w-8 h-8" />,
    popular: false,
    category: "commercial",
    features: [
      "Professional tenants",
      "Long-term leases",
      "Corporate rates",
      "Stable income",
    ],
  },
  {
    id: "warehouse",
    name: "Warehouse",
    description: "Industrial storage and logistics facilities",
    icon: <Warehouse className="w-8 h-8" />,
    popular: false,
    category: "commercial",
    features: [
      "Large square footage",
      "Industrial zones",
      "Logistics companies",
      "Bulk leases",
    ],
  },
  {
    id: "showroom",
    name: "Showroom",
    description: "Display spaces for products and services",
    icon: <Briefcase className="w-8 h-8" />,
    popular: false,
    category: "commercial",
    features: [
      "High visibility",
      "Display-friendly",
      "Retail brands",
      "Premium spaces",
    ],
  },

  // HOSPITALITY & EVENTS
  {
    id: "hotel",
    name: "Hotel",
    description: "Hotels, resorts, and short-term lodging facilities",
    icon: <Hotel className="w-8 h-8" />,
    popular: false,
    category: "hospitality",
    features: [
      "High nightly rates",
      "Tourism locations",
      "Seasonal peaks",
      "Premium positioning",
    ],
  },
  {
    id: "event_center",
    name: "Event Center",
    description: "Wedding venues, conference halls, and event spaces",
    icon: <Star className="w-8 h-8" />,
    popular: false,
    category: "hospitality",
    features: [
      "Wedding venue",
      "Conference spaces",
      "Event bookings",
      "Premium rates",
    ],
  },
  {
    id: "restaurant",
    name: "Restaurant",
    description: "Food & beverage establishments and dining venues",
    icon: <Utensils className="w-8 h-8" />,
    popular: false,
    category: "hospitality",
    features: [
      "Food business",
      "High traffic areas",
      "Commercial kitchen",
      "Growing sector",
    ],
  },

  // LAND
  {
    id: "residential_land",
    name: "Residential Land",
    description: "Plots and land for housing development",
    icon: <MapPin className="w-8 h-8" />,
    popular: false,
    category: "land",
    features: [
      "Development potential",
      "Long-term investment",
      "Appreciation likely",
      "Builders' target",
    ],
  },
  {
    id: "commercial_land",
    name: "Commercial Land",
    description: "Plots zoned for business and commercial use",
    icon: <MapPin className="w-8 h-8" />,
    popular: false,
    category: "land",
    features: [
      "Business zoning",
      "Premium locations",
      "High development value",
      "Investment grade",
    ],
  },
  {
    id: "mixed_use_land",
    name: "Mixed-Use Land",
    description: "Flexible zoning for residential and commercial",
    icon: <MapPin className="w-8 h-8" />,
    popular: false,
    category: "land",
    features: [
      "Flexible zoning",
      "Maximum potential",
      "Developer friendly",
      "Higher value",
    ],
  },
  {
    id: "farmland",
    name: "Farmland",
    description: "Agricultural land for farming and cultivation",
    icon: <MapPin className="w-8 h-8" />,
    popular: false,
    category: "land",
    features: [
      "Agricultural use",
      "Rural locations",
      "Farming communities",
      "Growing interest",
    ],
  },
];

// ============================================================================
// MEMOIZED SUBCOMPONENTS
// ============================================================================

interface PropertyCategoryCardProps {
  categoryId: string;
  category: PropertyCategory;
  typeCount: number;
  isSelected: boolean;
  selectedTypeName?: string;
  onClick: () => void;
}

const PropertyCategoryCard = memo(function PropertyCategoryCard({
  categoryId,
  category,
  typeCount,
  isSelected,
  selectedTypeName,
  onClick,
}: PropertyCategoryCardProps) {
  return (
    <Card
      className={`cursor-pointer transition-all duration-300 hover:shadow-xl ${
        isSelected
          ? `border-2 ${category.bgColor} shadow-lg scale-105`
          : `border border-border/30 hover:border-primary/50 hover:shadow-md`
      }`}
      onClick={onClick}
    >
      <CardContent className="p-8">
        <div className="space-y-4">
          {/* Icon */}
          <div
            className={`w-16 h-16 rounded-lg flex items-center justify-center transition-all ${
              isSelected
                ? `bg-primary text-primary-foreground`
                : `${category.bgColor} ${category.color}`
            }`}
          >
            {category.icon}
          </div>

          {/* Title */}
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-1">
              {category.title}
            </h3>
            <p className="text-sm text-muted-foreground">
              {typeCount} option{typeCount !== 1 ? "s" : ""} available
            </p>
          </div>

          {/* Selection Badge */}
          {isSelected && selectedTypeName && (
            <div className="flex items-center gap-2 pt-2 border-t border-border/30">
              <CheckCircle className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-primary">
                {selectedTypeName}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function PropertyTypeStep() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedType, setSelectedType] = useState<string>(
    searchParams.get("type") || ""
  );
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Memoize grouped types to prevent recalculation
  const groupedTypes = useMemo(() => {
    return PROPERTY_TYPES_DATA.reduce(
      (acc, type) => {
        if (!acc[type.category]) acc[type.category] = [];
        acc[type.category].push(type);
        return acc;
      },
      {} as Record<string, PropertyType[]>
    );
  }, []);

  // Persist selected type to URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedType) {
      params.set("type", selectedType);
    }
    const newUrl = params.toString() ? `?${params.toString()}` : "";
    window.history.replaceState({}, "", newUrl || window.location.pathname);
  }, [selectedType]);

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setIsModalOpen(true);
  };

  const handleTypeSelect = (typeId: string) => {
    setSelectedType(typeId);
  };

  const selectedTypeData = PROPERTY_TYPES_DATA.find((t) => t.id === selectedType);

  const handleContinue = () => {
    startTransition(() => {
      router.push(`/owner/listings/new/details?type=${selectedType}`);
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-[var(--primary)]/5">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-4">
              <Link href="/owner/listings/new">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-2">
                  What are you listing?
                </h1>
                <p className="text-lg text-muted-foreground">
                  {selectedType
                    ? "Property type selected. Ready to continue?"
                    : "Choose a category to see available property types"}
                </p>
              </div>
            </div>
            <div className="text-sm font-medium bg-[var(--primary)]/10 text-[var(--primary)] px-4 py-2 rounded-full">
              Step 1 of 6
            </div>
          </div>

          {/* Category Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {Object.entries(PROPERTY_CATEGORIES).map(([categoryId, category]) => {
              const typeCount = groupedTypes[categoryId]?.length || 0;
              const isSelected = selectedCategory === categoryId && !!selectedType;

              return (
                <PropertyCategoryCard
                  key={categoryId}
                  categoryId={categoryId}
                  category={category}
                  typeCount={typeCount}
                  isSelected={isSelected}
                  selectedTypeName={selectedTypeData?.name}
                  onClick={() => handleCategoryClick(categoryId)}
                />
              );
            })}
          </div>

          {/* Selection Feedback */}
          {selectedType && selectedTypeData && (
            <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <h3 className="font-semibold text-foreground text-lg">
                      Property Type Selected
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {selectedTypeData.name}
                    </span>{" "}
                    -{" "}
                    {selectedTypeData.description}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedType("");
                    setSelectedCategory(null);
                  }}
                  className="text-muted-foreground hover:text-foreground transition-colors p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-8 border-t border-border">
            <Link href="/owner/listings/new">
              <Button variant="ghost">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            {selectedType ? (
              <Button
                variant="default"
                className="gap-2"
                onClick={handleContinue}
                disabled={isPending}
              >
                {isPending ? "Loading..." : "Continue to Details"}
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </Button>
            ) : (
              <p className="text-sm text-muted-foreground">
                Select a category to continue →
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Property Type Selection Modal */}
      <PropertyTypeModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        selectedCategory={selectedCategory}
        selectedType={selectedType}
        groupedTypes={groupedTypes}
        onTypeSelect={handleTypeSelect}
        propertyCategories={PROPERTY_CATEGORIES}
        propertyTypesData={PROPERTY_TYPES_DATA}
      />
    </div>
  );
}
