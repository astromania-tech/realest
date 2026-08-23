"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { RealEstButton } from "@/components/heroui/RealEstButton";

interface ReviewFormProps {
  propertyId?: string;
  agentId?: string;
  reviewType: "property" | "agent" | "landlord";
  onSubmit?: (data: any) => void;
  initialData?: any;
  className?: string;
}

export function ReviewForm({
  propertyId,
  agentId,
  reviewType,
  onSubmit,
  initialData,
  className,
}: ReviewFormProps) {
  const [formData, setFormData] = useState({
    // Overall Rating
    overallRating: 0,

    // Specific Ratings (property)
    locationRating: 0,
    amenitiesRating: 0,
    valueRating: 0,

    // Specific Ratings (agent/landlord)
    communicationRating: 0,
    professionalismRating: 0,
    responsivenessRating: 0,

    // Review Content
    title: "",
    reviewText: "",

    // Experience Details
    moveInDate: "",
    rentalDuration: "",
    wouldRecommend: null,

    // Pros and Cons
    pros: [],
    cons: [],

    // Contact Information
    reviewerName: "",
    reviewerEmail: "",
    isAnonymous: false,

    // Media
    photos: [],

    ...initialData,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [currentPro, setCurrentPro] = useState("");
  const [currentCon, setCurrentCon] = useState("");

  const ratingLabels = {
    1: "Poor",
    2: "Fair",
    3: "Good",
    4: "Very Good",
    5: "Excellent",
  };

  const propertyAspects = [
    { key: "locationRating", label: "Location & Accessibility" },
    { key: "amenitiesRating", label: "Amenities & Features" },
    { key: "valueRating", label: "Value for Money" },
  ];

  const serviceAspects = [
    { key: "communicationRating", label: "Communication" },
    { key: "professionalismRating", label: "Professionalism" },
    { key: "responsivenessRating", label: "Responsiveness" },
  ];

  const handleRatingChange = (field: string, rating: number) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: rating,
    }));
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addPro = () => {
    if (currentPro.trim()) {
      setFormData((prev: any) => ({
        ...prev,
        pros: [...prev.pros, currentPro.trim()],
      }));
      setCurrentPro("");
    }
  };

  const addCon = () => {
    if (currentCon.trim()) {
      setFormData((prev: any) => ({
        ...prev,
        cons: [...prev.cons, currentCon.trim()],
      }));
      setCurrentCon("");
    }
  };

  const removePro = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      pros: prev.pros.filter((_: any, i: number) => i !== index),
    }));
  };

  const removeCon = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      cons: prev.cons.filter((_: any, i: number) => i !== index),
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

  const StarRating = ({
    rating,
    onRatingChange,
    size = "md",
  }: {
    rating: number;
    onRatingChange: (rating: number) => void;
    size?: "sm" | "md" | "lg";
  }) => {
    const starSize =
      size === "sm" ? "w-4 h-4" : size === "lg" ? "w-8 h-8" : "w-6 h-6";

    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
            className={cn(
              starSize,
              "transition-colors",
              star <= rating
                ? "text-yellow-400 fill-current"
                : "text-gray-300 hover:text-yellow-400",
            )}
          >
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
        {rating > 0 && (
          <span className="ml-2 text-sm text-muted-foreground">
            {ratingLabels[rating as keyof typeof ratingLabels]}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className={cn("max-w-2xl mx-auto", className)}>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-heading font-bold mb-2">Write a Review</h2>
        <p className="text-muted-foreground">
          Share your experience with{" "}
          {reviewType === "property" ? "this property" : "this service"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-card border border-border rounded-xl p-6">
          {/* Overall Rating */}
          <div className="text-center mb-6">
            <h3 className="text-xl font-heading font-semibold mb-4">
              Overall Rating
            </h3>
            <StarRating
              rating={formData.overallRating}
              onRatingChange={(rating) =>
                handleRatingChange("overallRating", rating)
              }
              size="lg"
            />
          </div>

          {/* Specific Ratings */}
          <div className="space-y-4">
            <h4 className="font-heading font-semibold">
              Rate Specific Aspects
            </h4>
            {(reviewType === "property" ? propertyAspects : serviceAspects).map(
              ({ key, label }) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{label}</span>
                  <StarRating
                    rating={formData[key as keyof typeof formData] as number}
                    onRatingChange={(rating) => handleRatingChange(key, rating)}
                  />
                </div>
              ),
            )}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Review Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Summarize your experience"
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Your Review
            </label>
            <textarea
              value={formData.reviewText}
              onChange={(e) => handleInputChange("reviewText", e.target.value)}
              rows={5}
              placeholder="Share details about your experience..."
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Pros and Cons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                What you liked
              </label>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={currentPro}
                  onChange={(e) => setCurrentPro(e.target.value)}
                  placeholder="Add a positive point"
                  className="flex-1 px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addPro())
                  }
                />
                <RealEstButton type="button" onClick={addPro} size="sm">
                  Add
                </RealEstButton>
              </div>
              <div className="space-y-2">
                {formData.pros.map((pro: string, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2"
                  >
                    <span className="text-sm text-green-800">{pro}</span>
                    <button
                      type="button"
                      onClick={() => removePro(index)}
                      className="text-green-600 hover:text-green-800"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Areas for improvement
              </label>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={currentCon}
                  onChange={(e) => setCurrentCon(e.target.value)}
                  placeholder="Add an area for improvement"
                  className="flex-1 px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addCon())
                  }
                />
                <RealEstButton type="button" onClick={addCon} size="sm">
                  Add
                </RealEstButton>
              </div>
              <div className="space-y-2">
                {formData.cons.map((con: string, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-red-50 border border-red-200 rounded-lg px-3 py-2"
                  >
                    <span className="text-sm text-red-800">{con}</span>
                    <button
                      type="button"
                      onClick={() => removeCon(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recommendation */}
          <div>
            <label className="block text-sm font-medium mb-3">
              Would you recommend this {reviewType}?
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="recommendation"
                  value="yes"
                  checked={formData.wouldRecommend === true}
                  onChange={() => handleInputChange("wouldRecommend", true)}
                  className="text-primary focus:ring-primary"
                />
                <span className="text-sm">Yes, I would recommend</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="recommendation"
                  value="no"
                  checked={formData.wouldRecommend === false}
                  onChange={() => handleInputChange("wouldRecommend", false)}
                  className="text-primary focus:ring-primary"
                />
                <span className="text-sm">No, I would not recommend</span>
              </label>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h4 className="font-heading font-semibold">Contact Information</h4>

          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isAnonymous}
              onChange={(e) =>
                handleInputChange("isAnonymous", e.target.checked)
              }
              className="rounded border-border focus:ring-2 focus:ring-primary"
            />
            <span className="text-sm">Post this review anonymously</span>
          </label>

          {!formData.isAnonymous && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  value={formData.reviewerName}
                  onChange={(e) =>
                    handleInputChange("reviewerName", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Your Email
                </label>
                <input
                  type="email"
                  value={formData.reviewerEmail}
                  onChange={(e) =>
                    handleInputChange("reviewerEmail", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-4">
          <RealEstButton
            type="button"
            variant="tertiary"
            onClick={() => window.history.back()}
          >
            Cancel
          </RealEstButton>
          <RealEstButton
            type="submit"
            isLoading={isLoading}
            disabled={
              isLoading ||
              formData.overallRating === 0 ||
              !formData.reviewText.trim()
            }
          >
            Submit Review
          </RealEstButton>
        </div>
      </form>
    </div>
  );
}
