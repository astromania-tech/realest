"use client";

import { Card, Button, Chip } from "@heroui/react";
import Link from "next/link";
import { Header, Footer } from "@/components/layout";
import {
  Star,
  Quote,
  Users,
  TrendingUp,
  Shield,
  Sparkles,
  CheckCircle,
  Heart,
  Award,
} from "lucide-react";

export default function TestimonialsPage() {
  const testimonials = [
    {
      id: 1,
      name: "Sarah Adebayo",
      role: "Home Buyer",
      location: "Lagos, Nigeria",
      rating: 5,
      image: "/api/placeholder/80/80",
      testimonial:
        "RealEST made buying my first home incredibly easy and secure. The verification process gave me complete peace of mind, and I found exactly what I was looking for within weeks. The team was incredibly supportive throughout the entire process.",
      property: "3-bedroom apartment in Lekki",
      date: "2 months ago",
      verified: true,
    },
    {
      id: 2,
      name: "Michael Okafor",
      role: "Property Investor",
      location: "Abuja, Nigeria",
      rating: 5,
      image: "/api/placeholder/80/80",
      testimonial:
        "As an investor, trust is everything. RealEST's rigorous verification process and transparent platform have helped me build a portfolio of verified properties. The analytics and market insights are invaluable for making informed decisions.",
      property: "Commercial property portfolio",
      date: "1 month ago",
      verified: true,
    },
    {
      id: 3,
      name: "Grace Nwosu",
      role: "Property Seller",
      location: "Port Harcourt, Nigeria",
      rating: 5,
      image: "/api/placeholder/80/80",
      testimonial:
        "Selling my property through RealEST was stress-free. The professional photography, detailed listing, and verified buyer connections made the process smooth. I sold my house above asking price within 3 weeks!",
      property: "4-bedroom duplex in GRA",
      date: "3 weeks ago",
      verified: true,
    },
    {
      id: 4,
      name: "David Ibrahim",
      role: "Real Estate Agent",
      location: "Kano, Nigeria",
      rating: 5,
      image: "/api/placeholder/80/80",
      testimonial:
        "RealEST has transformed how I work with clients. The platform's verification system builds instant trust, and the direct communication tools make transactions seamless. My clients love the transparency and security.",
      property: "Multiple client properties",
      date: "1 week ago",
      verified: true,
    },
    {
      id: 5,
      name: "Amara Eze",
      role: "First-time Buyer",
      location: "Enugu, Nigeria",
      rating: 5,
      image: "/api/placeholder/80/80",
      testimonial:
        "I was nervous about buying property online, but RealEST's verification badges and detailed property information gave me confidence. The virtual tours and direct owner communication made the process feel personal and secure.",
      property: "2-bedroom bungalow",
      date: "6 weeks ago",
      verified: true,
    },
    {
      id: 6,
      name: "John Okon",
      role: "Property Developer",
      location: "Calabar, Nigeria",
      rating: 5,
      image: "/api/placeholder/80/80",
      testimonial:
        "RealEST has been instrumental in marketing our development projects. The platform's credibility and reach have helped us connect with serious buyers. The verification process ensures only qualified prospects reach out.",
      property: "Residential estate development",
      date: "4 weeks ago",
      verified: true,
    },
  ];

  const stats = [
    { number: "50K+", label: "Happy Customers", icon: Users },
    { number: "4.9", label: "Average Rating", icon: Star },
    { number: "99%", label: "Satisfaction Rate", icon: Heart },
    { number: "30K+", label: "Properties Sold", icon: TrendingUp },
  ];

  const highlights = [
    {
      icon: Shield,
      title: "Verified & Secure",
      description: "Every testimonial from verified users who completed successful transactions",
    },
    {
      icon: Award,
      title: "Real Experiences",
      description: "Authentic stories from real customers across Nigeria",
    },
    {
      icon: CheckCircle,
      title: "Trusted Platform",
      description: "Building confidence through transparency and verification",
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
                Customer Stories
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-linear-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent leading-tight">
              What Our Customers
              <br />
              <span className="text-primary">Are Saying</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
              Real stories from real people who found their perfect property through RealEST's verified platform.
            </p>
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

      {/* Highlights Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Customers Choose RealEST
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our commitment to verification and transparency sets us apart
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {highlights.map((highlight, index) => (
              <Card.Root
                key={index}
                className="bg-background/80 backdrop-blur-lg border border-border/50 rounded-2xl p-6 text-center hover:shadow-lg transition-shadow"
              >
                <Card.Content className="space-y-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto">
                    <highlight.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">{highlight.title}</h3>
                  <p className="text-muted-foreground text-sm">
                    {highlight.description}
                  </p>
                </Card.Content>
              </Card.Root>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Customer Testimonials
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Hear directly from our satisfied customers across Nigeria
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <Card.Root
                key={testimonial.id}
                className="bg-background/80 backdrop-blur-lg border border-border/50 rounded-2xl p-6 hover:shadow-lg transition-shadow"
              >
                <Card.Content className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{testimonial.name}</h3>
                        {testimonial.verified && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.role} • {testimonial.location}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-4 h-4 fill-yellow-400 text-yellow-400"
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Quote */}
                  <div className="relative">
                    <Quote className="w-8 h-8 text-primary/20 absolute -top-2 -left-2" />
                    <p className="text-muted-foreground italic leading-relaxed pl-6">
                      "{testimonial.testimonial}"
                    </p>
                  </div>

                  {/* Property & Date */}
                  <div className="pt-4 border-t border-border/50">
                    <p className="text-sm font-medium text-primary">
                      {testimonial.property}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {testimonial.date}
                    </p>
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
                Join Thousands of Satisfied Customers
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Experience the RealEST difference with verified properties and secure transactions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register">
                  <Button
                    size="lg"
                    className="bg-primary hover:bg-primary/90 px-8 rounded-xl font-semibold gap-2"
                  >
                    <Users className="w-5 h-5" />
                    Get Started Today
                  </Button>
                </Link>
                <Link href="/explore">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="px-8 rounded-xl font-semibold gap-2"
                  >
                    <TrendingUp className="w-5 h-5" />
                    Browse Properties
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
