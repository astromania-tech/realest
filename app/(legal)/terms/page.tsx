"use client";

import { Card, Button, Chip } from "@heroui/react";
import Link from "next/link";
import { Header, Footer } from "@/components/layout";
import {
  FileText,
  Shield,
  Users,
  AlertTriangle,
  CheckCircle,
  Sparkles,
  Scale,
  Lock,
} from "lucide-react";

export default function TermsPage() {
  const sections = [
    {
      title: "Acceptance of Terms",
      icon: CheckCircle,
      content: [
        {
          subtitle: "Agreement to Terms",
          text: "By accessing and using RealEST, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.",
        },
        {
          subtitle: "Changes to Terms",
          text: "We reserve the right to modify these terms at any time. Your continued use of our platform after such modifications constitutes acceptance of the updated terms.",
        },
        {
          subtitle: "Eligibility",
          text: "You must be at least 18 years old and have the legal capacity to enter into binding agreements to use our services.",
        },
        {
          subtitle: "Account Responsibility",
          text: "You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.",
        },
      ],
    },
    {
      title: "Platform Usage",
      icon: Users,
      content: [
        {
          subtitle: "Permitted Use",
          text: "You may use our platform solely for legitimate real estate transactions, property inquiries, and related activities as intended by the service.",
        },
        {
          subtitle: "Prohibited Activities",
          text: "You agree not to engage in fraudulent activities, post false information, violate intellectual property rights, or use the platform for any illegal purposes.",
        },
        {
          subtitle: "Content Standards",
          text: "All property listings and user content must be accurate, truthful, and comply with our verification standards and applicable laws.",
        },
        {
          subtitle: "Platform Integrity",
          text: "You agree not to interfere with the platform's operations, attempt unauthorized access, or use automated tools without permission.",
        },
      ],
    },
    {
      title: "Property Listings & Verification",
      icon: Shield,
      content: [
        {
          subtitle: "Listing Requirements",
          text: "All property listings must undergo our verification process, including document submission, property inspection, and ownership confirmation.",
        },
        {
          subtitle: "Verification Obligations",
          text: "Property owners and agents must provide accurate information and cooperate fully with our verification team.",
        },
        {
          subtitle: "Listing Accuracy",
          text: "You warrant that all information provided about properties is true, accurate, and up-to-date to the best of your knowledge.",
        },
        {
          subtitle: "Verification Status",
          text: "Only verified properties may be listed on our platform. Unverified listings may be removed without notice.",
        },
      ],
    },
    {
      title: "Transactions & Payments",
      icon: Scale,
      content: [
        {
          subtitle: "Transaction Facilitation",
          text: "RealEST facilitates connections between buyers and sellers but is not a party to any transactions unless explicitly stated.",
        },
        {
          subtitle: "Payment Processing",
          text: "Payment processing is handled by third-party providers. You agree to comply with their terms and conditions.",
        },
        {
          subtitle: "Fees and Charges",
          text: "Premium services and verification fees are clearly disclosed. All applicable taxes are your responsibility.",
        },
        {
          subtitle: "Dispute Resolution",
          text: "Disputes between users should be resolved amicably. RealEST may assist in mediation but is not responsible for transaction outcomes.",
        },
      ],
    },
  ];

  const responsibilities = [
    {
      title: "User Conduct",
      description:
        "Users must conduct themselves professionally and respectfully in all interactions on the platform.",
      icon: Users,
    },
    {
      title: "Information Accuracy",
      description:
        "All information provided must be truthful and accurate. Misrepresentation may result in account suspension.",
      icon: CheckCircle,
    },
    {
      title: "Legal Compliance",
      description:
        "Users must comply with all applicable Nigerian laws and regulations regarding real estate transactions.",
      icon: Scale,
    },
    {
      title: "Platform Security",
      description:
        "Users must not attempt to compromise platform security or engage in unauthorized access attempts.",
      icon: Lock,
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
              <FileText className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                Terms of Service
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-linear-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent leading-tight">
              Terms of
              <br />
              <span className="text-primary">Service</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
              Please read these terms carefully before using RealEST's services.
            </p>

            {/* Last Updated */}
            <div className="text-sm text-muted-foreground">
              Last updated: December 15, 2024
            </div>
          </div>
        </div>
      </section>

      {/* Terms Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-12">
            {/* Introduction */}
            <Card.Root className="bg-background/80 backdrop-blur-lg border border-border/50 rounded-2xl p-8">
              <Card.Content className="space-y-4">
                <h2 className="text-2xl font-bold">Introduction</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Welcome to RealEST. These Terms of Service ("Terms") govern
                  your use of our website, mobile application, and related
                  services (collectively, the "Platform"). By accessing or
                  using our Platform, you agree to be bound by these Terms.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  RealEST is a property marketplace focused on connecting buyers,
                  sellers, and renters in Nigeria with verified, legitimate
                  properties. Our mission is to eliminate property fraud and
                  create a transparent real estate ecosystem.
                </p>
              </Card.Content>
            </Card.Root>

            {/* Terms Sections */}
            {sections.map((section, sectionIndex) => (
              <Card.Root
                key={sectionIndex}
                className="bg-background/80 backdrop-blur-lg border border-border/50 rounded-2xl p-8"
              >
                <Card.Content className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                      <section.icon className="w-5 h-5 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold">{section.title}</h2>
                  </div>

                  <div className="space-y-6">
                    {section.content.map((item, itemIndex) => (
                      <div key={itemIndex} className="space-y-2">
                        <h3 className="text-lg font-semibold text-primary">
                          {item.subtitle}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {item.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </Card.Content>
              </Card.Root>
            ))}

            {/* User Responsibilities */}
            <Card.Root className="bg-background/80 backdrop-blur-lg border border-border/50 rounded-2xl p-8">
              <Card.Content className="space-y-6">
                <h2 className="text-2xl font-bold">User Responsibilities</h2>
                <p className="text-muted-foreground leading-relaxed">
                  As a user of RealEST, you agree to maintain certain standards
                  of conduct and comply with our platform rules.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {responsibilities.map((responsibility, index) => (
                    <Card.Root
                      key={index}
                      className="bg-muted/30 border border-border/30 rounded-xl p-4"
                    >
                      <Card.Content className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                            <responsibility.icon className="w-4 h-4 text-primary" />
                          </div>
                          <h3 className="font-semibold">{responsibility.title}</h3>
                        </div>
                        <p className="text-muted-foreground text-sm">
                          {responsibility.description}
                        </p>
                      </Card.Content>
                    </Card.Root>
                  ))}
                </div>
              </Card.Content>
            </Card.Root>

            {/* Intellectual Property */}
            <Card.Root className="bg-background/80 backdrop-blur-lg border border-border/50 rounded-2xl p-8">
              <Card.Content className="space-y-6">
                <h2 className="text-2xl font-bold">Intellectual Property</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-primary mb-2">
                      Platform Content
                    </h3>
                    <p className="text-muted-foreground">
                      The Platform and its original content, features, and
                      functionality are owned by RealEST and are protected by
                      copyright, trademark, and other intellectual property laws.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-primary mb-2">
                      User Content
                    </h3>
                    <p className="text-muted-foreground">
                      By posting content on our Platform, you grant us a
                      non-exclusive, royalty-free license to use, display, and
                      distribute your content in connection with our services.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-primary mb-2">
                      Prohibited Use
                    </h3>
                    <p className="text-muted-foreground">
                      You may not copy, modify, distribute, or reverse engineer
                      any part of our Platform without explicit written permission.
                    </p>
                  </div>
                </div>
              </Card.Content>
            </Card.Root>

            {/* Limitation of Liability */}
            <Card.Root className="bg-background/80 backdrop-blur-lg border border-border/50 rounded-2xl p-8">
              <Card.Content className="space-y-6">
                <h2 className="text-2xl font-bold">Limitation of Liability</h2>
                <p className="text-muted-foreground leading-relaxed">
                  RealEST shall not be liable for any indirect, incidental,
                  special, consequential, or punitive damages arising from your
                  use of the Platform or any transactions facilitated through it.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Our total liability shall not exceed the amount paid by you
                  for our services in the twelve months preceding the claim.
                </p>
              </Card.Content>
            </Card.Root>

            {/* Termination */}
            <Card.Root className="bg-background/80 backdrop-blur-lg border border-border/50 rounded-2xl p-8">
              <Card.Content className="space-y-6">
                <h2 className="text-2xl font-bold">Termination</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We reserve the right to terminate or suspend your account
                  immediately, without prior notice, for conduct that we
                  believe violates these Terms or is harmful to other users,
                  us, or third parties.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Upon termination, your right to use the Platform will cease
                  immediately, and we may delete your account and data.
                </p>
              </Card.Content>
            </Card.Root>

            {/* Governing Law */}
            <Card.Root className="bg-background/80 backdrop-blur-lg border border-border/50 rounded-2xl p-8">
              <Card.Content className="space-y-6">
                <h2 className="text-2xl font-bold">Governing Law</h2>
                <p className="text-muted-foreground leading-relaxed">
                  These Terms shall be governed by and construed in accordance
                  with the laws of the Federal Republic of Nigeria. Any disputes
                  arising from these Terms shall be subject to the exclusive
                  jurisdiction of the Nigerian courts.
                </p>
              </Card.Content>
            </Card.Root>

            {/* Contact Information */}
            <Card.Root className="bg-background/80 backdrop-blur-lg border border-border/50 rounded-2xl p-8">
              <Card.Content className="space-y-6">
                <h2 className="text-2xl font-bold">Contact Us</h2>
                <p className="text-muted-foreground leading-relaxed">
                  If you have any questions about these Terms, please contact us:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-semibold">Legal Department</p>
                        <p className="text-muted-foreground">
                          legal@realest.ng
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-semibold">Compliance Officer</p>
                        <p className="text-muted-foreground">
                          compliance@realest.ng
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Scale className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-semibold">Address</p>
                        <p className="text-muted-foreground">
                          123 Property Street
                          <br />
                          Real Estate City, RC 12345
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card.Content>
            </Card.Root>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card.Root className="bg-linear-to-r from-primary/5 to-secondary/5 border border-primary/20 rounded-2xl p-8 md:p-12 text-center">
            <Card.Content className="max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Questions About Our Terms?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Our legal team is available to clarify any aspects of our Terms
                of Service.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 px-8 rounded-xl font-semibold gap-2"
                >
                  <FileText className="w-5 h-5" />
                  Contact Legal Team
                </Button>
                <Link href="/help">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="px-8 rounded-xl font-semibold gap-2"
                  >
                    <AlertTriangle className="w-5 h-5" />
                    View Help Center
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
