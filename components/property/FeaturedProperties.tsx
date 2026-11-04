"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, Chip } from "@heroui/react";
import Link from "next/link";
import { formatPrice, formatListingType, formatPropertyType } from "@/lib/utils/propertyUtils";
import {
  MapPin,
  Bed,
  Bath,
  Ruler,
  Sparkles,
  TrendingUp,
  MapPinned,
} from "lucide-react";
import {
  VerificationBadge,
  PropertyStatusChip,
  AmenityBadgeGroup,
  createAmenityBadges,
} from "@/components/realest";

interface Property {
  id: string;
  title: string;
  price: number;
  price_frequency: string | null;
  address: string;
  city: string;
  bedrooms: number;
  bathrooms: number;
  square_feet: number;
  listing_type: string;
  property_type: string;
}

export default function FeaturedProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("status", "live")
        .eq("verification_status", "verified")
        .limit(4);

      if (!error && data) {
        setProperties(data as Property[]);
      }
      setIsLoading(false);
    };

    fetchProperties();
  }, []);

  if (isLoading) {
    return (
      <section className="relative py-20 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-linear-to-br from-secondary/10 via-primary/5 to-secondary/20" />
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/50 to-transparent" />

        {/* Floating Elements */}
        <div className="absolute top-10 right-10 w-16 h-16 bg-primary/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-10 left-10 w-20 h-20 bg-secondary/10 rounded-full blur-xl animate-pulse delay-500" />

        <div className="relative z-10 container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-linear-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-full px-4 py-2 mb-6 backdrop-blur-sm">
              <MapPinned className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
                Geo-Verified Properties
              </span>
            </div>
            <h2 className="text-h1 font-bold mb-4 gradient-text-slanted">
              Featured Properties
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-80 bg-muted rounded-2xl animate-pulse shadow-lg"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-linear-to-br from-secondary/10 via-primary/5 to-secondary/20" />
      <div className="absolute inset-0 bg-linear-to-t from-background via-background/50 to-transparent" />

      {/* Floating Elements */}
      <div className="absolute top-10 right-10 w-16 h-16 bg-primary/10 rounded-full blur-xl animate-pulse" />
      <div className="absolute bottom-10 left-10 w-20 h-20 bg-secondary/10 rounded-full blur-xl animate-pulse delay-500" />

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4">
        <div className="text-center mb-12">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-full px-4 py-2 mb-6">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-accent">
              Premium Properties
            </span>
          </div>

          {/* Main Heading */}
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-linear-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent">
            Featured Properties
          </h2>

          {/* Subtitle */}
          <p className="text-body-l text-muted-foreground max-w-2xl mx-auto">
            Discover handpicked, geo-verified properties with authentic location
            data. No duplicates, only trusted listings.
          </p>
        </div>

        {properties.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-surface/90 backdrop-blur-lg border border-border/50 rounded-2xl p-8 max-w-md mx-auto shadow-lg">
              <MapPinned className="w-12 h-12 text-primary mx-auto mb-4" />
              <p className="text-body-m text-muted-foreground mb-2">
                No geo-verified properties available yet.
              </p>
              <p className="text-body-s text-muted-foreground/80">
                Check back soon for verified listings!
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {properties.map((property) => (
              <Link key={property.id} href={`/property/${property.id}`}>
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
                      {formatListingType(property.listing_type)}
                    </Chip>

                    {/* Property Type Badge */}
                    <Chip
                      variant="secondary"
                      className="absolute bottom-3 right-3 bg-surface/90 backdrop-blur-sm border-border/50 text-xs"
                    >
                      {formatPropertyType(property.property_type)}
                    </Chip>
                  </div>

                  <Card.Content className="p-6">
                    <h3 className="text-h3 line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                      {property.title}
                    </h3>
                    <p className="text-h2 font-bold bg-linear-to-r from-primary to-accent bg-clip-text text-transparent mb-3">
                      {formatPrice(property.price, property.price_frequency)}
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
                          <Bed className="w-4 h-4" />
                          <span>{property.bedrooms}</span>
                        </div>
                      )}
                      {property.bathrooms > 0 && (
                        <div className="flex items-center gap-1">
                          <Bath className="w-4 h-4" />
                          <span>{property.bathrooms}</span>
                        </div>
                      )}
                      {property.square_feet > 0 && (
                        <div className="flex items-center gap-1">
                          <Ruler className="w-4 h-4" />
                          <span>
                            {property.square_feet.toLocaleString()} sqft
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Amenity Badges Demo */}
                    <div className="mt-4">
                      <AmenityBadgeGroup
                        amenities={createAmenityBadges({
                          nepa_status: "stable",
                          has_generator: true,
                          water_source: "borehole",
                          internet_type: "fiber",
                          security_type: ["gated_community", "cctv"],
                          has_bq: true,
                          parking_spaces: 2,
                        })}
                        maxDisplay={4}
                        showTooltip={false}
                      />
                    </div>
                  </Card.Content>
                </Card.Root>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
