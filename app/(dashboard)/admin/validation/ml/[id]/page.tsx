import { prisma } from "@/lib/prisma";
import { requireAdminPage } from "@/lib/auth/require-admin-page";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";
import { readTrustDecision } from "@/lib/trust/gate";
import { TrustReviewActions } from "@/components/realest/validation/TrustReviewActions";

export default async function MLReviewDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireAdminPage();

  const property = await prisma.properties.findFirst({
    where: { id, status: "pending_ml_validation" },
    select: {
      id: true,
      title: true,
      description: true,
      price: true,
      property_type: true,
      address: true,
      city: true,
      state: true,
      owners: { select: { profiles: { select: { full_name: true } } } },
      property_documents: {
        select: { id: true, document_type: true, file_name: true, document_url: true, created_at: true },
      },
    },
  });
  if (!property) notFound();

  const job = await prisma.property_validation_jobs.findFirst({
    where: { property_id: id, job_kind: "property", source: "trust-reader", status: "completed" },
    orderBy: { queued_at: "desc" },
    select: { result: true },
  });
  const trust = readTrustDecision(job?.result);

  return (
    <div className="container mx-auto px-4">
      <div className="mb-8">
        <Link href="/admin/validation/ml" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to ML Review Queue
        </Link>
        <h1 className="text-3xl font-bold">Document gate</h1>
        <p className="text-muted-foreground">The reader reports facts. A person sends the listing to the field visit.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{property.title}</CardTitle>
              <Badge variant="secondary">Pending document gate</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Type</p>
                  <p>{property.property_type}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Price</p>
                  <p>₦{Number(property.price).toLocaleString("en-NG")}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Address</p>
                  <p>{[property.address, property.city, property.state].filter(Boolean).join(", ")}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Owner</p>
                  <p>{property.owners?.profiles.full_name}</p>
                </div>
              </div>
              <p className="text-sm">{property.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Submitted documents
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {property.property_documents.length === 0 ? (
                <p className="text-muted-foreground">No documents submitted</p>
              ) : (
                property.property_documents.map((document) => (
                  <div key={document.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{document.document_type}</p>
                      <p className="text-sm text-muted-foreground">{document.file_name}</p>
                    </div>
                    <Link href={document.document_url} target="_blank" rel="noopener noreferrer" className="text-sm underline">
                      View
                    </Link>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Reader result</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {trust ? (
                <>
                  <p>Decision: {trust.decision}</p>
                  <p>Hard blocks: {trust.hardBlocks.length ? trust.hardBlocks.join(", ") : "none"}</p>
                  <p>Flags: {trust.flags.length ? trust.flags.join(", ") : "none"}</p>
                </>
              ) : (
                <p>The trust reader has not finished this listing. Approve stays closed.</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Review</CardTitle>
            </CardHeader>
            <CardContent>
              <TrustReviewActions propertyId={property.id} allowsVetting={trust?.allowsVetting === true} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
