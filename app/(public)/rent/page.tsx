"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, Chip, Button, Input } from "@heroui/react";
import Link from "next/link";
import { Header, Footer } from "@/components/layout";
import {
  MapPin,
  Bed,
  Bath,
  Ruler,
  Search,
  Filter,
  TrendingUp,
  Sparkles,
} from "lucide-react";

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
}

export default function RentPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchProperties = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("status", "active")
        .eq("verification_status", "verified")
        .eq("listing_type", "for_rent")
        .limit(12);

      if (!error && data) {
        setProperties(data as Property[]);
      }
      setIsLoading(false);
    };

    fetchProperties();
  }, []);

  const filteredProperties = properties.filter(
    (property) =>
      property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.city.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-linear-to-br from-secondary/10 via-primary/5 to-secondary/20" />
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/50 to-transparent" />

        {/* Floating Elements */}
        <div className="absolute top-10 right-10 w-16 h-16 bg-secondary/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-10 left-10 w-20 h-20 bg-primary/10 rounded-full blur-xl animate-pulse delay-500" />

        <div className="relative z-10 container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-secondary/10 border border-secondary/20 rounded-full px-4 py-2 mb-6">
              <TrendingUp className="w-4 h-4 text-secondary" />
              <span className="text-sm font-medium text-secondary">
                Rent Properties
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-linear-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent leading-tight">
              Find Your
              <br />
              <span className="text-primary">Perfect Rental</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
              Discover verified rental properties with flexible terms. Your
              ideal rental home awaits.
            </p>

            {/* Search */}
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

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">
                  {properties.length}+
                </div>
                <div className="text-sm text-muted-foreground">
                  Rental Properties
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">25K+</div>
                <div className="text-sm text-muted-foreground">
                  Happy Renters
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">98%</div>
                <div className="text-sm text-muted-foreground">
                  Tenant Satisfaction
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Properties Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Featured Rental Properties
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Browse our verified rental properties with transparent pricing and
              flexible lease terms.
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-80 bg-muted rounded-2xl animate-pulse shadow-lg"
                />
              ))}
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-background/80 backdrop-blur-lg border border-border/50 rounded-2xl p-8 max-w-md mx-auto">
                <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No rental properties found matching your search.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.map((property) => (
                <Link key={property.id} href={`/property/${property.id}`}>
                  <Card.Root className="group h-full bg-background/80 backdrop-blur-lg border border-border/50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden">
                    {/* Property Image */}
                    <div className="relative h-48 bg-muted rounded-t-2xl overflow-hidden">
                      <div className="absolute inset-0 bg-linear-to-br from-slate-400 to-slate-600" />
                      {/* Overlay on hover */}
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      {/* Badge */}
                      <Chip
                        variant="primary"
                        className="absolute top-3 right-3 bg-secondary text-secondary-foreground font-semibold text-xs"
                      >
                        FOR RENT
                      </Chip>
                      {/* Property Type Badge */}
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
                        £{property.price.toLocaleString()}/month
                      </p>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
                        <MapPin className="w-4 h-4 shrink-0" />
                        <span className="line-clamp-1">
                          {property.address}, {property.city}
                        </span>
                      </div>
                      <div className="flex gap-4 text-sm text-muted-foreground">
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
