import { createClient, getAuthUser } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, ArrowLeft, FileText, Image, MapPin } from "lucide-react";
import Link from "next/link";

export default async function MLReviewDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
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
    .eq("id", (await params).id)
    .eq("verification_status", "ml_review")
    .single();

  if (!property) {
    notFound();
  }

  // Mock ML analysis data
  const mlAnalysis = {
    authenticityScore: 85,
    duplicateRisk: "Low",
    flaggedIssues: ["Document quality", "Location verification"],
    recommendations: "Approve with physical vetting required"
  };

  return (
    <>
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <Link
            href="/admin/validation/ml"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to ML Review Queue
          </Link>
          <h1 className="text-3xl font-bold">ML Document Review</h1>
          <p className="text-muted-foreground">
            Review property details and ML analysis
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Property Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{property.title}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">ML Review</Badge>
                  <Badge variant="outline">Authenticity: {mlAnalysis.authenticityScore}%</Badge>
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
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-sm">{property.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Documents */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Submitted Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {property.property_documents?.map((doc: any) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {doc.document_type === 'image' ? (
                          <Image className="w-5 h-5 text-blue-600" />
                        ) : (
                          <FileText className="w-5 h-5 text-green-600" />
                        )}
                        <div>
                          <p className="font-medium">{doc.document_type}</p>
                          <p className="text-sm text-muted-foreground">
                            Uploaded {new Date(doc.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </div>
                  )) || (
                    <p className="text-muted-foreground">No documents submitted</p>
                  )}
                </div>
              </CardContent>
            </Card>

          {/* ML Analysis & Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>ML Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Authenticity Score</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${mlAnalysis.authenticityScore}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{mlAnalysis.authenticityScore}%</span>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Duplicate Risk</p>
                  <Badge variant={mlAnalysis.duplicateRisk === 'Low' ? 'default' : 'destructive'}>
                    {mlAnalysis.duplicateRisk}
                  </Badge>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Flagged Issues</p>
                  <ul className="text-sm space-y-1">
                    {mlAnalysis.flaggedIssues.map((issue, index) => (
                      <li key={index} className="flex items-center gap-2">
                        {issue}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Recommendation</p>
                  <p className="text-sm">{mlAnalysis.recommendations}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Review Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Add review notes..."
                  className="min-h-20"
                />

                <div className="flex gap-2">
                  <Button className="flex-1" variant="outline">
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                  <Button className="flex-1">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                </div>

                <Button variant="secondary" className="w-full">
                  Send to Physical Vetting
                </Button>
              </CardContent>
            </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
