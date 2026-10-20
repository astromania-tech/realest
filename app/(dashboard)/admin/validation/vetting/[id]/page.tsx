import { prisma } from "@/lib/prisma";
import { requireAdminPage } from "@/lib/auth/require-admin-page";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";
import { VettingDecisionActions } from "@/components/realest/validation/VettingDecisionActions";
import { badgeWriteAllowed, observationConflicts } from "@/lib/trust/visit";
import { readPublicCase, readStoredVisit } from "@/lib/trust/visit-store";
import { caseStateLabel } from "@/lib/trust/case";
import { claimsBrief, type ClaimFinding } from "@/lib/trust/claims";

export default async function VettingReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireAdminPage();

  const property = await prisma.properties.findFirst({
    where: { id, status: "pending_vetting" },
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
      property_documents: { select: { id: true, document_type: true, file_name: true, document_url: true } },
      property_media: { select: { id: true, file_name: true, media_url: true }, take: 12 },
    },
  });
  if (!property) notFound();

  const [officers, visit] = await Promise.all([
    prisma.users.findMany({
      where: { role: "admin", is_active: true, deleted_at: null },
      select: { id: true, full_name: true },
      orderBy: { full_name: "asc" },
    }),
    readStoredVisit(property.id),
  ]);
  const record = await readPublicCase(property.id);
  const claims = Array.isArray(record.claims) ? record.claims as ClaimFinding[] : [];
  const badge = badgeWriteAllowed(visit);
  const conflicts = visit.sawBuilding === null || visit.addressMatches === null || visit.documentMatches === null || visit.distanceMeters === null
    ? []
    : observationConflicts({
        sawBuilding: visit.sawBuilding,
        addressMatches: visit.addressMatches,
        documentMatches: visit.documentMatches,
        distanceMeters: visit.distanceMeters,
      });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/admin/validation/vetting" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Vetting Queue
        </Link>
        <h1 className="font-heading text-3xl text-[#07402F]">Physical vetting</h1>
        <p className="text-muted-foreground">Approve only after a person has stood at the pin. Case: {caseStateLabel(visit.caseState)}.</p>
        {record.judgment ? <p className="mt-2 max-w-3xl text-sm">{record.judgment}</p> : null}
        {claims.length > 0 ? <p className="mt-2 text-sm">{claimsBrief(claims)}</p> : null}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{property.title}</CardTitle>
              <Badge variant="secondary">Pending field visit</Badge>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
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
              <p className="col-span-2 text-sm">{property.description}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Documents and photos on the listing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {property.property_documents.map((document) => (
                <p key={document.id}>
                  <Link href={document.document_url} target="_blank" rel="noopener noreferrer" className="underline">
                    {document.document_type}: {document.file_name}
                  </Link>
                </p>
              ))}
              {property.property_media.map((media) => (
                <p key={media.id}>
                  <Link href={media.media_url} target="_blank" rel="noopener noreferrer" className="underline">
                    Photo: {media.file_name}
                  </Link>
                </p>
              ))}
              {property.property_documents.length === 0 && property.property_media.length === 0 ? (
                <p className="text-muted-foreground">Nothing uploaded yet.</p>
              ) : null}
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Visit decision</CardTitle>
          </CardHeader>
          <CardContent>
            <VettingDecisionActions
              key={visit.registryReference ?? "no-registry-file"}
              propertyId={property.id}
              officers={officers}
              assignedOfficerId={visit.officerId}
              visitDay={visit.visitDay}
              documents={property.property_documents}
              canApprove={badge.ok}
              blockReason={badge.ok ? null : badge.error}
              conflicts={conflicts}
              openIssue={visit.openIssue}
              registryReference={visit.registryReference}
              registryMatches={visit.registryMatches}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
