"use client";

import { useState, useEffect } from "react";
import { Checkbox } from "@heroui/react";
import { Button, Card, CardContent } from "../ui";

import Link from "next/link";
import {
  Cookie,
  Settings,
  X,
  ThumbsUpIcon,
  Shield,
  BarChart3,
  Target,
  CheckCircle,
  Info,
} from "lucide-react";

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  functional: boolean;
  marketing: boolean;
  acceptedAt?: string;
  version?: string;
}

const COOKIE_CONSENT_KEY = "realest_cookie_consent";
const COOKIE_VERSION = "1.0";

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true, // Always true, cannot be disabled
    analytics: false,
    functional: false,
    marketing: false,
  });

  // Check if user has already consented
  useEffect(() => {
    const storedConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (storedConsent) {
      try {
        const parsedConsent = JSON.parse(storedConsent);
        if (parsedConsent.version === COOKIE_VERSION) {
          // User has valid consent, don't show banner
          setIsVisible(false);
          return;
        }
      } catch (error) {
        console.warn("Invalid cookie consent data, showing banner");
      }
    }
    // Show banner if no valid consent or version mismatch
    setIsVisible(true);
  }, []);

  const savePreferences = (prefs: CookiePreferences) => {
    const consentData = {
      ...prefs,
      acceptedAt: new Date().toISOString(),
      version: COOKIE_VERSION,
    };
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consentData));
    setIsVisible(false);
    setShowPreferences(false);

    // Here you would typically trigger loading/unloading of tracking scripts
    // based on the preferences (e.g., Google Analytics, Facebook Pixel, etc.)
    console.log("Cookie preferences saved:", consentData);
  };

  const handleAcceptAll = () => {
    const allAccepted = {
      essential: true,
      analytics: true,
      functional: true,
      marketing: true,
    };
    setPreferences(allAccepted);
    savePreferences(allAccepted);
  };

  const handleRejectAll = () => {
    const allRejected = {
      essential: true, // Essential cookies cannot be rejected
      analytics: false,
      functional: false,
      marketing: false,
    };
    setPreferences(allRejected);
    savePreferences(allRejected);
  };

  const handleSavePreferences = () => {
    savePreferences(preferences);
  };

  const updatePreference = (type: keyof CookiePreferences, value: boolean) => {
    if (type === "essential") return; // Essential cookies cannot be disabled
    setPreferences((prev) => ({ ...prev, [type]: value }));
  };

  if (!isVisible) return null;

  const cookieTypes = [
    {
      key: "essential" as const,
      title: "Essential Cookies",
      description:
        "Required for the website to function properly. These cannot be disabled.",
      icon: Shield,
      required: true,
    },
    {
      key: "analytics" as const,
      title: "Analytics Cookies",
      description:
        "Help us understand how visitors interact with our website to improve performance.",
      icon: BarChart3,
      required: false,
    },
    {
      key: "functional" as const,
      title: "Functional Cookies",
      description:
        "Enable enhanced functionality and personalization features.",
      icon: Settings,
      required: false,
    },
    {
      key: "marketing" as const,
      title: "Marketing Cookies",
      description:
        "Used to deliver relevant advertisements and track campaign effectiveness.",
      icon: Target,
      required: false,
    },
  ];

  return (
    <>
      {/* Cookie Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
        <div className="max-w-6xl mx-auto">
          <Card className="bg-background/80 backdrop-blur-lg border border-border/50 rounded-2xl p-6">
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                  <Cookie className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 space-y-3">
                  <h3 className="text-lg font-semibold">We use cookies</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    We use cookies to enhance your experience, analyze site
                    traffic, and personalize content. By continuing to use our
                    site, you agree to our use of cookies.
                    <Link
                      href="/cookies"
                      className="text-primary hover:underline ml-1"
                    >
                      Learn more about our cookie policy
                    </Link>
                  </p>
                </div>
                <button
                  onClick={() => setIsVisible(false)}
                  className="w-8 h-8 rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center shrink-0 transition-colors"
                  aria-label="Close cookie banner"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  onClick={handleAcceptAll}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 rounded-xl font-medium"
                >
                  <ThumbsUpIcon className="w-4 h-4" />
                  Accept All Cookies
                </Button>
                <Button
                  onClick={() => setShowPreferences(true)}
                  variant="secondary"
                  className="px-6 rounded-xl font-medium gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Manage Preferences
                </Button>
                <Button
                  onClick={handleRejectAll}
                  variant="ghost"
                  className="px-6 rounded-xl font-medium text-muted-foreground hover:text-foreground"
                >
                  Reject All
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Cookie Preferences Modal */}
      {showPreferences && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <Card className="bg-background border border-border/50 rounded-2xl shadow-2xl">
              <CardContent className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Settings className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Cookie Preferences</h2>
                      <p className="text-sm text-muted-foreground">
                        Manage your cookie settings
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowPreferences(false)}
                    className="w-8 h-8 rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
                    aria-label="Close preferences"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>

                {/* Cookie Types */}
                <div className="space-y-4">
                  {cookieTypes.map((cookieType) => {
                    const Icon = cookieType.icon;
                    const isChecked = preferences[cookieType.key];

                    return (
                      <Card
                        key={cookieType.key}
                        className="bg-muted/30 border border-border/30 rounded-xl p-4"
                      >
                        <CardContent className="space-y-3">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                              <Icon className="w-4 h-4 text-primary" />
                            </div>
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-sm">
                                  {cookieType.title}
                                </h3>
                                {cookieType.required && (
                                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                    Required
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                {cookieType.description}
                              </p>
                            </div>
                            <Checkbox
                              isSelected={isChecked}
                              isDisabled={cookieType.required}
                              onChange={(isSelected) =>
                                updatePreference(cookieType.key, isSelected)
                              }
                              className="shrink-0"
                            />
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Info Section */}
                <Card className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                  <CardContent>
                    <div className="flex gap-3">
                      <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                          Essential cookies cannot be disabled
                        </p>
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                          These cookies are necessary for the website to
                          function properly and provide basic services.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Links */}
                <div className="flex flex-col sm:flex-row gap-3 text-sm">
                  <Link
                    href="/legal/privacy"
                    className="text-primary hover:underline"
                  >
                    View Privacy Policy
                  </Link>
                  <Link
                    href="/legal/cookies"
                    className="text-primary hover:underline"
                  >
                    View Cookie Policy
                  </Link>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border/50">
                  <Button
                    onClick={handleAcceptAll}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 rounded-xl font-medium"
                  >
                    Accept All
                  </Button>
                  <Button
                    onClick={handleSavePreferences}
                    variant="secondary"
                    className="px-6 rounded-xl font-medium gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Save Preferences
                  </Button>
                  <Button
                    onClick={handleRejectAll}
                    variant="ghost"
                    className="px-6 rounded-xl font-medium text-muted-foreground hover:text-foreground"
                  >
                    Reject All
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </>
  );
}
