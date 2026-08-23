"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, Button, Input, Spinner } from "@/components/ui";
import { ArrowLeft, Save, Eye } from "lucide-react";
import { PropertyListingForm } from "@/components/patterns/forms";

interface Property {
  id: string;
  title: string;
  description: string;
  property_type: string;
  listing_type: string;
  price: number;
  address: string;
  city: string;
  state: string;
  bedrooms: number;
  bathrooms: number;
  square_feet: number;
  year_built: number;
  parking_spaces: number;
  furnished: boolean;
  pets_allowed: boolean;
  amenities: string[];
  status: string;
}

export default function EditListingPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params.id as string;
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      // TODO: Replace with actual API call
      // For now, simulate loading with mock data
      setTimeout(() => {
        const mockProperty: Property = {
          id: propertyId,
          title: "Modern 3BR Apartment in Lekki",
          description:
            "Beautiful modern apartment with ocean views and premium amenities.",
          property_type: "apartment",
          listing_type: "rent",
          price: 2500000,
          address: "Admiralty Way",
          city: "Lagos",
          state: "Lagos",
          bedrooms: 3,
          bathrooms: 2,
          square_feet: 1200,
          year_built: 2020,
          parking_spaces: 1,
          furnished: true,
          pets_allowed: false,
          amenities: ["Swimming Pool", "Gym", "Security", "Generator"],
          status: "active",
        };

        setProperty(mockProperty);
        setIsLoading(false);
      }, 1000);
    };

    if (propertyId) {
      fetchProperty();
    }
  }, [propertyId]);

  const handleFormSubmit = async (formData: any) => {
    setIsSaving(true);
    try {
      // TODO: Implement property update API call
      console.log("Updating property:", propertyId, formData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Redirect back to listings
      router.push("/owner/listings");
    } catch (error) {
      console.error("Failed to update property:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded-lg mb-6"></div>
            <div className="h-96 bg-muted rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">Property Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The property you're trying to edit doesn't exist.
          </p>
          <Link href="/owner/listings">
            <Button variant="default">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Listings
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/owner/listings">
              <Button variant="ghost" size="icon-sm">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Edit Listing
              </h1>
              <p className="text-muted-foreground">
                Update your property information and settings.
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Link href={`/listing/${property.id}`}>
              <Button variant="ghost">
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
            </Link>
            <Button
              variant="default"
              onClick={() => document.querySelector("form")?.requestSubmit()}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Spinner className="mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Property Form */}
        <Card className="bg-surface/90 backdrop-blur-lg border border-border/50 rounded-2xl shadow-lg">
          <CardContent className="p-8">
            <PropertyListingForm
              initialData={property}
              onSubmit={handleFormSubmit}
            />
          </CardContent>
        </Card>

        {/* Additional Actions */}
        <div className="mt-8 flex flex-wrap gap-4">
          <Link href={`/owner/listings/${property.id}/media`}>
            <Button variant="secondary">Manage Media</Button>
          </Link>
          <Link href={`/owner/listings/${property.id}/documents`}>
            <Button variant="secondary">Manage Documents</Button>
          </Link>
          <Link href={`/owner/inquiries`}>
            <Button variant="secondary">View Inquiries</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
