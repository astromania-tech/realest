"use client";

import { Card, Button, Chip } from "@heroui/react";
import Link from "next/link";
import { Header, Footer } from "@/components/layout";
import {
  Search,
  Shield,
  CheckCircle,
  Users,
  FileText,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Home,
  Building,
  Calendar,
} from "lucide-react";

export default function HowItWorksPage() {
  const buyerSteps = [
    {
      step: "01",
      title: "Search & Discover",
      description:
        "Browse our verified property listings with advanced filters and search tools.",
      icon: Search,
      details: [
        "Advanced search filters",
        "Real-time property updates",
        "Virtual tours available",
      ],
    },
    {
      step: "02",
      title: "Verify Authenticity",
      description:
        "Every property is thoroughly verified with documents, inspections, and owner confirmation.",
      icon: Shield,
      details: [
        "Document verification",
        "Property inspections",
        "Owner authentication",
      ],
    },
    {
      step: "03",
      title: "Connect & Inquire",
      description:
        "Contact verified owners directly through our secure messaging system.",
      icon: Users,
      details: [
        "Direct owner communication",
        "Secure inquiry system",
        "Schedule viewings",
      ],
    },
    {
      step: "04",
      title: "Complete Purchase",
      description:
        "Finalize your purchase with our secure transaction process and legal support.",
      icon: CheckCircle,
      details: [
        "Legal document handling",
        "Secure transactions",
        "Professional support",
      ],
    },
  ];

  const sellerSteps = [
    {
      step: "01",
      title: "List Your Property",
      description:
        "Create a detailed listing with photos, specifications, and pricing information.",
      icon: Building,
      details: [
        "Professional photography",
        "Detailed specifications",
        "Market pricing guidance",
      ],
    },
    {
      step: "02",
      title: "Verification Process",
      description:
        "Our team verifies your property details and prepares all necessary documentation.",
      icon: FileText,
      details: [
        "Document collection",
        "Property verification",
        "Legal compliance check",
      ],
    },
    {
      step: "03",
      title: "Reach Buyers",
      description:
        "Your verified listing reaches thousands of qualified buyers actively searching.",
      icon: TrendingUp,
      details: ["Wide buyer reach", "Targeted marketing", "Featured listings"],
    },
    {
      step: "04",
      title: "Close the Deal",
      description:
        "Complete the sale with our secure escrow service and professional assistance.",
      icon: CheckCircle,
      details: [
        "Secure escrow service",
        "Legal assistance",
        "Transaction support",
      ],
    },
  ];

  const features = [
    {
      icon: Shield,
      title: "Property Verification",
      description:
        "Every property undergoes rigorous verification including document checks, physical inspections, and owner authentication.",
    },
    {
      icon: Users,
      title: "Direct Communication",
      description:
        "Connect directly with verified property owners through our secure messaging platform.",
    },
    {
      icon: FileText,
      title: "Legal Support",
      description:
        "Access to legal templates, document handling, and professional guidance throughout the process.",
    },
    {
      icon: TrendingUp,
      title: "Market Insights",
      description:
        "Get real-time market data, pricing trends, and expert analysis to make informed decisions.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-linear-to-br from-primary/10 via-primary/5 to-secondary/20" />
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/50 to-transparent" />

        {/* Floating Elements */}
        <div className="absolute top-10 right-10 w-16 h-16 bg-primary/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-10 left-10 w-20 h-20 bg-secondary/10 rounded-full blur-xl animate-pulse delay-500" />

        <div className="relative z-10 container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                How It Works
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-linear-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent leading-tight">
              Simple, Secure,
              <br />
              <span className="text-primary">Verified</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
              Our streamlined process eliminates the complexity and uncertainty
              of traditional property transactions.
            </p>
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose RealEST?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We combine cutting-edge technology with traditional real estate
              expertise to create a better experience for everyone.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card.Root
                key={index}
                className="bg-background/80 backdrop-blur-lg border border-border/50 rounded-2xl p-6 text-center hover:shadow-lg transition-shadow"
              >
                <Card.Content className="space-y-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">
                    {feature.description}
                  </p>
                </Card.Content>
              </Card.Root>
            ))}
          </div>
        </div>
      </section>

      {/* Buyer Process */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              For Property Buyers
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Finding your dream property has never been easier or more secure.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {buyerSteps.map((step, index) => (
              <Card.Root
                key={index}
                className="bg-background/80 backdrop-blur-lg border border-border/50 rounded-2xl p-6 hover:shadow-lg transition-shadow"
              >
                <Card.Content className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0">
                      {step.step}
                    </div>
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-2">
                        <step.icon className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold text-lg">{step.title}</h3>
                      </div>
                      <p className="text-muted-foreground">
                        {step.description}
                      </p>
                      <ul className="space-y-1">
                        {step.details.map((detail, detailIndex) => (
                          <li
                            key={detailIndex}
                            className="text-sm text-muted-foreground flex items-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card.Content>
              </Card.Root>
            ))}
          </div>
        </div>
      </section>

      {/* Seller Process */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              For Property Sellers
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Sell your property quickly and securely with our comprehensive
              listing and verification process.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {sellerSteps.map((step, index) => (
              <Card.Root
                key={index}
                className="bg-background/80 backdrop-blur-lg border border-border/50 rounded-2xl p-6 hover:shadow-lg transition-shadow"
              >
                <Card.Content className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0">
                      {step.step}
                    </div>
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-2">
                        <step.icon className="w-5 h-5 text-secondary" />
                        <h3 className="font-semibold text-lg">{step.title}</h3>
                      </div>
                      <p className="text-muted-foreground">
                        {step.description}
                      </p>
                      <ul className="space-y-1">
                        {step.details.map((detail, detailIndex) => (
                          <li
                            key={detailIndex}
                            className="text-sm text-muted-foreground flex items-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card.Content>
              </Card.Root>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card.Root className="bg-linear-to-r from-primary/5 to-secondary/5 border border-primary/20 rounded-2xl p-8 md:p-12 text-center">
            <Card.Content className="max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Join thousands of satisfied users who have successfully bought
                and sold properties through our platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/buy">
                  <Button
                    size="lg"
                    className="bg-primary hover:bg-primary/90 px-8 rounded-xl font-semibold gap-2"
                  >
                    <Home className="w-5 h-5" />
                    Start Buying
                  </Button>
                </Link>
                <Link href="/sell">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="px-8 rounded-xl font-semibold gap-2"
                  >
                    <Building className="w-5 h-5" />
                    Start Selling
                  </Button>
                </Link>
              </div>
            </Card.Content>
          </Card.Root>
        </div>
      </section>

      <Footer />
    </div>
  );
}
