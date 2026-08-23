"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Spinner } from "@heroui/react";
import { Card, CardContent, Button } from "@/components/ui";
import { ArrowLeft, Save } from "lucide-react";
import { PropertyListingForm } from "@/components/patterns/forms";

export default function PropertyDetailsStep() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const propertyType = searchParams.get("type") || "";
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!propertyType) {
      router.push("/owner/listings/new/type");
    }
  }, [propertyType, router]);

  const handleFormSubmit = async (formData: any) => {
    setIsLoading(true);
    try {
      // TODO: Save form data to session/localStorage or API
      console.log("Property details:", formData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Navigate to next step
      router.push(`/owner/listings/new/location?type=${propertyType}`);
    } catch (error) {
      console.error("Failed to save property details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!propertyType) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
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
              <Link href={`/owner/listings/new/type?type=${propertyType}`}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Property Details
                </h1>
                <p className="text-muted-foreground">
                  Add comprehensive information about your {propertyType}
                </p>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">Step 2 of 6</div>
          </div>

          {/* Form */}
          <Card className="bg-surface/90 backdrop-blur-lg border border-border/50 rounded-2xl shadow-lg">
            <CardContent className="p-8">
              <PropertyListingForm
                initialData={{ property_type: propertyType }}
                onSubmit={handleFormSubmit}
              />
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
            <Link href={`/owner/listings/new/type?type=${propertyType}`}>
              <Button variant="ghost">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Type
              </Button>
            </Link>
            <Button
              variant="default"
              onClick={() => document.querySelector("form")?.requestSubmit()}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Continue to Location
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
