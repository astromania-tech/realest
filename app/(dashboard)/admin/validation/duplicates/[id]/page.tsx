import { createClient, getAuthUser } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, ArrowLeft, Copy, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default async function DuplicateResolutionPage({
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
    .select("*, owners(profiles(full_name, email, phone))")
    .eq("id", params.id)
    .eq("verification_status", "duplicate_check")
    .single();

  if (!property) {
    notFound();
  }

  // Mock potential duplicate properties
  const potentialDuplicates = [
    {
      id: "dup1",
      title: "Similar 3BR Apartment in Lekki",
      location: "Lekki Phase 1, Lagos",
      price: 4500000,
      owner: "Jane Smith",
      similarity: 85,
    },
    {
      id: "dup2",
      title: "Luxury Apartment Lekki",
      location: "Lekki, Lagos",
      price: 5000000,
      owner: "Mike Johnson",
      similarity: 72,
    },
  ];

  return (
    <>
      <div className="min-h-screen bg-background">
        <div className="mb-8">
          <Link
            href="/admin/validation/duplicates"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Duplicate Queue
          </Link>
          <h1 className="text-3xl font-bold">Duplicate Resolution</h1>
          <p className="text-muted-foreground">
            Review potential duplicate listings
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current Property */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                Current Property
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{property.title}</h3>
                <p className="text-muted-foreground">{property.location}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Price</p>
                  <p className="font-medium">₦{property.price?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Type</p>
                  <p>{property.property_type}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Owner</p>
                  <p>{property.owners?.profiles?.full_name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Submitted</p>
                  <p>{new Date(property.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              <div>
                <p className="text-muted-foreground text-sm">Description</p>
                <p className="text-sm mt-1">{property.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Potential Duplicates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Copy className="w-5 h-5 text-red-600" />
                Potential Duplicates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {potentialDuplicates.map((dup) => (
                  <div key={dup.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium">{dup.title}</h4>
                      <Badge variant="destructive">{dup.similarity}% match</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{dup.location}</p>
                    <div className="flex justify-between text-sm">
                      <span>₦{dup.price.toLocaleString()}</span>
                      <span>Owner: {dup.owner}</span>
                    </div>
                    <Button variant="outline" size="sm" className="w-full">
                      Compare Details
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

        {/* Resolution Actions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Resolution Decision</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Add resolution notes and reasoning..."
              className="min-h-24"
            />

            <div className="flex gap-4">
              <Button className="flex-1" variant="outline">
                <XCircle className="w-4 h-4 mr-2" />
                Mark as Duplicate - Remove Listing
              </Button>
              <Button className="flex-1">
                <CheckCircle className="w-4 h-4 mr-2" />
                Not a Duplicate - Approve Listing
              </Button>
            </div>

            <div className="flex gap-4">
              <Button variant="secondary" className="flex-1">
                Request Owner Clarification
              </Button>
              <Button variant="ghost" className="flex-1">
                Escalate to Senior Admin
              </Button>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </>
  );
}
