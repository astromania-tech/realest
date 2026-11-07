"use client";

import { useState } from "react";
import Link from "next/link";
import { Chip } from "@heroui/react";
import { Card, CardContent, Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui";
import {
  Plus,
  Edit,
  Eye,
  FileText,
  Image,
  MoreVertical,
  MapPin,
  Home,
  Building,
  Hotel,
  Briefcase,
  CheckCircle,
  Clock,
  MessageSquare,
} from "lucide-react";
import { VerificationBadge } from "@/components/realest";
import {
  OWNER_LISTING_FILTERS,
  ownerListingMatchesFilter,
  ownerListingPriceSuffix,
  ownerListingStatusLabel,
  type OwnerListingCard,
} from "@/lib/listings/owner-listings";

function propertyTypeIcon(type: string) {
  switch (type) {
    case "house":
      return <Home className="w-4 h-4" />;
    case "apartment":
      return <Building className="w-4 h-4" />;
    case "hotel":
      return <Hotel className="w-4 h-4" />;
    case "office":
      return <Briefcase className="w-4 h-4" />;
    default:
      return <Home className="w-4 h-4" />;
  }
}

function statusColor(status: string): "success" | "warning" | "danger" | "default" {
  if (status === "live") return "success";
  if (status === "pending_ml_validation" || status === "pending_vetting") return "warning";
  if (status === "rejected") return "danger";
  return "default";
}

export function OwnerListingsClient({ properties }: { properties: OwnerListingCard[] }) {
  const [filter, setFilter] = useState<string>("all");
  const filtered = properties.filter((property) => ownerListingMatchesFilter(property.status, filter));
  const liveCount = properties.filter((property) => property.status === "live").length;
  const reviewCount = properties.filter((property) => ownerListingMatchesFilter(property.status, "review")).length;
  const inquiryCount = properties.reduce((sum, property) => sum + property.inquiries, 0);

  return (
    <div className="w-full max-w-7xl mx-auto py-4 sm:py-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-foreground">My Listings</h1>
            <p className="text-muted-foreground">Manage your property listings and track their performance.</p>
          </div>
          <Link href="/owner/listings/new">
            <Button variant="default">
              <Plus className="mr-2 h-4 w-4" />
              Add New Property
            </Button>
          </Link>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-3 sm:mb-8 sm:gap-4 lg:grid-cols-4">
          <Card className="rounded-2xl border border-border/50 bg-surface/90 shadow-lg backdrop-blur-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Home className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{properties.length}</p>
                  <p className="text-sm text-muted-foreground">Total Listings</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border border-border/50 bg-surface/90 shadow-lg backdrop-blur-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
                  <CheckCircle className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{liveCount}</p>
                  <p className="text-sm text-muted-foreground">Live</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border border-border/50 bg-surface/90 shadow-lg backdrop-blur-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-warning/10">
                  <Clock className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{reviewCount}</p>
                  <p className="text-sm text-muted-foreground">In review</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border border-border/50 bg-surface/90 shadow-lg backdrop-blur-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                  <MessageSquare className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{inquiryCount}</p>
                  <p className="text-sm text-muted-foreground">Inquiries</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {OWNER_LISTING_FILTERS.map(({ key, label }) => {
            const count = properties.filter((property) => ownerListingMatchesFilter(property.status, key)).length;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  filter === key
                    ? "bg-primary text-primary-foreground"
                    : "border border-border/50 bg-surface/90 hover:bg-surface"
                }`}
              >
                {label} ({count})
              </button>
            );
          })}
        </div>

        {filtered.length === 0 ? (
          <div className="py-12 text-center">
            <div className="mx-auto max-w-md rounded-2xl border border-border/50 bg-surface/90 p-8 shadow-lg backdrop-blur-lg">
              <Home className="mx-auto mb-4 h-12 w-12 text-primary" />
              <p className="mb-2 text-muted-foreground">
                {filter === "all" ? "No listings yet." : "Nothing in this tab."}
              </p>
              <p className="mb-4 text-sm text-muted-foreground/80">
                {filter === "all"
                  ? "Start by adding your first property listing."
                  : "Listings move here when their status matches."}
              </p>
              <Link href="/owner/listings/new">
                <Button variant="default">
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Property
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {filtered.map((property) => (
              <Card
                key={property.id}
                className="rounded-2xl border border-border/50 bg-surface/90 shadow-lg backdrop-blur-lg transition-all duration-300 hover:shadow-xl"
              >
                <div className="relative h-48 overflow-hidden rounded-t-2xl bg-muted">
                  <div className="absolute inset-0 bg-linear-to-br from-primary/20 via-accent/10 to-primary/30" />
                  <div className="absolute left-3 top-3">
                    <VerificationBadge
                      status={property.verification_status === "verified" ? "geo-verified" : "pending"}
                      size="sm"
                      showTooltip={false}
                    />
                  </div>
                  <div className="absolute right-3 top-3">
                    <Chip variant="secondary" color={statusColor(property.status)} size="sm">
                      {ownerListingStatusLabel(property.status)}
                    </Chip>
                  </div>
                  <div className="absolute bottom-3 left-3 flex h-8 w-8 items-center justify-center rounded-lg border border-border/50 bg-surface/90 backdrop-blur-sm">
                    {propertyTypeIcon(property.property_type)}
                  </div>
                </div>

                <CardContent className="p-6">
                  <div className="mb-3 flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="mb-1 line-clamp-2 text-lg font-semibold">{property.title}</h3>
                      <div className="mb-2 flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 shrink-0 text-primary" />
                        <span className="line-clamp-1">
                          {property.address}, {property.city}
                        </span>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm" aria-label="Listing actions">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem asChild>
                          <Link href={`/listing/${property.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Listing
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/owner/listings/${property.id}`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Listing
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/owner/listings/${property.id}/media`}>
                            <Image className="mr-2 h-4 w-4" />
                            Manage Media
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/owner/listings/${property.id}/documents`}>
                            <FileText className="mr-2 h-4 w-4" />
                            Manage Documents
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <p className="mb-4 bg-linear-to-r from-primary to-accent bg-clip-text text-xl font-bold text-transparent">
                    ₦{property.price.toLocaleString("en-NG")}
                    <span className="ml-1 text-sm font-normal text-muted-foreground">
                      {ownerListingPriceSuffix(property.listing_type, property.price_frequency)}
                    </span>
                  </p>

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-lg font-semibold">{property.inquiries}</p>
                      <p className="text-xs text-muted-foreground">Inquiries</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold">{property.images_count}</p>
                      <p className="text-xs text-muted-foreground">Photos</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold">{property.documents_count}</p>
                      <p className="text-xs text-muted-foreground">Documents</p>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Link href={`/owner/listings/${property.id}`} className="flex-1">
                      <Button variant="secondary" size="sm" className="w-full">
                        <Edit className="mr-1 h-4 w-4" />
                        Edit
                      </Button>
                    </Link>
                    <Link href={`/listing/${property.id}`} className="flex-1">
                      <Button variant="ghost" size="sm" className="w-full">
                        <Eye className="mr-1 h-4 w-4" />
                        View
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
