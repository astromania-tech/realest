"use client";

import { Card, Chip } from "@heroui/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Header, Footer } from "@/components/layout";
import {
  Building,
  Users,
  Shield,
  TrendingUp,
  CheckCircle,
  Sparkles,
  ArrowRight,
  Camera,
  FileText,
  Star,
  Clock,
  DollarSign,
} from "lucide-react";

export default function ListWithUsPage() {
  const benefits = [
    {
      icon: Shield,
      title: "Complete Verification",
      description:
        "Your property undergoes rigorous verification including document checks, physical inspections, and ownership confirmation.",
    },
    {
      icon: Users,
      title: "Reach Serious Buyers",
      description:
        "Connect with pre-qualified buyers actively searching for properties like yours across Nigeria.",
    },
    {
      icon: TrendingUp,
      title: "Premium Exposure",
      description:
        "Featured listings get priority placement and appear in targeted searches to maximize visibility.",
    },
    {
      icon: CheckCircle,
      title: "Secure Transactions",
      description:
        "Our escrow service and legal support ensure safe, transparent transactions from start to finish.",
    },
  ];

  const process = [
    {
      step: "01",
      title: "Submit Your Property",
      description:
        "Create a detailed listing with specifications, pricing, and property details.",
      icon: FileText,
      details: [
        "Property specifications",
        "Pricing information",
        "Location details",
      ],
    },
    {
      step: "02",
      title: "Professional Photography",
      description:
        "Our team captures stunning professional photos to showcase your property.",
      icon: Camera,
      details: [
        "High-quality photos",
        "Virtual tours available",
        "Drone photography",
      ],
    },
    {
      step: "03",
      title: "Verification Process",
      description:
        "Complete document verification and property inspection for credibility.",
      icon: Shield,
      details: [
        "Document authentication",
        "Property inspection",
        "Ownership verification",
      ],
    },
    {
      step: "04",
      title: "Go Live & Connect",
      description:
        "Your verified listing goes live and starts receiving inquiries from serious buyers.",
      icon: TrendingUp,
      details: [
        "Instant visibility",
        "Buyer inquiries",
        "Direct communication",
      ],
    },
  ];

  const pricing = [
    {
      plan: "Basic",
      price: "Free",
      popular: false,
      features: [
        "Property listing",
        "Basic verification",
        "Standard visibility",
        "Email support",
        "Basic analytics",
      ],
    },
    {
      plan: "Premium",
      price: "₦25,000",
      popular: true,
      features: [
        "Everything in Basic",
        "Priority verification",
        "Featured listing",
        "Professional photography",
        "Virtual tours",
        "Advanced analytics",
        "Priority support",
      ],
    },
    {
      plan: "Enterprise",
      price: "Custom",
      popular: false,
      features: [
        "Everything in Premium",
        "Bulk property listings",
        "Dedicated account manager",
        "Custom marketing",
        "API integration",
        "White-label options",
      ],
    },
  ];

  const testimonials = [
    {
      name: "Mrs. Adebayo",
      property: "4-bedroom duplex",
      result: "Sold in 2 weeks at 15% above asking price",
      quote: "The professional presentation and verification gave buyers confidence. Sold faster than expected!",
    },
    {
      name: "Mr. Okon",
      property: "Commercial space",
      result: "Leased in 1 week to premium tenant",
      quote: "RealEST's network of serious commercial tenants made all the difference.",
    },
    {
      name: "Mrs. Ibrahim",
      property: "3-bedroom apartment",
      result: "Sold in 3 weeks with multiple offers",
      quote: "The verification badge and professional photos attracted qualified buyers immediately.",
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
                List With Us
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-linear-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent leading-tight">
              Sell Faster,
              <br />
              <span className="text-primary">Sell Smarter</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
              Join thousands of property owners who have successfully sold through RealEST's verified platform.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/dashboard/owner/listings/new">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 px-8 rounded-xl font-semibold gap-2"
                >
                  <Building className="w-5 h-5" />
                  List Your Property
                </Button>
              </Link>
              <Link href="/contact">
                <Button
                  size="lg"
                  variant="secondary"
                  className="px-8 rounded-xl font-semibold gap-2"
                >
                  <Users className="w-5 h-5" />
                  Contact Our Team
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why List With RealEST?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We provide everything you need to sell your property quickly and securely
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <Card.Root
                key={index}
                className="bg-background/80 backdrop-blur-lg border border-border/50 rounded-2xl p-6 hover:shadow-lg transition-shadow"
              >
                <Card.Content className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                      <benefit.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">{benefit.title}</h3>
                      <p className="text-muted-foreground">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                </Card.Content>
              </Card.Root>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Simple 4-Step Process
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get your property listed and verified in just a few easy steps
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {process.map((step, index) => (
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

      {/* Pricing Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Choose Your Plan
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Select the package that best fits your property listing needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pricing.map((plan, index) => (
              <Card.Root
                key={index}
                className={`bg-background/80 backdrop-blur-lg border rounded-2xl p-6 hover:shadow-lg transition-shadow ${
                  plan.popular
                    ? "border-primary/50 ring-2 ring-primary/20"
                    : "border-border/50"
                }`}
              >
                <Card.Content className="space-y-6">
                  {plan.popular && (
                    <div className="text-center">
                      <Chip
                        color="accent"
                        variant="primary"
                        className="text-xs font-medium"
                      >
                        Most Popular
                      </Chip>
                    </div>
                  )}

                  <div className="text-center">
                    <h3 className="font-semibold text-lg">{plan.plan}</h3>
                    <div className="text-3xl font-bold text-primary mt-2">
                      {plan.price}
                    </div>
                    {plan.plan !== "Basic" && plan.plan !== "Enterprise" && (
                      <div className="text-sm text-muted-foreground">per listing</div>
                    )}
                  </div>

                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li
                        key={featureIndex}
                        className="flex items-center gap-2 text-sm"
                      >
                        <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Link href="/owner/listings/new" className="block">
                    <Button
                      className={`w-full flex align-bottom  ${
                        plan.popular
                          ? "bg-primary hover:bg-primary/90"
                          : "bg-secondary-foreground"
                      }`}
                      size="sm"
                    >
                      {
                        plan.plan === "Basic" 
                        ? "Get Started"
                        : plan.plan === "Enterprise"
                        ? "Contact Us"
                        : "Choose Plan"
                      }
                    </Button>
                  </Link>
                </Card.Content>
              </Card.Root>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Success Stories
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See how other property owners have succeeded with RealEST
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card.Root
                key={index}
                className="bg-background/80 backdrop-blur-lg border border-border/50 rounded-2xl p-6 hover:shadow-lg transition-shadow"
              >
                <Card.Content className="space-y-4">
                  <div className="text-center">
                    <Star className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-primary">
                      {testimonial.result}
                    </p>
                  </div>
                  <p className="text-muted-foreground italic text-center">
                    "{testimonial.quote}"
                  </p>
                  <div className="text-center pt-4 border-t border-border/50">
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.property}
                    </p>
                  </div>
                </Card.Content>
              </Card.Root>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card.Root className="bg-linear-to-r from-primary/5 to-secondary/5 border border-primary/20 rounded-2xl p-8 md:p-12 text-center">
            <Card.Content className="max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to List Your Property?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Join thousands of successful sellers who have found the perfect buyers through RealEST.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/dashboard/owner/listings/new">
                  <Button
                    size="lg"
                    className="bg-primary hover:bg-primary/90 px-8 rounded-xl font-semibold gap-2"
                  >
                    <Building className="w-5 h-5" />
                    List Your Property Now
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="px-8 rounded-xl font-semibold gap-2"
                  >
                    <Users className="w-5 h-5" />
                    Speak to an Expert
                  </Button>
                </Link>
              </div>
              <p className="text-sm text-muted-foreground mt-6">
                Free basic listing • No hidden fees • Start selling today
              </p>
            </Card.Content>
          </Card.Root>
        </div>
      </section>

      <Footer />
    </div>
  );
}
