import { createClient, getAuthUser } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, ArrowLeft, MapPin, Camera, FileText } from "lucide-react";
import Link from "next/link";

export default async function VettingReportPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await getAuthUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user is an admin
  const { data: userRow } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (userRow?.role !== "admin") {
    redirect("/");
  }

  // Fetch the specific property
  const { data: property } = await supabase
    .from("properties")
    .select("*, owners(profiles(full_name, email, phone)), property_documents(*)")
    .eq("id", params.id)
    .eq("verification_status", "vetting")
    .single();

  if (!property) {
    notFound();
  }

  // Mock vetting report data
  const vettingReport = {
    inspectorName: "John Adebayo",
    inspectionDate: "2024-01-15",
    locationVerified: true,
    propertyCondition: "Excellent",
    documentsVerified: true,
    photosTaken: 12,
    notes: "Property is in excellent condition. All amenities are present and functional. Location matches the provided address. Owner was cooperative during inspection.",
    recommendations: "Approve for listing"
  };

  return (
    <>
      <div className="min-h-screen bg-background container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link
            href="/admin/validation/vetting"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Vetting Queue
          </Link>
          <h1 className="text-3xl font-bold">Physical Vetting Report</h1>
          <p className="text-muted-foreground">
            Review physical inspection results for this property
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Property Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{property.title}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Physical Vetting</Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {vettingReport.locationVerified ? "Location Verified" : "Location Issue"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Property Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Type</p>
                      <p>{property.property_type}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Price</p>
                      <p>₦{property.price?.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Location</p>
                      <p>{property.location}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Owner</p>
                      <p>{property.owners?.profiles?.full_name}</p>
                      <div>
                        <p className="text-sm text-muted-foreground">{property.owners?.profiles?.email}</p>
                        <p className="text-sm text-muted-foreground">{property.owners?.profiles?.phone}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-sm">{property.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Inspection Photos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  Inspection Photos ({vettingReport.photosTaken})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Mock photo thumbnails */}
                  {Array.from({ length: vettingReport.photosTaken }, (_, i) => (
                    <div key={i} className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                      <Camera className="w-8 h-8 text-gray-400" />
                    </div>
                  ))}
                </div>
                  
                <Button variant="outline" className="mt-4">
                  View All Photos
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Vetting Report & Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Inspection Report</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Inspector</p>
                  <p className="font-medium">{vettingReport.inspectorName}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Inspection Date</p>
                  <p>{vettingReport.inspectionDate}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Property Condition</p>
                  <Badge variant="default">{vettingReport.propertyCondition}</Badge>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Documents Verified</p>
                  <Badge variant={vettingReport.documentsVerified ? "default" : "destructive"}>
                    {vettingReport.documentsVerified ? "Verified" : "Issues Found"}
                  </Badge>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Inspector Notes</p>
                  <p className="text-sm bg-muted p-3 rounded-lg">{vettingReport.notes}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Recommendations</p>
                  <p className="text-sm font-medium">{vettingReport.recommendations}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Final Decision</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Add final review notes..."
                  className="min-h-20"
                />

                <div className="flex gap-2">
                  <Button className="flex-1" variant="outline">
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject Listing
                  </Button>
                  <Button className="flex-1">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve Listing
                  </Button>
                </div>

                <Button variant="secondary" className="w-full">
                  Request Additional Info
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
