"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Chip } from "@heroui/react";
import { Card, CardContent, Button, Spinner } from "@/components/ui";
import { ArrowLeft, CheckCircle, Eye, Send, AlertCircle } from "lucide-react";

export default function PropertyReviewStep() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const propertyType = searchParams.get("type") || "";
  const [isLoading, setIsLoading] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // Mock data - in real app, this would come from form state/session
  const propertyData = {
    type: propertyType,
    title: "Modern 3BR Apartment in Lekki",
    price: 2500000,
    address: "Admiralty Way, Lekki",
    city: "Lagos",
    state: "Lagos",
    bedrooms: 3,
    bathrooms: 2,
    squareFeet: 1200,
    description:
      "Beautiful modern apartment with ocean views and premium amenities.",
    amenities: ["Swimming Pool", "Gym", "Security", "Generator"],
    images: 5,
    documents: 2,
  };

  useEffect(() => {
    if (!propertyType) {
      router.push("/owner/listings/new/type");
    }
  }, [propertyType, router]);

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      // TODO: Submit complete property data to API
      console.log("Publishing property:", propertyData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Redirect to success page or listings
      router.push("/owner/listings");
    } catch (error) {
      console.error("Failed to publish property:", error);
    } finally {
      setIsPublishing(false);
    }
  };

  if (!propertyType) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Spinner />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link href={`/owner/listings/new/documents?type=${propertyType}`}>
                <Button variant="ghost" size="sm" >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Review & Publish
                </h1>
                <p className="text-muted-foreground">
                  Review your property details and publish your listing
                </p>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">Step 6 of 6</div>
          </div>

          {/* Property Summary */}
          <div className="space-y-6">
            {/* Basic Info */}
            <Card className="bg-surface/90 backdrop-blur-lg border border-border/50 rounded-2xl shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <h3 className="text-lg font-semibold">
                    Property Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Title</p>
                    <p className="font-medium">{propertyData.title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Type</p>
                    <p className="font-medium capitalize">
                      {propertyData.type}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Price</p>
                    <p className="font-medium">
                      ₦{propertyData.price.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium">
                      {propertyData.address}, {propertyData.city}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Bedrooms</p>
                    <p className="font-medium">{propertyData.bedrooms}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Bathrooms</p>
                    <p className="font-medium">{propertyData.bathrooms}</p>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    Description
                  </p>
                  <p className="text-sm">{propertyData.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Media & Documents */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-surface/90 backdrop-blur-lg border border-border/50 rounded-2xl shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle className="w-5 h-5 text-success" />
                    <h3 className="text-lg font-semibold">Photos & Media</h3>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      Images uploaded
                    </span>
                    <Chip variant="secondary">{propertyData.images} files</Chip>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-surface/90 backdrop-blur-lg border border-border/50 rounded-2xl shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle className="w-5 h-5 text-success" />
                    <h3 className="text-lg font-semibold">Documents</h3>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      Documents uploaded
                    </span>
                    <Chip variant="secondary">
                      {propertyData.documents} files
                    </Chip>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Amenities */}
            <Card className="bg-surface/90 backdrop-blur-lg border border-border/50 rounded-2xl shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <h3 className="text-lg font-semibold">
                    Amenities & Features
                  </h3>
                </div>

                <div className="flex flex-wrap gap-2">
                  {propertyData.amenities.map((amenity, index) => (
                    <Chip key={index} variant="secondary" size="sm">
                      {amenity}
                    </Chip>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Publishing Notice */}
            <Card className="bg-warning/5 border border-warning/20 rounded-2xl shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-warning mt-0.5" />
                  <div>
                    <h4 className="font-medium mb-2">Ready to Publish?</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Once published, your listing will be visible to potential
                      buyers and renters. You can edit or unpublish it anytime
                      from your listings dashboard.
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        Listing will be publicly visible
                      </span>
                      <span className="flex items-center gap-1">
                        <Send className="w-4 h-4" />
                        Notifications sent to interested users
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
            <Link href={`/owner/listings/new/documents?type=${propertyType}`}>
              <Button variant="ghost">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Documents
              </Button>
            </Link>
            <div className="flex gap-3">
              <Button variant="secondary">
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Button
                variant="default"
                onClick={handlePublish}
                disabled={isPublishing}
              >
                {isPublishing ? (
                  <>
                    <Spinner className="mr-2" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Publish Listing
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
