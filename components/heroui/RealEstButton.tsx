'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

// RealEST Button variant mapping
type RealEstButtonVariant =
  | 'primary'      // Neon green - primary actions
  | 'secondary'    // Violet - secondary actions
  | 'tertiary'     // Outline - neutral actions
  | 'outline'      // Alias for tertiary
  | 'ghost'        // Transparent - subtle actions
  | 'danger'       // Error red - destructive actions
  | 'neon'         // Custom neon variant
  | 'violet'       // Custom violet variant

interface RealEstButtonProps extends Omit<ComponentProps<typeof Button>, 'variant'> {
  variant?: RealEstButtonVariant
  isLoading?: boolean
  loadingText?: string
  isIconOnly?: boolean
}

const variantMap: Record<RealEstButtonVariant, string> = {
  primary: 'primary',
  secondary: 'secondary',
  tertiary: 'tertiary',
  outline: 'tertiary', // Alias for tertiary
  ghost: 'ghost',
  danger: 'danger',
  neon: 'primary',    // Maps to primary but with custom styling
  violet: 'secondary' // Maps to secondary but with custom styling
}

export function RealEstButton({
  variant = 'primary',
  className,
  children,
  isLoading = false,
  loadingText = 'Loading...',
  isIconOnly = false,
  // isPending,
  ...props
}: RealEstButtonProps) {
  const mappedVariant = variantMap[variant] as any
  const isLoadingState = isLoading // || isPending

  return (
    <Button
      variant={mappedVariant}
      className={cn(
        // Base RealEST styling
        'font-body font-semibold transition-all duration-200 ease-out rounded-xl',
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',

        // RealEST-specific variants
        variant === 'neon' && [
          'bg-brand-neon text-brand-dark border-0',
          'hover:bg-brand-neon/90 hover:shadow-lg hover:-translate-y-0.5',
          'active:translate-y-0 active:shadow-sm',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none'
        ],

        variant === 'violet' && [
          'bg-brand-violet text-white border-0',
          'hover:bg-brand-violet/90 hover:shadow-lg hover:-translate-y-0.5',
          'active:translate-y-0 active:shadow-sm',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none'
        ],

        (variant === 'tertiary' || variant === 'outline') && [
          'bg-transparent text-foreground border border-border',
          'hover:bg-accent hover:text-accent-foreground hover:border-brand-violet',
          'hover:shadow-sm hover:-translate-y-0.5',
          'active:translate-y-0 active:shadow-none'
        ],

        variant === 'ghost' && [
          'bg-transparent text-foreground border-0',
          'hover:bg-accent hover:text-accent-foreground',
          'hover:shadow-sm'
        ],

        variant === 'danger' && [
          'bg-error text-white border-0',
          'hover:bg-error/90 hover:shadow-lg hover:-translate-y-0.5',
          'active:translate-y-0 active:shadow-sm'
        ],

        // Loading state styling
        isLoadingState && [
          'opacity-80 cursor-wait transform-none'
        ],

        className
      )}
      // isPending={isLoadingState}
      {...props}
    >
      {isLoadingState ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          {loadingText}
        </>
      ) : isIconOnly ? null : (
        children
      )}
    </Button>
  )
}

// Property-specific button variants
export function FindPropertiesButton(props: Omit<RealEstButtonProps, 'variant'>) {
  return (
    <RealEstButton variant="neon" {...props}>
      🏠 Find Properties
    </RealEstButton>
  )
}

export function ContactOwnerButton(props: Omit<RealEstButtonProps, 'variant'>) {
  return (
    <RealEstButton variant="violet" {...props}>
      📞 Contact Owner
    </RealEstButton>
  )
}

export function ScheduleViewingButton(props: Omit<RealEstButtonProps, 'variant'>) {
  return (
    <RealEstButton variant="violet" {...props}>
      📅 Schedule Viewing
    </RealEstButton>
  )
}

export function SavePropertyButton(props: Omit<RealEstButtonProps, 'variant'>) {
  return (
    <RealEstButton variant="ghost" {...props}>
      ❤️ Save
    </RealEstButton>
  )
}

export function VerifyPropertyButton(props: Omit<RealEstButtonProps, 'variant'>) {
  return (
    <RealEstButton variant="neon" {...props}>
      ✅ Get Verified
    </RealEstButton>
  )
}

export function ListPropertyButton(props: Omit<RealEstButtonProps, 'variant'>) {
  return (
    <RealEstButton variant="violet" {...props}>
      📝 List Property
    </RealEstButton>
  )
}

// Nigerian market specific buttons
export function PayRentButton(props: Omit<RealEstButtonProps, 'variant'>) {
  return (
    <RealEstButton variant="neon" {...props}>
      💰 Pay Rent
    </RealEstButton>
  )
}

export function CheckNEPAButton(props: Omit<RealEstButtonProps, 'variant'>) {
  return (
    <RealEstButton variant="tertiary" {...props}>
      ⚡ Check NEPA
    </RealEstButton>
  )
}

export function ViewBQButton(props: Omit<RealEstButtonProps, 'variant'>) {
  return (
    <RealEstButton variant="tertiary" {...props}>
      🏠 View BQ
    </RealEstButton>
  )
}
