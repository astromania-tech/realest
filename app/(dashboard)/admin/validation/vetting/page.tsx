import { prisma } from "@/lib/prisma";
import { requireAdminPage } from "@/lib/auth/require-admin-page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MapPin, ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";

export default async function VettingPage() {
  await requireAdminPage();

  const vettingQueue = await prisma.properties.findMany({
    where: { status: "pending_vetting" },
    orderBy: { created_at: "asc" },
    select: {
      id: true,
      title: true,
      address: true,
      city: true,
      created_at: true,
      owners: { select: { profiles: { select: { full_name: true } } } },
    },
  });

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
          <h1 className="text-3xl font-bold">Physical Vetting Queue</h1>
          <p className="text-muted-foreground">
            Properties requiring physical inspection and verification
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-green-600" />
              Physical Vetting Queue ({vettingQueue.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vettingQueue.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No properties in physical vetting queue
                    </TableCell>
                  </TableRow>
                ) : vettingQueue.map((property) => (
                  <TableRow key={property.id}>
                    <TableCell className="font-medium">{property.title}</TableCell>
                    <TableCell>{property.owners?.profiles?.full_name}</TableCell>
                    <TableCell>{[property.address, property.city].filter(Boolean).join(", ")}</TableCell>
                    <TableCell>{property.created_at ? new Date(property.created_at).toLocaleDateString() : ""}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">Vetting</Badge>
                    </TableCell>
                    <TableCell>
                      <Button asChild size="sm">
                        <Link href={`/admin/validation/vetting/${property.id}`}>
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Review
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
    </>
  );
}
