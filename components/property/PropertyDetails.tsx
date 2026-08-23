import { Card, Chip } from "@heroui/react";
import {
  MapPin,
  Bed,
  Bath,
  Ruler,
  Calendar,
  DollarSign,
  CheckCircle,
} from "lucide-react";
import { formatPrice, formatListingType, formatPropertyType } from "@/lib/utils/propertyUtils";

interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  price_frequency: string | null;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  bedrooms: number;
  bathrooms: number;
  square_feet: number;
  year_built: number;
  property_type: string;
  listing_type: string;
  verification_status: string;
  created_at: string;
}

interface PropertyDetailsProps {
  property: Property;
  details: any;
}

export default function PropertyDetails({
  property,
  details,
}: PropertyDetailsProps) {
  const listingTypeLabel = formatListingType(property.listing_type);
  const propertyTypeLabel = formatPropertyType(property.property_type);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{property.title}</h1>
            <div className="flex items-center gap-2 text-muted-foreground mb-4">
              <MapPin className="w-5 h-5" />
              <span>
                {property.address}, {property.city}, {property.state}{" "}
                {property.postal_code}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-primary mb-2">
              {formatPrice(property.price, property.price_frequency)}
            </div>
            <Chip variant="primary" className="bg-green-600 text-white">
              {listingTypeLabel}
            </Chip>
          </div>
        </div>

        {property.verification_status === "verified" && (
          <div className="flex items-center gap-2 text-green-600 mb-4">
            <CheckCircle className="w-5 h-5" />
            <span className="font-semibold">Verified & Vetted Property</span>
          </div>
        )}
      </div>

      {/* Overview */}
      <Card.Root className="bg-background/80 backdrop-blur-lg border border-border/50">
        <Card.Header>
          <Card.Title>Overview</Card.Title>
        </Card.Header>
        <Card.Content>
          <p className="text-muted-foreground leading-relaxed">
            {property.description}
          </p>
        </Card.Content>
      </Card.Root>

      {/* Key Details */}
      <Card.Root className="bg-background/80 backdrop-blur-lg border border-border/50">
        <Card.Header>
          <Card.Title>Key Details</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {property.bedrooms > 0 && (
              <div>
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Bed className="w-5 h-5" />
                  <span className="text-sm">Bedrooms</span>
                </div>
                <p className="text-2xl font-bold">{property.bedrooms}</p>
              </div>
            )}
            {property.bathrooms > 0 && (
              <div>
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Bath className="w-5 h-5" />
                  <span className="text-sm">Bathrooms</span>
                </div>
                <p className="text-2xl font-bold">{property.bathrooms}</p>
              </div>
            )}
            {property.square_feet > 0 && (
              <div>
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Ruler className="w-5 h-5" />
                  <span className="text-sm">Square Feet</span>
                </div>
                <p className="text-2xl font-bold">
                  {property.square_feet.toLocaleString()}
                </p>
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Calendar className="w-5 h-5" />
                <span className="text-sm">Year Built</span>
              </div>
              <p className="text-2xl font-bold">{property.year_built}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <DollarSign className="w-5 h-5" />
                <span className="text-sm">Property Type</span>
              </div>
              <p className="text-lg font-semibold">{propertyTypeLabel}</p>
            </div>
          </div>
        </Card.Content>
      </Card.Root>

      {/* Amenities */}
      {details?.amenities && details.amenities.length > 0 && (
        <Card.Root className="bg-background/80 backdrop-blur-lg border border-border/50">
          <Card.Header>
            <Card.Title>Amenities</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {details.amenities.map((amenity: string, index: number) => (
                <Chip
                  key={index}
                  variant="secondary"
                  className="justify-center py-2"
                >
                  {amenity}
                </Chip>
              ))}
            </div>
          </Card.Content>
        </Card.Root>
      )}
    </div>
  );
}
