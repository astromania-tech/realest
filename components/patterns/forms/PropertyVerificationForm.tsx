'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { RealEstButton } from '@/components/heroui/RealEstButton'
import { StatusBadge } from '@/components/ui/status-badge'

interface PropertyVerificationFormProps {
  propertyId: string
  onSubmit?: (data: any) => void
  onReject?: (reason: string) => void
  initialData?: any
  className?: string
}

export function PropertyVerificationForm({
  propertyId,
  onSubmit,
  onReject,
  initialData,
  className
}: PropertyVerificationFormProps) {
  const [formData, setFormData] = useState({
    // Verification Status
    overallStatus: 'pending', // approved, rejected, pending

    // Document Verification
    titleDeed: {
      status: 'pending',
      notes: '',
      confidence: 0
    },
    survey: {
      status: 'pending',
      notes: '',
      confidence: 0
    },
    cOfO: {
      status: 'pending',
      notes: '',
      confidence: 0
    },

    // Physical Verification
    locationAccuracy: {
      status: 'pending',
      notes: '',
      gpsCoordinates: { lat: '', lng: '' },
      accuracy: 0
    },
    propertyCondition: {
      status: 'pending',
      notes: '',
      rating: 0
    },
    amenitiesVerified: {
      status: 'pending',
      notes: '',
      verified: [],
      missing: []
    },

    // Infrastructure Assessment
    powerSupply: {
      available: false,
      type: '', // NEPA, generator, solar
      reliability: 0,
      notes: ''
    },
    waterSupply: {
      available: false,
      type: '', // borehole, public, well
      quality: 0,
      notes: ''
    },
    roadAccess: {
      condition: '', // excellent, good, fair, poor
      type: '', // tarred, interlocked, dirt
      notes: ''
    },

    // Security Assessment
    security: {
      rating: 0,
      features: [],
      concerns: [],
      notes: ''
    },

    // Final Assessment
    recommendation: 'pending', // approve, reject, conditional
    rejectionReason: '',
    conditions: [],
    verifierNotes: '',

    ...initialData
  })

  const [currentSection, setCurrentSection] = useState('documents')
  const [isLoading, setIsLoading] = useState(false)

  const sections = [
    { id: 'documents', label: 'Documents', icon: '📄' },
    { id: 'physical', label: 'Physical Check', icon: '🏠' },
    { id: 'infrastructure', label: 'Infrastructure', icon: '🏗️' },
    { id: 'security', label: 'Security', icon: '🔒' },
    { id: 'assessment', label: 'Final Assessment', icon: '✅' }
  ]

  const documentTypes = [
    { key: 'titleDeed', label: 'Title Deed/Certificate of Occupancy' },
    { key: 'survey', label: 'Survey Plan' },
    { key: 'cOfO', label: 'Certificate of Occupancy' }
  ]

  const securityFeatures = [
    'Gated Community', 'Security Guards', 'CCTV Surveillance',
    'Perimeter Fencing', 'Access Control', 'Security Post',
    'Street Lighting', 'Neighborhood Watch'
  ]

  const handleStatusChange = (section: string, field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [section]: {
        ...(prev as any)[section],
        [field]: value
      }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await onSubmit?.(formData)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReject = async () => {
    if (!formData.rejectionReason.trim()) {
      alert('Please provide a rejection reason')
      return
    }
    setIsLoading(true)
    try {
      await onReject?.(formData.rejectionReason)
    } finally {
      setIsLoading(false)
    }
  }

  const renderSectionContent = () => {
    switch (currentSection) {
      case 'documents':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-heading font-bold mb-2">Document Verification</h3>
              <p className="text-muted-foreground">Review and verify property documents</p>
            </div>

            {documentTypes.map(({ key, label }) => (
              <div key={key} className="border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-heading font-semibold">{label}</h4>
                  <StatusBadge
                    variant={formData[key as keyof typeof formData].status as any}
                    size="sm"
                  >
                    {formData[key as keyof typeof formData].status}
                  </StatusBadge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Status</label>
                    <select
                      value={formData[key as keyof typeof formData].status}
                      onChange={(e) => handleStatusChange(key, 'status', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="pending">Pending Review</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      <option value="conditional">Needs Clarification</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Confidence Level</label>
                    <select
                      value={formData[key as keyof typeof formData].confidence}
                      onChange={(e) => handleStatusChange(key, 'confidence', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value={0}>Select Level</option>
                      <option value={25}>Low (25%)</option>
                      <option value={50}>Medium (50%)</option>
                      <option value={75}>High (75%)</option>
                      <option value={100}>Very High (100%)</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium mb-2">Notes</label>
                  <textarea
                    value={formData[key as keyof typeof formData].notes}
                    onChange={(e) => handleStatusChange(key, 'notes', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Add verification notes..."
                  />
                </div>
              </div>
            ))}
          </div>
        )

      case 'physical':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-heading font-bold mb-2">Physical Verification</h3>
              <p className="text-muted-foreground">On-site property assessment</p>
            </div>

            {/* Location Accuracy */}
            <div className="border border-border rounded-lg p-4">
              <h4 className="font-heading font-semibold mb-4">Location Accuracy</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">GPS Latitude</label>
                  <input
                    type="text"
                    value={formData.locationAccuracy.gpsCoordinates.lat}
                    onChange={(e) => handleStatusChange('locationAccuracy', 'gpsCoordinates', {
                      ...formData.locationAccuracy.gpsCoordinates,
                      lat: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="6.5244"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">GPS Longitude</label>
                  <input
                    type="text"
                    value={formData.locationAccuracy.gpsCoordinates.lng}
                    onChange={(e) => handleStatusChange('locationAccuracy', 'gpsCoordinates', {
                      ...formData.locationAccuracy.gpsCoordinates,
                      lng: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="3.3792"
                  />
                </div>
              </div>
            </div>

            {/* Property Condition */}
            <div className="border border-border rounded-lg p-4">
              <h4 className="font-heading font-semibold mb-4">Property Condition</h4>
              <div>
                <label className="block text-sm font-medium mb-2">Overall Rating</label>
                <select
                  value={formData.propertyCondition.rating}
                  onChange={(e) => handleStatusChange('propertyCondition', 'rating', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value={0}>Select Rating</option>
                  <option value={1}>1 - Poor Condition</option>
                  <option value={2}>2 - Fair Condition</option>
                  <option value={3}>3 - Good Condition</option>
                  <option value={4}>4 - Very Good</option>
                  <option value={5}>5 - Excellent</option>
                </select>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">Condition Notes</label>
                <textarea
                  value={formData.propertyCondition.notes}
                  onChange={(e) => handleStatusChange('propertyCondition', 'notes', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Describe property condition..."
                />
              </div>
            </div>
          </div>
        )

      case 'infrastructure':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-heading font-bold mb-2">Infrastructure Assessment</h3>
              <p className="text-muted-foreground">Evaluate utilities and infrastructure</p>
            </div>

            {/* Power Supply */}
            <div className="border border-border rounded-lg p-4">
              <h4 className="font-heading font-semibold mb-4">Power Supply</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center space-x-2 cursor-pointer mb-4">
                    <input
                      type="checkbox"
                      checked={formData.powerSupply.available}
                      onChange={(e) => handleStatusChange('powerSupply', 'available', e.target.checked)}
                      className="rounded border-border focus:ring-2 focus:ring-primary"
                    />
                    <span className="text-sm">Power Available</span>
                  </label>
                  {formData.powerSupply.available && (
                    <select
                      value={formData.powerSupply.type}
                      onChange={(e) => handleStatusChange('powerSupply', 'type', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">Select Type</option>
                      <option value="nepa">NEPA/Grid</option>
                      <option value="generator">Generator</option>
                      <option value="solar">Solar</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  )}
                </div>
                {formData.powerSupply.available && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Reliability Rating</label>
                    <select
                      value={formData.powerSupply.reliability}
                      onChange={(e) => handleStatusChange('powerSupply', 'reliability', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value={0}>Select Rating</option>
                      <option value={1}>1 - Very Poor</option>
                      <option value={2}>2 - Poor</option>
                      <option value={3}>3 - Average</option>
                      <option value={4}>4 - Good</option>
                      <option value={5}>5 - Excellent</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Water Supply */}
            <div className="border border-border rounded-lg p-4">
              <h4 className="font-heading font-semibold mb-4">Water Supply</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center space-x-2 cursor-pointer mb-4">
                    <input
                      type="checkbox"
                      checked={formData.waterSupply.available}
                      onChange={(e) => handleStatusChange('waterSupply', 'available', e.target.checked)}
                      className="rounded border-border focus:ring-2 focus:ring-primary"
                    />
                    <span className="text-sm">Water Available</span>
                  </label>
                  {formData.waterSupply.available && (
                    <select
                      value={formData.waterSupply.type}
                      onChange={(e) => handleStatusChange('waterSupply', 'type', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">Select Type</option>
                      <option value="borehole">Borehole</option>
                      <option value="public">Public Supply</option>
                      <option value="well">Well Water</option>
                      <option value="packaged">Packaged Water</option>
                    </select>
                  )}
                </div>
                {formData.waterSupply.available && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Quality Rating</label>
                    <select
                      value={formData.waterSupply.quality}
                      onChange={(e) => handleStatusChange('waterSupply', 'quality', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value={0}>Select Rating</option>
                      <option value={1}>1 - Poor Quality</option>
                      <option value={2}>2 - Fair Quality</option>
                      <option value={3}>3 - Good Quality</option>
                      <option value={4}>4 - Very Good</option>
                      <option value={5}>5 - Excellent</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Road Access */}
            <div className="border border-border rounded-lg p-4">
              <h4 className="font-heading font-semibold mb-4">Road Access</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Road Type</label>
                  <select
                    value={formData.roadAccess.type}
                    onChange={(e) => handleStatusChange('roadAccess', 'type', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Select Type</option>
                    <option value="tarred">Tarred Road</option>
                    <option value="interlocked">Interlocked</option>
                    <option value="dirt">Dirt Road</option>
                    <option value="gravel">Gravel Road</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Road Condition</label>
                  <select
                    value={formData.roadAccess.condition}
                    onChange={(e) => handleStatusChange('roadAccess', 'condition', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Select Condition</option>
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )

      case 'security':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-heading font-bold mb-2">Security Assessment</h3>
              <p className="text-muted-foreground">Evaluate security features and concerns</p>
            </div>

            <div className="border border-border rounded-lg p-4">
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Overall Security Rating</label>
                <select
                  value={formData.security.rating}
                  onChange={(e) => handleStatusChange('security', 'rating', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value={0}>Select Rating</option>
                  <option value={1}>1 - Very Poor</option>
                  <option value={2}>2 - Poor</option>
                  <option value={3}>3 - Average</option>
                  <option value={4}>4 - Good</option>
                  <option value={5}>5 - Excellent</option>
                </select>
              </div>

              <div className="mb-4">
                <h4 className="font-heading font-semibold mb-3">Security Features Present</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {securityFeatures.map(feature => (
                    <label key={feature} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.security.features.includes(feature)}
                        onChange={(e) => {
                          const features = e.target.checked
                            ? [...formData.security.features, feature]
                            : formData.security.features.filter((f: string) => f !== feature)
                          handleStatusChange('security', 'features', features)
                        }}
                        className="rounded border-border focus:ring-2 focus:ring-primary"
                      />
                      <span className="text-sm">{feature}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Security Notes</label>
                <textarea
                  value={formData.security.notes}
                  onChange={(e) => handleStatusChange('security', 'notes', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Additional security observations..."
                />
              </div>
            </div>
          </div>
        )

      case 'assessment':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-heading font-bold mb-2">Final Assessment</h3>
              <p className="text-muted-foreground">Make your verification recommendation</p>
            </div>

            <div className="border border-border rounded-lg p-4">
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Recommendation</label>
                <select
                  value={formData.recommendation}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, recommendation: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="pending">Select Recommendation</option>
                  <option value="approve">Approve - Property meets all standards</option>
                  <option value="conditional">Conditional Approval - Minor issues to resolve</option>
                  <option value="reject">Reject - Property does not meet standards</option>
                </select>
              </div>

              {formData.recommendation === 'reject' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Rejection Reason</label>
                  <textarea
                    value={formData.rejectionReason}
                    onChange={(e) => setFormData((prev: any) => ({ ...prev, rejectionReason: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Explain why the property is being rejected..."
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Verifier Notes</label>
                <textarea
                  value={formData.verifierNotes}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, verifierNotes: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Additional notes for the property owner and internal team..."
                />
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className={cn('max-w-4xl mx-auto', className)}>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-heading font-bold mb-2">Property Verification</h2>
        <p className="text-muted-foreground">Property ID: {propertyId}</p>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {/* Progress Steps */}
        <div className="border-b border-border p-6">
          <div className="flex items-center justify-between">
            {sections.map((section, index) => (
              <div key={section.id} className="flex items-center">
                <button
                  onClick={() => setCurrentSection(section.id)}
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors",
                    currentSection === section.id
                      ? "border-primary bg-primary text-primary-foreground"
                      : sections.findIndex(s => s.id === currentSection) > index
                      ? "border-green-500 bg-green-500 text-white"
                      : "border-border bg-background text-muted-foreground"
                  )}
                >
                  <span className="text-sm">{section.icon}</span>
                </button>
                {index < sections.length - 1 && (
                  <div className={cn(
                    "w-16 h-0.5 mx-2",
                    sections.findIndex(s => s.id === currentSection) > index
                      ? "bg-green-500"
                      : "bg-border"
                  )} />
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-2">
            {sections.map(section => (
              <span key={section.id} className="text-xs text-muted-foreground">
                {section.label}
              </span>
            ))}
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {renderSectionContent()}

          <div className="flex justify-between items-center mt-8 pt-6 border-t border-border">
            <div className="flex space-x-3">
              {currentSection !== 'documents' && (
                <RealEstButton
                  type="button"
                  variant="tertiary"
                  onClick={() => {
                    const currentIndex = sections.findIndex(s => s.id === currentSection)
                    if (currentIndex > 0) {
                      setCurrentSection(sections[currentIndex - 1].id)
                    }
                  }}
                >
                  Previous
                </RealEstButton>
              )}
              {currentSection !== 'assessment' && (
                <RealEstButton
                  type="button"
                  variant="tertiary"
                  onClick={() => {
                    const currentIndex = sections.findIndex(s => s.id === currentSection)
                    if (currentIndex < sections.length - 1) {
                      setCurrentSection(sections[currentIndex + 1].id)
                    }
                  }}
                >
                  Next
                </RealEstButton>
              )}
            </div>

            <div className="flex space-x-3">
              {formData.recommendation === 'reject' && (
                <RealEstButton
                  type="button"
                  variant="danger"
                  onClick={handleReject}
                  isLoading={isLoading}
                  disabled={isLoading || !formData.rejectionReason.trim()}
                >
                  Reject Property
                </RealEstButton>
              )}
              {currentSection === 'assessment' && formData.recommendation !== 'reject' && (
                <RealEstButton
                  type="submit"
                  isLoading={isLoading}
                  disabled={isLoading || formData.recommendation === 'pending'}
                >
                  {formData.recommendation === 'approve' ? 'Approve Property' : 'Conditional Approval'}
                </RealEstButton>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
