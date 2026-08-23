"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, Chip } from "@heroui/react";
import Link from "next/link";
import { MapPin, Bed, Bath, Ruler, Heart, MapPinned } from "lucide-react";
import { VerificationBadge, PropertyStatusChip } from "@/components/realest";

interface SavedProperty {
  id: string;
  property_id: string;
  saved_at: string;
  properties: {
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
  }[];
}

export default function FavoritesPage() {
  const [savedProperties, setSavedProperties] = useState<SavedProperty[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {

      try {
        const supabase = createClient();
        const { data: user } = await supabase.auth.getUser();

        if (!user || !user.user) {
          return;
        }

        const { data, error } = await supabase
          .from("saved_properties")
          .select(
            `
            id,
            property_id,
            saved_at,
            properties (
              id,
              title,
              price,
              address,
              city,
              bedrooms,
              bathrooms,
              square_feet,
              listing_type,
              property_type,
              verification_status,
              status
            )
          `,
          )
          .eq("user_id", user.user.id)
          .order("saved_at", { ascending: false });

        if (!error && data) {
          setSavedProperties(data);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              My Favorites
            </h1>
            <p className="text-muted-foreground">
              Properties you've saved for later.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-80 bg-muted rounded-2xl animate-pulse shadow-lg"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            My Favorites
          </h1>
          <p className="text-muted-foreground">
            Properties you've saved for later. ({savedProperties.length} saved)
          </p>
        </div>

        {savedProperties.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-surface/90 backdrop-blur-lg border border-border/50 rounded-2xl p-8 max-w-md mx-auto shadow-lg">
              <Heart className="w-12 h-12 text-primary mx-auto mb-4" />
              <p className="text-body-m text-muted-foreground mb-2">
                No saved properties yet.
              </p>
              <p className="text-body-s text-muted-foreground/80">
                Start browsing and save properties you like!
              </p>
              <Link
                href="/search"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                <MapPinned className="w-4 h-4" />
                Browse Properties
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedProperties.map((saved) => {
              const property = saved.properties?.[0]; // Take the first (and only) property, if present
              if (!property) {
                // If the related property is missing (e.g., deleted), skip rendering this favorite
                return null;
              }
              return (
                <Link key={saved.id} href={`/property/${property.id}`}>
                  <Card.Root className="property-card group h-full bg-surface/90 backdrop-blur-lg border border-border/50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden">
                    {/* Property Image */}
                    <div className="relative h-48 bg-muted rounded-t-2xl overflow-hidden">
                      <div className="absolute inset-0 bg-linear-to-br from-primary/20 via-accent/10 to-primary/30" />
                      {/* Overlay on hover */}
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      {/* Verification Badge */}
                      <div className="absolute top-3 left-3">
                        <VerificationBadge
                          status={
                            property.verification_status === "verified"
                              ? "geo-verified"
                              : "pending"
                          }
                          size="sm"
                          showTooltip={false}
                        />
                      </div>

                      {/* Property Status */}
                      <div className="absolute top-3 right-3">
                        <PropertyStatusChip
                          status={
                            property.status === "active"
                              ? "available"
                              : "pending"
                          }
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
                      <div className="mt-4 pt-4 border-t border-border/50">
                        <p className="text-xs text-muted-foreground">
                          Saved on{" "}
                          {new Date(saved.saved_at).toLocaleDateString()}
                        </p>
                      </div>
                    </Card.Content>
                  </Card.Root>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
