import { createClient, getAuthUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, CheckCircle, XCircle, Clock } from "lucide-react";
import Link from "next/link";

export default async function ValidationPage() {
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

  // Fetch pending properties for validation
  const { data: pendingProperties } = await supabase
    .from("properties")
    .select("*, owners(profiles(full_name, email))")
    .eq("verification_status", "pending")
    .order("created_at", { ascending: true });

  // Fetch properties in ML review queue
  const { data: mlQueue } = await supabase
    .from("properties")
    .select("*, owners(profiles(full_name, email))")
    .eq("verification_status", "ml_review")
    .order("created_at", { ascending: true });

  // Fetch properties in physical vetting
  const { data: vettingQueue } = await supabase
    .from("properties")
    .select("*, owners(profiles(full_name, email))")
    .eq("verification_status", "vetting")
    .order("created_at", { ascending: true });

  // Fetch potential duplicates
  const { data: duplicates } = await supabase
    .from("properties")
    .select("*, owners(profiles(full_name, email))")
    .eq("verification_status", "duplicate_check")
    .order("created_at", { ascending: true });

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Property Validation Queue</h1>
        <p className="text-muted-foreground">
          Review and validate property submissions
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Clock className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">
                  {pendingProperties?.length || 0}
                </p>
                <p className="text-sm text-muted-foreground">Pending Review</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Eye className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{mlQueue?.length || 0}</p>
                <p className="text-sm text-muted-foreground">ML Review</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">
                  {vettingQueue?.length || 0}
                </p>
                <p className="text-sm text-muted-foreground">
                  Physical Vetting
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <XCircle className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-2xl font-bold">{duplicates?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Duplicates</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-8">
        {/* Pending Properties */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Properties</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingProperties?.map((property) => (
                  <TableRow key={property.id}>
                    <TableCell className="font-medium">
                      {property.title}
                    </TableCell>
                    <TableCell>{property.owners?.profiles?.full_name}</TableCell>
                    <TableCell>
                      {new Date(property.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">Pending</Badge>
                    </TableCell>
                    <TableCell>
                      <Button asChild size="sm">
                        <Link href={`/admin/validation/ml/${property.id}`}>
                          Review
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                )) || (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-muted-foreground"
                    >
                      No pending properties
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button asChild variant="outline">
            <Link href="/admin/validation/ml">ML Review Queue</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/validation/vetting">Physical Vetting</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/validation/duplicates">Duplicate Check</Link>
          </Button>
        </div>
      </div>
    </>
  );
}
