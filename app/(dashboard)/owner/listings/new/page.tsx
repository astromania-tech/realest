"use client";

import { useState } from "react";
import Link from "next/link";
import { Chip } from "@heroui/react";
import { 
  Card, 
  CardContent,
  Button, 
} from "@/components/ui";
import {
  ArrowLeft,
  Home,
  Building,
  Hotel,
  Briefcase,
  CheckCircle,
  Clock,
  Star,
  Shield,
  Users,
} from "lucide-react";

interface Step {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
  current: boolean;
}

export default function NewListingPage() {
  const [currentStep, setCurrentStep] = useState(0);

  const steps: Step[] = [
    {
      id: "type",
      title: "Property Type",
      description: "Choose the type of property you're listing",
      icon: <Home className="w-6 h-6" />,
      completed: false,
      current: currentStep === 0,
    },
    {
      id: "details",
      title: "Property Details",
      description: "Add comprehensive property information",
      icon: <Building className="w-6 h-6" />,
      completed: false,
      current: currentStep === 1,
    },
    {
      id: "location",
      title: "Location",
      description: "Specify the property location and address",
      icon: <Shield className="w-6 h-6" />,
      completed: false,
      current: currentStep === 2,
    },
    {
      id: "media",
      title: "Photos & Media",
      description: "Upload high-quality photos and videos",
      icon: <Star className="w-6 h-6" />,
      completed: false,
      current: currentStep === 3,
    },
    {
      id: "documents",
      title: "Documents",
      description: "Upload property documents for verification",
      icon: <Briefcase className="w-6 h-6" />,
      completed: false,
      current: currentStep === 4,
    },
    {
      id: "review",
      title: "Review & Publish",
      description: "Review your listing and publish it",
      icon: <CheckCircle className="w-6 h-6" />,
      completed: false,
      current: currentStep === 5,
    },
  ];

  const propertyTypes = [
    {
      id: "house",
      name: "House",
      description: "Single-family homes, duplexes, townhouses",
      icon: <Home className="w-8 h-8" />,
      popular: true,
    },
    {
      id: "apartment",
      name: "Apartment",
      description: "Flats, condos, modern apartments",
      icon: <Building className="w-8 h-8" />,
      popular: true,
    },
    {
      id: "hotel",
      name: "Hotel",
      description: "Hotels, resorts, short-term rentals",
      icon: <Hotel className="w-8 h-8" />,
      popular: false,
    },
    {
      id: "office",
      name: "Office",
      description: "Commercial office spaces",
      icon: <Briefcase className="w-8 h-8" />,
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-secondary/10 via-primary/5 to-secondary/20" />
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/50 to-transparent" />

        <div className="relative z-10 container mx-auto px-4">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/owner/listings">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Create New Listing
              </h1>
              <p className="text-muted-foreground">
                Follow our step-by-step process to create a compelling property
                listing.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 pb-16">
        <div className="max-w-6xl mx-auto">
          {/* Progress Steps */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-8">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-colors ${
                        step.completed
                          ? "bg-success text-success-foreground"
                          : step.current
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {step.completed ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        step.icon
                      )}
                    </div>
                    <div className="text-center">
                      <p
                        className={`text-sm font-medium ${step.current ? "text-primary" : "text-muted-foreground"}`}
                      >
                        {step.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 max-w-24">
                        {step.description}
                      </p>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="flex-1 h-px bg-border mx-4 -mt-6" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Current Step Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <Card className="bg-surface/90 backdrop-blur-lg border border-border/50 rounded-2xl shadow-lg">
                <CardContent className="p-8">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      {steps[currentStep].icon}
                    </div>
                    <h2 className="text-2xl font-bold mb-2">
                      {steps[currentStep].title}
                    </h2>
                    <p className="text-muted-foreground">
                      {steps[currentStep].description}
                    </p>
                  </div>

                  {/* Step Content */}
                  {currentStep === 0 && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {propertyTypes.map((type) => (
                          <Card
                            key={type.id}
                            className="cursor-pointer border-2 border-transparent hover:border-primary/50 transition-colors"
                          >
                            <CardContent className="p-6 text-center">
                              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                                {type.icon}
                              </div>
                              <h3 className="font-semibold mb-2">
                                {type.name}
                              </h3>
                              <p className="text-sm text-muted-foreground mb-4">
                                {type.description}
                              </p>
                              {type.popular && (
                                <Chip variant="secondary" size="sm">
                                  Popular
                                </Chip>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>

                      <div className="flex justify-between pt-6">
                        <Button variant="ghost" disabled>
                          Previous
                        </Button>
                        <Link href="/owner/listings/new/type">
                          <Button variant="default">Continue</Button>
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* Placeholder for other steps */}
                  {currentStep > 0 && (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground mb-6">
                        This step is under development. Click the button below
                        to proceed.
                      </p>
                      <Link href={`/owner/listings/new/${steps[currentStep].id}`}>
                        <Button variant="default">
                          Go to {steps[currentStep].title}
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Tips */}
              <Card className="bg-surface/90 backdrop-blur-lg border border-border/50 rounded-2xl shadow-lg">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">💡 Pro Tips</h3>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li>• Take high-quality photos in natural lighting</li>
                    <li>• Write detailed, honest descriptions</li>
                    <li>• Set competitive pricing based on market rates</li>
                    <li>
                      • Upload all required documents for faster verification
                    </li>
                    <li>• Respond quickly to inquiries to build trust</li>
                  </ul>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-surface/90 backdrop-blur-lg border border-border/50 rounded-2xl shadow-lg">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <Link href="/owner/listings">
                      <Button variant="ghost" className="w-full justify-start">
                        <Home className="w-4 h-4 mr-2" />
                        View My Listings
                      </Button>
                    </Link>
                    <Link href="/owner/analytics">
                      <Button variant="ghost" className="w-full justify-start">
                        <Users className="w-4 h-4 mr-2" />
                        View Analytics
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Support */}
              <Card className="bg-primary/5 border border-primary/20 rounded-2xl shadow-lg">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Need Help?</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Our support team is here to help you create the perfect
                    listing.
                  </p>
                  <Button variant="secondary" className="w-full">
                    Contact Support
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
