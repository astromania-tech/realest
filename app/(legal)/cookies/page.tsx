"use client";

import { Card, Button, Chip } from "@heroui/react";
import Link from "next/link";
import { Header, Footer } from "@/components/layout";
import {
  Cookie,
  Settings,
  Eye,
  BarChart3,
  Target,
  Sparkles,
  Shield,
  CheckCircle,
} from "lucide-react";

export default function CookiesPage() {
  const cookieTypes = [
    {
      title: "Essential Cookies",
      icon: Shield,
      required: true,
      description:
        "These cookies are necessary for the website to function and cannot be switched off in our systems. They are usually only set in response to actions made by you which amount to a request for services.",
      examples: [
        "Authentication cookies for secure login",
        "Session management cookies",
        "Security cookies to prevent fraud",
        "Load balancing cookies for performance",
      ],
      purpose: "Enable core platform functionality and security",
    },
    {
      title: "Analytics Cookies",
      icon: BarChart3,
      required: false,
      description:
        "These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site. They help us to know which pages are the most and least popular.",
      examples: [
        "Google Analytics for usage statistics",
        "Performance monitoring cookies",
        "Error tracking and debugging",
        "User journey analytics",
      ],
      purpose: "Understand how users interact with our platform",
    },
    {
      title: "Functional Cookies",
      icon: Settings,
      required: false,
      description:
        "These cookies enable the website to provide enhanced functionality and personalisation. They may be set by us or by third party providers whose services we have added to our pages.",
      examples: [
        "Language preference cookies",
        "Theme selection (light/dark mode)",
        "Saved search preferences",
        "Form auto-fill data",
      ],
      purpose: "Enhance user experience and personalization",
    },
    {
      title: "Marketing Cookies",
      icon: Target,
      required: false,
      description:
        "These cookies may be set through our site by our advertising partners. They may be used by those companies to build a profile of your interests and show you relevant adverts.",
      examples: [
        "Social media advertising pixels",
        "Retargeting cookies for relevant ads",
        "Affiliate marketing tracking",
        "Campaign performance measurement",
      ],
      purpose: "Deliver relevant advertisements and measure effectiveness",
    },
  ];

  const cookieList = [
    {
      name: "session_id",
      type: "Essential",
      purpose: "Maintains user session during browsing",
      duration: "Session",
      provider: "RealEST",
    },
    {
      name: "auth_token",
      type: "Essential",
      purpose: "Secure user authentication",
      duration: "30 days",
      provider: "RealEST",
    },
    {
      name: "_ga",
      type: "Analytics",
      purpose: "Google Analytics tracking",
      duration: "2 years",
      provider: "Google",
    },
    {
      name: "theme_preference",
      type: "Functional",
      purpose: "Remembers user's theme choice",
      duration: "1 year",
      provider: "RealEST",
    },
    {
      name: "fb_pixel",
      type: "Marketing",
      purpose: "Facebook advertising tracking",
      duration: "90 days",
      provider: "Facebook",
    },
  ];

  const manageOptions = [
    {
      title: "Browser Settings",
      description:
        "Most web browsers allow you to control cookies through their settings preferences.",
      steps: [
        "Open browser settings",
        "Find privacy or security section",
        "Adjust cookie preferences",
        "Clear existing cookies if desired",
      ],
      icon: Settings,
    },
    {
      title: "Our Cookie Banner",
      description:
        "Use our cookie consent banner to manage preferences directly on our platform.",
      steps: [
        "Look for cookie banner on first visit",
        "Click 'Manage Preferences'",
        "Select desired cookie categories",
        "Save your choices",
      ],
      icon: Eye,
    },
    {
      title: "Third-Party Tools",
      description:
        "Various browser extensions and tools can help manage cookies across websites.",
      steps: [
        "Install cookie management extensions",
        "Use privacy-focused browsers",
        "Enable 'Do Not Track' settings",
        "Regular cookie cleanup",
      ],
      icon: Shield,
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
              <Cookie className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                Cookie Policy
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-linear-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent leading-tight">
              Cookie
              <br />
              <span className="text-primary">Policy</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
              Learn how we use cookies to improve your experience on RealEST.
            </p>

            {/* Last Updated */}
            <div className="text-sm text-muted-foreground">
              Last updated: December 15, 2024
            </div>
          </div>
        </div>
      </section>

      {/* Cookie Policy Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-12">
            {/* Introduction */}
            <Card.Root className="bg-background/80 backdrop-blur-lg border border-border/50 rounded-2xl p-8">
              <Card.Content className="space-y-4">
                <h2 className="text-2xl font-bold">What Are Cookies?</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Cookies are small text files that are placed on your computer
                  or mobile device when you visit a website. They allow the
                  website to remember your actions and preferences over time.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Cookies are widely used to make websites work more efficiently
                  and provide a better user experience. They can also help
                  ensure that advertisements you see online are more relevant
                  to you and your interests.
                </p>
              </Card.Content>
            </Card.Root>

            {/* How We Use Cookies */}
            <Card.Root className="bg-background/80 backdrop-blur-lg border border-border/50 rounded-2xl p-8">
              <Card.Content className="space-y-4">
                <h2 className="text-2xl font-bold">How We Use Cookies</h2>
                <p className="text-muted-foreground leading-relaxed">
                  RealEST uses cookies for several purposes to enhance your
                  experience and ensure our platform functions properly. We
                  categorize our cookies based on their purpose and necessity.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  We respect your privacy and give you control over non-essential
                  cookies. You can manage your cookie preferences at any time.
                </p>
              </Card.Content>
            </Card.Root>

            {/* Cookie Types */}
            {cookieTypes.map((cookieType, index) => (
              <Card.Root
                key={index}
                className="bg-background/80 backdrop-blur-lg border border-border/50 rounded-2xl p-8"
              >
                <Card.Content className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                      <cookieType.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-bold">{cookieType.title}</h2>
                        {cookieType.required && (
                          <Chip
                            color="danger"
                            variant="soft"
                            size="sm"
                            className="text-xs"
                          >
                            *Required
                          </Chip>
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="text-muted-foreground leading-relaxed">
                    {cookieType.description}
                  </p>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-primary mb-2">
                        Purpose
                      </h3>
                      <p className="text-muted-foreground">
                        {cookieType.purpose}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-primary mb-2">
                        Examples
                      </h3>
                      <ul className="space-y-1">
                        {cookieType.examples.map((example, exampleIndex) => (
                          <li
                            key={exampleIndex}
                            className="text-muted-foreground flex items-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                            {example}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card.Content>
              </Card.Root>
            ))}

            {/* Specific Cookies Table */}
            <Card.Root className="bg-background/80 backdrop-blur-lg border border-border/50 rounded-2xl p-8">
              <Card.Content className="space-y-6">
                <h2 className="text-2xl font-bold">Cookies We Use</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Here's a detailed list of the specific cookies we use on our platform:
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-semibold">
                          Cookie Name
                        </th>
                        <th className="text-left py-3 px-4 font-semibold">
                          Type
                        </th>
                        <th className="text-left py-3 px-4 font-semibold">
                          Purpose
                        </th>
                        <th className="text-left py-3 px-4 font-semibold">
                          Duration
                        </th>
                        <th className="text-left py-3 px-4 font-semibold">
                          Provider
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {cookieList.map((cookie, index) => (
                        <tr key={index} className="border-b border-border/50">
                          <td className="py-3 px-4 font-mono text-sm">
                            {cookie.name}
                          </td>
                          <td className="py-3 px-4">
                            <Chip
                              size="sm"
                              variant="tertiary"
                              color={
                                cookie.type === "Essential"
                                  ? "accent"
                                  : cookie.type === "Analytics"
                                  ? "success"
                                  : cookie.type === "Functional"
                                  ? "warning"
                                : "default"
                              }
                            >
                              {cookie.type}
                            </Chip>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">
                            {cookie.purpose}
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">
                            {cookie.duration}
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">
                            {cookie.provider}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card.Content>
            </Card.Root>

            {/* Managing Cookies */}
            <Card.Root className="bg-background/80 backdrop-blur-lg border border-border/50 rounded-2xl p-8">
              <Card.Content className="space-y-6">
                <h2 className="text-2xl font-bold">Managing Your Cookies</h2>
                <p className="text-muted-foreground leading-relaxed">
                  You have several options for managing cookies and your privacy preferences:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {manageOptions.map((option, index) => (
                    <Card.Root
                      key={index}
                      className="bg-muted/30 border border-border/30 rounded-xl p-4"
                    >
                      <Card.Content className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                            <option.icon className="w-4 h-4 text-primary" />
                          </div>
                          <h3 className="font-semibold">{option.title}</h3>
                        </div>
                        <p className="text-muted-foreground text-sm mb-3">
                          {option.description}
                        </p>
                        <ul className="space-y-1">
                          {option.steps.map((step, stepIndex) => (
                            <li
                              key={stepIndex}
                              className="text-xs text-muted-foreground flex items-center gap-2"
                            >
                              <span className="w-1 h-1 bg-primary rounded-full shrink-0" />
                              {step}
                            </li>
                          ))}
                        </ul>
                      </Card.Content>
                    </Card.Root>
                  ))}
                </div>
              </Card.Content>
            </Card.Root>

            {/* Third-Party Cookies */}
            <Card.Root className="bg-background/80 backdrop-blur-lg border border-border/50 rounded-2xl p-8">
              <Card.Content className="space-y-6">
                <h2 className="text-2xl font-bold">Third-Party Cookies</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Some cookies on our platform are set by third-party services
                  that appear on our pages. We have no control over these
                  cookies, and they are subject to the respective third party's
                  privacy policy.
                </p>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-primary mb-2">
                      Google Analytics
                    </h3>
                    <p className="text-muted-foreground">
                      Used to analyze website traffic and user behavior.
                      Privacy policy: https://policies.google.com/privacy
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-primary mb-2">
                      Social Media Pixels
                    </h3>
                    <p className="text-muted-foreground">
                      Used for advertising and retargeting across social media platforms.
                    </p>
                  </div>
                </div>
              </Card.Content>
            </Card.Root>

            {/* Contact Information */}
            <Card.Root className="bg-background/80 backdrop-blur-lg border border-border/50 rounded-2xl p-8">
              <Card.Content className="space-y-6">
                <h2 className="text-2xl font-bold">Contact Us</h2>
                <p className="text-muted-foreground leading-relaxed">
                  If you have any questions about our use of cookies, please contact us:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Cookie className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-semibold">Privacy Team</p>
                        <p className="text-muted-foreground">
                          privacy@realest.ng
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-semibold">Data Protection Officer</p>
                        <p className="text-muted-foreground">
                          dpo@realest.ng
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card.Content>
            </Card.Root>

            {/* Updates */}
            <Card.Root className="bg-background/80 backdrop-blur-lg border border-border/50 rounded-2xl p-8">
              <Card.Content className="space-y-4">
                <h2 className="text-2xl font-bold">Updates to This Policy</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We may update this Cookie Policy from time to time to reflect
                  changes in our practices or for other operational, legal, or
                  regulatory reasons.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  We will notify you of any material changes by posting the
                  updated policy on this page and updating the "Last updated" date.
                </p>
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
                Manage Your Cookie Preferences
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Take control of your privacy by managing your cookie settings.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 px-8 rounded-xl font-semibold gap-2"
                >
                  <Settings className="w-5 h-5" />
                  Manage Preferences
                </Button>
                <Link href="/privacy">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="px-8 rounded-xl font-semibold gap-2"
                  >
                    <Shield className="w-5 h-5" />
                    View Privacy Policy
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
