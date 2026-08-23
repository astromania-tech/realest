"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  StatusBadge,
  VerifiedBadge,
  PendingBadge,
  FeaturedBadge,
  NewBadge,
} from "@/components/ui/status-badge";
import {
  PropertyStatusChip,
  AvailableChip,
  PendingChip,
  BookedChip,
  FeaturedChip,
  ExclusiveChip,
  FreshListingChip,
  UnderOfferChip,
  PropertyStatusGroup,
} from "@/components/realest/badges/PropertyStatusChip";
import {
  AmenityBadge,
  PowerBadge,
  WaterBadge,
  SecurityBadge,
  InternetBadge,
  BoysQuartersBadge,
  ParkingBadge,
  PoolBadge,
  GymBadge,
  GeneratorBadge,
  InverterBadge,
  SolarBadge,
  WaterTankBadge,
  WaterTreatmentBadge,
  AmenityBadgeGroup,
  createAmenityBadges,
} from "@/components/realest/badges";
import {
  PropertyTypeBadge,
  HouseBadge,
  ApartmentBadge,
  LandBadge,
  CommercialBadge,
  HotelBadge,
  OfficeBadge,
  DuplexBadge,
  BungalowBadge,
  SelfContainedBadge,
  ResidentialLandBadge,
  CommercialLandBadge,
} from "@/components/realest/badges/PropertyTypeBadge";
import { ProfileDropdown } from "@/components/realest";
import { ProfileUpload } from "@/components/realest/ProfileUpload";
import { PropertyListingForm } from "@/components/patterns/forms";

export default function DesignShowcasePage() {
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header with Theme Toggle */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-brand-violet">
              RealEST
            </h1>
            <p className="text-sm text-muted-foreground">
              Design System Showcase
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={toggleDarkMode}>
              {darkMode ? "☀️ Light" : "🌙 Dark"}
            </Button>
            <Button variant="neon" size="sm">
              Find Your Next Move
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 space-y-24">
        {/* Brand Identity Section */}
        <section className="space-y-8">
          <div className="text-center space-y-4">
            <h1 className="font-display text-5xl lg:text-6xl font-bold bg-gradient-brand bg-clip-text text-transparent">
              RealEST Design System
            </h1>
            <p className="font-body text-xl text-muted-foreground max-w-3xl mx-auto">
              Conservative Professional Palette • 60-30-10 Color Architecture •
              Nigerian Real Estate Marketplace
            </p>
          </div>

          {/* Color Palette */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 60% Foundation */}
            <div className="space-y-4">
              <h3 className="font-heading text-xl font-semibold">
                60% Foundation
              </h3>
              <div className="bg-brand-dark rounded-xl p-6 text-white">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Primary Dark</span>
                    <code className="text-sm opacity-75">#242834</code>
                  </div>
                  <p className="text-sm opacity-90">
                    Base UI, Headers, Navigation, Footers, Cards - The
                    foundation that reinforces trust and professionalism
                  </p>
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    <div className="bg-white/10 rounded-lg p-2 text-xs text-center">
                      Default
                    </div>
                    <div className="bg-white/20 rounded-lg p-2 text-xs text-center">
                      Hover
                    </div>
                    <div className="bg-white/5 rounded-lg p-2 text-xs text-center">
                      Pressed
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 30% Neutrals */}
            <div className="space-y-4">
              <h3 className="font-heading text-xl font-semibold">
                30% Neutrals
              </h3>
              <div className="bg-card border border-border rounded-xl p-6 space-y-3">
                <div className="space-y-3">
                  <div className="bg-gray-50 rounded-lg p-3 text-center text-sm font-medium">
                    Grey 100 - #F7F8FA
                  </div>
                  <div className="bg-gray-200 rounded-lg p-3 text-center text-sm font-medium">
                    Grey 300 - #D7DAE2
                  </div>
                  <div className="bg-gray-500 rounded-lg p-3 text-center text-sm font-medium text-white">
                    Grey 500 - #9EA3B3
                  </div>
                  <div className="bg-gray-700 rounded-lg p-3 text-center text-sm font-medium text-white">
                    Grey 700 - #52586A
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Body text, Form inputs, Card surfaces, Corporate-clean balance
                </p>
              </div>
            </div>

            {/* 10% Accents */}
            <div className="space-y-4">
              <h3 className="font-heading text-xl font-semibold">
                10% Accents
              </h3>
              <div className="space-y-3">
                <div className="bg-brand-neon rounded-xl p-4 text-brand-dark">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">Neon Green</span>
                    <code className="text-xs">#B6FF00</code>
                  </div>
                  <p className="text-xs">
                    Primary CTAs, Active states, Success alerts
                  </p>
                </div>
                <div className="bg-brand-violet rounded-xl p-4 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">Violet</span>
                    <code className="text-xs">#7D53FF</code>
                  </div>
                  <p className="text-xs">
                    Secondary CTAs, Gradients, Interactive elements
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Typography Architecture */}
        <section className="space-y-8">
          <div className="text-center">
            <h2 className="font-heading text-4xl font-bold mb-4">
              Typography Architecture
            </h2>
            <p className="text-muted-foreground">
              Four-tier typography system with Nigerian market considerations
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Display Typeface */}
            <div className="card-enhanced p-8 space-y-6">
              <div>
                <h3 className="font-heading text-xl font-semibold mb-2">
                  Display • Lufga
                </h3>
                <p className="text-sm text-muted-foreground">
                  Hero sections, Brand moments, Landing headlines
                </p>
              </div>
              <div className="space-y-4">
                <div className="font-display text-5xl font-bold">
                  Find Your Next Move
                </div>
                <div className="font-display text-3xl font-bold">
                  Premium Properties
                </div>
                <div className="font-display text-2xl font-bold">
                  Verified Listings
                </div>
              </div>
            </div>

            {/* Heading Typeface */}
            <div className="card-enhanced p-8 space-y-6">
              <div>
                <h3 className="font-heading text-xl font-semibold mb-2">
                  Heading • Neulis Neue
                </h3>
                <p className="text-sm text-muted-foreground">
                  Page titles, Section headers, Card titles
                </p>
              </div>
              <div className="space-y-3">
                <h1 className="font-heading text-3xl font-bold">
                  Welcome to RealEST
                </h1>
                <h2 className="font-heading text-2xl font-semibold">
                  Featured Properties
                </h2>
                <h3 className="font-heading text-xl font-medium">
                  Property Details
                </h3>
                <h4 className="font-heading text-lg">Amenities & Features</h4>
              </div>
            </div>

            {/* Body Typeface */}
            <div className="card-enhanced p-8 space-y-6">
              <div>
                <h3 className="font-heading text-xl font-semibold mb-2">
                  Body • Space Grotesk
                </h3>
                <p className="text-sm text-muted-foreground">
                  Paragraphs, Descriptions, Form labels, General content
                </p>
              </div>
              <div className="space-y-4">
                <p className="font-body text-lg">
                  Large body text for introductions and important property
                  descriptions that need emphasis.
                </p>
                <p className="font-body text-base">
                  Regular body text for general content, property details, and
                  standard descriptions in listings.
                </p>
                <p className="font-body text-sm">
                  Small body text for captions, metadata, and secondary
                  information like property IDs.
                </p>
              </div>
            </div>

            {/* Monospace Typeface */}
            <div className="card-enhanced p-8 space-y-6">
              <div>
                <h3 className="font-heading text-xl font-semibold mb-2">
                  Mono • JetBrains Mono
                </h3>
                <p className="text-sm text-muted-foreground">
                  Property coordinates, IDs, Technical data, Code
                </p>
              </div>
              <div className="space-y-3">
                <div className="font-mono text-sm bg-muted p-3 rounded-lg">
                  6.4321°N, 3.4219°E
                </div>
                <div className="font-mono text-sm bg-muted p-3 rounded-lg">
                  Property ID: REP-2024-LKI-001
                </div>
                <div className="font-mono text-xs bg-muted p-3 rounded-lg">
                  Verification Hash: 0x4a7b9c2d...
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Component Library Strategy */}
        <section className="space-y-8">
          <div className="text-center">
            <h2 className="font-heading text-4xl font-bold mb-4">
              Component Library Strategy
            </h2>
            <p className="text-muted-foreground">
              70% HeroUI • 25% UntitledUI • 5% Shadcn
            </p>
          </div>

          {/* Button Showcase */}
          <div className="space-y-6">
            <h3 className="font-heading text-2xl font-semibold">
              Buttons (HeroUI Primary)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Primary Buttons */}
              <div className="space-y-4">
                <h4 className="font-heading text-lg font-medium">
                  Primary Actions
                </h4>
                <div className="space-y-3">
                  <Button variant="neon" size="lg" className="w-full">
                    Find Properties
                  </Button>
                  <Button variant="neon" size="default" className="w-full">
                    Get Verified
                  </Button>
                  <Button variant="neon" size="sm" className="w-full">
                    Start Now
                  </Button>
                </div>
              </div>

              {/* Secondary Buttons */}
              <div className="space-y-4">
                <h4 className="font-heading text-lg font-medium">
                  Secondary Actions
                </h4>
                <div className="space-y-3">
                  <Button variant="violet" size="lg" className="w-full">
                    Learn More
                  </Button>
                  <Button variant="violet" size="default" className="w-full">
                    View Details
                  </Button>
                  <Button variant="violet" size="sm" className="w-full">
                    Contact
                  </Button>
                </div>
              </div>

              {/* Neutral Buttons */}
              <div className="space-y-4">
                <h4 className="font-heading text-lg font-medium">
                  Neutral Actions
                </h4>
                <div className="space-y-3">
                  <Button variant="outline" size="lg" className="w-full">
                    Filter Results
                  </Button>
                  <Button variant="ghost" size="default" className="w-full">
                    Save for Later
                  </Button>
                  <Button variant="link" size="sm" className="w-full">
                    View All
                  </Button>
                </div>
              </div>

              {/* Icon Buttons */}
              <div className="space-y-4">
                <h4 className="font-heading text-lg font-medium">
                  Icon Actions
                </h4>
                <div className="space-y-3">
                  <Button variant="neon" size="icon" className="w-full">
                    ♥
                  </Button>
                  <Button variant="violet" size="icon" className="w-full">
                    📍
                  </Button>
                  <Button variant="outline" size="icon" className="w-full">
                    ⚙
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Status Badges (UntitledUI) */}
          <div className="space-y-6">
            <h3 className="font-heading text-2xl font-semibold">
              Status System (UntitledUI Components)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Property Status */}
              <div className="card-enhanced p-6 space-y-4">
                <h4 className="font-heading text-lg font-medium">
                  Property Status
                </h4>
                <div className="flex flex-wrap gap-2">
                  <VerifiedBadge>Verified</VerifiedBadge>
                  <PendingBadge>Pending</PendingBadge>
                  <StatusBadge variant="rejected">Rejected</StatusBadge>
                  <StatusBadge variant="available">Available</StatusBadge>
                  <StatusBadge variant="rented">Rented</StatusBadge>
                  <StatusBadge variant="sold">Sold</StatusBadge>
                </div>
              </div>

              {/* Special Badges */}
              <div className="card-enhanced p-6 space-y-4">
                <h4 className="font-heading text-lg font-medium">
                  Promotional
                </h4>
                <div className="flex flex-wrap gap-2">
                  <NewBadge>New</NewBadge>
                  <FeaturedBadge>Featured</FeaturedBadge>
                  <StatusBadge variant="info">Hot Deal</StatusBadge>
                  <StatusBadge variant="featured" className="animate-pulse">
                    Premium
                  </StatusBadge>
                  <StatusBadge variant="popular">Popular</StatusBadge>
                </div>
              </div>

              {/* Nigerian-Specific */}
              <div className="card-enhanced p-6 space-y-4">
                <h4 className="font-heading text-lg font-medium">
                  Nigerian Market
                </h4>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge variant="available" showIcon={false}>
                    BQ Available
                  </StatusBadge>
                  <StatusBadge variant="info" showIcon={false}>
                    Gated Community
                  </StatusBadge>
                  <StatusBadge variant="featured" showIcon={false}>
                    Power Included
                  </StatusBadge>
                  <StatusBadge variant="info" showIcon={false}>
                    Water Supply
                  </StatusBadge>
                </div>
              </div>
            </div>
          </div>

          {/* Property Status Chips (RealEST Components) */}
          <div className="space-y-6">
            <h3 className="font-heading text-2xl font-semibold">
              Property Status Chips (RealEST Components)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Property Status Variants */}
              <div className="card-enhanced p-6 space-y-4">
                <h4 className="font-heading text-lg font-medium">
                  Property Status Variants
                </h4>
                <div className="flex flex-wrap gap-2">
                  <AvailableChip />
                  <PendingChip />
                  <BookedChip />
                  <PropertyStatusChip status="unavailable" />
                  <FeaturedChip />
                  <FreshListingChip />
                  <ExclusiveChip />
                  <UnderOfferChip />
                </div>
              </div>

              {/* Size Variations */}
              <div className="card-enhanced p-6 space-y-4">
                <h4 className="font-heading text-lg font-medium">
                  Size Variations
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground w-12">
                      SM:
                    </span>
                    <AvailableChip size="sm" />
                    <PendingChip size="sm" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground w-12">
                      MD:
                    </span>
                    <AvailableChip size="md" />
                    <PendingChip size="md" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground w-12">
                      LG:
                    </span>
                    <AvailableChip size="lg" />
                    <PendingChip size="lg" />
                  </div>
                </div>
              </div>

              {/* Advanced Features */}
              <div className="card-enhanced p-6 space-y-4">
                <h4 className="font-heading text-lg font-medium">
                  Advanced Features
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Priority:
                    </span>
                    <FeaturedChip priority="high" />
                    <ExclusiveChip priority="medium" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Animated:
                    </span>
                    <PendingChip animated={true} />
                    <UnderOfferChip animated={true} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Interactive:
                    </span>
                    <AvailableChip interactive={true} />
                    <FeaturedChip interactive={true} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      No Icon:
                    </span>
                    <AvailableChip showIcon={false} />
                    <PendingChip showIcon={false} />
                  </div>
                </div>
              </div>
            </div>

            {/* Property Status Group Example */}
            <div className="card-enhanced p-6">
              <h4 className="font-heading text-lg font-medium mb-4">
                Property Status Group (Multiple Chips)
              </h4>
              <PropertyStatusGroup
                statuses={[
                  { status: "available", size: "sm" },
                  { status: "featured", size: "sm", priority: "high" },
                  { status: "fresh-listing", size: "sm" },
                  { status: "exclusive", size: "sm", priority: "high" },
                ]}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Hover over chips to see tooltips with descriptions
              </p>
            </div>
          </div>

          {/* Amenity Badges (RealEST Components) */}
          <div className="space-y-6">
            <h3 className="font-heading text-2xl font-semibold">
              Amenity Badges (RealEST Components)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Power & Electricity */}
              <div className="card-enhanced p-6 space-y-4">
                <h4 className="font-heading text-lg font-medium">
                  Power & Electricity
                </h4>
                <div className="flex flex-wrap gap-2">
                  <PowerBadge status="stable" />
                  <PowerBadge status="intermittent" />
                  <PowerBadge status="poor" />
                  <GeneratorBadge />
                  <InverterBadge />
                  <SolarBadge />
                </div>
              </div>

              {/* Water & Plumbing */}
              <div className="card-enhanced p-6 space-y-4">
                <h4 className="font-heading text-lg font-medium">
                  Water & Plumbing
                </h4>
                <div className="flex flex-wrap gap-2">
                  <WaterBadge status="borehole" />
                  <WaterBadge status="public_water" />
                  <WaterBadge status="well" />
                  <WaterTankBadge value={2000} />
                  <WaterTreatmentBadge />
                </div>
              </div>

              {/* Security & Safety */}
              <div className="card-enhanced p-6 space-y-4">
                <h4 className="font-heading text-lg font-medium">
                  Security & Safety
                </h4>
                <div className="flex flex-wrap gap-2">
                  <SecurityBadge status="gated_community" />
                  <SecurityBadge status="security_post" />
                  <SecurityBadge status="cctv" />
                  <SecurityBadge status="24/7" />
                </div>
              </div>

              {/* Internet & Connectivity */}
              <div className="card-enhanced p-6 space-y-4">
                <h4 className="font-heading text-lg font-medium">
                  Internet & Connectivity
                </h4>
                <div className="flex flex-wrap gap-2">
                  <InternetBadge status="fiber" />
                  <InternetBadge status="starlink" />
                  <InternetBadge status="4g" />
                  <InternetBadge status="3g" />
                </div>
              </div>

              {/* Boys Quarters */}
              <div className="card-enhanced p-6 space-y-4">
                <h4 className="font-heading text-lg font-medium">
                  Boys Quarters
                </h4>
                <div className="flex flex-wrap gap-2">
                  <BoysQuartersBadge status="self_contained" />
                  <BoysQuartersBadge status="room_and_parlor" />
                  <BoysQuartersBadge status="excellent" />
                  <BoysQuartersBadge status="good" />
                </div>
              </div>

              {/* Indoor Amenities */}
              <div className="card-enhanced p-6 space-y-4">
                <h4 className="font-heading text-lg font-medium">
                  Indoor Amenities
                </h4>
                <div className="flex flex-wrap gap-2">
                  <ParkingBadge value={2} />
                  <PoolBadge />
                  <GymBadge />
                  <AmenityBadge type="kitchen" status="built_in" />
                </div>
              </div>
            </div>

            {/* Amenity Badge Group Example */}
            <div className="card-enhanced p-6">
              <h4 className="font-heading text-lg font-medium mb-4">
                Amenity Badge Group (Multiple Amenities)
              </h4>
              <AmenityBadgeGroup
                amenities={createAmenityBadges({
                  nepa_status: "stable",
                  has_generator: true,
                  water_source: "borehole",
                  internet_type: "fiber",
                  security_type: ["gated_community", "cctv"],
                  has_bq: true,
                  parking_spaces: 2,
                  has_pool: true,
                  has_gym: true,
                })}
                maxDisplay={6}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Hover over badges to see detailed tooltips with amenity
                information
              </p>
            </div>

            {/* Size Variations */}
            <div className="card-enhanced p-6">
              <h4 className="font-heading text-lg font-medium mb-4">
                Size Variations & Variants
              </h4>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium w-16">Small:</span>
                  <PowerBadge status="stable" size="sm" />
                  <WaterBadge status="borehole" size="sm" />
                  <SecurityBadge status="gated_community" size="sm" />
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium w-16">Medium:</span>
                  <PowerBadge status="stable" size="md" />
                  <WaterBadge status="borehole" size="md" />
                  <SecurityBadge status="gated_community" size="md" />
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium w-16">Large:</span>
                  <PowerBadge status="stable" size="lg" />
                  <WaterBadge status="borehole" size="lg" />
                  <SecurityBadge status="gated_community" size="lg" />
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium w-16">Outline:</span>
                  <PowerBadge status="stable" variant="outline" />
                  <WaterBadge status="borehole" variant="outline" />
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium w-16">No Icon:</span>
                  <PowerBadge status="stable" showIcon={false} />
                  <WaterBadge status="borehole" showIcon={false} />
                </div>
              </div>
            </div>
          </div>

          {/* Property Type Badges (RealEST Components) */}
          <div className="space-y-6">
            <h3 className="font-heading text-2xl font-semibold">
              Property Type Badges (RealEST Components)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Broad Property Categories */}
              <div className="card-enhanced p-6 space-y-4">
                <h4 className="font-heading text-lg font-medium">
                  Broad Categories
                </h4>
                <div className="flex flex-wrap gap-2">
                  <HouseBadge />
                  <ApartmentBadge />
                  <LandBadge />
                  <CommercialBadge />
                  <HotelBadge />
                  <OfficeBadge />
                </div>
              </div>

              {/* Nigerian Residential Types */}
              <div className="card-enhanced p-6 space-y-4">
                <h4 className="font-heading text-lg font-medium">
                  Nigerian Residential
                </h4>
                <div className="flex flex-wrap gap-2">
                  <DuplexBadge />
                  <BungalowBadge />
                  <SelfContainedBadge />
                  <PropertyTypeBadge type="mini_flat" />
                  <PropertyTypeBadge type="room_and_parlor" />
                  <PropertyTypeBadge type="penthouse" />
                  <PropertyTypeBadge type="terrace" />
                  <PropertyTypeBadge type="detached_house" />
                </div>
              </div>

              {/* Commercial & Land Types */}
              <div className="card-enhanced p-6 space-y-4">
                <h4 className="font-heading text-lg font-medium">
                  Commercial & Land
                </h4>
                <div className="flex flex-wrap gap-2">
                  <PropertyTypeBadge type="warehouse" />
                  <PropertyTypeBadge type="showroom" />
                  <PropertyTypeBadge type="restaurant" />
                  <ResidentialLandBadge />
                  <CommercialLandBadge />
                  <PropertyTypeBadge type="mixed_use_land" />
                  <PropertyTypeBadge type="farmland" />
                </div>
              </div>
            </div>

            {/* Size Variations */}
            <div className="card-enhanced p-6">
              <h4 className="font-heading text-lg font-medium mb-4">
                Size Variations & Variants
              </h4>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium w-16">Small:</span>
                  <HouseBadge size="sm" />
                  <ApartmentBadge size="sm" />
                  <LandBadge size="sm" />
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium w-16">Medium:</span>
                  <HouseBadge size="md" />
                  <ApartmentBadge size="md" />
                  <LandBadge size="md" />
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium w-16">Large:</span>
                  <HouseBadge size="lg" />
                  <ApartmentBadge size="lg" />
                  <LandBadge size="lg" />
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium w-16">Outline:</span>
                  <HouseBadge variant="outline" />
                  <ApartmentBadge variant="outline" />
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium w-16">No Icon:</span>
                  <HouseBadge showIcon={false} />
                  <ApartmentBadge showIcon={false} />
                </div>
              </div>
            </div>

            {/* Property Type Badge Group Example */}
            <div className="card-enhanced p-6">
              <h4 className="font-heading text-lg font-medium mb-4">
                Property Type Badge Integration
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Property Card Example */}
                <div className="card-enhanced group cursor-pointer">
                  <div className="relative">
                    <div className="bg-linear-to-br from-blue-200 to-blue-300 h-32 rounded-t-xl"></div>
                    <div className="absolute top-3 left-3">
                      <DuplexBadge />
                    </div>
                    <div className="absolute top-3 right-3">
                      <PropertyStatusChip
                        status="available"
                        size="sm"
                        showTooltip={false}
                      />
                    </div>
                  </div>
                  <div className="p-4 space-y-2">
                    <h4 className="font-heading text-lg font-semibold">
                      Modern 3BR Duplex
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Lekki Phase 1, Lagos
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-brand-violet">
                        ₦3,500,000/year
                      </span>
                      <Button variant="violet" size="sm">
                        View
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Land Property Example */}
                <div className="card-enhanced group cursor-pointer">
                  <div className="relative">
                    <div className="bg-linear-to-br from-green-200 to-green-300 h-32 rounded-t-xl"></div>
                    <div className="absolute top-3 left-3">
                      <ResidentialLandBadge />
                    </div>
                    <div className="absolute top-3 right-3">
                      <PropertyStatusChip
                        status="featured"
                        size="sm"
                        showTooltip={false}
                      />
                    </div>
                  </div>
                  <div className="p-4 space-y-2">
                    <h4 className="font-heading text-lg font-semibold">
                      Residential Plot
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Banana Island, Lagos
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-brand-violet">
                        ₦15,000,000
                      </span>
                      <Button variant="neon" size="sm">
                        View
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Property type badges integrate seamlessly with property cards,
                providing clear visual categorization. Hover over badges to see
                detailed tooltips with property type information.
              </p>
            </div>
          </div>

          {/* Property Cards with Amenity Badges */}
          <div className="space-y-6">
            <h3 className="font-heading text-2xl font-semibold">
              Property Cards with Amenity Badges
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Property Card 1 - Full Amenities */}
              <div className="card-enhanced group cursor-pointer">
                <div className="relative">
                  <div className="bg-linear-to-br from-blue-200 to-blue-300 h-48 rounded-t-xl"></div>
                  <div className="absolute top-3 left-3">
                    <ApartmentBadge size="sm" showTooltip={false} />
                  </div>
                  <div className="absolute top-12 left-3">
                    <VerifiedBadge size="sm">Verified</VerifiedBadge>
                  </div>
                  <div className="absolute top-3 right-3">
                    <PropertyStatusChip
                      status="available"
                      size="sm"
                      showTooltip={false}
                    />
                  </div>
                  <div className="absolute bottom-3 left-3 right-3">
                    <AmenityBadgeGroup
                      amenities={createAmenityBadges({
                        nepa_status: "stable",
                        has_generator: true,
                        water_source: "borehole",
                        internet_type: "fiber",
                        security_type: ["gated_community"],
                        parking_spaces: 2,
                      })}
                      maxDisplay={3}
                      showTooltip={false}
                    />
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <h4 className="font-heading text-lg font-semibold">
                      Luxury 3BR Apartment
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Lekki Phase 1, Lagos
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>🛏 3 Beds</span>
                    <span>🚿 2 Baths</span>
                    <span>📐 120 m²</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-brand-violet">
                        ₦3,200,000
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Per year
                      </div>
                    </div>
                    <Button variant="violet" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              </div>

              {/* Property Card 2 - Basic Amenities */}
              <div className="card-enhanced group cursor-pointer">
                <div className="relative">
                  <div className="bg-linear-to-br from-green-200 to-green-300 h-48 rounded-t-xl"></div>
                  <div className="absolute top-3 left-3">
                    <DuplexBadge size="sm" showTooltip={false} />
                  </div>
                  <div className="absolute top-12 left-3">
                    <PendingBadge size="sm">Pending</PendingBadge>
                  </div>
                  <div className="absolute top-3 right-3">
                    <PropertyStatusChip
                      status="featured"
                      size="sm"
                      showTooltip={false}
                    />
                  </div>
                  <div className="absolute bottom-3 left-3 right-3">
                    <AmenityBadgeGroup
                      amenities={createAmenityBadges({
                        nepa_status: "intermittent",
                        water_source: "public_water",
                        security_type: ["security_post"],
                        has_bq: true,
                        parking_spaces: 1,
                      })}
                      maxDisplay={3}
                      showTooltip={false}
                    />
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <h4 className="font-heading text-lg font-semibold">
                      2BR + BQ Duplex
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Ikeja GRA, Lagos
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>🛏 2+BQ</span>
                    <span>🚿 2 Baths</span>
                    <span>📐 180 m²</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-brand-violet">
                        ₦2,800,000
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Per year
                      </div>
                    </div>
                    <Button variant="neon" size="sm">
                      Contact Owner
                    </Button>
                  </div>
                </div>
              </div>

              {/* Property Card 3 - Premium Amenities */}
              <div className="card-enhanced group cursor-pointer bg-gradient-brand text-white">
                <div className="relative">
                  <div className="bg-white/20 h-48 rounded-t-xl"></div>
                  <div className="absolute top-3 left-3">
                    <PropertyTypeBadge
                      type="penthouse"
                      size="sm"
                      showTooltip={false}
                    />
                  </div>
                  <div className="absolute top-12 left-3">
                    <FeaturedBadge size="sm">Featured</FeaturedBadge>
                  </div>
                  <div className="absolute top-3 right-3">
                    <PropertyStatusChip
                      status="exclusive"
                      size="sm"
                      showTooltip={false}
                    />
                  </div>
                  <div className="absolute bottom-3 left-3 right-3">
                    <AmenityBadgeGroup
                      amenities={createAmenityBadges({
                        nepa_status: "stable",
                        has_generator: true,
                        has_inverter: true,
                        has_solar_panels: true,
                        water_source: "borehole",
                        water_tank_capacity: 5000,
                        has_water_treatment: true,
                        internet_type: "fiber",
                        security_type: ["gated_community", "cctv", "24/7"],
                        parking_spaces: 3,
                        has_pool: true,
                        has_gym: true,
                      })}
                      maxDisplay={4}
                      showTooltip={false}
                    />
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <h4 className="font-heading text-lg font-semibold">
                      Premium 4BR Penthouse
                    </h4>
                    <p className="text-sm text-white/80">
                      Victoria Island, Lagos
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-white/80">
                    <span>🛏 4 Beds</span>
                    <span>🚿 4 Baths</span>
                    <span>🏊‍♂️ Pool</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold">₦12,500,000</div>
                      <div className="text-xs text-white/70">Per year</div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Integration Example:</strong> These property cards
                demonstrate how PropertyTypeBadges and AmenityBadges integrate
                seamlessly with existing property cards. PropertyTypeBadges
                provide clear categorization at the top-left, while
                AmenityBadges are positioned at the bottom of the image overlay
                and automatically display the most relevant amenities for each
                property. Hover over badges to see detailed tooltips.
              </p>
            </div>
          </div>

          {/* Profile Dropdown (HeroUI) */}
          <div className="space-y-6">
            <h3 className="font-heading text-2xl font-semibold">
              Profile Dropdown (HeroUI Components)
            </h3>
            <div className="card-enhanced p-8">
              <div className="flex items-center h-10 w-10 m-auto justify-center border rounded-full">
                <ProfileDropdown />
              </div>
              <p className="text-sm text-muted-foreground text-center mt-4">
                Dynamic user menu with role-based navigation items. Shows
                different actions for admins (settings), owners (list property,
                inquiries), agents (dashboard, properties), and regular users
                (profile only), plus logout for all.
              </p>
            </div>
          </div>

          {/* Profile Upload Component */}
          <div className="space-y-6">
            <h3 className="font-heading text-2xl font-semibold">
              Profile Upload (Signed-URL Integration)
            </h3>
            <div className="card-enhanced p-8">
              <div className="flex flex-col items-center gap-8">
                {/* Different sizes showcase */}
                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <ProfileUpload size="sm" />
                    <p className="text-xs text-muted-foreground mt-2">
                      Small (32px)
                    </p>
                  </div>
                  <div className="text-center">
                    <ProfileUpload size="md" />
                    <p className="text-xs text-muted-foreground mt-2">
                      Medium (48px)
                    </p>
                  </div>
                  <div className="text-center">
                    <ProfileUpload size="lg" />
                    <p className="text-xs text-muted-foreground mt-2">
                      Large (64px)
                    </p>
                  </div>
                  <div className="text-center">
                    <ProfileUpload size="xl" />
                    <p className="text-xs text-muted-foreground mt-2">
                      Extra Large (96px)
                    </p>
                  </div>
                </div>

                {/* Upload button example */}
                <div className="text-center">
                  <ProfileUpload size="lg" />
                  <p className="text-sm text-muted-foreground mt-4 max-w-md">
                    Click the avatar or use the upload button to change your
                    profile picture. Supports secure signed-URL uploads with
                    file validation and real-time preview.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Spacing & Layout System */}
        <section className="space-y-8">
          <div className="text-center">
            <h2 className="font-heading text-4xl font-bold mb-4">
              Spacing & Layout System
            </h2>
            <p className="text-muted-foreground">
              4px base unit • Consistent spacing scale • Component patterns
            </p>
          </div>

          {/* Spacing Scale */}
          <div className="card-enhanced p-8">
            <h3 className="font-heading text-xl font-semibold mb-6">
              Spacing Scale (4px base unit)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {[
                { name: "xs", value: "4px", class: "p-1" },
                { name: "sm", value: "8px", class: "p-2" },
                { name: "md", value: "12px", class: "p-3" },
                { name: "lg", value: "16px", class: "p-4" },
                { name: "xl", value: "20px", class: "p-5" },
                { name: "2xl", value: "24px", class: "p-6" },
                { name: "3xl", value: "32px", class: "p-8" },
                { name: "4xl", value: "48px", class: "p-12" },
              ].map((space) => (
                <div key={space.name} className="text-center">
                  <div className="bg-brand-violet/20 border-2 border-brand-violet border-dashed rounded-lg mb-2">
                    <div
                      className={`bg-brand-violet rounded ${space.class}`}
                    ></div>
                  </div>
                  <div className="text-xs font-mono">{space.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {space.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Grid System */}
          <div className="space-y-6">
            <h3 className="font-heading text-2xl font-semibold">
              Responsive Grid System
            </h3>
            <div className="space-y-4">
              {/* 12 Column Grid */}
              <div className="card-enhanced p-6">
                <h4 className="font-heading text-lg font-medium mb-4">
                  Property Grid (Responsive)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {Array.from({ length: 8 }, (_, i) => (
                    <div
                      key={i}
                      className="bg-brand-violet/10 border border-brand-violet/20 rounded-lg p-4 text-center"
                    >
                      <div className="font-medium">Property {i + 1}</div>
                      <div className="text-sm text-muted-foreground">
                        Grid Item
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Container Sizes */}
              <div className="card-enhanced p-6">
                <h4 className="font-heading text-lg font-medium mb-4">
                  Container Breakpoints
                </h4>
                <div className="space-y-3">
                  <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                    <span className="font-mono text-sm">sm: 640px</span> -
                    Mobile landscape
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                    <span className="font-mono text-sm">md: 768px</span> -
                    Tablet
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                    <span className="font-mono text-sm">lg: 1024px</span> -
                    Desktop
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                    <span className="font-mono text-sm">xl: 1280px</span> -
                    Large desktop
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                    <span className="font-mono text-sm">2xl: 1536px</span> -
                    Extra large
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Border Radius & Shadow System */}
        <section className="space-y-8">
          <div className="text-center">
            <h2 className="font-heading text-4xl font-bold mb-4">
              Border Radius & Shadow System
            </h2>
            <p className="text-muted-foreground">
              Minimal borders • Sophisticated shadows • Component-specific
              radius
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Border Radius */}
            <div className="card-enhanced p-8 space-y-6">
              <h3 className="font-heading text-xl font-semibold">
                Border Radius Scale
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { name: "xs", value: "4px", class: "rounded-xs" },
                  { name: "sm", value: "6px", class: "rounded-sm" },
                  { name: "md", value: "10px", class: "rounded-md" },
                  { name: "lg", value: "16px", class: "rounded-lg" },
                  { name: "xl", value: "24px", class: "rounded-xl" },
                  { name: "2xl", value: "32px", class: "rounded-2xl" },
                ].map((radius) => (
                  <div key={radius.name} className="text-center">
                    <div
                      className={`bg-brand-violet h-16 w-full mb-2 ${radius.class}`}
                    ></div>
                    <div className="text-sm font-medium">{radius.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {radius.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shadow System */}
            <div className="card-enhanced p-8 space-y-6">
              <h3 className="font-heading text-xl font-semibold">
                Shadow System
              </h3>
              <div className="space-y-4">
                {[
                  { name: "Small", class: "shadow-sm" },
                  { name: "Medium", class: "shadow-md" },
                  { name: "Large", class: "shadow-lg" },
                  { name: "Extra Large", class: "shadow-xl" },
                ].map((shadow) => (
                  <div
                    key={shadow.name}
                    className={`bg-card border border-border rounded-lg p-4 ${shadow.class}`}
                  >
                    <div className="font-medium">{shadow.name} Shadow</div>
                    <div className="text-sm text-muted-foreground">
                      Property card example
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Real Estate Component Examples */}
        <section className="space-y-8">
          <div className="text-center">
            <h2 className="font-heading text-4xl font-bold mb-4">
              Real Estate Components
            </h2>
            <p className="text-muted-foreground">
              Production-ready components for property marketplace
            </p>
          </div>

          {/* Property Cards */}
          <div className="space-y-6">
            <h3 className="font-heading text-2xl font-semibold">
              Property Cards
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Standard Property Card */}
              <div className="card-enhanced group cursor-pointer">
                <div className="relative">
                  <div className="bg-linear-to-br from-gray-200 to-gray-300 h-48 rounded-t-xl"></div>
                  <div className="absolute top-4 left-4">
                    <ApartmentBadge size="sm" showTooltip={false} />
                  </div>
                  <div className="absolute top-12 left-4">
                    <VerifiedBadge size="sm">Verified</VerifiedBadge>
                  </div>
                  <div className="absolute top-4 right-4">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="bg-white/90 hover:bg-white"
                    >
                      ♥
                    </Button>
                  </div>
                  <div className="absolute bottom-4 right-4">
                    <StatusBadge variant="available" size="sm">
                      Available
                    </StatusBadge>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <h4 className="font-heading text-lg font-semibold">
                      Modern 3BR Apartment
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Lekki Phase 1, Lagos
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>🛏 3 Beds</span>
                    <span>🚿 2 Baths</span>
                    <span>📐 120 m²</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-brand-violet">
                        ₦2,500,000
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Per year
                      </div>
                    </div>
                    <Button variant="violet" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              </div>

              {/* Premium Property Card */}
              <div className="card-enhanced group cursor-pointer bg-gradient-brand text-white">
                <div className="relative">
                  <div className="bg-white/20 h-48 rounded-t-xl"></div>
                  <div className="absolute top-4 left-4">
                    <DuplexBadge size="sm" showTooltip={false} />
                  </div>
                  <div className="absolute top-12 left-4">
                    <FeaturedBadge size="sm">Featured</FeaturedBadge>
                  </div>
                  <div className="absolute top-4 right-4">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="bg-white/10 hover:bg-white/20 text-white"
                    >
                      ♥
                    </Button>
                  </div>
                  <div className="absolute bottom-4 right-4">
                    <StatusBadge variant="new" size="sm">
                      Premium
                    </StatusBadge>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <h4 className="font-heading text-lg font-semibold">
                      Luxury 4BR Duplex
                    </h4>
                    <p className="text-sm text-white/80">
                      Victoria Island, Lagos
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-white/80">
                    <span>🛏 4 Beds</span>
                    <span>🚿 3 Baths</span>
                    <span>📐 250 m²</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold">₦8,500,000</div>
                      <div className="text-xs text-white/70">Per year</div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </div>

              {/* Nigerian-Specific Property Card */}
              <div className="card-enhanced group cursor-pointer">
                <div className="relative">
                  <div className="bg-linear-to-br from-green-200 to-green-300 h-48 rounded-t-xl"></div>
                  <div className="absolute top-4 left-4">
                    <ApartmentBadge size="sm" showTooltip={false} />
                  </div>
                  <div className="absolute top-12 left-4">
                    <PendingBadge size="sm">Pending</PendingBadge>
                  </div>
                  <div className="absolute top-4 right-4">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="bg-white/90 hover:bg-white"
                    >
                      ♥
                    </Button>
                  </div>
                  <div className="absolute bottom-4 left-4">
                    <StatusBadge variant="info" size="sm" showIcon={false}>
                      Gated
                    </StatusBadge>
                  </div>
                  <div className="absolute bottom-4 right-4">
                    <StatusBadge variant="available" size="sm" showIcon={false}>
                      Power
                    </StatusBadge>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <h4 className="font-heading text-lg font-semibold">
                      2BR + BQ
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Ikeja GRA, Lagos
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>🛏 2+BQ</span>
                    <span>🚿 2 Baths</span>
                    <span>⚡ NEPA</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-brand-violet">
                        ₦1,800,000
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Per year
                      </div>
                    </div>
                    <Button variant="neon" size="sm">
                      Contact Owner
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Search & Filter Components */}
          <div className="space-y-6">
            <h3 className="font-heading text-2xl font-semibold">
              Search & Filter System
            </h3>
            <div className="card-enhanced p-8">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="Search by area, landmark, or address..."
                    className="w-full p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Property Type
                  </label>
                  <select className="w-full p-3 border border-input rounded-lg bg-background">
                    <option>Any Type</option>
                    <option>Apartment</option>
                    <option>Duplex</option>
                    <option>Bungalow</option>
                    <option>Boys Quarters</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Budget Range
                  </label>
                  <select className="w-full p-3 border border-input rounded-lg bg-background">
                    <option>Any Budget</option>
                    <option>₦500k - ₦1M</option>
                    <option>₦1M - ₦3M</option>
                    <option>₦3M - ₦5M</option>
                    <option>₦5M+</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-between mt-6">
                <div className="flex gap-2">
                  <StatusBadge variant="info" interactive showIcon={false}>
                    Gated Community
                  </StatusBadge>
                  <StatusBadge variant="available" interactive showIcon={false}>
                    Power Included
                  </StatusBadge>
                  <StatusBadge variant="featured" interactive showIcon={false}>
                    Water Supply
                  </StatusBadge>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline">Clear Filters</Button>
                  <Button variant="neon">Search Properties</Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive States & Animations */}
        <section className="space-y-8">
          <div className="text-center">
            <h2 className="font-heading text-4xl font-bold mb-4">
              Interactive States & Animations
            </h2>
            <p className="text-muted-foreground">
              Hover effects • Focus states • Loading patterns •
              Micro-interactions
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Hover Effects */}
            <div className="space-y-4">
              <h3 className="font-heading text-xl font-semibold">
                Hover Effects
              </h3>
              <div className="space-y-4">
                <div className="card-enhanced p-6 cursor-pointer">
                  <h4 className="font-medium mb-2">Card Lift Effect</h4>
                  <p className="text-sm text-muted-foreground">
                    Hover to see elevation change with shadow
                  </p>
                </div>
                <button className="w-full p-4 text-left border border-border rounded-lg hover:border-brand-violet hover:shadow-lg transition-all duration-200">
                  <div className="font-medium mb-1">Border Color Change</div>
                  <div className="text-sm text-muted-foreground">
                    Hover to see border highlight
                  </div>
                </button>
                <div className="p-4 bg-muted rounded-lg hover:bg-brand-violet/10 hover:border-brand-violet border border-transparent transition-all duration-200 cursor-pointer">
                  <div className="font-medium mb-1">Background Tint</div>
                  <div className="text-sm text-muted-foreground">
                    Hover for subtle brand color tint
                  </div>
                </div>
              </div>
            </div>

            {/* Focus States */}
            <div className="space-y-4">
              <h3 className="font-heading text-xl font-semibold">
                Focus States
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium">
                    Input Focus Ring
                  </label>
                  <input
                    type="text"
                    placeholder="Click to see focus ring"
                    className="w-full p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium">
                    Button Focus
                  </label>
                  <div className="flex gap-2">
                    <Button variant="neon">Focus Test</Button>
                    <Button variant="outline">Tab Navigation</Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium">
                    Custom Focus Ring
                  </label>
                  <button className="p-3 border border-border rounded-lg focus:ring-2 focus:ring-brand-neon focus:ring-offset-2 focus:outline-none transition-all">
                    Custom Focus Ring Color
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Loading States */}
          <div className="space-y-4">
            <h3 className="font-heading text-xl font-semibold">
              Loading States
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Skeleton Card */}
              <div className="card-enhanced p-6 space-y-4">
                <div className="animate-pulse space-y-4">
                  <div className="bg-gray-200 dark:bg-gray-700 h-32 rounded"></div>
                  <div className="space-y-2">
                    <div className="bg-gray-200 dark:bg-gray-700 h-4 rounded w-3/4"></div>
                    <div className="bg-gray-200 dark:bg-gray-700 h-4 rounded w-1/2"></div>
                  </div>
                  <div className="bg-gray-200 dark:bg-gray-700 h-8 rounded w-1/3"></div>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Property Card Skeleton
                </p>
              </div>

              {/* Loading Button */}
              <div className="card-enhanced p-6 space-y-4">
                <Button variant="neon" disabled className="w-full">
                  <div className="animate-spin mr-2">⭘</div>
                  Loading...
                </Button>
                <Button variant="violet" disabled className="w-full">
                  <div className="animate-pulse mr-2">●</div>
                  Processing...
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Loading Buttons
                </p>
              </div>

              {/* Progress Indicator */}
              <div className="card-enhanced p-6 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Upload Progress</span>
                    <span>75%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-brand-neon h-2 rounded-full w-3/4"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Verification</span>
                    <span>2/3</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-brand-violet h-2 rounded-full w-2/3"></div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Progress Bars
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Form Components */}
        <section className="space-y-8">
          <div className="text-center">
            <h2 className="font-heading text-4xl font-bold mb-4">
              Form Components
            </h2>
            <p className="text-muted-foreground">
              Property listing forms • User input • Nigerian market fields
            </p>
          </div>

          <div className="card-enhanced p-8">
            <h3 className="font-heading text-xl font-semibold mb-6">
              Property Listing Form Example
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Property Title *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Modern 3BR Apartment in Lekki"
                    className="w-full p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Make it descriptive and appealing
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Property Type *
                  </label>
                  <select className="w-full p-3 border border-input rounded-lg bg-background">
                    <option>Select property type</option>
                    <option>Apartment</option>
                    <option>Duplex</option>
                    <option>Bungalow</option>
                    <option>Boys Quarters (BQ)</option>
                    <option>Self-contained</option>
                    <option>Mini Flat</option>
                    <option>Face-me-I-face-you</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    placeholder="Area, LGA, State"
                    className="w-full p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Include nearby landmarks
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Bedrooms
                    </label>
                    <select className="w-full p-3 border border-input rounded-lg bg-background">
                      <option>1</option>
                      <option>2</option>
                      <option>3</option>
                      <option>4</option>
                      <option>5+</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Bathrooms
                    </label>
                    <select className="w-full p-3 border border-input rounded-lg bg-background">
                      <option>1</option>
                      <option>2</option>
                      <option>3</option>
                      <option>4+</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Annual Rent (₦) *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2,500,000"
                    className="w-full p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Infrastructure & Amenities
                  </label>
                  <div className="space-y-2">
                    {[
                      "NEPA/Power Supply",
                      "Borehole/Water Supply",
                      "Internet Connectivity",
                      "Good Road Network",
                      "Drainage System",
                      "Gated Community",
                      "Security Post",
                      "CCTV Surveillance",
                    ].map((amenity) => (
                      <label
                        key={amenity}
                        className="flex items-center space-x-2"
                      >
                        <input
                          type="checkbox"
                          className="rounded border-input"
                        />
                        <span className="text-sm">{amenity}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Additional Details
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Describe the property, neighborhood, and any special features..."
                    className="w-full p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring resize-none"
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="terms"
                  className="rounded border-input"
                />
                <label htmlFor="terms" className="text-sm">
                  I agree to the{" "}
                  <span className="text-brand-violet underline">
                    Terms of Service
                  </span>
                </label>
              </div>
              <div className="flex gap-3">
                <Button variant="outline">Save Draft</Button>
                <Button variant="neon">Publish Listing</Button>
              </div>
            </div>
          </div>
        </section>

        {/* Page Layouts */}
        <section className="space-y-8">
          <div className="text-center">
            <h2 className="font-heading text-4xl font-bold mb-4">
              Page Layout Examples
            </h2>
            <p className="text-muted-foreground">
              Real-world page structures • Navigation patterns • Content
              organization
            </p>
          </div>

          {/* Hero Section Layout */}
          <div className="space-y-6">
            <h3 className="font-heading text-2xl font-semibold">
              Hero Section Layout
            </h3>
            <div className="bg-gradient-hero rounded-2xl p-12 text-white text-center">
              <div className="max-w-4xl mx-auto space-y-6">
                <h1 className="font-display text-5xl lg:text-6xl font-bold">
                  Find Your Next Move
                </h1>
                <p className="font-body text-xl lg:text-2xl text-white/90 max-w-2xl mx-auto">
                  Discover geo-verified properties in Nigeria's most trusted
                  marketplace. No duplicates, only authentic listings.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
                  <Button variant="neon" size="lg" className="min-w-48">
                    Start Exploring
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20 min-w-48"
                  >
                    List Your Property
                  </Button>
                </div>
                <div className="flex items-center justify-center gap-8 mt-12 text-sm text-white/80">
                  <div className="flex items-center gap-2">
                    <VerifiedBadge size="sm">Verified</VerifiedBadge>
                    <span>Geo-Verified</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge variant="available" size="sm">
                      10k+
                    </StatusBadge>
                    <span>Properties</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge variant="info" size="sm">
                      Trusted
                    </StatusBadge>
                    <span>Marketplace</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Layout */}
          <div className="space-y-6">
            <h3 className="font-heading text-2xl font-semibold">
              Navigation Layout
            </h3>
            <div className="card-enhanced">
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-8">
                    <div className="font-display text-2xl font-bold text-brand-violet">
                      RealEST
                    </div>
                    <nav className="hidden md:flex items-center gap-6">
                      <a
                        href="#"
                        className="font-medium hover:text-brand-violet transition-colors"
                      >
                        Properties
                      </a>
                      <a
                        href="#"
                        className="font-medium hover:text-brand-violet transition-colors"
                      >
                        Areas
                      </a>
                      <a
                        href="#"
                        className="font-medium hover:text-brand-violet transition-colors"
                      >
                        Agents
                      </a>
                      <a
                        href="#"
                        className="font-medium hover:text-brand-violet transition-colors"
                      >
                        About
                      </a>
                    </nav>
                  </div>
                  <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm">
                      Sign In
                    </Button>
                    <Button variant="neon" size="sm">
                      Get Started
                    </Button>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm">
                      📍 Lagos
                    </Button>
                    <Button variant="ghost" size="sm">
                      Filters
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      1,247 properties found
                    </span>
                    <Button variant="ghost" size="sm">
                      Sort ↕
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content Grid Layout */}
          <div className="space-y-6">
            <h3 className="font-heading text-2xl font-semibold">
              Content Grid Layout
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Sidebar */}
              <div className="lg:col-span-1 space-y-4">
                <div className="card-enhanced p-6">
                  <h4 className="font-heading text-lg font-semibold mb-4">
                    Quick Filters
                  </h4>
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                    >
                      🏠 All Properties
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                    >
                      🏢 Apartments
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                    >
                      🏡 Duplexes
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                    >
                      🏘 Bungalows
                    </Button>
                  </div>
                </div>

                <div className="card-enhanced p-6">
                  <h4 className="font-heading text-lg font-semibold mb-4">
                    Popular Areas
                  </h4>
                  <div className="space-y-2">
                    {[
                      "Lekki Phase 1",
                      "Victoria Island",
                      "Ikeja GRA",
                      "Surulere",
                      "Ikoyi",
                    ].map((area) => (
                      <a
                        key={area}
                        href="#"
                        className="block text-sm hover:text-brand-violet transition-colors"
                      >
                        {area}
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="lg:col-span-3 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Array.from({ length: 4 }, (_, i) => (
                    <div key={i} className="card-enhanced group cursor-pointer">
                      <div className="bg-linear-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 h-40 rounded-t-xl"></div>
                      <div className="p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <h4 className="font-heading text-lg font-semibold">
                            Property {i + 1}
                          </h4>
                          <VerifiedBadge size="sm">Verified</VerifiedBadge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Location details
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xl font-bold text-brand-violet">
                            ₦2.5M
                          </span>
                          <Button variant="violet" size="sm">
                            View
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-center gap-2 pt-6">
                  <Button variant="outline" size="sm" disabled>
                    ←
                  </Button>
                  <Button variant="neon" size="sm">
                    1
                  </Button>
                  <Button variant="outline" size="sm">
                    2
                  </Button>
                  <Button variant="outline" size="sm">
                    3
                  </Button>
                  <Button variant="outline" size="sm">
                    →
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Property Listing Form Showcase */}
        <section className="space-y-8">
          <div className="text-center">
            <h2 className="font-heading text-4xl font-bold mb-4">
              Property Listing Form
            </h2>
            <p className="text-muted-foreground">
              Complete property creation form with all Nigerian market amenities
              and features
            </p>
          </div>

          <div className="card-enhanced p-8">
            <h3 className="font-heading text-xl font-semibold mb-6">
              Full Property Listing Form with All Amenities
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              This form includes all the newly implemented amenities and
              features: Power (NEPA, Inverter, Solar), Water (Source, Tank,
              Treatment), Security (Hours, Levy), Boys Quarters details,
              Building specs, Road accessibility, Parking count, and Kitchen
              types.
            </p>

            <div className="bg-muted/50 p-4 rounded-lg mb-6">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> This is a demonstration form. Navigate
                through the steps to see all amenities fields. The form includes
                conditional rendering (e.g., BQ details only show when "Has BQ"
                is checked).
              </p>
            </div>

            <PropertyListingForm
              initialData={{
                propertyType: "apartment",
                purpose: "rent",
                hasBQ: true,
                hasNEPA: true,
                hasWater: true,
                isGated: true,
                hasGoodRoads: true,
                hasInverter: true,
                hasSolarPanels: false,
                hasWaterTreatment: true,
                waterTankCapacity: "2000",
                parkingSpaces: "2",
                kitchenType: "built_in",
                securityHours: "24/7",
                hasSecurityLevy: true,
                securityLevyAmount: "50000",
                bqType: "self_contained",
                bqBathrooms: "1",
                bqKitchen: true,
                bqSeparateEntrance: true,
                bqCondition: "excellent",
                floors: "3",
                buildingMaterial: "concrete",
                yearRenovated: "2022",
                roadAccessibility: "all_year",
              }}
              onSubmit={async (data) => console.log("Form submitted:", data)}
              onSaveDraft={async (data) => console.log("Draft saved:", data)}
            />
          </div>
        </section>

        {/* Property Listing Form with Amenities */}
        <section className="space-y-8">
          <div className="text-center">
            <h2 className="font-heading text-4xl font-bold mb-4">
              Property Listing Form with Amenities
            </h2>
            <p className="text-muted-foreground">
              Complete property creation form showcasing all Nigerian market
              amenities and features
            </p>
          </div>

          <div className="card-enhanced p-8">
            <h3 className="font-heading text-xl font-semibold mb-6">
              Full Property Listing Form
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              This form demonstrates all the newly added amenities and features
              including: Power (NEPA, Inverter, Solar), Water (Tank Capacity,
              Treatment), Security (Hours, Levy), Boys Quarters details,
              Building construction, Road accessibility, Parking spaces, and
              Kitchen types.
            </p>

            {/* Demo Form with Sample Data */}
            <div className="bg-muted/30 p-6 rounded-lg">
              <PropertyListingForm
                initialData={{
                  title: "Modern 3BR Apartment with Full Amenities",
                  description:
                    "Beautiful apartment in Lekki Phase 1 with complete infrastructure",
                  propertyType: "Apartment",
                  purpose: "rent",
                  state: "Lagos",
                  lga: "Eti Osa",
                  area: "Lekki Phase 1",
                  address: "12 Admiralty Way",
                  coordinates: { lat: "6.4474", lng: "3.4715" },
                  bedrooms: "3",
                  bathrooms: "2",
                  toilets: "3",
                  size: "120",
                  yearBuilt: "2020",
                  floors: "5",
                  buildingMaterial: "concrete",
                  yearRenovated: "2023",
                  price: "2500000",
                  serviceCharge: "300000",
                  cautionFee: "500000",
                  legalFee: "200000",
                  agentFee: "300000",
                  hasBQ: true,
                  bqType: "self_contained",
                  bqBathrooms: "1",
                  bqKitchen: true,
                  bqSeparateEntrance: true,
                  bqCondition: "excellent",
                  hasNEPA: true,
                  hasInverter: true,
                  hasSolarPanels: false,
                  hasWater: true,
                  waterTankCapacity: "2000",
                  hasWaterTreatment: true,
                  roadAccessibility: "all_year",
                  parkingSpaces: "2",
                  kitchenType: "built_in",
                  securityHours: "24/7",
                  hasSecurityLevy: true,
                  securityLevyAmount: "50000",
                  infrastructure: [
                    "NEPA/Power Supply",
                    "Inverter",
                    "Borehole/Water Supply",
                    "Water Tank",
                    "Water Treatment System",
                    "Internet Connectivity",
                    "Good Road Network",
                    "Road Accessibility",
                  ],
                  amenities: [
                    "Swimming Pool",
                    "Gym",
                    "Parking Spaces",
                    "Air Conditioning",
                    "Furnished",
                    "Balcony",
                    "Elevator",
                    "Built-in Kitchen",
                  ],
                  security: [
                    "Gated Community",
                    "Security Post",
                    "CCTV Surveillance",
                    "Perimeter Fencing",
                    "Security Guards",
                    "Access Control",
                  ],
                }}
                onSubmit={async (data) => console.log("Form submitted:", data)}
                onSaveDraft={async (data) => console.log("Draft saved:", data)}
              />
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border pt-12 pb-8">
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center gap-4">
              <div className="font-display text-2xl font-bold text-brand-violet">
                RealEST
              </div>
              <StatusBadge variant="verified" size="sm">
                Design System v1.0
              </StatusBadge>
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              This showcase demonstrates the complete RealEST design system
              following the Conservative Professional Palette with 60-30-10
              color architecture, Nigerian market considerations, and modern
              component patterns.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button variant="outline" size="sm">
                View Documentation
              </Button>
              <Button variant="violet" size="sm">
                Start Building
              </Button>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
