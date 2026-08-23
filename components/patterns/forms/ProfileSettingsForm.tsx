"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { RealEstButton } from "@/components/heroui/RealEstButton";
import { ProfileUpload } from "@/components/realest/ProfileUpload";

interface ProfileSettingsFormProps {
  onSubmit?: (data: any) => void;
  initialData?: any;
  userType?: "user" | "owner" | "agent" | "admin";
  className?: string;
}

export function ProfileSettingsForm({
  onSubmit,
  initialData,
  userType = "user",
  className,
}: ProfileSettingsFormProps) {
  const [activeTab, setActiveTab] = useState("personal");
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    profileImage: null,

    // Location
    state: "",
    city: "",
    address: "",

    // Professional (Agent/Owner specific)
    companyName: "",
    licenseNumber: "",
    experience: "",
    specialization: [],

    // Preferences
    language: "en",
    currency: "NGN",
    notifications: {
      email: true,
      sms: false,
      push: true,
      marketing: false,
    },

    // Privacy
    profileVisibility: "public",
    showContact: true,
    showLocation: false,

    // Account
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    twoFactorEnabled: false,

    ...initialData,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const tabs = [
    { id: "personal", label: "Personal Info", icon: "👤" },
    { id: "professional", label: "Professional", icon: "💼" },
    { id: "preferences", label: "Preferences", icon: "⚙️" },
    { id: "security", label: "Security", icon: "🔒" },
    { id: "privacy", label: "Privacy", icon: "👁️" },
  ];

  const nigerianStates = [
    "Abia",
    "Adamawa",
    "Akwa Ibom",
    "Anambra",
    "Bauchi",
    "Bayelsa",
    "Benue",
    "Borno",
    "Cross River",
    "Delta",
    "Ebonyi",
    "Edo",
    "Ekiti",
    "Enugu",
    "FCT",
    "Gombe",
    "Imo",
    "Jigawa",
    "Kaduna",
    "Kano",
    "Katsina",
    "Kebbi",
    "Kogi",
    "Kwara",
    "Lagos",
    "Nasarawa",
    "Niger",
    "Ogun",
    "Ondo",
    "Osun",
    "Oyo",
    "Plateau",
    "Rivers",
    "Sokoto",
    "Taraba",
    "Yobe",
    "Zamfara",
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value,
    }));

    // Calculate password strength
    if (field === "newPassword") {
      let strength = 0;
      if (value.length >= 8) strength += 25;
      if (/[A-Z]/.test(value)) strength += 25;
      if (/[0-9]/.test(value)) strength += 25;
      if (/[^A-Za-z0-9]/.test(value)) strength += 25;
      setPasswordStrength(strength);
    }
  };

  const handleNestedChange = (parent: string, field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [parent]: {
        ...(prev as any)[parent],
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSubmit?.(formData);
    } finally {
      setIsLoading(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "personal":
        return (
          <div className="space-y-6">
            {/* Profile Image Upload */}
            <div className="flex flex-col items-center space-y-4">
              <ProfileUpload
                size="xl"
                onUploadSuccess={(avatarUrl) => {
                  handleInputChange("profileImage", avatarUrl);
                }}
                onUploadError={(error) => {
                  console.error("Profile upload error:", error);
                  // You could add toast notification here
                }}
              />
              <p className="text-sm text-muted-foreground text-center">
                Click to upload a new profile picture. Maximum file size: 10MB.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) =>
                    handleInputChange("firstName", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) =>
                    handleInputChange("lastName", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="+234"
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">State</label>
                <select
                  value={formData.state}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Select State</option>
                  {nigerianStates.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
          </div>
        );

      case "professional":
        if (userType === "user") {
          return (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Professional settings are not available for user accounts.
              </p>
            </div>
          );
        }
        return (
          <div className="space-y-6">
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
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {userType === "agent" && (
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
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">
                Years of Experience
              </label>
              <select
                value={formData.experience}
                onChange={(e) =>
                  handleInputChange("experience", e.target.value)
                }
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Select Experience</option>
                <option value="0-1">0-1 years</option>
                <option value="2-5">2-5 years</option>
                <option value="6-10">6-10 years</option>
                <option value="11-15">11-15 years</option>
                <option value="16+">16+ years</option>
              </select>
            </div>
          </div>
        );

      case "preferences":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Language
                </label>
                <select
                  value={formData.language}
                  onChange={(e) =>
                    handleInputChange("language", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="en">English</option>
                  <option value="ha">Hausa</option>
                  <option value="ig">Igbo</option>
                  <option value="yo">Yoruba</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Currency
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) =>
                    handleInputChange("currency", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="NGN">Nigerian Naira (₦)</option>
                  <option value="USD">US Dollar ($)</option>
                </select>
              </div>
            </div>

            <div>
              <h4 className="font-heading font-semibold mb-4">Notifications</h4>
              <div className="space-y-3">
                {[
                  { key: "email", label: "Email Notifications" },
                  { key: "sms", label: "SMS Notifications" },
                  { key: "push", label: "Push Notifications" },
                  { key: "marketing", label: "Marketing Communications" },
                ].map(({ key, label }) => (
                  <label
                    key={key}
                    className="flex items-center space-x-3 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={
                        formData.notifications[
                          key as keyof typeof formData.notifications
                        ]
                      }
                      onChange={(e) =>
                        handleNestedChange(
                          "notifications",
                          key,
                          e.target.checked,
                        )
                      }
                      className="rounded border-border focus:ring-2 focus:ring-primary"
                    />
                    <span className="text-sm">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case "security":
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Current Password
              </label>
              <input
                type="password"
                value={formData.currentPassword}
                onChange={(e) =>
                  handleInputChange("currentPassword", e.target.value)
                }
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                New Password
              </label>
              <input
                type="password"
                value={formData.newPassword}
                onChange={(e) =>
                  handleInputChange("newPassword", e.target.value)
                }
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              {formData.newPassword && (
                <div className="mt-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className={cn(
                          "h-2 rounded-full transition-all",
                          passwordStrength >= 75
                            ? "bg-green-500"
                            : passwordStrength >= 50
                              ? "bg-yellow-500"
                              : passwordStrength >= 25
                                ? "bg-orange-500"
                                : "bg-red-500",
                        )}
                        style={{ width: `${passwordStrength}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {passwordStrength >= 75
                        ? "Strong"
                        : passwordStrength >= 50
                          ? "Good"
                          : passwordStrength >= 25
                            ? "Fair"
                            : "Weak"}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  handleInputChange("confirmPassword", e.target.value)
                }
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.twoFactorEnabled}
                  onChange={(e) =>
                    handleInputChange("twoFactorEnabled", e.target.checked)
                  }
                  className="rounded border-border focus:ring-2 focus:ring-primary"
                />
                <span className="text-sm">
                  Enable Two-Factor Authentication
                </span>
              </label>
              <p className="text-xs text-muted-foreground mt-1">
                Add an extra layer of security to your account
              </p>
            </div>
          </div>
        );

      case "privacy":
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Profile Visibility
              </label>
              <select
                value={formData.profileVisibility}
                onChange={(e) =>
                  handleInputChange("profileVisibility", e.target.value)
                }
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="public">
                  Public - Anyone can see your profile
                </option>
                <option value="verified">Verified Users Only</option>
                <option value="private">Private - Hidden from search</option>
              </select>
            </div>

            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.showContact}
                  onChange={(e) =>
                    handleInputChange("showContact", e.target.checked)
                  }
                  className="rounded border-border focus:ring-2 focus:ring-primary"
                />
                <span className="text-sm">Show contact information</span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.showLocation}
                  onChange={(e) =>
                    handleInputChange("showLocation", e.target.checked)
                  }
                  className="rounded border-border focus:ring-2 focus:ring-primary"
                />
                <span className="text-sm">Show general location</span>
              </label>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={cn("max-w-4xl mx-auto", className)}>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-heading font-bold mb-2">
          Profile Settings
        </h2>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-border">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center space-x-2 px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {renderTabContent()}

          <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-border">
            <RealEstButton
              type="button"
              variant="tertiary"
              onClick={() => window.location.reload()}
            >
              Cancel
            </RealEstButton>
            <RealEstButton
              type="submit"
              isLoading={isLoading}
              disabled={isLoading}
            >
              Save Changes
            </RealEstButton>
          </div>
        </form>
      </div>
    </div>
  );
}
