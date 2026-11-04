/**
 * Waitlist Modal Component
 *
 * A professional multi-stage modal for waitlist subscription featuring:
 * - 3-stage progressive disclosure (Personal Info → Preferences → Success)
 * - Silent email validation with subtle error handling
 * - Interest selection with brand-styled cards
 * - Location search with Nigeria-specific data
 * - Professional responsive design with RealEST brand theming
 * - Smooth animations and enhanced UX
 *
 * Integrates with /api/waitlist for subscription functionality.
 */
"use client";

import React, { useState } from 'react';
import { useEmailValidation, formatWaitlistMessage } from '@/lib/hooks/useEmailValidation';
import { useLocationSearch, formatLocationName } from '@/lib/hooks/useLocationSearch';
import { WAITLIST_INTENT_OPTIONS, type WaitlistPersona } from '@/lib/referral-system';
import {
  Mail,
  CheckCircle,
  X,
  AlertCircle,
  Info,
  ChevronRight,
  ChevronLeft,
  Home,
  BellRing,
  Building2,
  Search,
  MapPin,
  TrendingUp,
  Sparkles,
  Shield,
  MailCheck,
  Rocket,
  Gift,
  Users
} from "lucide-react";
import { HeroLogo } from '@/components/ui/RealEstLogo';
import { Button } from '@/components/ui/button'

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (data: {
    firstName: string;
    lastName?: string;
    position?: number;
    totalCount?: number;
    referralCode?: string | null;
  }) => void;
  referralCode?: string;
}

interface SubmittedData {
  firstName: string;
  lastName?: string;
  position?: number;
  totalCount?: number;
  persona?: WaitlistPersona;
  candidateRole?: string | null;
  referralCode?: string | null;
}

const WaitlistModal: React.FC<WaitlistModalProps> = ({ isOpen, onClose, onSuccess, referralCode }) => {
  // Form states
  const [currentStage, setCurrentStage] = useState(1);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedIntent, setSelectedIntent] = useState("");
  const [location, setLocation] = useState("");
  const [locationInputFocused, setLocationInputFocused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<SubmittedData | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Real-time email validation (silent)
  const emailValidation = useEmailValidation(email, {
    debounceMs: 500,
    minLength: 3,
    validateOnMount: true
  });

  // Location search
  const locationSearch = useLocationSearch({
    debounceMs: 300,
    maxResults: 8,
    includeStates: true,
    includePopularCities: true
  });

  // Form stages configuration
  const stages = [
    { id: 1, title: 'Personal Info', icon: Mail },
    { id: 2, title: 'Preferences', icon: Home },
    { id: 3, title: 'Success', icon: CheckCircle }
  ];

  const selectedIntentMeta = WAITLIST_INTENT_OPTIONS.find((item) => item.id === selectedIntent);
  const selectedPersona: WaitlistPersona | undefined = selectedIntentMeta?.persona;

  const intentIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    buy_property: Home,
    rent_property: MapPin,
    list_my_property: Building2,
    work_as_agent: Shield,
    invest_in_real_estate: TrendingUp,
    develop_or_manage_projects: Rocket,
    mortgage_or_finance_partner: MailCheck,
  };

  // Update form data and clear errors
  const updateFormData = (field: string, value: string | string[]) => {
    switch (field) {
      case 'firstName':
        setFirstName(value as string);
        break;
      case 'lastName':
        setLastName(value as string);
        break;
      case 'email':
        setEmail(value as string);
        break;
      case 'phone':
        setPhone(value as string);
        break;
      case 'selectedIntent':
        setSelectedIntent(value as string);
        break;
      case 'location':
        setLocation(value as string);
        break;
    }

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Validate current stage
  const validateStage = (stage: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (stage === 1) {
      if (!firstName.trim()) newErrors.firstName = 'First name is required';
      if (!email.trim()) newErrors.email = 'Email is required';
      else if (!emailValidation.isValid) newErrors.email = 'Invalid email address';
      else if (!emailValidation.isAvailable) newErrors.email = 'Email already in waitlist';
    }

    if (stage === 2) {
      if (!selectedIntentMeta) {
        newErrors.selectedIntent = 'Please select one option to continue';
      }
      if (!location.trim()) {
        newErrors.location = 'Location is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Navigation functions
  const handleNext = () => {
    if (validateStage(currentStage)) {
      if (currentStage < 2) {
        setCurrentStage(prev => prev + 1);
      }
    }
  };

  const handleBack = () => {
    if (currentStage > 1) {
      setCurrentStage(prev => prev - 1);
    }
  };

  const chooseIntent = (intentId: string) => {
    updateFormData('selectedIntent', intentId);
  };

  // Get progress percentage
  const getProgressPercentage = () => {
    if (currentStage === 3) return 100;
    return (currentStage / 2) * 100;
  };

  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isSubmitting) {
      e.preventDefault();
      if (currentStage === 1 && emailValidation.isValid && emailValidation.isAvailable && firstName.trim()) {
        handleNext();
      } else if (currentStage === 2 && !!selectedIntentMeta) {
        handleEmailSubmit();
      }
    }
  };

  // Handle final submission
  const handleEmailSubmit = async () => {
    if (!validateStage(2)) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          firstName: firstName.trim(),
          lastName: lastName.trim() || undefined,
          phone: phone.trim() || undefined,
          persona: selectedPersona,
          interests: selectedIntentMeta ? [selectedIntentMeta.id] : undefined,
          locationPreference: location || undefined,
          ref: referralCode ?? undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ submit: data.error || 'Something went wrong. Please try again.' });
        return;
      }

      const resultData = {
        firstName: data.firstName,
        lastName: data.lastName,
        position: data.position,
        totalCount: data.totalCount,
        persona: data.persona,
        candidateRole: data.candidateRole,
        referralCode: data.referralCode,
      };

      setSubmittedData(resultData);

      if (onSuccess) {
        onSuccess(resultData);
      }

      setCurrentStage(3);
    } catch (error) {
      console.error('Waitlist subscription error:', error);
      setErrors({ submit: 'Network error. Please check your connection and try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle modal close
  const handleModalClose = () => {
    onClose();
    setTimeout(() => {
      setCurrentStage(1);
      setSubmittedData(null);
      setErrors({});
      setEmail("");
      setFirstName("");
      setLastName("");
      setPhone("");
      setSelectedIntent("");
      setLocation("");
      locationSearch.clearQuery();
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <div className="hide-scrollbar fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/20 backdrop-blur-xs animate-in fade-in duration-200"
        onClick={handleModalClose}
      >
        {/* Animated Background */}
        <div className="absolute inset-0 bg-linear-to-br from-primary/20 via-primary/10 to-secondary/20" />
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/50 to-transparent" />

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute top-40 right-20 w-32 h-32 bg-secondary/10 rounded-full blur-xl animate-pulse delay-1000" />
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-primary/5 rounded-full blur-xl animate-pulse delay-500" />
      </div>

      {/* Modal */}
      <div className="hide-scrollbar relative w-full max-w-2xl max-h-[95vh] backdrop-blur-3xl border border-border/50 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300">
        {/* Close Button */}
        <button
          onClick={handleModalClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-surface/80 hover:bg-surface border border-border/30 flex items-center justify-center transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>

        {/* Progress Bar */}
        {currentStage < 3 && (
          <div className="h-0.5 bg-surface">
            <div
              className="h-full bg-linear-to-r from-primary/20 to-accent/80 transition-all duration-500 ease-out"
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>
        )}

        {/* Stage Indicators */}
        {currentStage < 3 && (
          <div className="flex items-center justify-center gap-3 px-6 py-5 border-b border-border/30 bg-surface/30 backdrop-blur-sm">
            {stages.slice(0, 2).map((stage, index) => {
              const Icon = stage.icon;
              const isActive = currentStage === stage.id;
              const isCompleted = currentStage > stage.id;

              return (
                <React.Fragment key={stage.id}>
                  <div className="flex items-center gap-2.5">
                    <div className={`
                      w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300
                      ${isActive ? 'bg-linear-to-tl from-primary/20 to-accent/20 shadow-lg shadow-accent/30 scale-105' : ''}
                      ${isCompleted ? 'bg-success' : ''}
                      ${!isActive && !isCompleted ? 'bg-muted border border-border/50' : ''}
                    `}>
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5 text-white" />
                      ) : (
                        <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-accent/80' : 'text-muted-foreground'}`} />
                      )}
                    </div>
                    <span className={`
                      text-sm font-medium transition-colors duration-300 hidden sm:inline
                      ${isActive ? 'text-foreground' : 'text-muted-foreground'}
                    `}>
                      {stage.title}
                    </span>
                  </div>
                  {index < 1 && (
                    <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        )}

        {/* Modal Content */}
        <div className="overflow-y-auto max-h-[calc(95vh-180px)] p-6 sm:p-8">
          {/* Stage 1: Personal Information */}
          {currentStage === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-5 duration-400">
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-linear-to-tr from-accent/20 to-primary/20 rounded-md mb-1">
                  <Mail className="w-7 h-7 text-accent/80" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold bg-linear-to-l from-primary to-accent bg-clip-text text-transparent">
                  Join our Waitlist
                </h2>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Be the first to access Nigeria's most trusted property marketplace
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-foreground">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => updateFormData('firstName', e.target.value)}
                      placeholder="John"
                      className={`w-full px-4 py-2.5 bg-surface border rounded-lg transition-all duration-200 focus:ring-2 focus:outline-none ${
                        errors.firstName
                          ? 'border-red-500 focus:ring-red-200/50'
                          : 'border-border/50 focus:border-primary/50 focus:ring-primary/20'
                      }`}
                      onKeyDown={handleKeyDown}
                      autoFocus
                    />
                    {errors.firstName && (
                      <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.firstName}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-foreground">
                      Last Name <span className="text-muted-foreground text-xs font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => updateFormData('lastName', e.target.value)}
                      placeholder="Doe"
                      className="w-full px-4 py-2.5 bg-surface border border-border/50 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary/50 focus:outline-none transition-all duration-200"
                      onKeyDown={handleKeyDown}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-foreground">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => updateFormData('email', e.target.value)}
                    placeholder="john@example.com"
                    className={`w-full px-4 py-2.5 bg-surface border rounded-lg transition-all duration-200 focus:ring-2 focus:outline-none ${
                      errors.email
                        ? 'border-red-500 focus:ring-red-200/50'
                        : 'border-border/50 focus:border-primary/50 focus:ring-primary/20'
                    }`}
                    onKeyDown={handleKeyDown}
                  />

                  {/* Only show error when email is taken */}
                  {errors.email && (
                    <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.email}
                    </p>
                  )}

                  {/* Show detailed message if email is already registered */}
                  {email && emailValidation.isValid && !emailValidation.isAvailable && emailValidation.userInfo && !errors.email && (
                    <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg mt-2">
                      <div className="flex items-start gap-2">
                        <Info className="w-4 h-4 text-orange-600 dark:text-orange-400 mt-0.5 shrink-0" />
                        <div className="text-xs">
                          <div className="font-medium text-orange-800 dark:text-orange-200">
                            {formatWaitlistMessage(emailValidation.userInfo).title}
                          </div>
                          <div className="text-orange-700 dark:text-orange-300 mt-0.5">
                            {formatWaitlistMessage(emailValidation.userInfo).description}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-foreground">
                    Phone Number <span className="text-muted-foreground text-xs font-normal">(Optional)</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => updateFormData('phone', e.target.value)}
                    placeholder="+234 800 000 0000"
                    className="w-full px-4 py-2.5 bg-surface border border-border/50 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary/50 focus:outline-none transition-all duration-200"
                    onKeyDown={handleKeyDown}
                  />
                </div>
              </div>
              {errors.submit && (
                <p className="text-xs text-red-600 flex items-center gap-1 mt-2">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.submit}
                </p>
              )}
            </div>
          )}

          {/* Stage 2: Preferences */}
          {currentStage === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-5 duration-400">
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-linear-to-br from-accent/20 to-primary/20 rounded-md mb-1">
                  <Home className="w-7 h-7 text-accent/80" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold bg-linear-to-r from-accent to-primary bg-clip-text text-transparent mb-1">
                  What brings you to RealEST?
                </h2>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Choose one option so we can tailor your experience
                </p>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-foreground">
                  I'm interested in: <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {WAITLIST_INTENT_OPTIONS.map((interest) => {
                    const Icon = intentIcons[interest.id] ?? Sparkles;
                    const isSelected = selectedIntent === interest.id;

                    return (
                      <button
                        key={interest.id}
                        type="button"
                        onClick={() => chooseIntent(interest.id)}
                        className={`
                          p-4 rounded-xl hover:border-primary/30 hover:bg-primary/15 transition-all duration-200 text-left
                          ${isSelected
                            ? 'border-accent/30 border bg-linear-to-br from-primary/15 to-accent/15 shadow-md scale-[1.02]'
                            : 'border-accent/10 border bg-surface'
                          }
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`
                            w-10 h-10 rounded-lg flex items-center justify-center shrink-0
                            ${isSelected
                              ? 'bg-linear-to-br from-primary/30 to-accent/30'
                              : 'bg-muted border border-border/30'
                            }
                          `}>
                            <Icon className={`w-5 h-5 ${isSelected ? 'text-accent' : 'text-muted-foreground'}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-0.5">
                              <h3 className="text-sm font-semibold text-foreground">
                                {interest.label}
                              </h3>
                              {isSelected && (
                                <CheckCircle className="w-4.5 h-4.5 text-accent shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {interest.description}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
                {errors.selectedIntent && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.selectedIntent}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">
                  Where are you located? <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={locationSearch.query}
                    onChange={(e) => {
                      locationSearch.setQuery(e.target.value);
                      updateFormData('location', e.target.value);
                    }}
                    onFocus={() => setLocationInputFocused(true)}
                    onBlur={() => setTimeout(() => setLocationInputFocused(false), 120)}
                    placeholder="e.g., Lagos, Abuja, Port Harcourt"
                    className={`w-full px-4 py-2.5 pr-10 bg-surface border rounded-lg focus:ring-2 focus:ring-accent/20 focus:border-accent/50 focus:outline-none transition-all duration-200 ${errors.location ? 'border-red-500 focus:ring-red-200/50' : 'border-border/50'}`}
                  />
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />

                  {/* Location Search Results - show results or default suggestions when focused */}
                  {locationInputFocused && (locationSearch.results.length > 0 || locationSearch.defaultSuggestions.length > 0) && (
                    <div className="absolute top-full left-0 right-0 bg-surface border border-border/50 rounded-lg shadow-lg z-10 mt-1 max-h-48 overflow-y-auto">
                      {locationSearch.results.length > 0 ? (
                        locationSearch.results.map((location) => (
                          <button
                            key={location.id}
                            onMouseDown={() => {
                              locationSearch.selectLocation(location);
                              updateFormData('location', location.name);
                              setTimeout(() => setLocationInputFocused(false), 0);
                            }}
                            className="w-full text-left px-4 py-2.5 hover:bg-muted transition-colors duration-150 flex items-center gap-2.5"
                          >
                            {location.type === 'city' ? (
                              <Building2 className="w-4 h-4 text-muted-foreground" />
                            ) : (
                              <MapPin className="w-4 h-4 text-muted-foreground" />
                            )}
                            <span className="text-sm text-foreground">{formatLocationName(location)}</span>
                          </button>
                        ))
                      ) : (
                        <>
                          <div className="px-4 py-2 text-xs font-medium text-muted-foreground border-b border-border/30">
                            Popular locations
                          </div>
                          {locationSearch.defaultSuggestions.map((location) => (
                            <button
                              key={location.id}
                              onMouseDown={() => {
                                locationSearch.selectLocation(location);
                                updateFormData('location', location.name);
                                setTimeout(() => setLocationInputFocused(false), 0);
                              }}
                              className="w-full text-left px-4 py-2.5 hover:bg-muted transition-colors duration-150 flex items-center gap-2.5"
                            >
                              <Building2 className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm text-foreground">{formatLocationName(location)}</span>
                            </button>
                          ))}
                        </>
                      )}
                    </div>
                  )}
                  {errors.location && (
                    <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.location}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Stage 3: Success */}
          {currentStage === 3 && (
            <div className="space-y-6 text-center animate-in fade-in zoom-in-95 duration-400">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-2xl mb-2">
                <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">
                  {submittedData?.firstName && submittedData?.lastName
                    ? `Welcome ${submittedData.firstName} ${submittedData.lastName}!`
                    : submittedData?.firstName
                    ? `Welcome ${submittedData.firstName}!`
                    : "You're On The List!"}
                </h2>
                <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto">
                  Thank you for joining our waitlist. We'll notify you as soon as we launch with exclusive early access.
                </p>
              </div>

              {submittedData?.position && (
                <div className="max-w-sm mx-auto p-5 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <span className="text-2xl font-bold text-green-800 dark:text-green-200">
                      #{submittedData.position}
                    </span>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    out of {submittedData.totalCount?.toLocaleString()} people
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1.5">
                    The earlier you joined, the sooner you'll get access.
                  </p>
                </div>
              )}

              {/* Refer CTA after joining */}
              <div className="mt-8">
                <div className="inline-flex flex-col items-center gap-2 w-full">
                  <span className="text-sm text-muted-foreground">Want to help us grow?</span>
                  <a
                    href={submittedData?.referralCode ? `/refer?ref=${encodeURIComponent(submittedData.referralCode)}` : '/refer'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-accent/90 hover:bg-accent text-primary font-semibold shadow transition-all duration-200"
                  >
                    <Gift className="w-4 h-4" />
                    Refer a friend & get rewards
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-border/30 px-6 sm:px-8 py-4 bg-surface/30 backdrop-blur-sm">
          {/* Step Indicator (only for stage 2+) */}
          {currentStage === 2 && (
            <div className="flex items-center justify-center sm:justify-center mb-1">
              <span className="text-sm text-muted-foreground">Step {currentStage} of 2</span>
            </div>
          )}
          {currentStage < 3 ? (
            <div className="flex flex-col sm:flex-row w-full gap-3">
              {/* Button Container */}
              <div className={`flex ${currentStage === 1 ? 'w-full' : 'w-full sm:w-auto sm:flex-1 justify-between'} gap-3`}>
                {/* Back Button (only for stage 2) */}
                {currentStage > 1 && (
                  <Button 
                    onClick={handleBack} 
                    variant="outline" 
                    size="lg" 
                    className="flex items-center justify-center gap-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <ChevronLeft className="w-4.5 h-4.5" />
                    Back
                  </Button>
                )}
                {/* Main Action Button */}
                {currentStage === 1 ? (
                  <Button 
                    onClick={handleNext} 
                    disabled={!firstName.trim() || !email.trim() || !emailValidation.isValid || !emailValidation.isAvailable}
                    variant="neon" 
                    size="lg" 
                    className="flex w-full items-center justify-center gap-2 btn-glow-accent transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:bg-muted disabled:cursor-not-allowed"
                  >
                    Continue
                    <ChevronRight className="w-4.5 h-4.5" />
                  </Button>
                ) : (
                  <Button 
                    onClick={handleEmailSubmit} 
                    disabled={isSubmitting || !selectedIntentMeta}
                    variant="neon" 
                    size="lg" 
                    className="flex-1 w-full items-center justify-center gap-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:bg-muted"
                  >
                  {isSubmitting ? (
                    <>
                      <div className="w-4.5 h-4.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Joining...
                    </>
                  ) : (
                    <>
                      Join Waitlist
                      <CheckCircle className="w-4.5 h-4.5" />
                    </>
                  )}
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <Button variant="neon" size="default" onClick={handleModalClose} className="w-full bg-green-600 hover:bg-green-700 text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500">Perfect, Thanks!</Button>
          )}

          {/* Error Display */}
          {errors.submit && (
            <div className="mt-3 text-xs text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errors.submit}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WaitlistModal;
