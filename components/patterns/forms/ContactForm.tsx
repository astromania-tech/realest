"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { RealEstButton } from "@/components/heroui/RealEstButton";

interface ContactFormProps {
  propertyId?: string;
  recipientType?: "owner" | "agent";
  recipientName?: string;
  onSubmit?: (data: any) => void;
  className?: string;
}

export function ContactForm({
  propertyId,
  recipientType = "owner",
  recipientName,
  onSubmit,
  className,
}: ContactFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    inquiryType: "viewing",
    preferredContactMethod: "email",
    availableTimes: [],
  });

  const [isLoading, setIsLoading] = useState(false);

  const inquiryTypes = [
    { value: "viewing", label: "Schedule a Viewing" },
    { value: "rental", label: "Rental Inquiry" },
    { value: "purchase", label: "Purchase Inquiry" },
    { value: "information", label: "Request Information" },
    { value: "negotiation", label: "Price Negotiation" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSubmit?.({ ...formData, propertyId });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("max-w-lg mx-auto", className)}>
      <div className="text-center mb-6">
        <h3 className="text-xl font-heading font-bold mb-2">
          Contact {recipientType}
        </h3>
        {recipientName && (
          <p className="text-muted-foreground">
            Get in touch with {recipientName}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Inquiry Type
            </label>
            <select
              value={formData.inquiryType}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  inquiryType: e.target.value,
                }))
              }
              className="w-full p-3 border border-input rounded-lg bg-background"
            >
              {inquiryTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Your Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Email Address *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              className="w-full p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, phone: e.target.value }))
              }
              placeholder="+234 901 234 5678"
              className="w-full p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Message *</label>
            <textarea
              value={formData.message}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, message: e.target.value }))
              }
              placeholder="Tell us about your requirements, preferred viewing times, or any questions you have..."
              rows={4}
              className="w-full p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring resize-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Preferred Contact Method
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="contactMethod"
                  value="email"
                  checked={formData.preferredContactMethod === "email"}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      preferredContactMethod: e.target.value,
                    }))
                  }
                  className="border-input"
                />
                <span className="text-sm">Email</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="contactMethod"
                  value="phone"
                  checked={formData.preferredContactMethod === "phone"}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      preferredContactMethod: e.target.value,
                    }))
                  }
                  className="border-input"
                />
                <span className="text-sm">Phone</span>
              </label>
            </div>
          </div>
        </div>

        <RealEstButton
          type="submit"
          variant="neon"
          size="lg"
          className="w-full"
          isLoading={isLoading}
          disabled={isLoading}
        >
          {isLoading ? "Sending Message..." : "Send Message"}
        </RealEstButton>

        <p className="text-xs text-muted-foreground text-center">
          Your contact information will be shared with the {recipientType} to
          facilitate communication.
        </p>
      </form>
    </div>
  );
}
