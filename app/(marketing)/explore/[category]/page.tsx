"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, Chip, Button } from "@heroui/react";
import {
  MapPin,
  Home,
  Building,
  Hotel,
  Briefcase,
  ArrowLeft,
  Filter,
  Sparkles,
} from "lucide-react";
import { VerificationBadge, PropertyStatusChip } from "@/components/realest";

interface Property {
  id: string;
  title: string;
  price: number;
  address: string;
  city: string;
  bedrooms: number;
  bathrooms: number;
  square_feet: number;
  listing_type: string;
  property_type: string;
  verification_status: string;
  status: string;
}

interface CategoryInfo {
  name: string;
  description: string;
  icon: React.ReactNode;
  propertyType: string;
}

export default function CategoryPage() {
  const params = useParams();
  const category = params.category as string;
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const categoryMap: Record<string, CategoryInfo> = {
    houses: {
      name: "Houses",
      description: "Beautiful homes for families and individuals",
      icon: <Home className="w-6 h-6" />,
      propertyType: "house",
    },
    apartments: {
      name: "Apartments",
      description: "Modern apartments in prime locations",
      icon: <Building className="w-6 h-6" />,
      propertyType: "apartment",
    },
    hotels: {
      name: "Hotels",
      description: "Luxury and budget accommodations",
      icon: <Hotel className="w-6 h-6" />,
      propertyType: "hotel",
    },
    offices: {
      name: "Offices",
      description: "Commercial spaces for businesses",
      icon: <Briefcase className="w-6 h-6" />,
      propertyType: "office",
    },
  };

  const categoryInfo = categoryMap[category] || {
    name: category.charAt(0).toUpperCase() + category.slice(1),
    description: `Explore ${category} properties`,
    icon: <Home className="w-6 h-6" />,
    propertyType: category,
  };

  useEffect(() => {
    const fetchProperties = async () => {
      // TODO: Replace with actual API call filtering by category
      // For now, simulate loading with mock data
      setTimeout(() => {
        const mockProperties: Property[] = [
          {
            id: "1",
            title: `Modern 3BR ${categoryInfo.name.slice(0, -1)} in Lekki`,
            price:
              category === "hotels"
                ? 50000
                : category === "offices"
                  ? 5000000
                  : 2500000,
            address: "Admiralty Way",
            city: "Lagos",
            bedrooms: category === "offices" ? 0 : 3,
            bathrooms: category === "offices" ? 2 : 2,
            square_feet: category === "offices" ? 2000 : 1200,
            listing_type: category === "hotels" ? "rent" : "sale",
            property_type: categoryInfo.propertyType,
            verification_status: "verified",
            status: "active",
          },
          {
            id: "2",
            title: `Luxury ${categoryInfo.name.slice(0, -1)} in Victoria Island`,
            price:
              category === "hotels"
                ? 100000
                : category === "offices"
                  ? 10000000
                  : 5000000,
            address: "Victoria Island",
            city: "Lagos",
            bedrooms: category === "offices" ? 0 : 4,
            bathrooms: category === "offices" ? 3 : 3,
            square_feet: category === "offices" ? 3000 : 2000,
            listing_type: category === "hotels" ? "rent" : "sale",
            property_type: categoryInfo.propertyType,
            verification_status: "verified",
            status: "active",
          },
          {
            id: "3",
            title: `Cozy ${categoryInfo.name.slice(0, -1)} in Ikeja`,
            price:
              category === "hotels"
                ? 25000
                : category === "offices"
                  ? 2500000
                  : 1500000,
            address: "Allen Avenue",
            city: "Lagos",
            bedrooms: category === "offices" ? 0 : 2,
            bathrooms: category === "offices" ? 1 : 2,
            square_feet: category === "offices" ? 1000 : 800,
            listing_type: category === "hotels" ? "rent" : "sale",
            property_type: categoryInfo.propertyType,
            verification_status: "verified",
            status: "active",
          },
        ];

        setProperties(mockProperties);
        setIsLoading(false);
      }, 1000);
    };

    if (category) {
      fetchProperties();
    }
  }, [category, categoryInfo.propertyType]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-secondary/10 via-primary/5 to-secondary/20" />
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/50 to-transparent" />

        <div className="relative z-10 container mx-auto px-4">
          <div className="flex items-center gap-4 mb-6">
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 px-3 py-2 bg-surface/90 backdrop-blur-sm border border-border/50 rounded-lg hover:bg-surface transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Explore
            </Link>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              {categoryInfo.icon}
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                {categoryInfo.name}
              </h1>
              <p className="text-muted-foreground">
                {categoryInfo.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="secondary">
              <Filter className="w-4 h-4 mr-2" />
              Filter Results
            </Button>
            <span className="text-sm text-muted-foreground">
              {properties.length} properties found
            </span>
          </div>
        </div>
      </section>

      {/* Properties Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-80 bg-muted rounded-2xl animate-pulse shadow-lg"
                />
              ))}
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-surface/90 backdrop-blur-lg border border-border/50 rounded-2xl p-8 max-w-md mx-auto shadow-lg">
                <Home className="w-12 h-12 text-primary mx-auto mb-4" />
                <p className="text-body-m text-muted-foreground mb-2">
                  No {categoryInfo.name.toLowerCase()} found in this category
                  yet.
                </p>
                <p className="text-body-s text-muted-foreground/80 mb-4">
                  Check back soon for new listings!
                </p>
                <Link
                  href="/explore"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  Explore Other Categories
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <Link key={property.id} href={`/listing/${property.id}`}>
                  <Card.Root className="property-card group h-full bg-surface/90 backdrop-blur-lg border border-border/50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden">
                    {/* Property Image */}
                    <div className="relative h-48 bg-muted rounded-t-2xl overflow-hidden">
                      <div className="absolute inset-0 bg-linear-to-br from-primary/20 via-accent/10 to-primary/30" />
                      {/* Overlay on hover */}
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      {/* Verification Badge */}
                      <div className="absolute top-3 left-3">
                        <VerificationBadge
                          status="geo-verified"
                          size="sm"
                          showTooltip={false}
                        />
                      </div>

                      {/* Property Status */}
                      <div className="absolute top-3 right-3">
                        <PropertyStatusChip
                          status="available"
                          size="sm"
                          showTooltip={false}
                        />
                      </div>

                      {/* Listing Type Badge */}
                      <Chip
                        variant="secondary"
                        className="absolute bottom-3 left-3 bg-surface/90 backdrop-blur-sm border-border/50 text-xs"
                      >
                        {property.listing_type.replace("_", " ").toUpperCase()}
                      </Chip>

                      {/* Property Type Badge */}
                      <Chip
                        variant="secondary"
                        className="absolute bottom-3 right-3 bg-surface/90 backdrop-blur-sm border-border/50 text-xs"
                      >
                        {property.property_type}
                      </Chip>
                    </div>

                    <Card.Content className="p-6">
                      <h3 className="text-h3 line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                        {property.title}
                      </h3>
                      <p className="text-h2 font-bold bg-linear-to-r from-primary to-accent bg-clip-text text-transparent mb-3">
                        ₦{property.price.toLocaleString()}
                      </p>
                      <div className="flex items-center gap-1 text-body-s text-muted-foreground mb-4">
                        <MapPin className="w-4 h-4 shrink-0 text-primary" />
                        <span className="line-clamp-1">
                          {property.address}, {property.city}
                        </span>
                      </div>
                      <div className="flex gap-4 text-body-s text-muted-foreground">
                        {property.bedrooms > 0 && (
                          <div className="flex items-center gap-1">
                            <Home className="w-4 h-4" />
                            <span>{property.bedrooms} BR</span>
                          </div>
                        )}
                        {property.bathrooms > 0 && (
                          <div className="flex items-center gap-1">
                            <Building className="w-4 h-4" />
                            <span>{property.bathrooms} BA</span>
                          </div>
                        )}
                        {property.square_feet > 0 && (
                          <div className="flex items-center gap-1">
                            <Briefcase className="w-4 h-4" />
                            <span>
                              {property.square_feet.toLocaleString()} sqft
                            </span>
                          </div>
                        )}
                      </div>
                    </Card.Content>
                  </Card.Root>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
