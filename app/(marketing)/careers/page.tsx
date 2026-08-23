"use client";

import { Card, Button, Chip } from "@heroui/react";
import Link from "next/link";
import { Header, Footer } from "@/components/layout";
import {
  Users,
  Target,
  Heart,
  Sparkles,
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

export default function CareersPage() {
  const values = [
    {
      icon: Users,
      title: "Collaborative Culture",
      description:
        "Work with passionate individuals who share your vision for transforming real estate.",
    },
    {
      icon: Target,
      title: "Impact-Driven Work",
      description:
        "Make a real difference in people's lives by providing secure and transparent property transactions.",
    },
    {
      icon: Heart,
      title: "Work-Life Balance",
      description:
        "Enjoy flexible working arrangements and a supportive environment that values your well-being.",
    },
    {
      icon: Sparkles,
      title: "Innovation Focus",
      description:
        "Be part of cutting-edge technology solutions that are reshaping the real estate industry.",
    },
  ];

  const openPositions = [
    {
      title: "Senior Full-Stack Developer",
      department: "Engineering",
      location: "Remote / London",
      type: "Full-time",
      salary: "£80K - £120K",
      description:
        "Build scalable web applications using modern technologies. Experience with React, Node.js, and cloud platforms required.",
      requirements: [
        "5+ years experience",
        "React expertise",
        "Node.js proficiency",
        "Cloud platform experience",
      ],
    },
    {
      title: "Property Verification Specialist",
      department: "Operations",
      location: "London",
      type: "Full-time",
      salary: "£35K - £45K",
      description:
        "Ensure property listings meet our verification standards. Background in real estate or legal field preferred.",
      requirements: [
        "Real estate experience",
        "Attention to detail",
        "Legal knowledge",
        "Communication skills",
      ],
    },
    {
      title: "UX/UI Designer",
      department: "Design",
      location: "Remote",
      type: "Full-time",
      salary: "£50K - £70K",
      description:
        "Create intuitive user experiences for our property platform. Portfolio showcasing web and mobile design required.",
      requirements: [
        "3+ years experience",
        "Figma proficiency",
        "User research skills",
        "Portfolio required",
      ],
    },
    {
      title: "Customer Success Manager",
      department: "Support",
      location: "Manchester",
      type: "Full-time",
      salary: "£40K - £55K",
      description:
        "Help our users navigate property transactions successfully. Excellent communication and problem-solving skills required.",
      requirements: [
        "Customer service experience",
        "Communication skills",
        "Problem-solving",
        "Real estate knowledge",
      ],
    },
  ];

  const benefits = [
    "Competitive salary and equity package",
    "Health, dental, and vision insurance",
    "Flexible working hours and remote options",
    "Professional development budget",
    "Team retreats and company events",
    "Modern office with great amenities",
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
              <Briefcase className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                Join Our Team
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-linear-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent leading-tight">
              Shape the Future of
              <br />
              <span className="text-primary">Real Estate</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
              Join a passionate team that's revolutionizing property
              transactions with technology and transparency.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto mb-12">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">50+</div>
                <div className="text-sm text-muted-foreground">
                  Team Members
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">15+</div>
                <div className="text-sm text-muted-foreground">Countries</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">4.9</div>
                <div className="text-sm text-muted-foreground">
                  Employee Rating
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Values</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The principles that guide our work and define our culture
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card.Root
                key={index}
                className="bg-background/80 backdrop-blur-lg border border-border/50 rounded-2xl p-6 text-center hover:shadow-lg transition-shadow"
              >
                <Card.Content className="space-y-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto">
                    <value.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">{value.title}</h3>
                  <p className="text-muted-foreground text-sm">
                    {value.description}
                  </p>
                </Card.Content>
              </Card.Root>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Open Positions
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join our growing team and help us build the future of property
              transactions
            </p>
          </div>

          <div className="space-y-6">
            {openPositions.map((position, index) => (
              <Card.Root
                key={index}
                className="bg-background/80 backdrop-blur-lg border border-border/50 rounded-2xl p-6 hover:shadow-lg transition-shadow"
              >
                <Card.Content className="space-y-4">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="space-y-3 flex-1">
                      <div>
                        <h3 className="text-xl font-bold mb-1">
                          {position.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-4 h-4" />
                            {position.department}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {position.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {position.type}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            {position.salary}
                          </span>
                        </div>
                      </div>
                      <p className="text-muted-foreground">
                        {position.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {position.requirements.map((req, reqIndex) => (
                          <Chip
                            key={reqIndex}
                            variant="secondary"
                            className="text-xs"
                          >
                            {req}
                          </Chip>
                        ))}
                      </div>
                    </div>
                    <div className="shrink-0">
                      <Button className="bg-primary hover:bg-primary/90">
                        Apply Now
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </Card.Content>
              </Card.Root>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Work With Us?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We offer competitive benefits and a supportive work environment
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-muted-foreground">{benefit}</span>
              </div>
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
                Ready to Join Us?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Don't see a position that matches your skills? We're always
                looking for talented individuals to join our team.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 px-8 rounded-xl font-semibold gap-2"
                >
                  <Briefcase className="w-5 h-5" />
                  View All Positions
                </Button>
                <Button
                  size="lg"
                  variant="secondary"
                  className="px-8 rounded-xl font-semibold gap-2"
                >
                  <Users className="w-5 h-5" />
                  Send General Application
                </Button>
              </div>
            </Card.Content>
          </Card.Root>
        </div>
      </section>

      <Footer />
    </div>
  );
}
