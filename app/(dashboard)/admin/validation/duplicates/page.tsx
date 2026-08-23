import { createClient, getAuthUser} from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Copy, ArrowLeft, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default async function DuplicatesPage() {
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

  // Fetch potential duplicate properties
  const { data: duplicates } = await supabase
    .from("properties")
    .select("*, owners(profiles(full_name, email))")
    .eq("verification_status", "duplicate_check")
    .order("created_at", { ascending: true });

  return (
    <>
      <div className="min-h-screen bg-background">
        <div className="mb-8">
          <Link
            href="/admin/validation"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Validation Queue
          </Link>
          <h1 className="text-3xl font-bold">Duplicate Review Queue</h1>
          <p className="text-muted-foreground">
            Review properties flagged as potential duplicates
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Copy className="w-5 h-5 text-orange-600" />
              Potential Duplicates ({duplicates?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Similarity Score</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {duplicates?.map((property) => (
                  <TableRow key={property.id}>
                    <TableCell className="font-medium">{property.title}</TableCell>
                    <TableCell>{property.owners?.profiles?.full_name}</TableCell>
                    <TableCell>{property.location}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {property.similarity_score || "N/A"}%
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(property.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button asChild size="sm">
                        <Link href={`/admin/validation/duplicates/${property.id}`}>
                          <AlertTriangle className="w-4 h-4 mr-1" />
                          Review
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                )) || (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No potential duplicates found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
