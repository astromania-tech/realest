import { createClient, getAuthUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, AlertTriangle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function MLReviewPage() {
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

  // Fetch properties in ML review queue
  const { data: mlQueue } = await supabase
    .from("properties")
    .select("*, owners(profiles(full_name, email))")
    .eq("verification_status", "ml_review")
    .order("created_at", { ascending: true });

  return (
    <>
        <div className="mb-8">
          <Link
            href="/admin/validation"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Validation Queue
          </Link>
          <h1 className="text-3xl font-bold">ML Review Queue</h1>
          <p className="text-muted-foreground">
            Properties flagged by ML for manual review
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              ML Flagged Properties ({mlQueue?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>ML Score</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mlQueue?.map((property) => (
                  <TableRow key={property.id}>
                    <TableCell className="font-medium">{property.title}</TableCell>
                    <TableCell>{property.owners?.profiles?.full_name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {property.ml_score || "N/A"}%
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(property.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button asChild size="sm">
                        <Link href={`/admin/validation/ml/${property.id}`}>
                          <Eye className="w-4 h-4 mr-1" />
                          Review
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                )) || (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No properties in ML review queue
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
    </>
  );
}
