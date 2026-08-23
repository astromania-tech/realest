"use client";

import { Card, Button, Chip, Input } from "@heroui/react";
import Link from "next/link";
import { Header, Footer } from "@/components/layout";
import {
  Search,
  HelpCircle,
  MessageSquare,
  FileText,
  Phone,
  Mail,
  Clock,
  Sparkles,
  ChevronDown,
  ExternalLink,
  Shield,
} from "lucide-react";

export default function HelpPage() {
  const faqCategories = [
    {
      title: "Getting Started",
      icon: Sparkles,
      faqs: [
        {
          question: "How do I create an account?",
          answer:
            "Click the 'Sign Up' button in the top right corner and follow the registration process. You'll need to verify your email address to complete the setup.",
        },
        {
          question: "What types of properties can I list?",
          answer:
            "You can list residential properties for sale or rent, commercial spaces, and event venues. All listings require verification before going live.",
        },
        {
          question: "How does property verification work?",
          answer:
            "Our team reviews all property details, documents, and may conduct physical inspections to ensure authenticity and accuracy.",
        },
      ],
    },
    {
      title: "Buying & Renting",
      icon: Search,
      faqs: [
        {
          question: "How do I search for properties?",
          answer:
            "Use the search bar on our homepage or browse by category (Buy, Rent, Events). You can filter by location, price, property type, and more.",
        },
        {
          question: "Are all properties verified?",
          answer:
            "Yes, every property on our platform undergoes rigorous verification. Look for the 'Verified' badge on listings.",
        },
        {
          question: "How do I contact a property owner?",
          answer:
            "Click on any property listing and use the contact form to send an inquiry directly to the verified owner or agent.",
        },
      ],
    },
    {
      title: "Selling & Listing",
      icon: FileText,
      faqs: [
        {
          question: "What documents do I need to list a property?",
          answer:
            "You'll need property deeds, identification documents, and proof of ownership. Our team will guide you through the specific requirements.",
        },
        {
          question: "How long does verification take?",
          answer:
            "Most verifications are completed within 24-48 hours. Complex cases may take up to 5 business days.",
        },
        {
          question: "What are the listing fees?",
          answer:
            "Basic listings are free. Premium features and advertising options are available for a fee. Contact our sales team for details.",
        },
      ],
    },
    {
      title: "Account & Support",
      icon: HelpCircle,
      faqs: [
        {
          question: "How do I reset my password?",
          answer:
            "Click 'Forgot Password' on the login page and follow the instructions sent to your email.",
        },
        {
          question: "How do I update my profile?",
          answer:
            "Go to your dashboard and click on 'Profile' to update your personal information and preferences.",
        },
        {
          question: "How do I contact customer support?",
          answer:
            "You can reach us via email at support@realest.ng, through our contact form, or by phone during business hours.",
        },
      ],
    },
  ];

  const quickLinks = [
    {
      title: "Property Verification Guide",
      description: "Learn about our verification process",
      link: "/verification",
      icon: FileText,
    },
    {
      title: "Safety Guidelines",
      description: "Stay safe during property transactions",
      link: "/safety",
      icon: Shield,
    },
    {
      title: "Contact Support",
      description: "Get in touch with our team",
      link: "/contact",
      icon: MessageSquare,
    },
    {
      title: "How It Works",
      description: "Complete platform overview",
      link: "/how-it-works",
      icon: Sparkles,
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
              <HelpCircle className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                Help Center
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-linear-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent leading-tight">
              How Can We
              <br />
              <span className="text-primary">Help You?</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
              Find answers to common questions, get support, and learn how to
              make the most of RealEST.
            </p>

            {/* Search */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="bg-background/80 backdrop-blur-lg border border-border/50 rounded-2xl p-2 shadow-2xl">
                <div className="flex gap-2">
                  <div className="flex-1 flex items-center gap-3 px-4 py-3">
                    <Search className="w-5 h-5 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search for help articles..."
                      className="w-full border-none outline-none bg-transparent text-base placeholder:text-muted-foreground/70"
                    />
                  </div>
                  <Button
                    size="lg"
                    className="bg-primary hover:bg-primary/90 px-8 rounded-xl font-semibold gap-2 shadow-lg"
                  >
                    <Search className="w-5 h-5" />
                    Search
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Popular Resources
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Quick access to our most helpful guides and resources
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickLinks.map((link, index) => (
              <Link key={index} href={link.link}>
                <Card.Root className="bg-background/80 backdrop-blur-lg border border-border/50 rounded-2xl p-6 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                  <Card.Content className="space-y-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto group-hover:bg-primary/20 transition-colors">
                      <link.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                      {link.title}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {link.description}
                    </p>
                    <div className="flex items-center justify-center text-primary text-sm font-medium">
                      Learn More
                      <ExternalLink className="w-4 h-4 ml-1" />
                    </div>
                  </Card.Content>
                </Card.Root>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Find answers to the most common questions about RealEST
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-8">
            {faqCategories.map((category, categoryIndex) => (
              <div key={categoryIndex} className="space-y-4">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <category.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold">{category.title}</h3>
                </div>

                <div className="space-y-4">
                  {category.faqs.map((faq, faqIndex) => (
                    <Card.Root
                      key={faqIndex}
                      className="bg-background/80 backdrop-blur-lg border border-border/50 rounded-2xl p-6"
                    >
                      <Card.Content className="space-y-3">
                        <h4 className="font-semibold text-lg">
                          {faq.question}
                        </h4>
                        <p className="text-muted-foreground">{faq.answer}</p>
                      </Card.Content>
                    </Card.Root>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Support */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Still Need Help?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our support team is here to help you with any questions or issues
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Live Chat */}
            <Card.Root className="bg-background/80 backdrop-blur-lg border border-border/50 rounded-2xl p-6 text-center">
              <Card.Content className="space-y-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto">
                  <MessageSquare className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-lg">Live Chat</h3>
                <p className="text-muted-foreground text-sm">
                  Get instant help from our support team during business hours
                </p>
                <Chip variant="secondary" className="text-xs">
                  Available 9 AM - 6 PM EST
                </Chip>
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Start Chat
                </Button>
              </Card.Content>
            </Card.Root>

            {/* Email Support */}
            <Card.Root className="bg-background/80 backdrop-blur-lg border border-border/50 rounded-2xl p-6 text-center">
              <Card.Content className="space-y-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-lg">Email Support</h3>
                <p className="text-muted-foreground text-sm">
                  Send us a detailed message and we'll respond within 24 hours
                </p>
                <Chip variant="secondary" className="text-xs">
                  24-48 hour response
                </Chip>
                <Button variant="secondary" className="w-full">
                  Send Email
                </Button>
              </Card.Content>
            </Card.Root>

            {/* Phone Support */}
            <Card.Root className="bg-background/80 backdrop-blur-lg border border-border/50 rounded-2xl p-6 text-center">
              <Card.Content className="space-y-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto">
                  <Phone className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-lg">Phone Support</h3>
                <p className="text-muted-foreground text-sm">
                  Speak directly with our support specialists for urgent issues
                </p>
                <Chip variant="secondary" className="text-xs">
                  Business hours only
                </Chip>
                <Button variant="secondary" className="w-full">
                  Call Now
                </Button>
              </Card.Content>
            </Card.Root>
          </div>
        </div>
      </section>

      {/* Business Hours */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <Card.Root className="bg-background/80 backdrop-blur-lg border border-border/50 rounded-2xl p-8 max-w-2xl mx-auto">
            <Card.Content className="text-center space-y-6">
              <div className="flex items-center justify-center gap-3">
                <Clock className="w-6 h-6 text-primary" />
                <h3 className="text-xl font-bold">Business Hours</h3>
              </div>
              <div className="space-y-2 text-muted-foreground">
                <p>
                  <strong>Monday - Friday:</strong> 9:00 AM - 6:00 PM EST
                </p>
                <p>
                  <strong>Saturday:</strong> 10:00 AM - 4:00 PM EST
                </p>
                <p>
                  <strong>Sunday:</strong> Closed
                </p>
              </div>
              <div className="pt-4 border-t border-border/50">
                <p className="text-sm text-muted-foreground">
                  Emergency support available 24/7 for verified property
                  transactions
                </p>
              </div>
            </Card.Content>
          </Card.Root>
        </div>
      </section>

      <Footer />
    </div>
  );
}
