"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, Chip } from "@heroui/react";
import {
  MapPin,
  Home,
  Building,
  Hotel,
  Briefcase,
  Sparkles,
  TrendingUp,
  MapPinned,
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

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: React.ReactNode;
  description: string;
  count: number;
}

export default function ExplorePage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const categories: Category[] = [
    {
      id: "houses",
      name: "Houses",
      slug: "houses",
      icon: <Home className="w-6 h-6" />,
      description: "Beautiful homes for families",
      count: 1250,
    },
    {
      id: "apartments",
      name: "Apartments",
      slug: "apartments",
      icon: <Building className="w-6 h-6" />,
      description: "Modern apartments in prime locations",
      count: 890,
    },
    {
      id: "hotels",
      name: "Hotels",
      slug: "hotels",
      icon: <Hotel className="w-6 h-6" />,
      description: "Luxury and budget accommodations",
      count: 340,
    },
    {
      id: "offices",
      name: "Offices",
      slug: "offices",
      icon: <Briefcase className="w-6 h-6" />,
      description: "Commercial spaces for businesses",
      count: 156,
    },
  ];

  useEffect(() => {
    const fetchProperties = async () => {
      // TODO: Replace with actual API call
      // For now, simulate loading
      setTimeout(() => {
        setProperties([
          {
            id: "1",
            title: "Modern 3BR Apartment in Lekki",
            price: 2500000,
            address: "Admiralty Way",
            city: "Lagos",
            bedrooms: 3,
            bathrooms: 2,
            square_feet: 1200,
            listing_type: "rent",
            property_type: "apartment",
            verification_status: "verified",
            status: "active",
          },
          {
            id: "2",
            title: "Luxury Villa in Banana Island",
            price: 15000000,
            address: "Banana Island",
            city: "Lagos",
            bedrooms: 5,
            bathrooms: 4,
            square_feet: 3500,
            listing_type: "sale",
            property_type: "house",
            verification_status: "verified",
            status: "active",
          },
        ]);
        setIsLoading(false);
      }, 1000);
    };

    fetchProperties();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-linear-to-br from-secondary/10 via-primary/5 to-secondary/20" />
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/50 to-transparent" />

        {/* Floating Elements */}
        <div className="absolute top-10 right-10 w-16 h-16 bg-primary/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-10 left-10 w-20 h-20 bg-secondary/10 rounded-full blur-xl animate-pulse delay-500" />

        <div className="relative z-10 container mx-auto px-4">
          <div className="text-center mb-12">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-full px-4 py-2 mb-6">
              <MapPinned className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent">
                Explore Properties
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-linear-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent">
              Discover Your Perfect Property
            </h1>

            {/* Subtitle */}
            <p className="text-body-l text-muted-foreground max-w-2xl mx-auto">
              Browse through our curated collection of verified properties
              across Nigeria. Find homes, apartments, hotels, and commercial
              spaces that match your needs.
            </p>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-surface/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Browse by Category</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Explore properties by type to find exactly what you're looking
              for.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link key={category.id} href={`/explore/${category.slug}`}>
                <Card.Root className="group h-full bg-surface/90 backdrop-blur-lg border border-border/50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                  <Card.Content className="p-6 text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                      {category.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {category.description}
                    </p>
                    <Chip variant="secondary" size="sm">
                      {category.count} listings
                    </Chip>
                  </Card.Content>
                </Card.Root>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Featured Properties</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Handpicked properties with verified locations and authentic
              details.
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(2)].map((_, i) => (
                <div
                  key={i}
                  className="h-80 bg-muted rounded-2xl animate-pulse shadow-lg"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                            <TrendingUp className="w-4 h-4" />
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

          <div className="text-center mt-12">
            <Link
              href="/search"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              View All Properties
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
