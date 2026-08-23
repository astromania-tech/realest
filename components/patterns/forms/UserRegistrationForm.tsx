"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { RealEstButton } from "@/components/heroui/RealEstButton";
import { StatusBadge } from "@/components/ui/status-badge";

interface UserRegistrationFormProps {
  onSubmit?: (data: any) => void;
  userType?: "user" | "owner" | "agent";
  className?: string;
}

export function UserRegistrationForm({
  onSubmit,
  userType = "user",
  className,
}: UserRegistrationFormProps) {
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",

    // Account Information
    password: "",
    confirmPassword: "",

    // Location
    state: "",
    city: "",

    // User Type Specific
    profession: "",
    companyName: "",
    licenseNumber: "",
    experience: "",

    // Preferences
    interestedAreas: [],
    budgetRange: "",
    propertyTypes: [],

    // Legal
    agreeToTerms: false,
    subscribeNewsletter: true,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Calculate password strength
    if (field === "password") {
      let strength = 0;
      if (value.length >= 8) strength += 25;
      if (/[A-Z]/.test(value)) strength += 25;
      if (/[0-9]/.test(value)) strength += 25;
      if (/[^A-Za-z0-9]/.test(value)) strength += 25;
      setPasswordStrength(strength);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit?.(formData);
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 25) return "bg-red-500";
    if (passwordStrength <= 50) return "bg-yellow-500";
    if (passwordStrength <= 75) return "bg-blue-500";
    return "bg-green-500";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 25) return "Weak";
    if (passwordStrength <= 50) return "Fair";
    if (passwordStrength <= 75) return "Good";
    return "Strong";
  };

  return (
    <div className={cn("max-w-2xl mx-auto", className)}>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-heading font-bold mb-2">
          Create Your RealEST Account
        </h2>
        <p className="text-muted-foreground">
          Join Nigeria's most trusted property marketplace
        </p>
        <div className="flex justify-center mt-4">
          <StatusBadge variant="verified">
            {userType === "user" && "RealEST User"}
            {userType === "owner" && "Property Owner"}
            {userType === "agent" && "Real Estate Agent"}
          </StatusBadge>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Personal Information */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-xl font-heading font-semibold mb-6">
            Personal Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                First Name *
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                className="w-full p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Last Name *
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
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
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="w-full p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="+234 901 234 5678"
                className="w-full p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">State *</label>
              <select
                value={formData.state}
                onChange={(e) => handleInputChange("state", e.target.value)}
                className="w-full p-3 border border-input rounded-lg bg-background"
                required
              >
                <option value="">Select your state</option>
                <option value="Lagos">Lagos</option>
                <option value="Abuja">FCT Abuja</option>
                <option value="Rivers">Rivers</option>
                <option value="Kano">Kano</option>
                <option value="Ogun">Ogun</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                placeholder="Your city"
                className="w-full p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        </div>

        {/* Account Security */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-xl font-heading font-semibold mb-6">
            Account Security
          </h3>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Password *
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className="w-full p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring"
                required
              />
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className={cn(
                          "h-2 rounded-full transition-all",
                          getPasswordStrengthColor(),
                        )}
                        style={{ width: `${passwordStrength}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium">
                      {getPasswordStrengthText()}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Use 8+ characters with uppercase, lowercase, numbers, and
                    symbols
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Confirm Password *
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  handleInputChange("confirmPassword", e.target.value)
                }
                className="w-full p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring"
                required
              />
              {formData.confirmPassword &&
                formData.password !== formData.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">
                    Passwords do not match
                  </p>
                )}
            </div>
          </div>
        </div>

        {/* User Type Specific Fields */}
        {userType === "agent" && (
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-xl font-heading font-semibold mb-6">
              Professional Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) =>
                    handleInputChange("companyName", e.target.value)
                  }
                  className="w-full p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  License Number
                </label>
                <input
                  type="text"
                  value={formData.licenseNumber}
                  onChange={(e) =>
                    handleInputChange("licenseNumber", e.target.value)
                  }
                  placeholder="Professional license number"
                  className="w-full p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Years of Experience
                </label>
                <select
                  value={formData.experience}
                  onChange={(e) =>
                    handleInputChange("experience", e.target.value)
                  }
                  className="w-full p-3 border border-input rounded-lg bg-background"
                >
                  <option value="">Select experience level</option>
                  <option value="0-1">0-1 years</option>
                  <option value="2-5">2-5 years</option>
                  <option value="6-10">6-10 years</option>
                  <option value="10+">10+ years</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Legal & Preferences */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-xl font-heading font-semibold mb-6">
            Terms & Preferences
          </h3>

          <div className="space-y-4">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={formData.agreeToTerms}
                onChange={(e) =>
                  handleInputChange("agreeToTerms", e.target.checked)
                }
                className="mt-1 rounded border-input"
                required
              />
              <span className="text-sm">
                I agree to the{" "}
                <a href="/terms" className="text-brand-violet hover:underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="/privacy"
                  className="text-brand-violet hover:underline"
                >
                  Privacy Policy
                </a>
              </span>
            </label>

            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={formData.subscribeNewsletter}
                onChange={(e) =>
                  handleInputChange("subscribeNewsletter", e.target.checked)
                }
                className="mt-1 rounded border-input"
              />
              <span className="text-sm">
                Subscribe to our newsletter for property updates and market
                insights
              </span>
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <RealEstButton
          type="submit"
          variant="neon"
          size="lg"
          className="w-full"
          isLoading={isLoading}
          disabled={
            !formData.agreeToTerms ||
            formData.password !== formData.confirmPassword
          }
        >
          {isLoading ? "Creating Account..." : "Create Account"}
        </RealEstButton>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <a
              href="/signin"
              className="text-brand-violet hover:underline font-medium"
            >
              Sign in here
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}
