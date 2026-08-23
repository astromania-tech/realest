"use client";

import { Card, Button, Chip } from "@heroui/react";
import Link from "next/link";
import { Header, Footer } from "@/components/layout";
import {
  Shield,
  Users,
  Award,
  CheckCircle,
  Star,
  TrendingUp,
  Heart,
  Target,
  Sparkles,
  Home,
} from "lucide-react";

export default function AboutPage() {
  const values = [
    {
      icon: Shield,
      title: "Trust & Security",
      description:
        "We prioritize the security and trust of our users with rigorous verification processes and secure transactions.",
    },
    {
      icon: Users,
      title: "Community First",
      description:
        "Building a supportive community where buyers, sellers, and renters can connect and thrive together.",
    },
    {
      icon: Award,
      title: "Excellence",
      description:
        "Committed to delivering exceptional service and maintaining the highest standards in everything we do.",
    },
    {
      icon: Heart,
      title: "Passion",
      description:
        "Driven by our passion for real estate and helping people find their perfect property.",
    },
  ];

  const stats = [
    { number: "50K+", label: "Happy Customers", icon: Users },
    { number: "30K+", label: "Properties Listed", icon: Home },
    { number: "99%", label: "Verification Rate", icon: CheckCircle },
    { number: "4.9", label: "Average Rating", icon: Star },
  ];

  const team = [
    {
      name: "Sarah Johnson",
      role: "CEO & Founder",
      image: "/api/placeholder/150/150",
      bio: "Former real estate executive with 15+ years of industry experience.",
    },
    {
      name: "Michael Chen",
      role: "CTO",
      image: "/api/placeholder/150/150",
      bio: "Tech innovator specializing in secure property platforms.",
    },
    {
      name: "Emily Rodriguez",
      role: "Head of Verification",
      image: "/api/placeholder/150/150",
      bio: "Expert in property verification and compliance standards.",
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
                About RealEST
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-linear-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent leading-tight">
              Revolutionizing
              <br />
              <span className="text-primary">Real Estate</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
              We're on a mission to eliminate property fraud and create a
              transparent, trustworthy marketplace for everyone.
            </p>

            {/* Mission Statement */}
            <Card.Root className="bg-background/80 backdrop-blur-lg border border-border/50 rounded-2xl p-8 max-w-3xl mx-auto">
              <Card.Content className="text-center">
                <Target className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
                <p className="text-lg text-muted-foreground">
                  To create the world's most trusted property marketplace by
                  eliminating duplicates, fraud, and uncertainty through
                  rigorous verification and cutting-edge technology.
                </p>
              </Card.Content>
            </Card.Root>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card.Root
                key={index}
                className="bg-background/80 backdrop-blur-lg border border-border/50 rounded-2xl p-6 text-center hover:shadow-lg transition-shadow"
              >
                <Card.Content className="space-y-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto">
                    <stat.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-3xl font-bold text-primary">
                    {stat.number}
                  </div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </Card.Content>
              </Card.Root>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Story</h2>
              <p className="text-lg text-muted-foreground">
                How we started and where we're going
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h3 className="text-2xl font-bold">The Problem We Saw</h3>
                <p className="text-muted-foreground leading-relaxed">
                  The real estate industry has long been plagued by duplicate
                  listings, fraudulent properties, and a lack of transparency.
                  Buyers and renters often waste time and money on properties
                  that don't exist or are misrepresented.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Sellers struggle to reach genuine buyers, and the entire
                  process lacks the trust and efficiency that modern consumers
                  expect.
                </p>
              </div>
              <div className="space-y-6">
                <h3 className="text-2xl font-bold">Our Solution</h3>
                <p className="text-muted-foreground leading-relaxed">
                  RealEST was born from the vision to create a marketplace
                  where every property is verified, every listing is authentic,
                  and every transaction is secure.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Using advanced technology and rigorous verification processes,
                  we ensure that only legitimate, high-quality properties make
                  it to our platform.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Values</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((value, index) => (
              <Card.Root
                key={index}
                className="bg-background/80 backdrop-blur-lg border border-border/50 rounded-2xl p-6 hover:shadow-lg transition-shadow"
              >
                <Card.Content className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                      <value.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">{value.title}</h3>
                      <p className="text-muted-foreground">
                        {value.description}
                      </p>
                    </div>
                  </div>
                </Card.Content>
              </Card.Root>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Meet Our Team
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The passionate experts behind RealEST
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {team.map((member, index) => (
              <Card.Root
                key={index}
                className="bg-background/80 backdrop-blur-lg border border-border/50 rounded-2xl p-6 text-center hover:shadow-lg transition-shadow"
              >
                <Card.Content className="space-y-4">
                  <div className="w-24 h-24 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
                    <Users className="w-12 h-12 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{member.name}</h3>
                    <p className="text-primary font-medium">{member.role}</p>
                  </div>
                  <p className="text-muted-foreground text-sm">{member.bio}</p>
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
                Join Our Community
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Be part of the future of real estate. Whether you're buying,
                selling, or renting, RealEST is here to help.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/login">
                  <Button
                    size="lg"
                    className="bg-primary hover:bg-primary/90 px-8 rounded-xl font-semibold gap-2"
                  >
                    <Users className="w-5 h-5" />
                    Get Started
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="px-8 rounded-xl font-semibold gap-2"
                  >
                    <Target className="w-5 h-5" />
                    Contact Us
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
