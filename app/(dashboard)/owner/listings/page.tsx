"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Chip,
  // Dropdown,
  // DropdownTrigger,
  // DropdownMenu,
  // DropdownItem,
} from "@heroui/react";

import {
  Card,
  CardContent,
  Button, 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui";

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
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { VerificationBadge, PropertyStatusChip } from "@/components/realest";

interface Property {
  id: string;
  title: string;
  address: string;
  city: string;
  property_type: string;
  listing_type: string;
  price: number;
  status: string;
  verification_status: string;
  created_at: string;
  views: number;
  inquiries: number;
  images_count: number;
  documents_count: number;
}

export default function OwnerListingsPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    const fetchProperties = async () => {
      // TODO: Replace with actual API call
      // For now, simulate loading
      setTimeout(() => {
        setProperties([
          {
            id: "1",
            title: "Modern 3BR Apartment in Lekki",
            address: "Admiralty Way",
            city: "Lagos",
            property_type: "apartment",
            listing_type: "rent",
            price: 2500000,
            status: "active",
            verification_status: "verified",
            created_at: "2024-01-15T10:00:00Z",
            views: 245,
            inquiries: 12,
            images_count: 8,
            documents_count: 3,
          },
          {
            id: "2",
            title: "Luxury Villa in Banana Island",
            address: "Banana Island",
            city: "Lagos",
            property_type: "house",
            listing_type: "sale",
            price: 15000000,
            status: "pending",
            verification_status: "under_review",
            created_at: "2024-01-10T08:00:00Z",
            views: 89,
            inquiries: 3,
            images_count: 12,
            documents_count: 5,
          },
          {
            id: "3",
            title: "Commercial Office Space",
            address: "Victoria Island",
            city: "Lagos",
            property_type: "office",
            listing_type: "rent",
            price: 5000000,
            status: "draft",
            verification_status: "pending",
            created_at: "2024-01-08T14:00:00Z",
            views: 0,
            inquiries: 0,
            images_count: 2,
            documents_count: 1,
          },
        ]);
        setIsLoading(false);
      }, 1000);
    };

    fetchProperties();
  }, []);

  const getPropertyTypeIcon = (type: string) => {
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
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "success";
      case "pending":
        return "warning";
      case "draft":
        return "default";
      case "inactive":
        return "danger";
      default:
        return "default";
    }
  };

  const filteredProperties = properties.filter((property) => {
    if (filter === "all") return true;
    return property.status === filter;
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded-lg mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-muted rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              My Listings
            </h1>
            <p className="text-muted-foreground">
              Manage your property listings and track their performance.
            </p>
          </div>
          <Link href="/owner/listings/new">
            <Button variant="default">
              <Plus className="w-4 h-4 mr-2" />
              Add New Property
            </Button>
          </Link>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-surface/90 backdrop-blur-lg border border-border/50 rounded-2xl shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Home className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{properties.length}</p>
                  <p className="text-sm text-muted-foreground">
                    Total Listings
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-surface/90 backdrop-blur-lg border border-border/50 rounded-2xl shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {properties.filter((p) => p.status === "active").length}
                  </p>
                  <p className="text-sm text-muted-foreground">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-surface/90 backdrop-blur-lg border border-border/50 rounded-2xl shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {properties.filter((p) => p.status === "pending").length}
                  </p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-surface/90 backdrop-blur-lg border border-border/50 rounded-2xl shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {properties.reduce((sum, p) => sum + p.views, 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Views</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { key: "all", label: "All Listings", count: properties.length },
            {
              key: "active",
              label: "Active",
              count: properties.filter((p) => p.status === "active").length,
            },
            {
              key: "pending",
              label: "Pending",
              count: properties.filter((p) => p.status === "pending").length,
            },
            {
              key: "draft",
              label: "Drafts",
              count: properties.filter((p) => p.status === "draft").length,
            },
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === key
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface/90 hover:bg-surface border border-border/50"
              }`}
            >
              {label} ({count})
            </button>
          ))}
        </div>

        {/* Properties Grid */}
        {filteredProperties.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-surface/90 backdrop-blur-lg border border-border/50 rounded-2xl p-8 max-w-md mx-auto shadow-lg">
              <Home className="w-12 h-12 text-primary mx-auto mb-4" />
              <p className="text-body-m text-muted-foreground mb-2">
                No {filter === "all" ? "" : filter} listings found.
              </p>
              <p className="text-body-s text-muted-foreground/80 mb-4">
                {filter === "all"
                  ? "Start by adding your first property listing."
                  : `You don't have any ${filter} listings.`}
              </p>
              <Link href="/owner/listings/new">
                <Button variant="default">
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Property
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property) => (
              <Card
                key={property.id}
                className="bg-surface/90 backdrop-blur-lg border border-border/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {/* Property Image */}
                <div className="relative h-48 bg-muted rounded-t-2xl overflow-hidden">
                  <div className="absolute inset-0 bg-linear-to-br from-primary/20 via-accent/10 to-primary/30" />

                  {/* Verification Badge */}
                  <div className="absolute top-3 left-3">
                    <VerificationBadge
                      status={
                        property.verification_status === "verified"
                          ? "geo-verified"
                          : "pending"
                      }
                      size="sm"
                      showTooltip={false}
                    />
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    <Chip
                      variant="secondary"
                      color={getStatusColor(property.status)}
                      size="sm"
                      className="capitalize"
                    >
                      {property.status}
                    </Chip>
                  </div>

                  {/* Property Type Icon */}
                  <div className="absolute bottom-3 left-3 w-8 h-8 bg-surface/90 backdrop-blur-sm border border-border/50 rounded-lg flex items-center justify-center">
                    {getPropertyTypeIcon(property.property_type)}
                  </div>
                </div>

                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold mb-1 line-clamp-2">
                        {property.title}
                      </h3>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                        <MapPin className="w-4 h-4 shrink-0 text-primary" />
                        <span className="line-clamp-1">
                          {property.address}, {property.city}
                        </span>
                      </div>
                    </div>

                    {/* Actions Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <Button variant="ghost" size="icon-sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <Link href={`/listing/${property.id}`}>
                          <DropdownMenuItem>
                            <Eye className="w-4 h-4 mr-2" />
                            View Listing
                          </DropdownMenuItem>
                        </Link>
                        <Link href={`/owner/listings/${property.id}`}>
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Listing
                          </DropdownMenuItem>
                        </Link>
                        <Link href={`/owner/listings/${property.id}/media`}>
                          <DropdownMenuItem>
                            <Image className="w-4 h-4 mr-2" />
                            Manage Media
                          </DropdownMenuItem>
                        </Link>
                        <Link href={`/owner/listings/${property.id}/documents`}>
                          <DropdownMenuItem>
                            <FileText className="w-4 h-4 mr-2" />
                            Manage Documents
                          </DropdownMenuItem>
                        </Link>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Price */}
                  <p className="text-xl font-bold bg-linear-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
                    ₦{property.price.toLocaleString()}
                    <span className="text-sm text-muted-foreground font-normal ml-1">
                      /{property.listing_type === "rent" ? "month" : "total"}
                    </span>
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-lg font-semibold">{property.views}</p>
                      <p className="text-xs text-muted-foreground">Views</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold">
                        {property.inquiries}
                      </p>
                      <p className="text-xs text-muted-foreground">Inquiries</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold">
                        {property.images_count}
                      </p>
                      <p className="text-xs text-muted-foreground">Photos</p>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex gap-2 mt-4">
                    <Link
                      href={`/owner/listings/${property.id}`}
                      className="flex-1"
                    >
                      <Button variant="secondary" size="sm" className="w-full">
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    </Link>
                    <Link href={`/listing/${property.id}`} className="flex-1">
                      <Button variant="ghost" size="sm" className="w-full">
                        <Eye className="w-4 h-4 mr-1" />
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
