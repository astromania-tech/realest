'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { RealEstButton } from '@/components/heroui/RealEstButton'

interface QuickInquiryFormProps {
  propertyId?: string
  propertyTitle?: string
  onSubmit?: (data: any) => void
  className?: string
}

export function QuickInquiryForm({
  propertyId,
  propertyTitle,
  onSubmit,
  className
}: QuickInquiryFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    inquiryType: 'viewing',
    message: '',
    preferredTime: '',
    urgency: 'normal'
  })

  const [isLoading, setIsLoading] = useState(false)

  const inquiryTypes = [
    { value: 'viewing', label: 'Schedule Viewing', icon: '👁️' },
    { value: 'rental', label: 'Rental Inquiry', icon: '🏠' },
    { value: 'purchase', label: 'Purchase Inquiry', icon: '💰' },
    { value: 'information', label: 'More Information', icon: 'ℹ️' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await onSubmit?.({ ...formData, propertyId })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className={cn('', className)}>
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="text-center mb-6">
          <h3 className="text-xl font-heading font-bold mb-2">Quick Inquiry</h3>
          {propertyTitle && (
            <p className="text-sm text-muted-foreground">{propertyTitle}</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                required
                placeholder="+234"
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-3">Inquiry Type</label>
            <div className="grid grid-cols-2 gap-2">
              {inquiryTypes.map(type => (
                <label
                  key={type.value}
                  className={cn(
                    "flex items-center space-x-2 p-3 border border-border rounded-lg cursor-pointer transition-colors",
                    formData.inquiryType === type.value
                      ? "border-primary bg-primary/10"
                      : "hover:border-primary/50"
                  )}
                >
                  <input
                    type="radio"
                    name="inquiryType"
                    value={type.value}
                    checked={formData.inquiryType === type.value}
                    onChange={(e) => handleInputChange('inquiryType', e.target.value)}
                    className="sr-only"
                  />
                  <span className="text-sm">{type.icon}</span>
                  <span className="text-sm font-medium">{type.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Message</label>
            <textarea
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              rows={3}
              placeholder="Tell us about your requirements..."
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <RealEstButton
            type="submit"
            className="w-full"
            isLoading={isLoading}
            disabled={isLoading}
            size="lg"
          >
            Send Inquiry
          </RealEstButton>
        </form>
      </div>
    </div>
  )
}
