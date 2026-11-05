"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Card, Chip, Button, Input } from "@heroui/react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {
  MapPin,
  Bed,
  Bath,
  Ruler,
  Search,
  Filter,
  Home,
} from "lucide-react";
import type { MarketplaceListingCard } from "@/lib/listings/load-marketplace-listings";

type BuyPageClientProps = {
  initialProperties: MarketplaceListingCard[];
};

export default function BuyPageClient({ initialProperties }: BuyPageClientProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProperties = useMemo(() => {
    const needle = searchQuery.trim().toLowerCase();
    if (!needle) return initialProperties;
    return initialProperties.filter(
      (property) =>
        property.title.toLowerCase().includes(needle) ||
        property.address.toLowerCase().includes(needle) ||
        property.city.toLowerCase().includes(needle),
    );
  }, [initialProperties, searchQuery]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-primary/10 via-primary/5 to-secondary/20" />
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/50 to-transparent" />
        <div className="absolute top-10 right-10 w-16 h-16 bg-primary/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-10 left-10 w-20 h-20 bg-secondary/10 rounded-full blur-xl animate-pulse delay-500" />

        <div className="relative z-10 container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6">
              <Home className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Buy Properties</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-linear-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent leading-tight">
              Find Your
              <br />
              <span className="text-primary">Dream Home</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
              Discover verified properties for sale with no duplicates. Your
              perfect home is waiting.
            </p>

            <div className="max-w-2xl mx-auto mb-8">
              <div className="bg-background/80 backdrop-blur-lg border border-border/50 rounded-2xl p-2 shadow-2xl">
                <div className="flex gap-2">
                  <div className="flex-1 flex items-center gap-3 px-4 py-3">
                    <Search className="w-5 h-5 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search by location, property type, or keywords..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full border-none outline-none bg-transparent text-base placeholder:text-muted-foreground/70"
                    />
                  </div>
                  <Button
                    size="lg"
                    className="bg-primary hover:bg-primary/90 px-8 rounded-xl font-semibold gap-2 shadow-lg"
                  >
                    <Filter className="w-5 h-5" />
                    Search
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">
                  {initialProperties.length}+
                </div>
                <div className="text-sm text-muted-foreground">Verified Properties</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">50K+</div>
                <div className="text-sm text-muted-foreground">Happy Buyers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">99%</div>
                <div className="text-sm text-muted-foreground">Satisfaction Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Featured Properties for Sale
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Browse our curated selection of verified properties available for
              purchase.
            </p>
          </div>

          {filteredProperties.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-background/80 backdrop-blur-lg border border-border/50 rounded-2xl p-8 max-w-md mx-auto">
                <Home className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No properties found matching your search.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.map((property) => (
                <Link key={property.id} href={`/property/${property.id}`}>
                  <Card.Root className="group h-full bg-background/80 backdrop-blur-lg border border-border/50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden">
                    <div className="relative h-48 bg-muted rounded-t-2xl overflow-hidden">
                      {property.thumbnailUrl ? (
                        <Image
                          src={property.thumbnailUrl}
                          alt={property.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-linear-to-br from-slate-400 to-slate-600" />
                      )}
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <Chip
                        variant="primary"
                        className="absolute top-3 right-3 bg-primary text-primary-foreground font-semibold text-xs"
                      >
                        FOR SALE
                      </Chip>
                      <Chip
                        variant="secondary"
                        className="absolute bottom-3 left-3 bg-background/90 backdrop-blur-sm border-border/50 text-xs"
                      >
                        {property.property_type}
                      </Chip>
                    </div>

                    <Card.Content className="p-6">
                      <h3 className="font-bold text-lg line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                        {property.title}
                      </h3>
                      <p className="text-2xl font-bold text-primary mb-3">
                        ₦{property.price.toLocaleString("en-NG")}
                      </p>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
                        <MapPin className="w-4 h-4 shrink-0" />
                        <span className="line-clamp-1">
                          {property.address}, {property.city}
                        </span>
                      </div>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        {property.bedrooms != null && property.bedrooms > 0 && (
                          <div className="flex items-center gap-1">
                            <Bed className="w-4 h-4" />
                            <span>{property.bedrooms}</span>
                          </div>
                        )}
                        {property.bathrooms != null && property.bathrooms > 0 && (
                          <div className="flex items-center gap-1">
                            <Bath className="w-4 h-4" />
                            <span>{property.bathrooms}</span>
                          </div>
                        )}
                        {property.square_feet != null && property.square_feet > 0 && (
                          <div className="flex items-center gap-1">
                            <Ruler className="w-4 h-4" />
                            <span>
                              {property.square_feet.toLocaleString("en-NG")} sqft
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

      <Footer />
    </div>
  );
}
