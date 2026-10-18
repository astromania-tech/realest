import { prisma } from "@/lib/prisma";
import { requireAdminPage } from "@/lib/auth/require-admin-page";
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
  await requireAdminPage();

  const [documentGate, fieldVisit, duplicates, verifiedLive] = await Promise.all([
    prisma.properties.findMany({
      where: { status: "pending_ml_validation" },
      orderBy: { created_at: "asc" },
      select: {
        id: true,
        title: true,
        created_at: true,
        owners: { select: { profiles: { select: { full_name: true } } } },
      },
    }),
    prisma.properties.count({ where: { status: "pending_vetting" } }),
    prisma.properties.count({ where: { status: "pending_duplicate_review" } }),
    prisma.properties.count({ where: { status: "live", verification_status: "verified" } }),
  ]);

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
                <p className="text-2xl font-bold">{documentGate.length}</p>
                <p className="text-sm text-muted-foreground">Document gate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Eye className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{fieldVisit}</p>
                <p className="text-sm text-muted-foreground">Field visit</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <XCircle className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-2xl font-bold">{duplicates}</p>
                <p className="text-sm text-muted-foreground">Duplicates</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{verifiedLive}</p>
                <p className="text-sm text-muted-foreground">RealEST Verified</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-8">
        {/* Pending Properties */}
        <Card>
          <CardHeader>
            <CardTitle>Document gate</CardTitle>
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
                {documentGate.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No listings in the document gate
                    </TableCell>
                  </TableRow>
                ) : documentGate.map((property) => (
                  <TableRow key={property.id}>
                    <TableCell className="font-medium">{property.title}</TableCell>
                    <TableCell>{property.owners?.profiles?.full_name}</TableCell>
                    <TableCell>{property.created_at ? new Date(property.created_at).toLocaleDateString() : ""}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">Document gate</Badge>
                    </TableCell>
                    <TableCell>
                      <Button asChild size="sm">
                        <Link href={`/admin/validation/ml/${property.id}`}>Review</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
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
