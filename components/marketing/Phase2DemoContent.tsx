'use client'

import React, { useState } from 'react'
import { useRealEstTheme } from '@/components/providers/RealEstThemeProvider'
import { ThemeToggleDropdown } from '@/components/ui/theme-toggle-wrapper'
import {
  RealEstButton,
  FindPropertiesButton,
  ContactOwnerButton,
  VerifyPropertyButton,
  ListPropertyButton
} from '@/components/heroui/RealEstButton'
import {
  RealEstCard,
  PropertyCard,
  AgentCard,
  FeaturedPropertyCard,
  NigerianPropertyCard
} from '@/components/heroui/RealEstCard'
import {
  ProgressRing,
  StatusDot,
  StatusIndicator,
  LoadingDots,
  LoadingSpinner,
  AlertBanner,
  VerificationProgress,
  AvailabilityIndicator,
  InfrastructureIndicator,
  Toast,
  PropertySavedToast,
  VerificationCompleteToast,
  ContactRequestToast
} from '@/components/untitledui/StatusComponents'
import { StatusBadge, VerifiedBadge } from '@/components/ui/status-badge'
import { VerificationBadge } from '@/components/realest'
import * as RealEstLogoNS from '@/components/ui/RealEstLogo'
const RealEstLogo = (RealEstLogoNS as any).default || RealEstLogoNS

export default function Phase2DemoContent() {
  const { theme, effectiveTheme, systemTheme } = useRealEstTheme()
  const [toastVisible, setToastVisible] = useState(false)
  const [toastType, setToastType] = useState<'saved' | 'verified' | 'contact'>('saved')

  const showToast = (type: 'saved' | 'verified' | 'contact') => {
    setToastType(type)
    setToastVisible(true)
    setTimeout(() => setToastVisible(false), 4000)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold text-brand-violet">RealEST Phase 2</h1>
              <p className="text-sm text-muted-foreground">Component Library Integration Demo</p>
            </div>
            <div className="flex items-center gap-4">
              <StatusIndicator
                label={`${effectiveTheme} mode ${theme === 'system' ? '(auto)' : ''}`}
                status="verified"
                position="left"
              />
              <ThemeToggleDropdown size="sm" />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 space-y-16">
        {/* Component Library Strategy Overview */}
        <section className="text-center space-y-6">
          <div className="space-y-4">
            <h1 className="font-display text-5xl font-bold bg-gradient-brand bg-clip-text text-transparent">
              Phase 2: Component Integration
            </h1>
            <p className="font-body text-xl text-muted-foreground max-w-4xl mx-auto">
              Current: 20% HeroUI • 5% UntitledUI • 75% Shadcn — Target: 70% / 25% / 5%
            </p>
          </div>

          {/* Strategy Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <RealEstCard variant="elevated" className="p-6 text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-brand-violet/10 rounded-full flex items-center justify-center">
                <ProgressRing value={20} size="lg" color="violet" showValue />
              </div>
              <div>
                <h3 className="font-heading text-xl font-semibold">HeroUI v3</h3>
                <p className="text-sm text-muted-foreground">Current ~20% (auth/public). Target 70% as primary forms/buttons/cards/navigation.</p>
              </div>
            </RealEstCard>

            <RealEstCard variant="elevated" className="p-6 text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-brand-neon/10 rounded-full flex items-center justify-center">
                <ProgressRing value={5} size="lg" color="neon" showValue />
              </div>
              <div>
                <h3 className="font-heading text-xl font-semibold">UntitledUI</h3>
                <p className="text-sm text-muted-foreground">Current ~5% (status-components.tsx). Target 25% for status/progress/alerts.</p>
              </div>
            </RealEstCard>

            <RealEstCard variant="elevated" className="p-6 text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-gray-500/10 rounded-full flex items-center justify-center">
                <ProgressRing value={75} size="lg" color="default" showValue />
              </div>
              <div>
                <h3 className="font-heading text-xl font-semibold">Shadcn</h3>
                <p className="text-sm text-muted-foreground">Current ~75% (components/ui/*). Target 5% for complex patterns only.</p>
              </div>
            </RealEstCard>
          </div>
        </section>

        {/* HeroUI Components (70%) */}
        <section className="space-y-8">
          <div className="text-center">
            <h2 className="font-heading text-4xl font-bold mb-4">HeroUI Components (70%)</h2>
            <p className="text-muted-foreground">Primary component library with RealEST brand integration</p>
          </div>

          {/* Button Showcase */}
          <div className="space-y-6">
            <h3 className="font-heading text-2xl font-semibold">RealEST Button System</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-4">
                <h4 className="font-heading text-lg font-medium">Property Actions</h4>
                <div className="space-y-3">
                  <FindPropertiesButton className="w-full" onClick={() => showToast('saved')} />
                  <ContactOwnerButton className="w-full" onClick={() => showToast('contact')} />
                  <VerifyPropertyButton className="w-full" onClick={() => showToast('verified')} />
                  <ListPropertyButton className="w-full" />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-heading text-lg font-medium">Standard Variants</h4>
                <div className="space-y-3">
                  <RealEstButton variant="primary" className="w-full">Primary</RealEstButton>
                  <RealEstButton variant="secondary" className="w-full">Secondary</RealEstButton>
                  <RealEstButton variant="tertiary" className="w-full">Tertiary</RealEstButton>
                  <RealEstButton variant="ghost" className="w-full">Ghost</RealEstButton>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-heading text-lg font-medium">Brand Variants</h4>
                <div className="space-y-3">
                  <RealEstButton variant="neon" className="w-full">Neon Primary</RealEstButton>
                  <RealEstButton variant="violet" className="w-full">Violet Secondary</RealEstButton>
                  <RealEstButton variant="danger" className="w-full">Danger</RealEstButton>
                  <RealEstButton variant="neon" isLoading className="w-full">Loading State</RealEstButton>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-heading text-lg font-medium">Sizes & States</h4>
                <div className="space-y-3">
                  <RealEstButton variant="violet" size="sm" className="w-full">Small</RealEstButton>
                  <RealEstButton variant="violet" size="default" className="w-full">Medium</RealEstButton>
                  <RealEstButton variant="violet" size="lg" className="w-full">Large</RealEstButton>
                  <RealEstButton variant="violet" disabled className="w-full">Disabled</RealEstButton>
                </div>
              </div>
            </div>
          </div>

          {/* Card Showcase */}
          <div className="space-y-6">
            <h3 className="font-heading text-2xl font-semibold">RealEST Card System</h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Standard Property Card */}
              <PropertyCard
                title="Modern 3BR Apartment"
                location="Lekki Phase 1, Lagos"
                price="2,500,000"
                bedrooms={3}
                bathrooms={2}
                area="120 m²"
                isVerified={true}
                status="available"
                badges={["Gated Community"]}
                onView={() => console.log('View property')}
                onContact={() => showToast('contact')}
                onSave={() => showToast('saved')}
              />

              {/* Featured Property Card */}
              <FeaturedPropertyCard
                title="Luxury 4BR Duplex"
                location="Victoria Island, Lagos"
                price="8,500,000"
                bedrooms={4}
                bathrooms={3}
                area="250 m²"
                isVerified={true}
                status="available"
                badges={["Premium", "Sea View"]}
                onView={() => console.log('View featured property')}
                onContact={() => showToast('contact')}
                onSave={() => showToast('saved')}
              />

              {/* Nigerian Property Card */}
              <NigerianPropertyCard
                title="2BR + BQ Self-Contained"
                location="Ikeja GRA, Lagos"
                price="1,800,000"
                bedrooms={2}
                bathrooms={2}
                area="100 m²"
                hasNEPA={true}
                hasWater={true}
                isGated={true}
                hasBQ={true}
                isPending={true}
                status="available"
                onView={() => console.log('View Nigerian property')}
                onContact={() => showToast('contact')}
                onSave={() => showToast('saved')}
              />
            </div>
          </div>

          {/* Agent Cards */}
          <div className="space-y-6">
            <h3 className="font-heading text-2xl font-semibold">Agent Profiles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <AgentCard
                name="Adebayo Johnson"
                title="Senior Property Agent"
                company="RealEST Verified"
                rating={4.8}
                totalProperties={127}
                phone="+234 901 234 5678"
                email="adebayo@realest.ng"
                isVerified={true}
                onContact={() => showToast('contact')}
                onViewProfile={() => console.log('View agent profile')}
              />
              <AgentCard
                name="Chinwe Okafor"
                title="Property Consultant"
                company="Lagos Properties"
                rating={4.9}
                totalProperties={89}
                phone="+234 902 345 6789"
                isVerified={true}
                onContact={() => showToast('contact')}
                onViewProfile={() => console.log('View agent profile')}
              />
              <AgentCard
                name="Ibrahim Musa"
                title="Real Estate Agent"
                rating={4.7}
                totalProperties={156}
                phone="+234 903 456 7890"
                onContact={() => showToast('contact')}
                onViewProfile={() => console.log('View agent profile')}
              />
              <AgentCard
                name="Funmi Adebisi"
                title="Property Manager"
                company="Elite Homes"
                rating={4.6}
                totalProperties={203}
                isVerified={true}
                onContact={() => showToast('contact')}
                onViewProfile={() => console.log('View agent profile')}
              />
            </div>
          </div>
        </section>

        {/* UntitledUI Components (25%) */}
        <section className="space-y-8">
          <div className="text-center">
            <h2 className="font-heading text-4xl font-bold mb-4">UntitledUI Components (25%)</h2>
            <p className="text-muted-foreground">Micro-components for status, progress, and state management</p>
          </div>

          {/* Status & Progress Components */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Progress Indicators */}
            <RealEstCard variant="elevated" className="p-8 space-y-6">
              <h3 className="font-heading text-xl font-semibold">Progress Indicators</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Verification Progress</span>
                  <ProgressRing value={75} color="violet" showValue />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Listing Completion</span>
                  <ProgressRing value={60} color="neon" showValue />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Profile Setup</span>
                  <ProgressRing value={100} color="success" showValue />
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <VerificationProgress
                  step={2}
                  totalSteps={4}
                  steps={[
                    'Property Details Submitted',
                    'Location Verified',
                    'Photos Approved',
                    'Final Review'
                  ]}
                />
              </div>
            </RealEstCard>

            {/* Status Indicators */}
            <RealEstCard variant="elevated" className="p-8 space-y-6">
              <h3 className="font-heading text-xl font-semibold">Status Indicators</h3>

              <div className="space-y-4">
                <StatusIndicator label="Property Online" status="online" />
                <StatusIndicator label="Agent Available" status="verified" />
                <StatusIndicator label="Verification Pending" status="pending" />
                <StatusIndicator label="System Maintenance" status="away" />
                <StatusIndicator label="Agent Busy" status="busy" />
              </div>

              <div className="pt-4 border-t border-border space-y-4">
                <AvailabilityIndicator
                  status="available"
                  lastUpdated="2 hours ago"
                />
                <AvailabilityIndicator
                  status="pending"
                  lastUpdated="1 day ago"
                />
                <AvailabilityIndicator
                  status="rented"
                  lastUpdated="3 days ago"
                />
              </div>
            </RealEstCard>
          </div>

          {/* Loading States */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <RealEstCard variant="default" className="p-6 text-center space-y-4">
              <h4 className="font-heading font-semibold">Loading Spinner</h4>
              <LoadingSpinner size="lg" color="violet" />
              <p className="text-sm text-muted-foreground">Processing request...</p>
            </RealEstCard>

            <RealEstCard variant="default" className="p-6 text-center space-y-4">
              <h4 className="font-heading font-semibold">Loading Dots</h4>
              <LoadingDots />
              <p className="text-sm text-muted-foreground">Uploading images...</p>
            </RealEstCard>

            <RealEstCard variant="default" className="p-6 text-center space-y-4">
              <h4 className="font-heading font-semibold">Neon Spinner</h4>
              <LoadingSpinner size="lg" color="neon" />
              <p className="text-sm text-muted-foreground">Verifying location...</p>
            </RealEstCard>

            <RealEstCard variant="default" className="p-6 text-center space-y-4">
              <h4 className="font-heading font-semibold">Button Loading</h4>
              <RealEstButton variant="neon" isLoading className="w-full">
                Processing...
              </RealEstButton>
              <p className="text-sm text-muted-foreground">Payment processing...</p>
            </RealEstCard>
          </div>

          {/* Alert Banners */}
          <div className="space-y-4">
            <h3 className="font-heading text-2xl font-semibold">Alert Banners</h3>
            <div className="space-y-4">
              <AlertBanner variant="success" title="Property Verified Successfully">
                Your property has been verified and is now live on RealEST marketplace.
              </AlertBanner>

              <AlertBanner variant="warning" title="Incomplete Listing" dismissible>
                Please add property photos to complete your listing and attract more viewers.
              </AlertBanner>

              <AlertBanner variant="error" title="Verification Failed">
                The provided location coordinates could not be verified. Please check and resubmit.
              </AlertBanner>

              <AlertBanner variant="info" title="New Feature Available">
                You can now add virtual tour links to your property listings for better engagement.
              </AlertBanner>

              <AlertBanner variant="neon" title="Premium Listing Active">
                Your property is now featured at the top of search results for the next 30 days.
              </AlertBanner>
            </div>
          </div>

          {/* Nigerian Market Infrastructure */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <RealEstCard variant="default" className="p-6">
              <InfrastructureIndicator
                hasNEPA={true}
                hasWater={true}
                hasInternet={true}
                hasGoodRoads={false}
              />
            </RealEstCard>

            <RealEstCard variant="default" className="p-6">
              <InfrastructureIndicator
                hasNEPA={false}
                hasWater={true}
                hasInternet={true}
                hasGoodRoads={true}
              />
            </RealEstCard>

            <RealEstCard variant="default" className="p-6">
              <InfrastructureIndicator
                hasNEPA={true}
                hasWater={false}
                hasInternet={false}
                hasGoodRoads={true}
              />
            </RealEstCard>
          </div>
        </section>

        {/* Footer Message */}
        <section className="text-center py-12">
          <RealEstCard variant="elevated" className="p-12 max-w-2xl mx-auto">
            <h3 className="font-heading text-2xl font-bold mb-4">Migration Path</h3>
            <p className="text-muted-foreground mb-4">
              This demo showcases the 70-25-5 component strategy. As more HeroUI components are integrated and Shadcn is deprecated for complex patterns, the dashboard will update to reflect the target distribution.
            </p>
            <div className="flex gap-4 justify-center">
              <RealEstButton variant="primary">View Status</RealEstButton>
              <RealEstButton variant="ghost">Learn More</RealEstButton>
            </div>
          </RealEstCard>
        </section>
      </main>
    </div>
  )
}
