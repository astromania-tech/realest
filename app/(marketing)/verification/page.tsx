"use client";

import { Card, Button, Chip } from "@heroui/react";
import Link from "next/link";
import { Header, Footer } from "@/components/layout";
import {
  Shield,
  CheckCircle,
  FileText,
  Camera,
  Users,
  Clock,
  Sparkles,
  AlertTriangle,
  Lock,
} from "lucide-react";

export default function VerificationPage() {
  const verificationSteps = [
    {
      step: "01",
      title: "Document Submission",
      description:
        "Property owners submit all necessary legal documents and ownership proofs.",
      icon: FileText,
      details: [
        "Property deeds and titles",
        "Identification documents",
        "Tax certificates",
        "Utility bills",
      ],
    },
    {
      step: "02",
      title: "Initial Review",
      description:
        "Our legal team reviews all submitted documents for authenticity and completeness.",
      icon: CheckCircle,
      details: [
        "Document verification",
        "Legal compliance check",
        "Ownership validation",
        "Title search",
      ],
    },
    {
      step: "03",
      title: "Physical Inspection",
      description:
        "Certified inspectors visit the property to verify condition and specifications.",
      icon: Camera,
      details: [
        "Property condition assessment",
        "Measurement verification",
        "Photo documentation",
        "Amenity confirmation",
      ],
    },
    {
      step: "04",
      title: "Final Approval",
      description:
        "Property receives verification badge and goes live on the platform.",
      icon: Shield,
      details: [
        "Verification badge assignment",
        "Listing activation",
        "Buyer notifications",
        "Ongoing monitoring",
      ],
    },
  ];

  const verificationTypes = [
    {
      title: "Basic Verification",
      description: "Essential document and ownership verification",
      features: [
        "Document authentication",
        "Ownership verification",
        "Basic listing badge",
        "24/7 support",
      ],
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Premium Verification",
      description: "Comprehensive verification with physical inspection",
      features: [
        "All Basic features",
        "Physical property inspection",
        "Professional photography",
        "Priority support",
        "Enhanced visibility",
      ],
      icon: Shield,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Enterprise Verification",
      description: "Full-service verification for large portfolios",
      features: [
        "All Premium features",
        "Bulk processing",
        "Dedicated account manager",
        "Custom reporting",
        "API integration",
      ],
      icon: Sparkles,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ];

  const benefits = [
    {
      icon: Shield,
      title: "Fraud Prevention",
      description: "Eliminate fake listings and protect buyers from scams",
    },
    {
      icon: Users,
      title: "Trust Building",
      description: "Build confidence between buyers, sellers, and renters",
    },
    {
      icon: CheckCircle,
      title: "Quality Assurance",
      description: "Ensure all property information is accurate and up-to-date",
    },
    {
      icon: Lock,
      title: "Secure Transactions",
      description: "Facilitate safe and secure property transactions",
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
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                Property Verification
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-linear-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent leading-tight">
              Verified Properties,
              <br />
              <span className="text-primary">Trusted Transactions</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
              Our comprehensive verification process ensures every property
              listing is authentic, accurate, and trustworthy.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto mb-12">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">
                  99.9%
                </div>
                <div className="text-sm text-muted-foreground">
                  Verification Accuracy
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">
                  24hrs
                </div>
                <div className="text-sm text-muted-foreground">
                  Average Processing Time
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">50K+</div>
                <div className="text-sm text-muted-foreground">
                  Verified Properties
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Verification Matters
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our verification process protects everyone involved in property
              transactions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <Card.Root
                key={index}
                className="bg-background/80 backdrop-blur-lg border border-border/50 rounded-2xl p-6 text-center hover:shadow-lg transition-shadow"
              >
                <Card.Content className="space-y-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto">
                    <benefit.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">{benefit.title}</h3>
                  <p className="text-muted-foreground text-sm">
                    {benefit.description}
                  </p>
                </Card.Content>
              </Card.Root>
            ))}
          </div>
        </div>
      </section>

      {/* Verification Process */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Our Verification Process
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Every property goes through a rigorous 4-step verification process
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {verificationSteps.map((step, index) => (
              <Card.Root
                key={index}
                className="bg-background/80 backdrop-blur-lg border border-border/50 rounded-2xl p-6 hover:shadow-lg transition-shadow"
              >
                <Card.Content className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
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
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
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

      {/* Verification Types */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Verification Levels
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose the verification level that best fits your property and
              needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {verificationTypes.map((type, index) => (
              <Card.Root
                key={index}
                className="bg-background/80 backdrop-blur-lg border border-border/50 rounded-2xl p-6 hover:shadow-lg transition-shadow"
              >
                <Card.Content className="space-y-6">
                  <div className="text-center space-y-4">
                    <div
                      className={`w-12 h-12 ${type.bgColor} rounded-xl flex items-center justify-center mx-auto`}
                    >
                      <type.icon className={`w-6 h-6 ${type.color}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-xl">{type.title}</h3>
                      <p className="text-muted-foreground text-sm">
                        {type.description}
                      </p>
                    </div>
                  </div>

                  <ul className="space-y-3">
                    {type.features.map((feature, featureIndex) => (
                      <li
                        key={featureIndex}
                        className="flex items-center gap-3 text-sm"
                      >
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="w-full bg-primary hover:bg-primary/90"
                    variant={index === 1 ? "primary" : "secondary"}
                  >
                    {index === 0
                      ? "Get Started"
                      : index === 1
                        ? "Choose Premium"
                        : "Contact Sales"}
                  </Button>
                </Card.Content>
              </Card.Root>
            ))}
          </div>
        </div>
      </section>

      {/* Warning Section */}
      <section className="py-16 bg-red-50">
        <div className="container mx-auto px-4">
          <Card.Root className="bg-white/80 backdrop-blur-lg border border-red-200 rounded-2xl p-8 max-w-4xl mx-auto">
            <Card.Content className="text-center space-y-6">
              <div className="flex items-center justify-center gap-3">
                <AlertTriangle className="w-8 h-8 text-red-600" />
                <h3 className="text-2xl font-bold text-red-800">
                  Important Notice
                </h3>
              </div>
              <div className="space-y-4 text-left max-w-2xl mx-auto">
                <p className="text-red-700">
                  <strong>Unverified properties pose significant risks:</strong>
                </p>
                <ul className="space-y-2 text-red-700 ml-6">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    Fake or non-existent properties
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    Fraudulent ownership claims
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    Inaccurate property information
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    Legal disputes and financial loss
                  </li>
                </ul>
                <p className="text-red-700 font-medium">
                  Always choose verified properties to protect your investment
                  and ensure a smooth transaction.
                </p>
              </div>
            </Card.Content>
          </Card.Root>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card.Root className="bg-linear-to-r from-primary/5 to-secondary/5 border border-primary/20 rounded-2xl p-8 md:p-12 text-center">
            <Card.Content className="max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to List Your Property?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Join thousands of verified property owners and get your property
                verified today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/sell">
                  <Button
                    size="lg"
                    className="bg-primary hover:bg-primary/90 px-8 rounded-xl font-semibold gap-2"
                  >
                    <Shield className="w-5 h-5" />
                    Start Verification
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="px-8 rounded-xl font-semibold gap-2"
                  >
                    <FileText className="w-5 h-5" />
                    Learn More
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
