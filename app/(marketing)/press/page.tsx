"use client";

import { Card, Button, Chip } from "@heroui/react";
import Link from "next/link";
import { Header, Footer } from "@/components/layout";
import {
  Newspaper,
  Download,
  Calendar,
  Sparkles,
  ExternalLink,
  Mail,
  Phone,
  Users,
} from "lucide-react";

export default function PressPage() {
  const pressReleases = [
    {
      title:
        "RealEST Raises £10M Series A to Revolutionize Property Verification",
      date: "December 15, 2024",
      excerpt:
        "Leading real estate platform secures funding to expand verification technology and eliminate property fraud.",
      category: "Funding",
    },
    {
      title: "RealEST Launches Advanced AI-Powered Property Inspection Tools",
      date: "November 28, 2024",
      excerpt:
        "New AI technology streamlines property verification process, reducing inspection time by 60%.",
      category: "Product",
    },
    {
      title: "RealEST Reaches 50,000 Verified Property Listings Milestone",
      date: "October 10, 2024",
      excerpt:
        "Platform celebrates major milestone with zero reported fraud cases in verified listings.",
      category: "Milestone",
    },
    {
      title: "RealEST Partners with Leading Real Estate Associations",
      date: "September 5, 2024",
      excerpt:
        "Strategic partnerships aim to standardize property verification across the UK real estate industry.",
      category: "Partnership",
    },
  ];

  const mediaKit = [
    {
      title: "Company Logos",
      description: "High-resolution logos in various formats",
      icon: Download,
      items: ["PNG", "SVG", "EPS"],
    },
    {
      title: "Brand Guidelines",
      description: "Complete brand identity specifications",
      icon: Sparkles,
      items: ["Colors", "Typography", "Usage"],
    },
    {
      title: "Press Photos",
      description: "Professional team and office photos",
      icon: Users,
      items: ["Team photos", "Office images", "Events"],
    },
    {
      title: "Product Screenshots",
      description: "Platform interface screenshots",
      icon: Newspaper,
      items: ["Dashboard", "Property listings", "Mobile app"],
    },
  ];

  const stats = [
    { number: "500+", label: "Media Mentions", icon: Newspaper },
    { number: "50+", label: "Countries Covered", icon: Users },
    { number: "25+", label: "Journalists Network", icon: Mail },
    { number: "10M+", label: "Monthly Readers", icon: ExternalLink },
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
              <Newspaper className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                Press & Media
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-linear-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent leading-tight">
              RealEST in the
              <br />
              <span className="text-primary">News</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
              Stay updated with the latest news, announcements, and insights
              from the RealEST team.
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

      {/* Press Releases */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Latest Press Releases
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Read our latest announcements and company updates
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pressReleases.map((release, index) => (
              <Card.Root
                key={index}
                className="bg-background/80 backdrop-blur-lg border border-border/50 rounded-2xl p-6 hover:shadow-lg transition-shadow cursor-pointer group"
              >
                <Card.Content className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span className="text-sm text-muted-foreground">
                          {release.date}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                        {release.title}
                      </h3>
                      <p className="text-muted-foreground">{release.excerpt}</p>
                    </div>
                    <Chip variant="secondary" className="text-xs flex-shrink-0">
                      {release.category}
                    </Chip>
                  </div>
                  <div className="pt-4 border-t border-border/50">
                    <Button
                      variant="ghost"
                      className="p-0 h-auto font-semibold text-primary hover:text-primary/80"
                    >
                      Read Full Release
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </Card.Content>
              </Card.Root>
            ))}
          </div>
        </div>
      </section>

      {/* Media Kit */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Media Resources
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Download our media kit with logos, photos, and brand guidelines
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mediaKit.map((item, index) => (
              <Card.Root
                key={index}
                className="bg-background/80 backdrop-blur-lg border border-border/50 rounded-2xl p-6 text-center hover:shadow-lg transition-shadow"
              >
                <Card.Content className="space-y-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto">
                    <item.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">
                    {item.description}
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {item.items.map((format, formatIndex) => (
                      <Chip
                        key={formatIndex}
                        variant="secondary"
                        className="text-xs"
                      >
                        {format}
                      </Chip>
                    ))}
                  </div>
                  <Button variant="secondary" className="w-full mt-4">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </Card.Content>
              </Card.Root>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Media Inquiries
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              For press inquiries, interviews, or media requests
            </p>
          </div>

          <Card.Root className="bg-background/80 backdrop-blur-lg border border-border/50 rounded-2xl p-8 max-w-2xl mx-auto">
            <Card.Content className="text-center space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-3">
                  <Mail className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-semibold">Email</p>
                    <p className="text-muted-foreground">press@realest.ng</p>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-3">
                  <Phone className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-semibold">Phone</p>
                    <p className="text-muted-foreground">+44 20 1234 5678</p>
                  </div>
                </div>
              </div>
              <div className="pt-6 border-t border-border/50">
                <p className="text-sm text-muted-foreground mb-4">
                  For urgent media inquiries outside business hours, please call
                  our 24/7 press line.
                </p>
                <Button className="bg-primary hover:bg-primary/90">
                  <Mail className="w-4 h-4 mr-2" />
                  Send Press Inquiry
                </Button>
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
                Stay Updated
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Subscribe to our press releases and get the latest RealEST
                news delivered to your inbox.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 px-8 rounded-xl font-semibold gap-2"
                >
                  <Mail className="w-5 h-5" />
                  Subscribe to Updates
                </Button>
                <Link href="/contact">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="px-8 rounded-xl font-semibold gap-2"
                  >
                    <Newspaper className="w-5 h-5" />
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
