"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Chip, Avatar } from "@heroui/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
  CardHeader,
  Button,
} from "@/components/ui";
import {
  Heart,
  Search,
  MessageSquare,
  MapPin,
  Eye,
  Home,
  AlertCircle,
  Copy,
  Gift,
  Share2,
  Users,
} from "lucide-react";
import { useUser } from "@/lib/hooks/useUser";

interface UserDashboardStats {
  savedProperties: number;
  activeSearches: number;
  sentInquiries: number;
  viewedProperties: number;
  favoriteLocations: string[];
}

interface SavedProperty {
  id: string;
  title: string;
  price: number;
  address: string;
  city: string;
  property_type: string;
  listing_type: string;
  saved_at: string;
  image_url?: string;
}

interface RecentSearch {
  id: string;
  query: string;
  location: string;
  property_type: string;
  price_range: string;
  created_at: string;
  results_count: number;
}

interface SentInquiry {
  id: string;
  property_title: string;
  property_id: string;
  message: string;
  status: string;
  sent_at: string;
  owner_response?: string;
}

interface UserProfile {
  id: string;
  full_name: string | null;
  phone: string | null;
  bio: string | null;
  email: string;
  user_type: string;
}

interface ReferralMilestone {
  key: string;
  count: number;
  label: string;
  description: string;
}

interface RewardEntitlement {
  id: string;
  reward_key: string;
  status: string;
  granted_at: string;
  expires_at: string | null;
  metadata: {
    reward_label?: string;
    reward_description?: string;
    reward_copy?: string;
  } | null;
}

interface ReferralSummary {
  email: string;
  firstName: string;
  referralCode: string | null;
  referralCount: number;
  currentMilestone: ReferralMilestone | null;
  nextMilestone: ReferralMilestone | null;
  queueRank: number | null;
  queueScore: number | null;
  persona: string | null;
  candidateRole: string;
  entitlements: RewardEntitlement[];
  launchRewardWindowEndsAt: string | null;
  shareUrl: string | null;
}

export default function UserDashboardPage() {
  const router = useRouter();
  const { user, profile, role } = useUser();
  const [stats, setStats] = useState<UserDashboardStats | null>(null);
  const [savedProperties, setSavedProperties] = useState<SavedProperty[]>([]);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [sentInquiries, setSentInquiries] = useState<SentInquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "saved" | "searches" | "inquiries"
  >("saved");
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [referralSummary, setReferralSummary] =
    useState<ReferralSummary | null>(null);
  const [referralError, setReferralError] = useState<string | null>(null);
  const [isReferralLoading, setIsReferralLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [inviteResult, setInviteResult] = useState<string | null>(null);

  const avatarUrl = profile?.avatar_url;
  const getAvatarFallback = () =>
    profile?.full_name?.charAt(0) ||
    user?.email?.charAt(0)?.toUpperCase() ||
    "U";

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setAuthError(null);
      setReferralError(null);

      try {
        const supabase = createClient();

        // Get current user using client-side auth
        const {
          data: { user },
          error: authError
        } = await supabase.auth.getUser();
        const userRole =
          user?.app_metadata?.role || user?.user_metadata?.user_type || role;

        if (authError || !user) {
          console.error("Auth error:", authError);
          setAuthError("Authentication failed. Please try logging in again.");
          router.push("/login?redirect=/profile");
          return;
        }

        if (!user) {
          router.push("/login?redirect=/profile");
          return;
        }

        // Fetch user profile
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileError) {
          console.error("Profile fetch error:", profileError);
          if (userRole === "owner" || userRole === "agent") {
            router.push("/onboarding");
            return;
          }

          setAuthError("Failed to load your profile. Please try refreshing the page.");
          setIsLoading(false);
          return;
        }

        if (profile) {
          setUserProfile({
            id: profile.id,
            full_name: profile.full_name,
            phone: profile.phone,
            bio: profile.bio,
            email: user.email || "",
            user_type: role || "user",
          });
        } else {
          if (userRole === "owner" || userRole === "agent") {
            router.push("/onboarding");
            return;
          }

          setAuthError("Profile not found. Please contact support.");
        }

        setIsReferralLoading(true);
        try {
          const referralResponse = await fetch("/api/referral/me", {
            method: "GET",
            credentials: "include",
          });
          const referralPayload = await referralResponse.json();

          if (!referralResponse.ok || !referralPayload?.ok) {
            throw new Error(
              referralPayload?.error || "Could not load referral summary.",
            );
          }

          setReferralSummary(referralPayload.summary as ReferralSummary);
        } catch (referralLoadError) {
          console.error("Referral summary fetch error:", referralLoadError);
          setReferralError("Referral data is temporarily unavailable.");
        } finally {
          setIsReferralLoading(false);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
        setAuthError("An unexpected error occurred. Please try again.");
        setIsReferralLoading(false);
      }

      // Mock data for now - in real app, these would come from database
      setStats({
        savedProperties: 12,
        activeSearches: 3,
        sentInquiries: 8,
        viewedProperties: 45,
        favoriteLocations: ["London", "Manchester", "Birmingham"],
      });

      // Mock saved properties
      setSavedProperties([
        {
          id: "1",
          title: "Modern 3-Bed Apartment",
          price: 2500,
          address: "123 High Street",
          city: "London",
          property_type: "apartment",
          listing_type: "rent",
          saved_at: new Date().toISOString(),
        },
        {
          id: "2",
          title: "Victorian Terrace House",
          price: 450000,
          address: "456 Oak Avenue",
          city: "Manchester",
          property_type: "house",
          listing_type: "sale",
          saved_at: new Date(Date.now() - 86400000).toISOString(),
        },
      ]);

      // Mock recent searches
      setRecentSearches([
        {
          id: "1",
          query: "3 bedroom apartment",
          location: "London",
          property_type: "apartment",
          price_range: "£2000-£3000",
          created_at: new Date().toISOString(),
          results_count: 24,
        },
        {
          id: "2",
          query: "family house",
          location: "Manchester",
          property_type: "house",
          price_range: "£300000-£500000",
          created_at: new Date(Date.now() - 86400000).toISOString(),
          results_count: 18,
        },
      ]);

      // Mock sent inquiries
      setSentInquiries([
        {
          id: "1",
          property_title: "Luxury Penthouse",
          property_id: "prop1",
          message:
            "I'm interested in viewing this property. Could we schedule a viewing for next week?",
          status: "pending",
          sent_at: new Date().toISOString(),
        },
        {
          id: "2",
          property_title: "Garden Apartment",
          property_id: "prop2",
          message:
            "Is this property still available? I'd like to make an offer.",
          status: "responded",
          sent_at: new Date(Date.now() - 86400000).toISOString(),
          owner_response:
            "Yes, it's still available. Would you like to schedule a viewing?",
        },
      ]);

      setIsLoading(false);
    };

    fetchDashboardData();
  }, [router]);

  const copyReferralLink = async () => {
    if (!referralSummary?.shareUrl) {
      setInviteResult("Your referral link is not available yet.");
      return;
    }

    try {
      await navigator.clipboard.writeText(referralSummary.shareUrl);
      setInviteResult("Referral link copied to clipboard.");
    } catch (error) {
      console.error("Failed to copy referral link:", error);
      setInviteResult("Unable to copy link. Please copy it manually.");
    }
  };

  const handleInviteSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setInviteResult(null);

    if (!inviteEmail.trim()) {
      setInviteResult("Enter an email address to send an invite.");
      return;
    }

    if (!referralSummary?.referralCode) {
      setInviteResult("Your referral code is not ready yet. Try again shortly.");
      return;
    }

    setIsSendingInvite(true);

    try {
      const response = await fetch("/api/referral/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          inviteeEmail: inviteEmail.trim(),
          referralCode: referralSummary.referralCode,
          message: inviteMessage.trim() || undefined,
        }),
      });

      const payload = await response.json();

      if (!response.ok || !payload?.ok) {
        throw new Error(payload?.error || "Could not send referral invite.");
      }

      setInviteResult("Referral invite sent successfully.");
      setInviteEmail("");
      setInviteMessage("");
    } catch (error) {
      console.error("Referral invite error:", error);
      setInviteResult(
        error instanceof Error ? error.message : "Could not send invite.",
      );
    } finally {
      setIsSendingInvite(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded-lg" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-96 bg-muted rounded-lg" />
              <div className="h-96 bg-muted rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="py-12 text-center">
              <AlertCircle className="w-16 h-16 text-danger mx-auto mb-6" />
              <h1 className="text-2xl font-bold mb-4">Authentication Error</h1>
              <p className="text-muted-foreground mb-8">{authError}</p>
              <div className="flex gap-4 justify-center">
                <Button
                  variant="default"
                  onClick={() => router.push("/login?redirect=/profile")}
                >
                  Sign In
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => window.location.reload()}
                >
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Dashboard</h1>
            <p className="text-muted-foreground">
              Track your property searches and saved listings.
            </p>
          </div>
          <Button asChild variant="default">
            <Link href="/search">
              <Search className="w-4 h-4 mr-2" />
              Search Properties
            </Link>
          </Button>
        </div>

        {/* Profile Card */}
        {userProfile && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-auto h-auto border border-accent rounded-full p-0.5 flex items-center justify-center">
                    <Avatar className="size-15">
                      {avatarUrl ? (
                        <Avatar.Image
                          alt={profile?.full_name || "User"}
                          className="rounded-full"
                          src={avatarUrl}
                        />
                      ) : (
                        <Avatar.Fallback delayMs={600}>
                          <div className="rounded-full border w-full h-full justify-center items-center flex bg-muted-foreground/10">
                            {getAvatarFallback()}
                          </div>
                        </Avatar.Fallback>
                      )}
                    </Avatar>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">
                      {userProfile.full_name || "Anonymous User"}
                    </h3>
                    <p className="text-muted-foreground">{userProfile.email}</p>
                    {userProfile.phone && (
                      <p className="text-sm text-muted-foreground">
                        {userProfile.phone}
                      </p>
                    )}
                    {userProfile.bio && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {userProfile.bio}
                      </p>
                    )}
                  </div>
                </div>
                <Button asChild variant="secondary" size="sm">
                  <Link href={`/profile/${userProfile.id}`}>Edit Profile</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Saved Properties
                  </p>
                  <p className="text-2xl font-bold">
                    {stats?.savedProperties || 0}
                  </p>
                </div>
                <Heart className="w-8 h-8 text-danger" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Active Searches
                  </p>
                  <p className="text-2xl font-bold">
                    {stats?.activeSearches || 0}
                  </p>
                </div>
                <Search className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Sent Inquiries
                  </p>
                  <p className="text-2xl font-bold">
                    {stats?.sentInquiries || 0}
                  </p>
                </div>
                <MessageSquare className="w-8 h-8 text-warning" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Properties Viewed
                  </p>
                  <p className="text-2xl font-bold">
                    {stats?.viewedProperties || 0}
                  </p>
                </div>
                <Eye className="w-8 h-8 text-info" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5" />
              Referral And Rewards
            </CardTitle>
            <CardDescription>
              Track your referral progress and active launch rewards.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isReferralLoading ? (
              <div className="animate-pulse grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-40 bg-muted rounded-lg" />
                <div className="h-40 bg-muted rounded-lg" />
              </div>
            ) : referralError ? (
              <div className="border border-warning/30 bg-warning/10 rounded-lg p-4 text-sm text-muted-foreground">
                {referralError}
              </div>
            ) : referralSummary ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="rounded-lg border p-3">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Referral Count
                      </p>
                      <p className="text-2xl font-semibold">
                        {referralSummary.referralCount}
                      </p>
                    </div>
                    <div className="rounded-lg border p-3">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Queue Rank
                      </p>
                      <p className="text-2xl font-semibold">
                        {referralSummary.queueRank ?? "-"}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-lg border p-4 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Your referral code
                        </p>
                        <p className="text-lg font-semibold">
                          {referralSummary.referralCode ?? "Unavailable"}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={copyReferralLink}
                        disabled={!referralSummary.shareUrl}
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        Copy Link
                      </Button>
                    </div>

                    <div className="flex gap-2">
                      <Button asChild size="sm" variant="default">
                        <Link href="/refer">
                          <Share2 className="w-4 h-4 mr-1" />
                          Open Referral Hub
                        </Link>
                      </Button>
                      {referralSummary.currentMilestone && (
                        <Chip color="success" variant="soft">
                          Reached {referralSummary.currentMilestone.count}
                        </Chip>
                      )}
                    </div>
                  </div>

                  {referralSummary.nextMilestone && (
                    <div className="rounded-lg border p-4">
                      <p className="text-sm font-medium mb-1">
                        Next milestone: {referralSummary.nextMilestone.count} referrals
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {referralSummary.nextMilestone.label}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Need {Math.max(referralSummary.nextMilestone.count - referralSummary.referralCount, 0)}
                        {" "}
                        more referral(s).
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="w-4 h-4" />
                      <p className="font-medium">Invite Someone Directly</p>
                    </div>
                    <form className="space-y-3" onSubmit={handleInviteSubmit}>
                      <input
                        type="email"
                        value={inviteEmail}
                        onChange={(event) => setInviteEmail(event.target.value)}
                        className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                        placeholder="friend@example.com"
                        required
                      />
                      <textarea
                        value={inviteMessage}
                        onChange={(event) => setInviteMessage(event.target.value)}
                        className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                        placeholder="Optional personal message"
                        rows={3}
                      />
                      <Button
                        type="submit"
                        size="sm"
                        disabled={isSendingInvite}
                        className="w-full"
                      >
                        {isSendingInvite ? "Sending..." : "Send Invite"}
                      </Button>
                    </form>
                    {inviteResult && (
                      <p className="text-xs text-muted-foreground mt-3">{inviteResult}</p>
                    )}
                  </div>

                  <div className="rounded-lg border p-4">
                    <p className="font-medium mb-2">Active Entitlements</p>
                    {referralSummary.entitlements.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No active rewards yet. Keep inviting to unlock milestones.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {referralSummary.entitlements.slice(0, 4).map((entitlement) => (
                          <div
                            key={entitlement.id}
                            className="rounded-md border p-2 text-sm"
                          >
                            <p className="font-medium">
                              {entitlement.metadata?.reward_label || entitlement.reward_key}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Granted {new Date(entitlement.granted_at).toLocaleDateString()}
                              {entitlement.expires_at
                                ? ` • Expires ${new Date(entitlement.expires_at).toLocaleDateString()}`
                                : ""}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Join the waitlist and start sharing to unlock rewards.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Tab Navigation */}
          <div className="flex gap-2 border-b border-border">
            <Button
              variant={activeTab === "saved" ? "default" : "ghost"}
              onClick={() => setActiveTab("saved")}
              className={
                activeTab === "saved"
                  ? "border-b-2 border-primary rounded-b-none"
                  : ""
              }
            >
              <Heart className="w-4 h-4 mr-2" />
              Saved Properties
            </Button>
            <Button
              variant={activeTab === "searches" ? "default" : "ghost"}
              onClick={() => setActiveTab("searches")}
              className={
                activeTab === "searches"
                  ? "border-b-2 border-primary rounded-b-none"
                  : ""
              }
            >
              <Search className="w-4 h-4 mr-2" />
              Recent Searches
            </Button>
            <Button
              variant={activeTab === "inquiries" ? "default" : "ghost"}
              onClick={() => setActiveTab("inquiries")}
              className={
                activeTab === "inquiries"
                  ? "border-b-2 border-primary rounded-b-none"
                  : ""
              }
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              My Inquiries
            </Button>
          </div>

          {/* Saved Properties Tab */}
          {activeTab === "saved" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5" />
                    Saved Properties
                  </CardTitle>
                  <CardDescription>
                    Properties you've saved for later
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {savedProperties.length === 0 ? (
                    <div className="text-center py-8">
                      <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">
                        No saved properties yet
                      </p>
                      <Button asChild variant="default" size="sm">
                        <Link href="/search">Start Searching</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {savedProperties.map((property) => (
                        <div
                          key={property.id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                              <Home className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <div>
                              <h3 className="font-medium">{property.title}</h3>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                                <MapPin className="w-4 h-4" />
                                <span>
                                  {property.address}, {property.city}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 text-sm">
                                <Chip variant="secondary">
                                  {property.property_type}
                                </Chip>
                                <span className="font-medium text-primary">
                                  £{property.price.toLocaleString()}
                                  {property.listing_type === "rent" && "/month"}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button asChild variant="secondary" size="sm">
                              <Link href={`/property/${property.id}`}>
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Link>
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Heart className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      <div className="pt-4">
                        <Button asChild variant="secondary" className="w-full">
                          <Link href="/profile/saved">
                            View All Saved Properties
                          </Link>
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Recent Searches Tab */}
          {activeTab === "searches" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="w-5 h-5" />
                    Recent Searches
                  </CardTitle>
                  <CardDescription>
                    Your recent property searches
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {recentSearches.length === 0 ? (
                    <div className="text-center py-8">
                      <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">
                        No recent searches
                      </p>
                      <Button asChild variant="default" size="sm">
                        <Link href="/search">Start Searching</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentSearches.map((search) => (
                        <div key={search.id} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium">
                              "{search.query}" in {search.location}
                            </h3>
                            <Chip variant="secondary">
                              {search.results_count} results
                            </Chip>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                            <span>{search.property_type}</span>
                            <span>{search.price_range}</span>
                            <span>
                              {new Date(search.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <Button variant="secondary" size="sm">
                            <Search className="w-4 h-4 mr-1" />
                            Search Again
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Inquiries Tab */}
          {activeTab === "inquiries" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    My Inquiries
                  </CardTitle>
                  <CardDescription>
                    Messages you've sent to property owners
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {sentInquiries.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        No inquiries sent yet
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Inquiries will appear here when you contact property
                        owners
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {sentInquiries.map((inquiry) => (
                        <div key={inquiry.id} className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="font-medium mb-1">
                                {inquiry.property_title}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                Sent{" "}
                                {new Date(inquiry.sent_at).toLocaleDateString()}
                              </p>
                            </div>
                            <Chip
                              color={
                                inquiry.status === "pending"
                                  ? "warning"
                                  : "success"
                              }
                              variant="secondary"
                            >
                              {inquiry.status}
                            </Chip>
                          </div>
                          <div className="bg-muted p-3 rounded-lg mb-3">
                            <p className="text-sm italic">
                              "{inquiry.message}"
                            </p>
                          </div>
                          {inquiry.owner_response && (
                            <div className="bg-primary-50 border border-primary-200 p-3 rounded-lg mb-3">
                              <p className="text-sm font-medium text-primary-900 mb-1">
                                Owner Response:
                              </p>
                              <p className="text-sm text-primary-800">
                                "{inquiry.owner_response}"
                              </p>
                            </div>
                          )}
                          <div className="flex gap-2">
                            <Button asChild variant="secondary" size="sm">
                              <Link href={`/property/${inquiry.property_id}`}>
                                View Property
                              </Link>
                            </Button>
                            {inquiry.status === "responded" && (
                              <Button variant="default" size="sm">
                                Reply
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Favorite Locations */}
        {stats?.favoriteLocations && stats.favoriteLocations.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Favorite Locations
              </CardTitle>
              <CardDescription>
                Locations you search most frequently
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {stats.favoriteLocations.map((location, index) => (
                  <Button key={index} asChild variant="secondary" size="sm">
                    <Link
                      href={`/search?q=&location=${encodeURIComponent(location)}`}
                    >
                      <MapPin className="w-4 h-4 mr-1" />
                      {location}
                    </Link>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
