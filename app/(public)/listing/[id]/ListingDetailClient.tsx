"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Chip,
  Avatar,
} from "@heroui/react";
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Button,
  Input,
  Textarea,
  Separator,
} from "@/components/ui";
import {
  MapPin,
  Bed,
  Bath,
  Ruler,
  Car,
  Calendar,
  Phone,
  Mail,
  Share,
  Heart,
  CheckCircle,
  Star,
  Award,
} from "lucide-react";
import { Header, Footer } from "@/components/layout";
import { PropertyMap } from "@/components/property/PropertyMap";
import { formatPrice, formatListingType } from "@/lib/utils/propertyUtils";
import {
  StatusBadge,
  VerifiedBadge,
  PendingBadge,
  AvailableBadge,
} from "@/components/ui/status-badge";
import {
  PropertyStatusChip,
  AvailableChip,
  PendingChip,
  FeaturedChip,
} from "@/components/realest/badges/PropertyStatusChip";
import {
  AmenityBadge,
  PowerBadge,
  WaterBadge,
  SecurityBadge,
  InternetBadge,
  BoysQuartersBadge,
  GeneratorBadge,
  ParkingBadge,
  PoolBadge,
  GymBadge,
  AmenityBadgeGroup,
  createAmenityBadges,
} from "@/components/realest/badges";
import {
  PropertyTypeBadge,
  HouseBadge,
  ApartmentBadge,
  LandBadge,
  CommercialBadge,
  HotelBadge,
  OfficeBadge,
  DuplexBadge,
  BungalowBadge,
  SelfContainedBadge,
  ResidentialLandBadge,
  CommercialLandBadge,
} from "@/components/realest/badges/PropertyTypeBadge";

interface AgentListing {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  address: string;
  city: string;
  state: string | null;
  zip_code: string | null;
  country: string;
  latitude: number | null;
  longitude: number | null;
  property_type: string;
  listing_type: "sale" | "rent" | "lease" | "location" | "short_let";
  price_frequency: string | null;
  status: string;
  verification_status: "pending" | "verified" | "rejected";
  created_at: string;
  // Nigerian market fields (to be added to schema)
  nepa_status?: "stable" | "intermittent" | "poor" | "none" | "generator_only";
  water_source?: "borehole" | "public_water" | "well" | "water_vendor" | "none";
  internet_type?: "fiber" | "starlink" | "4g" | "3g" | "none";
  security_type?: string[];
  has_bq?: boolean;
  property_details: {
    bedrooms: number | null;
    bathrooms: number | null;
    square_feet: number | null;
    lot_size: number | null;
    year_built: number | null;
    parking_spaces: number | null;
    furnished: boolean | null;
    pets_allowed: boolean | null;
    amenities: string[] | null;
    utilities_included: string[] | null;
    has_generator: boolean | null;
    has_pool: boolean | null;
    has_gym: boolean | null;
  } | null;
  property_media: {
    id: string;
    media_type: "image" | "video" | "virtual_tour";
    file_url: string;
    file_name: string;
    is_primary: boolean;
  }[];
  agent: {
    id: string;
    license_number: string;
    agency_name: string;
    specialization: string[];
    verified: boolean;
    rating: number | null;
    agent_profile: {
      id: string;
      full_name: string;
      email: string;
      phone: string | null;
      avatar_url: string | null;
    };
  };
}

export default function ListingDetailsPage() {
  const params = useParams();
  const propertyId = params.id as string;
  const [property, setProperty] = useState<AgentListing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [inquiryForm, setInquiryForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inquirySent, setInquirySent] = useState(false);
  const [inquiryError, setInquiryError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperty = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/properties/${propertyId}/public?source=agent`);
        if (res.ok) {
          const json = await res.json();
          if (json.data) setProperty(json.data as AgentListing);
        }
      } catch (err) {
        console.error("Failed to fetch listing:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (propertyId) {
      fetchProperty();
    }
  }, [propertyId]);

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setInquiryError(null);

    try {
      const res = await fetch("/api/inquiries/guest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          property_id: propertyId,
          name: inquiryForm.name,
          email: inquiryForm.email,
          phone: inquiryForm.phone || undefined,
          message: inquiryForm.message,
        }),
      });

      if (res.ok) {
        setInquirySent(true);
        setInquiryForm({ name: "", email: "", phone: "", message: "" });
      } else {
        const err = await res.json();
        const detail = err?.details?.[0]?.message ?? err?.error ?? "Failed to send inquiry. Please try again.";
        setInquiryError(detail);
        console.error("Inquiry error:", err);
      }
    } catch (error) {
      console.error("Failed to send inquiry:", error);
      setInquiryError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8">
            <div className="animate-pulse space-y-8">
              <div className="h-96 bg-muted rounded-lg" />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <div className="h-8 bg-muted rounded" />
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-32 bg-muted rounded" />
                </div>
                <div className="h-96 bg-muted rounded" />
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!property) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="text-center py-8">
              <h2 className="text-xl font-semibold mb-2">Listing Not Found</h2>
              <p className="text-muted-foreground mb-4">
                The listing you're looking for doesn't exist or has been removed.
              </p>
              <Button variant="default">
                <Link href="/">Back to Homepage</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </>
    );
  }

  const primaryImage = property.property_media.find(
    (media) => media.is_primary,
  );
  const galleryImages = property.property_media.filter(
    (media) => media.media_type === "image",
  );

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Image Gallery */}
          <div className="mb-8">
            <div className="relative h-96 lg:h-[500px] rounded-lg overflow-hidden mb-4">
              <img
                src={
                  galleryImages[selectedImage]?.file_url ||
                  primaryImage?.file_url ||
                  "/placeholder.jpg"
                }
                alt={property.title}
                className="w-full h-full object-cover"
              />
              {property.verification_status === "verified" && (
                <div className="absolute top-4 left-4">
                  <Chip
                    color="success"
                    variant="primary"
                    className="flex items-center gap-1"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Vetted Property
                  </Chip>
                </div>
              )}
              <div className="absolute top-4 right-4 flex gap-2">
                <Button variant="secondary" size="sm">
                  <Share className="w-4 h-4" />
                </Button>
                <Button variant="secondary" size="sm">
                  <Heart className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Thumbnail Gallery */}
            {galleryImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {galleryImages.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImage(index)}
                    className={`shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      selectedImage === index
                        ? "border-primary"
                        : "border-transparent"
                    }`}
                  >
                    <img
                      src={image.file_url}
                      alt={`Property view ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Property Header */}
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{property.title}</h1>
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <MapPin className="w-4 h-4" />
                      <span>
                        {property.address}, {property.city}
                        {property.state && `, ${property.state}`}
                      </span>
                    </div>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <PropertyTypeBadge type={property.property_type as any} />
                      <PropertyStatusChip 
                        status={property.status === 'live' ? 'available' : property.status === 'pending' ? 'pending' : 'unavailable'}
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-primary mb-1">
                      {formatPrice(property.price, property.price_frequency)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatListingType(property.listing_type)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Property Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Property Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {property.property_details?.bedrooms && (
                      <div className="flex items-center gap-2">
                        <Bed className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium">
                            {property.property_details.bedrooms}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Bedrooms
                          </div>
                        </div>
                      </div>
                    )}
                    {property.property_details?.bathrooms && (
                      <div className="flex items-center gap-2">
                        <Bath className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium">
                            {property.property_details.bathrooms}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Bathrooms
                          </div>
                        </div>
                      </div>
                    )}
                    {property.property_details?.square_feet && (
                      <div className="flex items-center gap-2">
                        <Ruler className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium">
                            {property.property_details.square_feet.toLocaleString()}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Sq Ft
                          </div>
                        </div>
                      </div>
                    )}
                    {property.property_details?.parking_spaces && (
                      <div className="flex items-center gap-2">
                        <Car className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium">
                            {property.property_details.parking_spaces}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Parking
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {property.property_details?.year_built && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">
                          Built in {property.property_details.year_built}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Description */}
              {property.description && (
                <Card>
                  <CardHeader>
                    <CardTitle>Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {property.description}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Amenities */}
              {property.property_details?.amenities &&
                property.property_details.amenities.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Amenities</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {property.property_details.amenities.map(
                          (amenity, index) => (
                            <Chip key={index} variant="secondary">
                              {amenity}
                            </Chip>
                          ),
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

              {/* Nigerian Market Amenities */}
              <Card>
                <CardHeader>
                  <CardTitle>Infrastructure & Amenities</CardTitle>
                </CardHeader>
                <CardContent>
                  <AmenityBadgeGroup 
                    amenities={createAmenityBadges({
                      nepa_status: property.nepa_status || 'none',
                      water_source: property.water_source || 'none',
                      internet_type: property.internet_type || 'none',
                      security_type: property.security_type || [],
                      has_bq: property.has_bq || false,
                      has_generator: property.property_details?.has_generator || false,
                      has_pool: property.property_details?.has_pool || false,
                      has_gym: property.property_details?.has_gym || false,
                      parking_spaces: property.property_details?.parking_spaces || 0,
                    })}
                  />
                </CardContent>
              </Card>

              {/* Property Location Map */}
              <Card>
                <CardHeader>
                  <CardTitle>Location</CardTitle>
                </CardHeader>
                <CardContent>
                  {property.latitude && property.longitude ? (
                    <div className="h-64 rounded-lg overflow-hidden">
                      <PropertyMap
                        className="w-full h-full"
                        initialCenter={[property.latitude, property.longitude]}
                        initialZoom={15}
                        showFilters={false}
                        showLegend={false}
                      />
                    </div>
                  ) : (
                    <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <MapPin className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground">
                          Location coordinates not available
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact Agent</CardTitle>
                  <CardDescription>
                    Inquire about this property listing
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {inquirySent ? (
                    <div className="text-center py-8">
                      <CheckCircle className="w-12 h-12 text-success mx-auto mb-4" />
                      <h3 className="font-medium mb-2">Inquiry Sent!</h3>
                      <p className="text-sm text-muted-foreground">
                        The agent will get back to you soon.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleInquirySubmit} className="space-y-4">
                      <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium">
                          Your Name
                        </label>
                        <Input
                          id="name"
                          placeholder="Enter your full name"
                          value={inquiryForm.name}
                          onChange={(e) =>
                            setInquiryForm((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium">
                          Email
                        </label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          value={inquiryForm.email}
                          onChange={(e) =>
                            setInquiryForm((prev) => ({
                              ...prev,
                              email: e.target.value,
                            }))
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="phone" className="text-sm font-medium">
                          Phone (Optional)
                        </label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="Enter your phone number"
                          value={inquiryForm.phone}
                          onChange={(e) =>
                            setInquiryForm((prev) => ({
                              ...prev,
                              phone: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="message" className="text-sm font-medium">
                          Message
                        </label>
                        <Textarea
                          id="message"
                          placeholder="Tell the agent about your interest in this property..."
                          value={inquiryForm.message}
                          onChange={(e) =>
                            setInquiryForm((prev) => ({
                              ...prev,
                              message: e.target.value,
                            }))
                          }
                          required
                          minLength={10}
                          rows={4}
                        />
                      </div>
                      {inquiryError && (
                        <p className="text-sm text-destructive">{inquiryError}</p>
                      )}
                      <Button
                        type="submit"
                        variant="default"
                        className="w-full"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Sending..." : "Send Inquiry"}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>

              {/* Agent Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Listed by</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Agent Profile */}
                    <div className="flex items-center gap-3">
                      <div className="w-auto h-auto border border-accent rounded-full p-0.5 flex items-center justify-center">
                        <Avatar className="size-12">
                          <Avatar.Image
                            src={property.agent.agent_profile.avatar_url || undefined}
                            alt={property.agent.agent_profile.full_name}
                            className="rounded-full"
                          />
                          <Avatar.Fallback delayMs={600}>
                            <div className="rounded-full border w-full h-full justify-center items-center flex bg-muted-foreground/10">
                              {property.agent.agent_profile.full_name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </div>
                          </Avatar.Fallback>
                        </Avatar>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">
                          {property.agent.agent_profile.full_name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Licensed Agent
                        </div>
                      </div>
                      {property.agent.verified && (
                        <CheckCircle className="w-5 h-5 text-success" />
                      )}
                    </div>

                    <Separator />

                    {/* Agency Info */}
                    <div>
                      <div className="text-sm font-medium mb-1">
                        {property.agent.agency_name}
                      </div>
                      <div className="text-xs text-muted-foreground mb-2">
                        License: {property.agent.license_number}
                      </div>

                      {/* Specialization */}
                      {property.agent.specialization &&
                        property.agent.specialization.length > 0 && (
                          <div className="mb-3">
                            <div className="text-xs font-medium text-muted-foreground mb-2">
                              Specializations
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {property.agent.specialization.map(
                                (spec, index) => (
                                  <Chip key={index} size="sm" variant="secondary">
                                    {spec}
                                  </Chip>
                                ),
                              )}
                            </div>
                          </div>
                        )}

                      {/* Rating */}
                      {property.agent.rating !== null && (
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${
                                  i < Math.floor(property.agent.rating!)
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-muted-foreground"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {property.agent.rating.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>

                    <Separator />

                    {/* Contact Details */}
                    <div className="space-y-2">
                      {property.agent.agent_profile.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <a
                            href={`tel:${property.agent.agent_profile.phone}`}
                            className="text-primary hover:underline"
                          >
                            {property.agent.agent_profile.phone}
                          </a>
                        </div>
                      )}
                      {property.agent.agent_profile.email && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <a
                            href={`mailto:${property.agent.agent_profile.email}`}
                            className="text-primary hover:underline"
                          >
                            {property.agent.agent_profile.email}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Property Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Listed
                      </span>
                      <span className="text-sm">
                        {new Date(property.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Property Type
                      </span>
                      <PropertyTypeBadge type={property.property_type as any} />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Status
                      </span>
                      <PropertyStatusChip
                        status={
                          property.verification_status === 'verified' 
                          ? 'available' 
                          : property.verification_status === 'pending' 
                            ? 'pending' 
                            : 'unavailable'
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
