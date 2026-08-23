"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { RealEstButton } from "@/components/heroui/RealEstButton";
import { StatusBadge } from "@/components/ui/status-badge";
import { AdvancedSearchForm } from "@/components/patterns/forms";
import { PropertyMap } from "@/components/property/PropertyMap";
import { Chip } from "@heroui/react";
import { 
  Card, 
  Input, 
  Button 
} from "@/components/ui";
import { Header, Footer } from "@/components/layout";
import {
  MapPin,
  Bed,
  Bath,
  Ruler,
  Search,
  Filter,
  Grid3X3,
  List,
  SlidersHorizontal,
  Heart,
  Eye,
  Star,
  CheckCircle,
  Zap,
  Droplets,
  Shield,
  Home,
  TrendingUp,
  Clock,
  ArrowUpDown,
  Map as MapIcon,
  X,
  Users,
  Building,
} from "lucide-react";

// Normalized shape returned by /api/search/properties
interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  price_frequency: string | null;
  listing_type: string; // for_sale | for_rent | for_lease | short_let
  listing_source: string; // owner | agent
  property_type: string;
  address: string;
  city: string;
  state: string | null;
  country: string;
  latitude: number | null;
  longitude: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  square_feet: number | null;
  status: string;
  verification_status: "pending" | "verified" | "rejected";
  created_at: string;
  // First media item
  thumbnail: { url: string; type: string } | null;
  // Nigerian infra (from property_details.metadata)
  has_bq: boolean;
  nepa_status: string | null;
  water_source: string | null;
  security_type: string[];
  // Lister info (flattened)
  owner: { id: string; full_name: string | null; avatar_url: string | null; phone: string | null } | null;
  agent: { id: string; full_name: string | null; avatar_url: string | null; phone: string | null } | null;
  // Computed client-side
  days_listed?: number;
  view_count?: number;
}

type ViewMode = "grid" | "list" | "map";
type SortOption = "relevance" | "price_low" | "price_high" | "newest" | "oldest";

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Core state
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [likedProperties, setLikedProperties] = useState<Set<string>>(
    new Set(),
  );

  // UI state
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("relevance");

  // Search state
  const [quickSearch, setQuickSearch] = useState(searchParams.get("q") || "");
  const [activeFilters, setActiveFilters] = useState<{
    state?: string;
    propertyType?: string[];
    purpose?: string;
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: number;
    bathrooms?: number;
    verifiedOnly?: boolean;
  }>({});

  const itemsPerPage = 12;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatListingType = (type: string) => {
    const map: Record<string, string> = {
      for_rent: "Rent",
      for_sale: "Sale",
      for_lease: "Lease",
      short_let: "Short Let",
    };
    return map[type] ?? type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const getDaysListed = (createdAt: string) => {
    return Math.floor(
      (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24),
    );
  };

  const nigerianStates = [
    "Lagos",
    "Abuja",
    "Rivers",
    "Ogun",
    "Kano",
    "Kaduna",
    "Oyo",
    "Edo",
    "Delta",
    "Anambra",
    "Imo",
    "Plateau",
    "Cross River",
    "Bauchi",
    "Jigawa",
    "Enugu",
    "Kebbi",
    "Sokoto",
  ];

  useEffect(() => {
    const fetchProperties = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (quickSearch) params.set("query", quickSearch);
        if (activeFilters.state) params.set("state", activeFilters.state);
        // API accepts a single property_type; send first selected if multiple
        if (activeFilters.propertyType && activeFilters.propertyType.length > 0) {
          params.set("property_type", activeFilters.propertyType[0]);
        }
        if (activeFilters.purpose && activeFilters.purpose !== "any") {
          params.set("listing_type", activeFilters.purpose);
        }
        if (activeFilters.minPrice) params.set("min_price", String(activeFilters.minPrice));
        if (activeFilters.maxPrice) params.set("max_price", String(activeFilters.maxPrice));
        if (activeFilters.bedrooms) params.set("bedrooms", String(activeFilters.bedrooms));
        if (activeFilters.bathrooms) params.set("bathrooms", String(activeFilters.bathrooms));
        params.set("page", String(currentPage));
        params.set("limit", String(itemsPerPage));

        const sortMap: Record<SortOption, string> = {
          relevance: "newest",
          price_low: "price_asc",
          price_high: "price_desc",
          newest: "newest",
          oldest: "oldest",
        };
        params.set("sort_by", sortMap[sortBy]);

        const res = await fetch(`/api/search/properties?${params}`);
        const json = await res.json();

        if (res.ok) {
          const enriched = (json.properties ?? []).map((p: Property) => ({
            ...p,
            days_listed: getDaysListed(p.created_at),
            view_count: Math.floor(Math.random() * 500) + 50,
          }));
          setProperties(enriched);
          setTotalCount(json.pagination?.total ?? 0);
        }
      } catch (err) {
        console.error("Search fetch error:", err);
      }
      setIsLoading(false);
    };

    fetchProperties();
  }, [quickSearch, activeFilters, sortBy, currentPage]);

  const handleSearch = (filters: any) => {
    setActiveFilters(filters);
    setCurrentPage(1);
    setShowAdvancedSearch(false);
  };

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    // Update URL with search params
    const params = new URLSearchParams();
    if (quickSearch) params.set("q", quickSearch);
    router.push(`/search?${params.toString()}`);
  };

  const toggleLike = (propertyId: string) => {
    setLikedProperties((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(propertyId)) {
        newSet.delete(propertyId);
      } else {
        newSet.add(propertyId);
      }
      return newSet;
    });
  };

  const clearFilters = () => {
    setActiveFilters({});
    setQuickSearch("");
    setCurrentPage(1);
  };

  const PropertyCard = ({
    property,
    isListView = false,
  }: {
    property: Property;
    isListView?: boolean;
  }) => {
    const isLiked = likedProperties.has(property.id);

    // Lister resolution based on listing_source
    const isAgentListing = property.listing_source === "agent" && !!property.agent;
    const lister = isAgentListing ? property.agent : property.owner;
    const listerType = isAgentListing ? "Agent" : "Owner";
    const detailRoute = isAgentListing ? `/listing/${property.id}` : `/property/${property.id}`;

    if (isListView) {
      return (
        <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="flex gap-6">
            {/* Image */}
            <div className="w-48 h-32 bg-muted rounded-xl overflow-hidden shrink-0 relative">
              {property.thumbnail ? (
                <img
                  src={property.thumbnail.url}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-muted to-muted/50">
                  <Building className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
              {/* Status badges */}
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                <StatusBadge variant={property.verification_status} size="sm">
                  {property.verification_status === "verified" && (
                    <CheckCircle className="w-3 h-3" />
                  )}
                  {property.verification_status === "verified"
                    ? "Verified"
                    : property.verification_status}
                </StatusBadge>
                {property.has_bq && (
                  <StatusBadge variant="info" size="sm">
                    BQ
                  </StatusBadge>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <Link href={detailRoute}>
                    <h3 className="text-lg font-heading font-semibold mb-2 hover:text-primary transition-colors truncate">
                      {property.title}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <MapPin className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-sm truncate">
                      {property.address}, {property.city}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Chip variant="secondary" className="text-xs">
                      {property.property_type
                        .replace("_", " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </Chip>
                    <Chip variant="secondary" className="text-xs">
                      For {formatListingType(property.listing_type)}
                    </Chip>
                    {(property.days_listed ?? 999) < 7 && (
                      <StatusBadge variant="new" size="sm">
                        New
                      </StatusBadge>
                    )}
                  </div>
                  {/* Lister info */}
                  <div className="flex items-center gap-2 mt-2">
                    {lister?.avatar_url && (
                      <img
                        src={lister.avatar_url}
                        alt={lister.full_name ?? undefined}
                        className="w-7 h-7 rounded-full object-cover"
                      />
                    )}
                    <span className="text-xs font-medium text-muted-foreground">
                      Listed by{" "}
                      {lister?.full_name
                        ? lister.full_name
                        : listerType || "Admin"}
                      {listerType && (
                        <span className="ml-1 text-[10px] px-2 py-0.5 rounded bg-muted">
                          {listerType}
                        </span>
                      )}
                    </span>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <div className="text-xl font-heading font-bold text-primary mb-1">
                    {formatPrice(property.price)}
                  </div>
                  {property.listing_type === "for_rent" && (
                    <div className="text-xs text-muted-foreground">
                      per month
                    </div>
                  )}
                </div>
              </div>

              {/* Property details */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                {property.bedrooms != null && (
                  <div className="flex items-center gap-1">
                    <Bed className="w-4 h-4" />
                    <span>{property.bedrooms}</span>
                  </div>
                )}
                {property.bathrooms != null && (
                  <div className="flex items-center gap-1">
                    <Bath className="w-4 h-4" />
                    <span>{property.bathrooms}</span>
                  </div>
                )}
                {property.square_feet != null && (
                  <div className="flex items-center gap-1">
                    <Ruler className="w-4 h-4" />
                    <span>{property.square_feet.toLocaleString()} sqft</span>
                  </div>
                )}
              </div>

              {/* Nigerian features */}
              <div className="flex flex-wrap gap-2 mb-3">
                {property.nepa_status && ![ "none", "poor" ].includes(property.nepa_status) && (
                  <div className="flex items-center gap-1 text-xs bg-success/10 text-success px-2 py-1 rounded-full">
                    <Zap className="w-3 h-3" />
                    <span>NEPA</span>
                  </div>
                )}
                {property.water_source && property.water_source !== "none" && (
                  <div className="flex items-center gap-1 text-xs bg-info/10 text-info px-2 py-1 rounded-full">
                    <Droplets className="w-3 h-3" />
                    <span>Water</span>
                  </div>
                )}
                {property.security_type.includes("gated_community") && (
                  <div className="flex items-center gap-1 text-xs bg-warning/10 text-warning px-2 py-1 rounded-full">
                    <Shield className="w-3 h-3" />
                    <span>Gated</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    <span>{property.view_count} views</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{property.days_listed} days ago</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <RealEstButton
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleLike(property.id)}
                  >
                    <Heart
                      className={`w-4 h-4 ${isLiked ? "fill-current text-error" : ""}`}
                    />
                  </RealEstButton>
                  <RealEstButton variant="primary" size="sm">
                    <Link href={detailRoute}>View Details</Link>
                  </RealEstButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Grid view
    return (
      <div className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
        {/* Image */}
        <div className="relative h-48 bg-muted overflow-hidden">
          {property.thumbnail ? (
            <img
              src={property.thumbnail.url}
              alt={property.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-muted to-muted/50">
              <Building className="w-12 h-12 text-muted-foreground" />
            </div>
          )}

          {/* Status badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            <StatusBadge variant={property.verification_status}>
              {property.verification_status === "verified" && (
                <CheckCircle className="w-4 h-4" />
              )}
              {property.verification_status === "verified"
                ? "Verified"
                : property.verification_status}
            </StatusBadge>
            {(property.days_listed ?? 999) < 7 && (
              <StatusBadge variant="new">New</StatusBadge>
            )}
          </div>

          {/* Action buttons */}
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <RealEstButton
              variant="ghost"
              size="sm"
              onClick={() => toggleLike(property.id)}
              className="bg-background/80 backdrop-blur-sm"
            >
              <Heart
                className={`w-4 h-4 ${isLiked ? "fill-current text-error" : ""}`}
              />
            </RealEstButton>
          </div>

          {/* Price overlay */}
          <div className="absolute bottom-3 right-3 bg-background/90 backdrop-blur-sm rounded-lg px-3 py-1">
            <div className="font-heading font-bold text-primary">
              {formatPrice(property.price)}
            </div>
            {property.listing_type === "for_rent" && (
              <div className="text-xs text-muted-foreground text-center">
                per month
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <Link href={detailRoute}>
            <h3 className="font-heading font-semibold text-lg mb-2 hover:text-primary transition-colors line-clamp-1">
              {property.title}
            </h3>
          </Link>

          <div className="flex items-center gap-2 text-muted-foreground mb-3">
            <MapPin className="w-4 h-4 text-primary shrink-0" />
            <span className="text-sm truncate">
              {property.address}, {property.city}
            </span>
          </div>

          {/* Property details */}
          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
            {property.bedrooms != null && (
              <div className="flex items-center gap-1">
                <Bed className="w-4 h-4" />
                <span>{property.bedrooms}</span>
              </div>
            )}
            {property.bathrooms != null && (
              <div className="flex items-center gap-1">
                <Bath className="w-4 h-4" />
                <span>{property.bathrooms}</span>
              </div>
            )}
            {property.square_feet != null && (
              <div className="flex items-center gap-1">
                <Ruler className="w-4 h-4" />
                <span>{(property.square_feet / 1000).toFixed(1)}k sqft</span>
              </div>
            )}
          </div>

          {/* Nigerian features */}
          <div className="flex flex-wrap gap-1 mb-3">
            {property.has_bq && (
              <StatusBadge variant="info" size="sm">
                BQ
              </StatusBadge>
            )}
            {property.nepa_status && !["none", "poor"].includes(property.nepa_status) && (
              <div className="text-xs bg-success/10 text-success px-2 py-1 rounded-full">
                NEPA
              </div>
            )}
            {property.water_source && property.water_source !== "none" && (
              <div className="text-xs bg-info/10 text-info px-2 py-1 rounded-full">
                Water
              </div>
            )}
            {property.security_type.includes("gated_community") && (
              <div className="text-xs bg-warning/10 text-warning px-2 py-1 rounded-full">
                Gated
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="capitalize">
                {property.property_type.replace("_", " ")}
              </span>
              <span>•</span>
              <span>{property.days_listed}d ago</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span>{property.view_count}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background">
        {/* Search Header */}
        <div className="bg-linear-to-r from-primary/5 to-accent/5 border-b border-border">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-display-2 font-heading font-bold mb-6 text-center">
                Find Your Perfect Property
              </h1>

              {/* Quick Search */}
              <form onSubmit={handleQuickSearch} className="mb-6">
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search by location, property type, or keyword..."
                      value={quickSearch}
                      onChange={(e) => setQuickSearch(e.target.value)}
                      className="pl-12 h-12 text-base"
                    />
                  </div>
                  <Button variant="default" type="submit" size="lg" className="px-8">
                    Search
                  </Button>
                  <RealEstButton
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                  >
                    <SlidersHorizontal className="w-5 h-5 mr-2" />
                    Filters
                  </RealEstButton>
                </div>
              </form>

              {/* Active Filters */}
              {Object.keys(activeFilters).length > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm font-medium">Active filters:</span>
                  <div className="flex flex-wrap gap-2">
                    {activeFilters.state && (
                      <Chip
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {activeFilters.state}
                        <X
                          className="w-3 h-3 cursor-pointer"
                          onClick={() =>
                            setActiveFilters((prev) => ({ ...prev, state: "" }))
                          }
                        />
                      </Chip>
                    )}
                    {activeFilters.propertyType &&
                      activeFilters.propertyType.length > 0 &&
                      activeFilters.propertyType.map((type: string) => (
                        <Chip
                          key={type}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {type
                            .replace("_", " ")
                            .replace(/\b\w/g, (l: string) => l.toUpperCase())}
                          <X
                            className="w-3 h-3 cursor-pointer"
                            onClick={() =>
                              setActiveFilters((prev) => ({
                                ...prev,
                                propertyType: prev.propertyType?.filter(
                                  (t: string) => t !== type,
                                ),
                              }))
                            }
                          />
                        </Chip>
                      ))}
                    {activeFilters.purpose &&
                      activeFilters.purpose !== "any" && (
                        <Chip
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          For {activeFilters.purpose}
                          <X
                            className="w-3 h-3 cursor-pointer"
                            onClick={() =>
                              setActiveFilters((prev) => ({
                                ...prev,
                                purpose: "any",
                              }))
                            }
                          />
                        </Chip>
                      )}
                  </div>
                  <RealEstButton
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                  >
                    Clear All
                  </RealEstButton>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Advanced Search Panel */}
        {showAdvancedSearch && (
          <div className="border-b border-border bg-card/50 backdrop-blur-sm">
            <div className="container mx-auto px-4 py-6">
              <AdvancedSearchForm
                onSearch={handleSearch}
                initialFilters={activeFilters}
                className="max-w-4xl mx-auto"
              />
            </div>
          </div>
        )}

        {/* Results Section */}
        <div className="container mx-auto px-4 py-8">
          {/* Results Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-heading font-semibold">
                {isLoading ? (
                  <div className="h-6 w-32 bg-muted rounded animate-pulse" />
                ) : (
                  `${totalCount.toLocaleString()} properties found`
                )}
              </h2>
              {quickSearch && (
                <span className="text-muted-foreground">
                  for "{quickSearch}"
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-3 py-2 border border-border rounded-lg text-sm bg-background"
              >
                <option value="relevance">Most Relevant</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>

              {/* View Mode Toggle */}
              <div className="flex bg-muted rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded transition-colors ${
                    viewMode === "grid"
                      ? "bg-background shadow-sm"
                      : "hover:bg-background/50"
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded transition-colors ${
                    viewMode === "list"
                      ? "bg-background shadow-sm"
                      : "hover:bg-background/50"
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("map")}
                  className={`p-2 rounded transition-colors ${
                    viewMode === "map"
                      ? "bg-background shadow-sm"
                      : "hover:bg-background/50"
                  }`}
                >
                  <MapIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "space-y-6"
              }
            >
              {Array.from({ length: itemsPerPage }).map((_, i) => (
                <div
                  key={i}
                  className={
                    viewMode === "grid"
                      ? "h-80 bg-muted rounded-2xl animate-pulse"
                      : "h-48 bg-muted rounded-2xl animate-pulse"
                  }
                />
              ))}
            </div>
          )}

          {/* No Results */}
          {!isLoading && properties.length === 0 && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-linear-to-br from-muted to-muted/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Search className="w-12 h-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-heading font-semibold mb-3">
                No Properties Found
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                We couldn't find any properties matching your criteria. Try
                adjusting your search filters or explore different areas.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <RealEstButton onClick={clearFilters}>
                  Clear All Filters
                </RealEstButton>
                <RealEstButton variant="outline">
                  <Link href="/search">Browse All Properties</Link>
                </RealEstButton>
              </div>
            </div>
          )}

          {/* Map View */}
          {viewMode === "map" && !isLoading && properties.length > 0 && (
            <div className="h-[600px] rounded-2xl overflow-hidden border border-border">
              <PropertyMap
                className="w-full h-full"
                showFilters={true}
                showLegend={true}
              />
            </div>
          )}

          {/* Properties Grid/List */}
          {!isLoading && properties.length > 0 && viewMode !== "map" && (
            <>
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    : "space-y-6"
                }
              >
                {properties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    isListView={viewMode === "list"}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalCount > itemsPerPage && (
                <div className="flex items-center justify-center gap-2 mt-12">
                  <RealEstButton
                    variant="outline"
                    disabled={currentPage === 1}
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                  >
                    Previous
                  </RealEstButton>

                  <div className="flex items-center gap-1">
                    {Array.from({
                      length: Math.min(5, Math.ceil(totalCount / itemsPerPage)),
                    }).map((_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                            currentPage === page
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-muted"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>

                  <RealEstButton
                    variant="outline"
                    disabled={
                      currentPage >= Math.ceil(totalCount / itemsPerPage)
                    }
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                  >
                    Next
                  </RealEstButton>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading properties...</p>
          </div>
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}
