"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { RealEstButton } from "@/components/heroui/RealEstButton";
import {
  PropertyListingForm,
  UserRegistrationForm,
  ContactForm,
  AdvancedSearchForm,
  ProfileSettingsForm,
  PropertyVerificationForm,
  ReviewForm,
  QuickInquiryForm,
} from "@/components/patterns/forms";

type FormType =
  | "property-listing"
  | "user-registration"
  | "contact"
  | "advanced-search"
  | "profile-settings"
  | "property-verification"
  | "review"
  | "quick-inquiry";

const formPatterns = [
  {
    id: "property-listing",
    title: "Property Listing Form",
    description:
      "Multi-step form for property owners and agents to list properties",
    category: "Core Forms",
    complexity: "Complex",
    features: [
      "6-step wizard",
      "Nigerian property types",
      "Infrastructure assessment",
      "Draft saving",
    ],
  },
  {
    id: "user-registration",
    title: "User Registration Form",
    description: "Role-based user account creation with type-specific fields",
    category: "Authentication",
    complexity: "Medium",
    features: [
      "Role selection",
      "Progressive disclosure",
      "Password strength",
      "Professional credentials",
    ],
  },
  {
    id: "contact",
    title: "Contact Form",
    description:
      "Streamlined communication between users and property contacts",
    category: "Communication",
    complexity: "Simple",
    features: [
      "Inquiry types",
      "Contact methods",
      "Property context",
      "Availability scheduling",
    ],
  },
  {
    id: "advanced-search",
    title: "Advanced Search Form",
    description: "Comprehensive property filtering with expandable sections",
    category: "Search & Filter",
    complexity: "Medium",
    features: [
      "Quick filters",
      "Expandable sections",
      "Infrastructure filters",
      "Search saving",
    ],
  },
  {
    id: "profile-settings",
    title: "Profile Settings Form",
    description: "Tabbed interface for comprehensive user account management",
    category: "User Management",
    complexity: "Complex",
    features: [
      "5 tab sections",
      "Role-based fields",
      "Security settings",
      "Privacy controls",
    ],
  },
  {
    id: "property-verification",
    title: "Property Verification Form",
    description:
      "Admin workflow for property verification with detailed assessment",
    category: "Admin Tools",
    complexity: "Complex",
    features: [
      "5-step process",
      "Document tracking",
      "Physical inspection",
      "Final recommendation",
    ],
  },
  {
    id: "review",
    title: "Review & Rating Form",
    description: "User feedback system for properties, agents, and landlords",
    category: "Feedback",
    complexity: "Medium",
    features: [
      "5-star ratings",
      "Category ratings",
      "Pros/cons lists",
      "Anonymous option",
    ],
  },
  {
    id: "quick-inquiry",
    title: "Quick Inquiry Form",
    description:
      "Compact, sidebar-friendly contact form for immediate inquiries",
    category: "Communication",
    complexity: "Simple",
    features: [
      "Minimal fields",
      "Inquiry types",
      "Mobile-optimized",
      "Urgency indicators",
    ],
  },
];

export default function FormShowcasePage() {
  const [selectedForm, setSelectedForm] = useState<FormType | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = [
    "All",
    ...new Set(formPatterns.map((form) => form.category)),
  ];
  const filteredForms =
    selectedCategory === "All"
      ? formPatterns
      : formPatterns.filter((form) => form.category === selectedCategory);

  const handleFormSubmit = async (formId: string, data: any) => {
    console.log(`${formId} submitted:`, data);
    alert(`${formId} form submitted successfully! Check console for data.`);
  };

  const renderForm = () => {
    if (!selectedForm) return null;

    const commonProps = {
      onSubmit: (data: any) => handleFormSubmit(selectedForm, data),
      className: "max-w-none",
    };

    switch (selectedForm) {
      case "property-listing":
        return (
          <PropertyListingForm
            {...commonProps}
            onSaveDraft={async (data) => console.log("Draft saved:", data)}
          />
        );

      case "user-registration":
        return <UserRegistrationForm {...commonProps} userType="owner" />;

      case "contact":
        return (
          <ContactForm
            {...commonProps}
            propertyId="demo-property-123"
            recipientType="owner"
            recipientName="John Doe"
          />
        );

      case "advanced-search":
        return (
          <AdvancedSearchForm
            onSearch={(filters) => console.log("Search filters:", filters)}
            onSaveSearch={(filters) => console.log("Saved search:", filters)}
          />
        );

      case "profile-settings":
        return (
          <ProfileSettingsForm
            {...commonProps}
            userType="owner"
            initialData={{
              firstName: "John",
              lastName: "Doe",
              email: "john@example.com",
              state: "Lagos",
            }}
          />
        );

      case "property-verification":
        return (
          <PropertyVerificationForm
            propertyId="demo-property-123"
            onSubmit={commonProps.onSubmit}
            onReject={(reason) => console.log("Property rejected:", reason)}
          />
        );

      case "review":
        return (
          <ReviewForm
            {...commonProps}
            propertyId="demo-property-123"
            reviewType="property"
          />
        );

      case "quick-inquiry":
        return (
          <QuickInquiryForm
            {...commonProps}
            propertyId="demo-property-123"
            propertyTitle="3BR Apartment in Lekki"
          />
        );

      default:
        return null;
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case "Simple":
        return "text-green-600 bg-green-100";
      case "Medium":
        return "text-yellow-600 bg-yellow-100";
      case "Complex":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-heading font-bold text-foreground mb-4">
              RealEST Form Patterns Showcase
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Comprehensive collection of form patterns built for the Nigerian
              real estate marketplace. Each form follows RealEST design system
              guidelines and includes market-specific features.
            </p>
          </div>

          {selectedForm && (
            <div className="mt-6 flex justify-center">
              <RealEstButton
                variant="outline"
                onClick={() => setSelectedForm(null)}
              >
                ← Back to Overview
              </RealEstButton>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedForm ? (
          // Form Display
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-heading font-bold mb-2">
                {formPatterns.find((f) => f.id === selectedForm)?.title}
              </h2>
              <p className="text-muted-foreground">
                {formPatterns.find((f) => f.id === selectedForm)?.description}
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              {renderForm()}
            </div>
          </div>
        ) : (
          // Form Grid
          <div className="space-y-8">
            {/* Category Filter */}
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                    selectedCategory === category
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80",
                  )}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Form Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredForms.map((form) => (
                <div
                  key={form.id}
                  className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSelectedForm(form.id as FormType)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-heading font-semibold mb-1">
                        {form.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {form.category}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        getComplexityColor(form.complexity),
                      )}
                    >
                      {form.complexity}
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4">
                    {form.description}
                  </p>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Key Features:</h4>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {form.features.map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <span className="w-1 h-1 bg-primary rounded-full mr-2" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-4 pt-4 border-t border-border">
                    <RealEstButton
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      View Form →
                    </RealEstButton>
                  </div>
                </div>
              ))}
            </div>

            {/* Design System Info */}
            <div className="bg-card border border-border rounded-xl p-6 mt-12">
              <h2 className="text-2xl font-heading font-bold mb-4">
                Design System Integration
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-heading font-semibold mb-2">
                    Color System
                  </h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-brand-dark rounded mr-2"></div>
                      Navy #242834 (60%)
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-brand-violet rounded mr-2"></div>
                      Violet #7D53FF (30%)
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-brand-neon rounded mr-2"></div>
                      Neon #B6FF00 (10%)
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-heading font-semibold mb-2">
                    Typography
                  </h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="font-display">Display: Lufga</div>
                    <div className="font-heading">Heading: Neulis Neue</div>
                    <div className="font-body">Body: Space Grotesk</div>
                    <div className="font-mono">Mono: JetBrains Mono</div>
                  </div>
                </div>

                <div>
                  <h3 className="font-heading font-semibold mb-2">
                    Components
                  </h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div>HeroUI v3 (70%)</div>
                    <div>UntitledUI (25%)</div>
                    <div>Shadcn/UI (5%)</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h4 className="font-heading font-semibold mb-2">
                  Nigerian Market Features
                </h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>• Nigerian states and LGAs integration</p>
                  <p>• Boys Quarters (BQ) property type support</p>
                  <p>• NEPA/power supply considerations</p>
                  <p>• Naira (₦) currency formatting</p>
                  <p>• Local infrastructure indicators</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
