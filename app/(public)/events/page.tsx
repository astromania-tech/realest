"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, Chip, Button, Input } from "@heroui/react";
import Link from "next/link";
import { Header, Footer } from "@/components/layout";
import {
  MapPin,
  Users,
  Calendar,
  Search,
  Filter,
  Sparkles,
  Clock,
  Star,
} from "lucide-react";

interface EventSpace {
  id: string;
  title: string;
  price: number;
  address: string;
  city: string;
  capacity: number | null;
  square_feet: number;
  listing_type: string;
  property_type: string;
  verification_status: string;
  amenities: string[];
}

export default function EventsPage() {
  const [spaces, setSpaces] = useState<EventSpace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchSpaces = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("status", "active")
        .eq("verification_status", "verified")
        .eq("property_type", "event_space")
        .limit(12);

      if (!error && data) {
        setSpaces(
          data.map((row) => ({
            id: row.id,
            title: row.title,
            price: Number(row.price),
            address: row.address,
            city: row.city,
            capacity: null,
            square_feet: row.square_feet ?? 0,
            listing_type: row.listing_type,
            property_type: row.property_type,
            verification_status: row.verification_status,
            amenities: [],
          })),
        );
      }
      setIsLoading(false);
    };

    fetchSpaces();
  }, []);

  const filteredSpaces = spaces.filter(
    (space) =>
      space.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      space.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      space.city.toLowerCase().includes(searchQuery.toLowerCase()),
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
              <Calendar className="w-4 h-4 text-secondary" />
              <span className="text-sm font-medium text-secondary">
                Event Spaces
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-linear-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent leading-tight">
              Perfect Spaces for
              <br />
              <span className="text-primary">Your Events</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
              Find the ideal venue for weddings, corporate events, parties, and
              celebrations. Fully verified and equipped spaces.
            </p>

            {/* Search */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="bg-background/80 backdrop-blur-lg border border-border/50 rounded-2xl p-2 shadow-2xl">
                <div className="flex gap-2">
                  <div className="flex-1 flex items-center gap-3 px-4 py-3">
                    <Search className="w-5 h-5 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search by location, venue type, or features..."
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
                  {spaces.length}+
                </div>
                <div className="text-sm text-muted-foreground">
                  Event Spaces
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">500+</div>
                <div className="text-sm text-muted-foreground">
                  Events Hosted
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">4.9</div>
                <div className="text-sm text-muted-foreground">
                  Average Rating
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Spaces Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Featured Event Spaces
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover beautifully designed venues perfect for your special
              occasions and corporate events.
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
          ) : filteredSpaces.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-background/80 backdrop-blur-lg border border-border/50 rounded-2xl p-8 max-w-md mx-auto">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No event spaces found matching your search.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSpaces.map((space) => (
                <Link key={space.id} href={`/property/${space.id}`}>
                  <Card.Root className="group h-full bg-background/80 backdrop-blur-lg border border-border/50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden">
                    {/* Property Image */}
                    <div className="relative h-48 bg-muted rounded-t-2xl overflow-hidden">
                      <div className="absolute inset-0 bg-linear-to-br from-purple-400 to-pink-600" />
                      {/* Overlay on hover */}
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      {/* Badge */}
                      <Chip
                        variant="primary"
                        className="absolute top-3 right-3 bg-secondary text-secondary-foreground font-semibold text-xs"
                      >
                        EVENT SPACE
                      </Chip>
                      {/* Capacity Badge */}
                      {space.capacity != null && (
                        <Chip
                          variant="secondary"
                          className="absolute bottom-3 left-3 bg-background/90 backdrop-blur-sm border-border/50 text-xs"
                        >
                          <Users className="w-3 h-3 mr-1" />
                          {space.capacity} guests
                        </Chip>
                      )}
                    </div>

                    <Card.Content className="p-6">
                      <h3 className="font-bold text-lg line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                        {space.title}
                      </h3>
                      <p className="text-2xl font-bold text-primary mb-3">
                        £{space.price.toLocaleString()}/day
                      </p>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
                        <MapPin className="w-4 h-4 shrink-0" />
                        <span className="line-clamp-1">
                          {space.address}, {space.city}
                        </span>
                      </div>

                      {/* Amenities */}
                      {space.amenities && space.amenities.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {space.amenities.slice(0, 3).map((amenity, index) => (
                            <Chip
                              key={index}
                              variant="secondary"
                              className="text-xs"
                            >
                              {amenity}
                            </Chip>
                          ))}
                          {space.amenities.length > 3 && (
                            <Chip variant="secondary" className="text-xs">
                              +{space.amenities.length - 3} more
                            </Chip>
                          )}
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {space.capacity != null && (
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{space.capacity}</span>
                          </div>
                        )}
                        {space.square_feet > 0 && (
                          <div className="flex items-center gap-1">
                            <Sparkles className="w-4 h-4" />
                            <span>
                              {space.square_feet.toLocaleString()} sqft
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

      {/* Event Types Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Perfect for Any Occasion
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From intimate gatherings to grand celebrations, find the perfect
              space for your event.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Weddings",
                description: "Elegant venues for your special day",
                icon: "💒",
              },
              {
                title: "Corporate Events",
                description: "Professional spaces for meetings and conferences",
                icon: "🏢",
              },
              {
                title: "Birthday Parties",
                description: "Fun and festive spaces for celebrations",
                icon: "🎂",
              },
              {
                title: "Social Gatherings",
                description: "Versatile venues for any social occasion",
                icon: "🎉",
              },
            ].map((eventType, index) => (
              <Card.Root
                key={index}
                className="bg-background/80 backdrop-blur-lg border border-border/50 rounded-2xl p-6 text-center hover:shadow-lg transition-shadow"
              >
                <Card.Content className="space-y-4">
                  <div className="text-4xl">{eventType.icon}</div>
                  <h3 className="font-semibold text-lg">{eventType.title}</h3>
                  <p className="text-muted-foreground text-sm">
                    {eventType.description}
                  </p>
                </Card.Content>
              </Card.Root>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
