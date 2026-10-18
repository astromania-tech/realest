import { prisma } from "@/lib/prisma";
import { requireAdminPage } from "@/lib/auth/require-admin-page";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Copy, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { propertiesWithinRadius } from "@/lib/geo/properties-within-radius";
import { readTrustDecision } from "@/lib/trust/gate";
import { matchedPropertyIdsFromResult, selectDuplicateMatches } from "@/lib/trust/matches";
import { DUPLICATE_CANDIDATE_STATUSES, DUPLICATE_RADIUS_METERS } from "@/lib/trust/types";
import { DuplicateResolutionActions } from "@/components/realest/validation/DuplicateResolutionActions";

function toNumber(value: { toString(): string } | number | null): number | null {
  if (value === null) return null;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export default async function DuplicateResolutionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminPage();
  const { id } = await params;

  const property = await prisma.properties.findFirst({
    where: { id, status: "pending_duplicate_review" },
    select: {
      id: true,
      title: true,
      description: true,
      price: true,
      property_type: true,
      address: true,
      city: true,
      state: true,
      latitude: true,
      longitude: true,
      created_at: true,
      owners: { select: { profiles: { select: { full_name: true } } } },
    },
  });
  if (!property) notFound();

  const job = await prisma.property_validation_jobs.findFirst({
    where: {
      property_id: id,
      status: "completed",
      source: "trust-reader",
      job_kind: { in: ["property", "duplicate"] },
    },
    orderBy: { queued_at: "desc" },
    select: { result: true },
  });
  const trust = readTrustDecision(job?.result);
  const hardBlocks = trust?.hardBlocks.filter((block) => block.startsWith("duplicate_")) ?? [];

  const latitude = toNumber(property.latitude);
  const longitude = toNumber(property.longitude);
  let pinIds: string[] = [];
  let pinSearchFailed = false;
  if (latitude !== null && longitude !== null) {
    try {
      const rows = await propertiesWithinRadius({
        lat: latitude,
        lng: longitude,
        radiusKm: DUPLICATE_RADIUS_METERS / 1000,
        excludePropertyId: id,
      });
      pinIds = rows.map((row) => row.id);
    } catch (error) {
      console.error("[validation] Duplicate pin search failed:", error);
      pinSearchFailed = true;
    }
  }

  const storedIds = matchedPropertyIdsFromResult(job?.result);
  const peerSelect = {
    id: true,
    title: true,
    address: true,
    city: true,
    state: true,
    status: true,
    price: true,
    latitude: true,
    longitude: true,
    owners: { select: { profiles: { select: { full_name: true } } } },
  } as const;
  const extraIds = [...new Set([...pinIds, ...storedIds])];
  const [cityPeers, pinnedPeers, addressPeers] = await Promise.all([
    prisma.properties.findMany({
      where: {
        id: { not: id },
        city: property.city,
        status: { in: [...DUPLICATE_CANDIDATE_STATUSES] },
      },
      select: peerSelect,
      take: 200,
    }),
    extraIds.length === 0
      ? Promise.resolve([])
      : prisma.properties.findMany({
          where: { id: { in: extraIds }, status: { in: [...DUPLICATE_CANDIDATE_STATUSES] } },
          select: peerSelect,
        }),
    prisma.properties.findMany({
      where: {
        id: { not: id },
        status: { in: [...DUPLICATE_CANDIDATE_STATUSES] },
        address: { equals: property.address, mode: "insensitive" },
      },
      select: peerSelect,
      take: 20,
    }),
  ]);
  const seen = new Set<string>();
  const peers = [...pinnedPeers, ...addressPeers, ...cityPeers].filter((peer) => {
    if (seen.has(peer.id)) return false;
    seen.add(peer.id);
    return true;
  });

  const matches = selectDuplicateMatches({
    address: property.address,
    latitude,
    longitude,
    candidates: peers.map((peer) => ({
      id: peer.id,
      address: peer.address,
      latitude: toNumber(peer.latitude),
      longitude: toNumber(peer.longitude),
      status: peer.status,
    })),
  });
  const matchById = new Map(matches.map((match) => [match.id, match]));
  const shown = peers.filter((peer) => matchById.has(peer.id) || storedIds.includes(peer.id));

  return (
    <div className="min-h-screen bg-background">
      <div className="mb-8">
        <Link href="/admin/validation/duplicates" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Duplicate Queue
        </Link>
        <h1 className="text-3xl font-bold">Duplicate Resolution</h1>
        <p className="text-muted-foreground">Reject the listing or leave it here. Vetting stays closed while a duplicate block stands.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
              <p className="text-muted-foreground">{[property.address, property.city, property.state].filter(Boolean).join(", ")}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Price</p>
                <p className="font-medium">₦{Number(property.price).toLocaleString("en-NG")}</p>
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
                <p>{property.created_at ? new Date(property.created_at).toLocaleDateString() : ""}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {hardBlocks.length === 0 ? (
                <Badge variant="secondary">No duplicate block stored on the latest reader job</Badge>
              ) : (
                hardBlocks.map((block) => (
                  <Badge key={block} variant="destructive">
                    {block}
                  </Badge>
                ))
              )}
            </div>
            {property.description ? (
              <div>
                <p className="text-muted-foreground text-sm">Description</p>
                <p className="text-sm mt-1">{property.description}</p>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Copy className="w-5 h-5 text-red-600" />
              Matching listings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {pinSearchFailed ? (
              <p className="text-sm text-muted-foreground">Pin search is unavailable. Address matches are still listed.</p>
            ) : null}
            {shown.length === 0 ? (
              <p className="text-sm text-muted-foreground">No other live or in-progress listing matches this address or the 50 meter pin.</p>
            ) : (
              shown.map((peer) => {
                const match = matchById.get(peer.id);
                return (
                  <div key={peer.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="font-medium">{peer.title}</h4>
                      <Badge variant="secondary">{match?.reason ?? peer.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{[peer.address, peer.city, peer.state].filter(Boolean).join(", ")}</p>
                    <div className="flex justify-between text-sm">
                      <span>₦{Number(peer.price).toLocaleString("en-NG")}</span>
                      <span>{peer.owners?.profiles?.full_name}</span>
                    </div>
                    {match?.meters !== null && match?.meters !== undefined ? (
                      <p className="text-sm text-muted-foreground">{Math.round(match.meters)} m from this pin</p>
                    ) : null}
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Resolution</CardTitle>
        </CardHeader>
        <CardContent>
          <DuplicateResolutionActions propertyId={property.id} />
        </CardContent>
      </Card>
    </div>
  );
}
