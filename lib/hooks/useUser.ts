"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { useAuth } from "@/components/providers/AuthProvider";

// Base user types
export type UserRole = "user" | "owner" | "agent" | "admin" | "system_owner";

export interface BaseUserProfile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  bio: string | null;
  avatar_url: string | null;
  /**
   * Role from public.users.role — single source of truth.
   * Named user_type for backward compatibility with existing UI code.
   */
  user_type: UserRole;
  created_at: string;
  updated_at: string;
}

// Extended profiles for specific user types
export interface OwnerProfile extends BaseUserProfile {
  user_type: "owner";
  owner_details: {
    id: string;
    business_name: string | null;
    property_types: string[] | null;
    verified: boolean;
    verification_date: string | null;
    years_experience: number | null;
    rating: number | null;
    total_properties: number | null;
    whatsapp: string | null;
    kyc_status: "pending" | "approved" | "rejected" | null;
    kyc_submitted_at: string | null;
  };
}

export interface AgentProfile extends BaseUserProfile {
  user_type: "agent";
  agent_details: {
    id: string;
    license_number: string | null;
    agency_name: string | null;
    specialization: string[] | null;
    verified: boolean;
    verification_date: string | null;
    years_experience: number | null;
    rating: number | null;
    total_sales: number | null;
    total_listings: number | null;
    whatsapp: string | null;
    kyc_status: "pending" | "approved" | "rejected" | null;
    kyc_submitted_at: string | null;
  };
}

export interface AdminProfile extends BaseUserProfile {
  user_type: "admin";
  admin_details: {
    // Admin-specific data can be added here
    system_permissions: string[];
  };
}

export interface SystemOwnerProfile extends BaseUserProfile {
  user_type: "system_owner";
  system_owner_details: {
    // System owner has ultimate control
    global_permissions: string[];
    system_access_level: "ultimate";
  };
}

export interface RegularUserProfile extends BaseUserProfile {
  user_type: "user";
}

// Union type for all user profiles
export type UserProfile =
  | RegularUserProfile
  | OwnerProfile
  | AgentProfile
  | AdminProfile
  | SystemOwnerProfile;

// Hook return type
export interface UseUserReturn {
  user: User | null;
  profile: UserProfile | null;
  role: UserRole | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
  logout: () => Promise<void>;
}

// Cache for user data to avoid repeated fetches
const userCache = new Map<string, { data: UserProfile; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useUser(): UseUserReturn {
  const { user: authUser, isLoading: authLoading } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  const isInitialized = useRef(false);

  // Fetch user role from public.users table (single source of truth)
  const fetchUserRole = useCallback(
    async (userId: string): Promise<UserRole | null> => {
      try {
        const { data: userData, error } = await supabase
          .from("users")
          .select("role")
          .eq("id", userId)
          .single();

        if (error) {
          console.error("Error fetching user role:", error);
          return null;
        }

        return (userData?.role as UserRole) || null;
      } catch (err) {
        console.error("Error in fetchUserRole:", err);
        return null;
      }
    },
    [supabase],
  );

  // Fetch basic profile data
  const fetchBasicProfile = useCallback(
    async (userId: string): Promise<BaseUserProfile | null> => {
      try {
        const { data: profileData, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (error) {
          console.error("Error fetching basic profile:", error);
          return null;
        }

        return profileData as BaseUserProfile;
      } catch (err) {
        console.error("Error in fetchBasicProfile:", err);
        return null;
      }
    },
    [supabase],
  );

  // Fetch owner-specific data
  const fetchOwnerDetails = useCallback(
    async (userId: string) => {
      try {
        const { data: ownerData, error: ownerError } = await supabase
          .from("owners")
          .select("*")
          .eq("profile_id", userId)
          .single();

        // Fetch KYC status
        const { data: kycData } = await supabase
          .from("kyc_requests")
          .select("status, submitted_at")
          .eq("user_id", userId)
          .eq("user_type", "owner")
          .order("submitted_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        return {
          owner_details: ownerData
            ? {
                id: ownerData.id,
                business_name: ownerData.business_name,
                property_types: ownerData.property_types,
                verified: ownerData.verified,
                verification_date: ownerData.verification_date,
                years_experience: ownerData.years_experience,
                rating: ownerData.rating,
                total_properties: ownerData.total_properties,
                whatsapp: ownerData.whatsapp,
                kyc_status: kycData?.status || null,
                kyc_submitted_at: kycData?.submitted_at || null,
              }
            : null,
          ownerError,
        };
      } catch (err) {
        console.error("Error in fetchOwnerDetails:", err);
        return { owner_details: null, ownerError: err };
      }
    },
    [supabase],
  );

  // Fetch agent-specific data
  const fetchAgentDetails = useCallback(
    async (userId: string) => {
      try {
        const { data: agentData, error: agentError } = await supabase
          .from("agents")
          .select("*")
          .eq("profile_id", userId)
          .single();

        // Fetch KYC status
        const { data: kycData } = await supabase
          .from("kyc_requests")
          .select("status, submitted_at")
          .eq("user_id", userId)
          .eq("user_type", "agent")
          .order("submitted_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        return {
          agent_details: agentData
            ? {
                id: agentData.id,
                license_number: agentData.license_number,
                agency_name: agentData.agency_name,
                specialization: agentData.specialization,
                verified: agentData.verified,
                verification_date: agentData.verification_date,
                years_experience: agentData.years_experience,
                rating: agentData.rating,
                total_sales: agentData.total_sales,
                total_listings: agentData.total_listings,
                whatsapp: agentData.whatsapp,
                kyc_status: kycData?.status || null,
                kyc_submitted_at: kycData?.submitted_at || null,
              }
            : null,
          agentError,
        };
      } catch (err) {
        console.error("Error in fetchAgentDetails:", err);
        return { agent_details: null, agentError: err };
      }
    },
    [supabase],
  );

  // Main function to fetch complete user profile
  const fetchCompleteProfile = useCallback(
    async (userId: string): Promise<UserProfile | null> => {
      try {
        // Check cache first
        const cached = userCache.get(userId);
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
          return cached.data;
        }

        // Fetch basic data
        const [userRole, basicProfile] = await Promise.all([
          fetchUserRole(userId),
          fetchBasicProfile(userId),
        ]);

        if (!userRole || !basicProfile) {
          return null;
        }

        let completeProfile: UserProfile;

        // Fetch role-specific data
        if (userRole === "owner") {
          const { owner_details } = await fetchOwnerDetails(userId);
          completeProfile = {
            ...basicProfile,
            user_type: "owner",
            owner_details: owner_details || {
              id: "",
              business_name: null,
              property_types: null,
              verified: false,
              verification_date: null,
              years_experience: null,
              rating: null,
              total_properties: null,
              whatsapp: null,
              kyc_status: null,
              kyc_submitted_at: null,
            },
          } as OwnerProfile;
        } else if (userRole === "agent") {
          const { agent_details } = await fetchAgentDetails(userId);
          completeProfile = {
            ...basicProfile,
            user_type: "agent",
            agent_details: agent_details || {
              id: "",
              license_number: null,
              agency_name: null,
              specialization: null,
              verified: false,
              verification_date: null,
              years_experience: null,
              rating: null,
              total_sales: null,
              total_listings: null,
              whatsapp: null,
              kyc_status: null,
              kyc_submitted_at: null,
            },
          } as AgentProfile;
        } else if (userRole === "admin") {
          completeProfile = {
            ...basicProfile,
            user_type: "admin",
            admin_details: {
              system_permissions: ["all"], // Default admin permissions
            },
          } as AdminProfile;
        } else if (userRole === "system_owner") {
          completeProfile = {
            ...basicProfile,
            user_type: "system_owner",
            system_owner_details: {
              global_permissions: ["ultimate_control"],
              system_access_level: "ultimate",
            },
          } as SystemOwnerProfile;
        } else {
          completeProfile = {
            ...basicProfile,
            user_type: "user",
          } as RegularUserProfile;
        }

        // Cache the result
        userCache.set(userId, { data: completeProfile, timestamp: Date.now() });

        return completeProfile;
      } catch (err) {
        console.error("Error in fetchCompleteProfile:", err);
        return null;
      }
    },
    [fetchUserRole, fetchBasicProfile, fetchOwnerDetails, fetchAgentDetails],
  );

  // Initialize user data — driven by AuthProvider's authUser
  const initializeUser = useCallback(async (currentUser: User) => {
    try {
      setIsLoading(true);
      setError(null);

      setUser(currentUser);

      const userProfile = await fetchCompleteProfile(currentUser.id);

      if (userProfile) {
        setProfile(userProfile);
        setRole(userProfile.user_type);
      } else {
        setError("Failed to load user profile");
      }
    } catch (err) {
      console.error("Error initializing user:", err);
      setError("Failed to load user data");
    } finally {
      setIsLoading(false);
    }
  }, [fetchCompleteProfile]);

  // Refresh user data
  const refresh = useCallback(async () => {
    if (user) {
      // Clear cache for this user
      userCache.delete(user.id);
      await initializeUser(user);
    }
  }, [user, initializeUser]);

  // Update profile
  const updateProfile = useCallback(
    async (updates: Partial<UserProfile>): Promise<boolean> => {
      if (!user?.id || !profile) return false;

      try {
        // Update basic profile fields
        const basicUpdates: any = {};
        if (updates.full_name !== undefined)
          basicUpdates.full_name = updates.full_name;
        if (updates.phone !== undefined) basicUpdates.phone = updates.phone;
        if (updates.bio !== undefined) basicUpdates.bio = updates.bio;
        if (updates.avatar_url !== undefined)
          basicUpdates.avatar_url = updates.avatar_url;

        if (Object.keys(basicUpdates).length > 0) {
          const { error } = await supabase
            .from("profiles")
            .update({ ...basicUpdates, updated_at: new Date().toISOString() })
            .eq("id", user.id);

          if (error) throw error;
        }

        // Update role-specific data
        if (
          profile.user_type === "owner" &&
          "owner_details" in updates &&
          updates.owner_details
        ) {
          const { error } = await supabase
            .from("owners")
            .update(updates.owner_details)
            .eq("profile_id", user.id);

          if (error) throw error;
        } else if (
          profile.user_type === "agent" &&
          "agent_details" in updates &&
          updates.agent_details
        ) {
          const { error } = await supabase
            .from("agents")
            .update(updates.agent_details)
            .eq("profile_id", user.id);

          if (error) throw error;
        }

        // Refresh data
        await refresh();
        return true;
      } catch (err) {
        console.error("Error updating profile:", err);
        setError("Failed to update profile");
        return false;
      }
    },
    [user?.id, profile, supabase, refresh],
  );

  // Logout function
  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      setRole(null);
      setError(null);
      // Clear cache
      userCache.clear();
    } catch (err) {
      console.error("Error during logout:", err);
      setError("Failed to logout");
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  // React to AuthProvider's user changes
  useEffect(() => {
    if (authLoading) return; // wait for AuthProvider to resolve

    if (authUser) {
      initializeUser(authUser);
    } else {
      // signed out
      setUser(null);
      setProfile(null);
      setRole(null);
      setError(null);
      setIsLoading(false);
      userCache.clear();
    }
  }, [authUser, authLoading, initializeUser]);

  return {
    user,
    profile,
    role,
    isLoading,
    isAuthenticated: !!user,
    error,
    refresh,
    updateProfile,
    logout,
  };
}

// Utility hooks for specific user types
export function useOwnerProfile(): OwnerProfile | null {
  const { profile } = useUser();
  return profile?.user_type === "owner" ? profile : null;
}

export function useAgentProfile(): AgentProfile | null {
  const { profile } = useUser();
  return profile?.user_type === "agent" ? profile : null;
}

export function useAdminProfile(): AdminProfile | null {
  const { profile } = useUser();
  return profile?.user_type === "admin" ? profile : null;
}

export function useRegularUserProfile(): RegularUserProfile | null {
  const { profile } = useUser();
  return profile?.user_type === "user" ? profile : null;
}

export function useSystemOwnerProfile(): SystemOwnerProfile | null {
  const { profile } = useUser();
  return profile?.user_type === "system_owner" ? profile : null;
}

// Hook for checking specific roles
export function useHasRole(requiredRole: UserRole): boolean {
  const { role } = useUser();
  return role === requiredRole;
}

// Hook for role-based conditional rendering
export function useRoleGuard(allowedRoles: UserRole[]): boolean {
  const { role } = useUser();
  return role ? allowedRoles.includes(role) : false;
}
