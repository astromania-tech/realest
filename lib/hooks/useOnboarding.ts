// Create useOnboarding hook for centralized data fetching and state management

"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "./useUser";

export interface OnboardingFormData {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  profilePhotoUrl: string;
  // Agent-specific
  licenseNumber?: string;
  agencyName?: string;
  specializations?: string[];
  whatsapp?: string;
  agreeTerms?: boolean;
  // Owner-specific
  companyName?: string;
  experience?: string;
}

export interface OnboardingState {
  currentStep: number;
  isLoading: boolean;
  error: string | null;
  success: boolean;
  formData: OnboardingFormData;
}

export interface UseOnboardingOptions {
  userType: "agent" | "owner";
  redirectPath?: string;
}

export interface UseOnboardingReturn extends OnboardingState {
  updateFormData: (field: string, value: any) => void;
  handleNext: () => void;
  handleBack: () => void;
  handleSubmit: () => Promise<void>;
  validateStep: (step: number) => boolean;
  resetForm: () => void;
}

/**
 * Centralized hook for onboarding logic
 * Handles data fetching, validation, and submission for both agent and owner onboarding
 */
export function useOnboarding(
  options: UseOnboardingOptions,
): UseOnboardingReturn {
  const { userType, redirectPath } = options;
  const router = useRouter();
  const { user, profile, isLoading: userLoading } = useUser();
  const supabase = createClient();

  const [state, setState] = useState<OnboardingState>({
    currentStep: 1,
    isLoading: false,
    error: null,
    success: false,
    formData: {
      fullName: "",
      email: "",
      phone: "",
      location: "",
      bio: "",
      profilePhotoUrl: "",
      licenseNumber: "",
      agencyName: "",
      specializations: [],
      whatsapp: "",
      agreeTerms: false,
      companyName: "",
      experience: "",
    },
  });

  // Initialize form data from existing profile
  useEffect(() => {
    if (!userLoading && user?.email) {
      setState((prev) => ({
        ...prev,
        formData: {
          ...prev.formData,
          email: prev.formData.email || user.email || "",
        },
      }));
    }
  }, [userLoading, user?.email]);

  // Initialize profile-backed form data when a profile already exists
  useEffect(() => {
    if (profile && !userLoading) {
      setState((prev) => ({
        ...prev,
        formData: {
          ...prev.formData,
          fullName: profile.full_name || "",
          phone: profile.phone || "",
          bio: profile.bio || "",
          profilePhotoUrl: profile.avatar_url || "",
        },
      }));
    }
  }, [profile, userLoading]);

  // Update form data
  const updateFormData = useCallback((field: string, value: any) => {
    setState((prev) => ({
      ...prev,
      formData: {
        ...prev.formData,
        [field]: value,
      },
      error: null, // Clear error when user makes changes
    }));
  }, []);

  // Validate current step
  const validateStep = useCallback(
    (step: number): boolean => {
      const { formData } = state;
      let newError: string | null = null;

      if (step === 1) {
        if (!formData.fullName.trim()) {
          newError = "Full name is required";
        } else if (!formData.email.trim()) {
          newError = "Email is required";
        } else if (!formData.phone.trim()) {
          newError = "Phone number is required";
        }
      }

      if (userType === "owner" && step === 2) {
        if (!formData.companyName?.trim()) {
          newError = "Business/company name is required";
        }
      }

      if (userType === "agent" && (step === 2 || step === 4)) {
        if (!formData.licenseNumber?.trim()) {
          newError = "RC number (company registration) is required";
        } else if (!formData.agencyName?.trim()) {
          newError = "Agency name is required";
        } else if (
          !formData.specializations ||
          formData.specializations.length === 0
        ) {
          newError = "Please select at least one specialization";
        } else if (!formData.agreeTerms) {
          newError = "You must agree to the terms and conditions";
        }
      }

      setState((prev) => ({ ...prev, error: newError }));
      return newError === null;
    },
    [state.formData, userType],
  );

  // Navigation functions
  const handleNext = useCallback(() => {
    if (validateStep(state.currentStep)) {
      setState((prev) => ({
        ...prev,
        currentStep: Math.min(prev.currentStep + 1, 4),
      }));
    }
  }, [state.currentStep, validateStep, userType]);

  const handleBack = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 1),
    }));
  }, []);

  // Submit onboarding data
  const handleSubmit = useCallback(async () => {
    if (!user || !validateStep(state.currentStep)) return;

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const { formData } = state;

      // Update profiles table (role lives on users.role — never write user_type to profiles)
      const profileUpdates = {
        id: user.id,
        full_name: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        bio: formData.bio.trim() || null,
        avatar_url: formData.profilePhotoUrl || null,
        updated_at: new Date().toISOString(),
      };

      const { error: profileError } = await supabase
        .from("profiles")
        .upsert(profileUpdates);

      if (profileError) throw profileError;

      // Insert role-specific data
      if (userType === "agent") {
        const agentData = {
          profile_id: user.id,
          license_number: formData.licenseNumber!.trim(),
          agency_name: formData.agencyName!.trim(),
          phone: formData.phone.trim(),
          whatsapp: formData.whatsapp?.trim() || null,
          bio: formData.bio.trim() || null,
          specialization: formData.specializations!,
          photo_url: formData.profilePhotoUrl || null,
          verified: false,
        };

        const { error: agentError } = await supabase
          .from("agents")
          .insert(agentData);

        if (agentError) throw agentError;
      } else if (userType === "owner") {
        const ownerData = {
          profile_id: user.id,
          business_name: formData.companyName?.trim() || null,
          years_experience: formData.experience
            ? parseInt(formData.experience)
            : null,
          phone: formData.phone.trim(),
          verified: false,
        };

        const { error: ownerError } = await supabase
          .from("owners")
          .insert(ownerData);

        if (ownerError) throw ownerError;
      }

      setState((prev) => ({ ...prev, success: true }));

      // Fire-and-forget: send welcome email (non-blocking — onboarding is complete either way)
      const redirectTo =
        redirectPath || (userType === "agent" ? "/agent" : "/owner");
      const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
      fetch("/api/email/welcome", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userType,
          dashboardUrl: `${siteUrl}${redirectTo}`,
        }),
      }).catch((err) =>
        console.warn("[Onboarding] Welcome email request failed:", err),
      );

      // Redirect after success
      setTimeout(() => {
        router.push(redirectTo);
      }, 2000);
    } catch (error: any) {
      console.error("Onboarding submission error:", error);
      setState((prev) => ({
        ...prev,
        error:
          error.message || "Failed to complete onboarding. Please try again.",
      }));
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [user, state, validateStep, userType, redirectPath, supabase, router]);

  // Reset form
  const resetForm = useCallback(() => {
    setState({
      currentStep: 1,
      isLoading: false,
      error: null,
      success: false,
      formData: {
        fullName: "",
        email: "",
        phone: "",
        location: "",
        bio: "",
        profilePhotoUrl: "",
        licenseNumber: "",
        agencyName: "",
        specializations: [],
        whatsapp: "",
        agreeTerms: false,
        companyName: "",
        experience: "",
      },
    });
  }, []);

  return {
    ...state,
    updateFormData,
    handleNext,
    handleBack,
    handleSubmit,
    validateStep,
    resetForm,
  };
}
