"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, Button, Input, Spinner } from "@/components/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, MapPin, Save, Navigation } from "lucide-react";

const nigerianStates = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
];

export default function PropertyLocationStep() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const propertyType = searchParams.get("type") || "";
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingPostcode, setIsCheckingPostcode] = useState(false);
  const [postcodeNote, setPostcodeNote] = useState("");
  const [postcodeChecked, setPostcodeChecked] = useState("");
  const [formData, setFormData] = useState({
    address: "",
    city: "",
    state: "",
    postalCode: "",
    latitude: "",
    longitude: "",
  });

  useEffect(() => {
    if (!propertyType) {
      router.push("/owner/listings/new/type");
    }
  }, [propertyType, router]);

  const handleInputChange = (field: string, value: string) => {
    if (field === "postalCode") {
      setPostcodeChecked("");
      setPostcodeNote("");
    }
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const checkPostcode = async () => {
    const code = formData.postalCode.trim();
    if (!code) {
      setPostcodeNote("");
      setPostcodeChecked("");
      return true;
    }
    setIsCheckingPostcode(true);
    setPostcodeNote("");
    try {
      const response = await fetch(`/api/postcode/lookup?code=${encodeURIComponent(code)}`);
      const body = await response.json();
      if (!response.ok) {
        setPostcodeChecked("");
        setPostcodeNote(body.error || "NIPOST lookup failed");
        return false;
      }
      const place = [body.recentHouseAddress, body.lgaName, body.stateName].filter(Boolean).join(", ");
      setPostcodeChecked(body.postcode);
      setFormData((prev) => ({ ...prev, postalCode: body.postcode }));
      setPostcodeNote(place ? `NIPOST verified ${body.postcode}. ${place}` : `NIPOST verified ${body.postcode}`);
      return true;
    } catch {
      setPostcodeChecked("");
      setPostcodeNote("NIPOST lookup failed");
      return false;
    } finally {
      setIsCheckingPostcode(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const code = formData.postalCode.trim();
      if (code && postcodeChecked !== code) {
        const verified = await checkPostcode();
        if (!verified) return;
      }

      router.push(`/owner/listings/new/media?type=${propertyType}`);
    } catch (error) {
      console.error("Failed to save location:", error);
    } finally {
      setIsLoading(false);
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
      <div className="w-full max-w-7xl mx-auto py-4 sm:py-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <div className="flex items-center gap-4">
              <Link href={`/owner/listings/new/details?type=${propertyType}`}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Property Location
                </h1>
                <p className="text-muted-foreground">
                  Specify the exact location of your {propertyType}
                </p>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">Step 3 of 6</div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Form Section */}
              <div>
                <Card className="bg-surface/90 backdrop-blur-lg border border-border/50 rounded-2xl shadow-lg">
                  <CardContent className="p-8">
                    <h3 className="text-lg font-semibold mb-6">
                      Location Details
                    </h3>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Street Address
                        </label>
                        <Input
                          type="text"
                          placeholder="Enter full street address"
                          value={formData.address}
                          onChange={(e) =>
                            handleInputChange("address", e.target.value)
                          }
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            City
                          </label>
                          <Input
                            type="text"
                            placeholder="Enter city"
                            value={formData.city}
                            onChange={(e) =>
                              handleInputChange("city", e.target.value)
                            }
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            State
                          </label>
                          <Select
                            value={formData.state}
                            onValueChange={(value) =>
                              handleInputChange("state", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select state" />
                            </SelectTrigger>
                            <SelectContent>
                              {nigerianStates.map((state) => (
                                <SelectItem key={state} value={state}>
                                  {state}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          NIPOST postcode (optional)
                        </label>
                        <div className="flex gap-2">
                          <Input
                            type="text"
                            placeholder="LA-11-W06-TC-10"
                            value={formData.postalCode}
                            onChange={(e) =>
                              handleInputChange("postalCode", e.target.value)
                            }
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="secondary"
                            disabled={isCheckingPostcode || !formData.postalCode.trim()}
                            onClick={() => {
                              void checkPostcode();
                            }}
                          >
                            {isCheckingPostcode ? "Checking" : "Check"}
                          </Button>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {postcodeNote || "Five parts, for example LA-11-W06-TC-10. A check uses one NIPOST credit."}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-border">
                        <Button variant="secondary" className="w-full">
                          <Navigation className="w-4 h-4 mr-2" />
                          Get Current Location
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Map Preview Section */}
              <div>
                <Card className="bg-surface/90 backdrop-blur-lg border border-border/50 rounded-2xl shadow-lg">
                  <CardContent className="p-8">
                    <h3 className="text-lg font-semibold mb-6">Map Preview</h3>

                    {/* Placeholder for map */}
                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-4">
                      <div className="text-center">
                        <MapPin className="w-12 h-12 text-primary mx-auto mb-2" />
                        <p className="text-muted-foreground">
                          Map integration coming soon
                        </p>
                        <p className="text-sm text-muted-foreground/80">
                          Enter your address above to see the location on map
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Latitude:</span>
                        <span>{formData.latitude || "Not set"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Longitude:
                        </span>
                        <span>{formData.longitude || "Not set"}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
              <Link href={`/owner/listings/new/details?type=${propertyType}`}>
                <Button variant="ghost">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Details
                </Button>
              </Link>
              <Button type="submit" variant="default" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Spinner className="mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Continue to Media
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Help Text */}
          <div className="mt-8 p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <h4 className="font-medium mb-2">
              📍 Accurate Location Information
            </h4>
            <p className="text-sm text-muted-foreground">
              Providing accurate location details helps potential buyers or
              renters find your property easily and increases trust in your
              listing. Use the current location feature or enter the address
              manually.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
