import { prisma } from "@/lib/prisma";
import { requireAdminPage } from "@/lib/auth/require-admin-page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, AlertTriangle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function MLReviewPage() {
  await requireAdminPage();

  const mlQueue = await prisma.properties.findMany({
    where: { status: "pending_ml_validation" },
    orderBy: { created_at: "asc" },
    select: {
      id: true,
      title: true,
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
          <h1 className="text-3xl font-bold">ML Review Queue</h1>
          <p className="text-muted-foreground">
            Properties flagged by ML for manual review
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              ML Flagged Properties ({mlQueue.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Gate</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mlQueue.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No properties in ML review queue
                    </TableCell>
                  </TableRow>
                ) : mlQueue.map((property) => (
                  <TableRow key={property.id}>
                    <TableCell className="font-medium">{property.title}</TableCell>
                    <TableCell>{property.owners?.profiles?.full_name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">Document gate</Badge>
                    </TableCell>
                    <TableCell>{property.created_at ? new Date(property.created_at).toLocaleDateString() : ""}</TableCell>
                    <TableCell>
                      <Button asChild size="sm">
                        <Link href={`/admin/validation/ml/${property.id}`}>
                          <Eye className="w-4 h-4 mr-1" />
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
