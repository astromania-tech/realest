'use client'

import { useState } from 'react'
import Link from 'next/link'
import { RealEstButton } from '@/components/heroui/RealEstButton'
import { StatusBadge } from '@/components/ui/status-badge'
import {
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowRight,
  ExternalLink,
  Zap,
  Home,
  Users,
  Shield,
  Palette,
  Code,
  Globe,
  Star,
  TrendingUp,
  Eye,
  Settings,
  Smartphone
} from 'lucide-react'

interface FeatureStatus {
  name: string
  status: 'complete' | 'partial' | 'pending'
  description: string
  progress: number
  href?: string
  icon: any
}

interface PhaseData {
  phase: string
  title: string
  description: string
  overall: number
  features: FeatureStatus[]
}

export default function RealESTStatusPage() {
  const [selectedPhase, setSelectedPhase] = useState<string>('current')

  const phases: PhaseData[] = [
    {
      phase: 'foundation',
      title: 'Phase 1: Foundation',
      description: 'Design system, typography, colors, and core infrastructure',
      overall: 100,
      features: [
        {
          name: 'OKLCH Color System',
          status: 'complete',
          description: '60-30-10 rule with Navy, Violet, Neon palette',
          progress: 100,
          icon: Palette
        },
        {
          name: '4-Tier Typography',
          status: 'complete',
          description: 'Lufga, Neulis Neue, Space Grotesk, JetBrains Mono',
          progress: 100,
          icon: Code
        },
        {
          name: 'Design Tokens',
          status: 'complete',
          description: 'Spacing, shadows, animations, border radius',
          progress: 100,
          icon: Settings
        },
        {
          name: 'Responsive Breakpoints',
          status: 'complete',
          description: 'Mobile-first design system',
          progress: 100,
          icon: Smartphone
        }
      ]
    },
    {
      phase: 'components',
      title: 'Phase 2: Core Components',
      description: 'Component library with HeroUI v3, UntitledUI, and custom components',
      overall: 95,
      features: [
        {
          name: 'RealEstButton',
          status: 'complete',
          description: '7 variants + Nigerian-specific buttons',
          progress: 100,
          icon: Code,
          href: '/form-showcase'
        },
        {
          name: 'StatusBadge System',
          status: 'complete',
          description: 'Verification, availability, status indicators',
          progress: 100,
          icon: Shield
        },
        {
          name: 'HeroUI Integration',
          status: 'complete',
          description: 'Primary component library (70% usage)',
          progress: 100,
          icon: Code
        },
        {
          name: 'UntitledUI Integration',
          status: 'complete',
          description: 'Status components and loading states (25% usage)',
          progress: 100,
          icon: Clock
        }
      ]
    },
    {
      phase: 'navigation',
      title: 'Phase 3: Layout & Navigation',
      description: 'Navigation, layouts, and page structure',
      overall: 85,
      features: [
        {
          name: 'RealEST Header',
          status: 'complete',
          description: 'Branded navigation with mobile menu',
          progress: 100,
          icon: Globe
        },
        {
          name: 'Property Layouts',
          status: 'complete',
          description: 'Property detail and listing layouts',
          progress: 100,
          icon: Home,
          href: '/search'
        },
        {
          name: 'Dashboard Layouts',
          status: 'partial',
          description: 'Owner, buyer, admin dashboards need styling updates',
          progress: 70,
          icon: Users
        },
        {
          name: 'Footer Component',
          status: 'complete',
          description: 'Comprehensive footer with RealEST branding',
          progress: 100,
          icon: Globe
        }
      ]
    },
    {
      phase: 'patterns',
      title: 'Phase 4: Advanced Patterns',
      description: 'Form patterns, workflows, and complex interactions',
      overall: 100,
      features: [
        {
          name: 'Form Pattern Library',
          status: 'complete',
          description: '8 comprehensive forms with Nigerian market integration',
          progress: 100,
          icon: Code,
          href: '/form-showcase'
        },
        {
          name: 'Property Verification Flow',
          status: 'complete',
          description: 'Admin workflow for property approval',
          progress: 100,
          icon: Shield
        },
        {
          name: 'Advanced Search',
          status: 'complete',
          description: 'Comprehensive filtering with infrastructure options',
          progress: 100,
          icon: Eye,
          href: '/search'
        },
        {
          name: 'Review & Rating System',
          status: 'complete',
          description: 'Star ratings with category breakdowns',
          progress: 100,
          icon: Star
        }
      ]
    },
    {
      phase: 'current',
      title: 'Phase 5: Visual Consistency (CURRENT)',
      description: 'Property experience transformation and visual integration',
      overall: 95,
      features: [
        {
          name: 'Property Detail Pages',
          status: 'complete',
          description: 'Enhanced with RealEST design system and Nigerian features',
          progress: 100,
          icon: Home,
          href: '/property/demo'
        },
        {
          name: 'Search & Listing Pages',
          status: 'complete',
          description: 'Advanced search integration with multiple view modes',
          progress: 100,
          icon: Eye,
          href: '/search'
        },
        {
          name: 'Form Integration',
          status: 'complete',
          description: 'All forms integrated into actual pages',
          progress: 100,
          icon: Code
        },
        {
          name: 'Brand Consistency',
          status: 'complete',
          description: 'RealProof → RealEST migration completed',
          progress: 100,
          icon: Palette
        }
      ]
    }
  ]

  const nigerianFeatures = [
    'Complete Nigerian states and LGAs support',
    'Boys Quarters (BQ) property type integration',
    'NEPA/power supply indicators',
    'Water supply and infrastructure scoring',
    'Gated community and security features',
    'Naira currency formatting',
    'Cultural sensitivity in messaging',
    'Local phone number patterns (+234)'
  ]

  const accessibilityFeatures = [
    'WCAG 2.1 AA compliance',
    'Keyboard navigation support',
    'Screen reader optimization',
    'High contrast mode support',
    '4.5:1 minimum color contrast',
    'Focus management and indicators',
    'Semantic HTML structure',
    'ARIA labels and roles'
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="w-4 h-4 text-success" />
      case 'partial':
        return <Clock className="w-4 h-4 text-warning" />
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-error" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'complete':
        return <StatusBadge variant="verified" size="sm">Complete</StatusBadge>
      case 'partial':
        return <StatusBadge variant="pending" size="sm">In Progress</StatusBadge>
      case 'pending':
        return <StatusBadge variant="rejected" size="sm">Pending</StatusBadge>
      default:
        return null
    }
  }

  const currentPhase = phases.find(p => p.phase === selectedPhase) || phases[phases.length - 1]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 border-b border-border">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-success/10 border border-success/20 rounded-full px-4 py-2 mb-6">
              <TrendingUp className="w-4 h-4 text-success" />
              <span className="text-sm font-medium text-success">95% Complete</span>
            </div>
            <h1 className="text-display-1 font-heading font-bold mb-6">
              RealEST Rebranding
              <br />
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Transformation Status
              </span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Complete overview of the RealEST marketplace rebranding progress.
              From RealProof to RealEST - Nigeria's premier geo-verified property marketplace.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-2xl p-6 sticky top-8">
              <h3 className="font-heading font-semibold text-lg mb-4">Phases</h3>
              <div className="space-y-2">
                {phases.map((phase) => (
                  <button
                    key={phase.phase}
                    onClick={() => setSelectedPhase(phase.phase)}
                    className={`w-full text-left p-3 rounded-xl transition-colors ${
                      selectedPhase === phase.phase
                        ? 'bg-primary/10 text-primary border border-primary/20'
                        : 'hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{phase.title}</span>
                      <span className="text-xs font-mono">{phase.overall}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1">
                      <div
                        className="bg-gradient-to-r from-primary to-accent h-1 rounded-full transition-all"
                        style={{ width: `${phase.overall}%` }}
                      />
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-border">
                <h4 className="font-heading font-semibold mb-3">Quick Links</h4>
                <div className="space-y-2">
                  <RealEstButton variant="outline" size="sm" className="w-full justify-start" asChild>
                    <Link href="/form-showcase">
                      <Code className="w-4 h-4 mr-2" />
                      Form Showcase
                    </Link>
                  </RealEstButton>
                  <RealEstButton variant="outline" size="sm" className="w-full justify-start" asChild>
                    <Link href="/search">
                      <Eye className="w-4 h-4 mr-2" />
                      Property Search
                    </Link>
                  </RealEstButton>
                  <RealEstButton variant="outline" size="sm" className="w-full justify-start" asChild>
                    <Link href="/design-showcase">
                      <Palette className="w-4 h-4 mr-2" />
                      Design System
                    </Link>
                  </RealEstButton>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Phase Overview */}
            <div className="bg-card border border-border rounded-2xl p-6 mb-8">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-heading font-bold mb-2">{currentPhase.title}</h2>
                  <p className="text-muted-foreground">{currentPhase.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-heading font-bold text-primary mb-1">
                    {currentPhase.overall}%
                  </div>
                  <div className="text-sm text-muted-foreground">Complete</div>
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-primary to-accent h-3 rounded-full transition-all"
                  style={{ width: `${currentPhase.overall}%` }}
                />
              </div>
            </div>

            {/* Features List */}
            <div className="space-y-4 mb-8">
              {currentPhase.features.map((feature, index) => (
                <div key={index} className="bg-card border border-border rounded-2xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-heading font-semibold">{feature.name}</h3>
                        <div className="flex items-center gap-2 ml-4">
                          {getStatusBadge(feature.status)}
                          {feature.href && (
                            <RealEstButton variant="ghost" size="sm" asChild>
                              <Link href={feature.href}>
                                <ExternalLink className="w-4 h-4" />
                              </Link>
                            </RealEstButton>
                          )}
                        </div>
                      </div>
                      <p className="text-muted-foreground text-sm mb-3">{feature.description}</p>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all"
                            style={{ width: `${feature.progress}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono font-medium">{feature.progress}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Nigerian Market Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gradient-to-br from-success/5 to-success/10 border border-success/20 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-success/20 rounded-xl flex items-center justify-center">
                    <Zap className="w-5 h-5 text-success" />
                  </div>
                  <h3 className="font-heading font-semibold text-lg">Nigerian Market Integration</h3>
                </div>
                <div className="space-y-2">
                  {nigerianFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-success shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-info/5 to-info/10 border border-info/20 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-info/20 rounded-xl flex items-center justify-center">
                    <Eye className="w-5 h-5 text-info" />
                  </div>
                  <h3 className="font-heading font-semibold text-lg">Accessibility Standards</h3>
                </div>
                <div className="space-y-2">
                  {accessibilityFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-info shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Overall Statistics */}
            <div className="bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20 rounded-2xl p-6">
              <h3 className="font-heading font-semibold text-lg mb-6">Transformation Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-heading font-bold text-primary mb-1">8</div>
                  <div className="text-sm text-muted-foreground">Form Patterns</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-heading font-bold text-primary mb-1">50+</div>
                  <div className="text-sm text-muted-foreground">Components</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-heading font-bold text-primary mb-1">100%</div>
                  <div className="text-sm text-muted-foreground">Brand Consistency</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-heading font-bold text-primary mb-1">WCAG AA</div>
                  <div className="text-sm text-muted-foreground">Accessibility</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <RealEstButton size="lg" className="flex-1" asChild>
                <Link href="/search">
                  <Eye className="w-5 h-5 mr-2" />
                  Explore Properties
                </Link>
              </RealEstButton>
              <RealEstButton variant="outline" size="lg" className="flex-1" asChild>
                <Link href="/form-showcase">
                  <Code className="w-5 h-5 mr-2" />
                  View Form Patterns
                </Link>
              </RealEstButton>
              <RealEstButton variant="ghost" size="lg" className="flex-1" asChild>
                <Link href="/">
                  <ArrowRight className="w-5 h-5 mr-2" />
                  Back to Homepage
                </Link>
              </RealEstButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
