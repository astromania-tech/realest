'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { RealEstButton } from '@/components/heroui/RealEstButton'
import { StatusBadge, VerifiedBadge } from '@/components/ui/status-badge'
import { StatusDot } from '@/components/untitledui/StatusComponents'
import { ThemeToggleCompact } from '@/components/ui/theme-toggle-wrapper'

// ================================================================
// HEADER NAVIGATION COMPONENT
// ================================================================

interface HeaderNavigationProps {
  variant?: 'default' | 'transparent' | 'dark'
  isAuthenticated?: boolean
  user?: {
    name: string
    avatar?: string
    isAgent?: boolean
    isVerified?: boolean
  }
  onSignIn?: () => void
  onSignOut?: () => void
  className?: string
}

export function HeaderNavigation({
  variant = 'default',
  isAuthenticated = false,
  user,
  onSignIn,
  onSignOut,
  className
}: HeaderNavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className={cn(
      'sticky top-0 z-50 w-full transition-all duration-200',
      variant === 'default' && 'bg-background/95 backdrop-blur-sm border-b border-border',
      variant === 'transparent' && 'bg-transparent',
      variant === 'dark' && 'bg-brand-dark border-b border-brand-violet/20',
      className
    )}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex items-center gap-3">
              <div className="font-display text-2xl font-bold text-brand-violet">
                RealEST
              </div>
              <StatusBadge variant="verified" size="sm">Verified</StatusBadge>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="/properties" className="font-medium text-foreground hover:text-brand-violet transition-colors">
              Properties
            </a>
            <a href="/agents" className="font-medium text-foreground hover:text-brand-violet transition-colors">
              Agents
            </a>
            <a href="/areas" className="font-medium text-foreground hover:text-brand-violet transition-colors">
              Areas
            </a>
            <a href="/about" className="font-medium text-foreground hover:text-brand-violet transition-colors">
              About
            </a>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            {/* Theme Toggle */}
            <ThemeToggleCompact />

            {!isAuthenticated ? (
              <>
                <RealEstButton variant="ghost" size="sm" onClick={onSignIn}>
                  Sign In
                </RealEstButton>
                <RealEstButton variant="neon" size="sm">
                  Get Started
                </RealEstButton>
              </>
            ) : (
              <>
                <RealEstButton variant="tertiary" size="sm">
                  List Property
                </RealEstButton>

                {/* User Menu */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-brand-violet flex items-center justify-center text-white font-semibold text-sm">
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{user?.name}</span>
                      <div className="flex items-center gap-1">
                        {user?.isAgent && <StatusBadge variant="info" size="sm">Agent</StatusBadge>}
                        {user?.isVerified && <StatusDot status="verified" size="xs" />}
                      </div>
                    </div>
                  </div>
                  <RealEstButton variant="ghost" size="sm" onClick={onSignOut}>
                    Sign Out
                  </RealEstButton>
                </div>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <RealEstButton
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? '✕' : '☰'}
            </RealEstButton>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-sm">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a
                href="/properties"
                className="block px-3 py-2 text-base font-medium text-foreground hover:text-brand-violet hover:bg-accent rounded-md transition-colors"
              >
                Properties
              </a>
              <a
                href="/agents"
                className="block px-3 py-2 text-base font-medium text-foreground hover:text-brand-violet hover:bg-accent rounded-md transition-colors"
              >
                Agents
              </a>
              <a
                href="/areas"
                className="block px-3 py-2 text-base font-medium text-foreground hover:text-brand-violet hover:bg-accent rounded-md transition-colors"
              >
                Areas
              </a>
              <a
                href="/about"
                className="block px-3 py-2 text-base font-medium text-foreground hover:text-brand-violet hover:bg-accent rounded-md transition-colors"
              >
                About
              </a>
            </div>

            <div className="px-2 py-3 border-t border-border space-y-2">
              {!isAuthenticated ? (
                <>
                  <RealEstButton variant="ghost" size="sm" className="w-full" onClick={onSignIn}>
                    Sign In
                  </RealEstButton>
                  <RealEstButton variant="neon" size="sm" className="w-full">
                    Get Started
                  </RealEstButton>
                </>
              ) : (
                <>
                  <div className="px-3 py-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand-violet flex items-center justify-center text-white font-semibold">
                        {user?.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <div className="font-medium">{user?.name}</div>
                        <div className="flex items-center gap-2">
                          {user?.isAgent && <StatusBadge variant="info" size="sm">Agent</StatusBadge>}
                          {user?.isVerified && <VerifiedBadge size="sm">Verified</VerifiedBadge>}
                        </div>
                      </div>
                    </div>
                  </div>
                  <RealEstButton variant="tertiary" size="sm" className="w-full">
                    List Property
                  </RealEstButton>
                  <RealEstButton variant="ghost" size="sm" className="w-full" onClick={onSignOut}>
                    Sign Out
                  </RealEstButton>
                </>
              )}

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Theme</span>
                <ThemeToggleCompact />
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

// ================================================================
// SIDEBAR NAVIGATION COMPONENT
// ================================================================

interface SidebarNavigationProps {
  isOpen?: boolean
  onClose?: () => void
  activeItem?: string
  userRole?: 'user' | 'owner' | 'agent' | 'admin'
  className?: string
}

export function SidebarNavigation({
  isOpen = false,
  onClose,
  activeItem,
  userRole = 'user',
  className
}: SidebarNavigationProps) {
  const navigationItems = {
    user: [
      { id: 'dashboard', label: 'Dashboard', icon: '🏠', href: '/profile' },
      { id: 'search', label: 'Search Properties', icon: '🔍', href: '/search' },
      { id: 'saved', label: 'Saved Properties', icon: '❤️', href: '/profile/saved' },
      { id: 'applications', label: 'Applications', icon: '📋', href: '/profile/applications' },
      { id: 'messages', label: 'Messages', icon: '💬', href: '/profile/messages' },
      { id: 'profile', label: 'Profile', icon: '👤', href: '/profile' },
    ],
    owner: [
      { id: 'dashboard', label: 'Dashboard', icon: '🏠', href: '/owner' },
      { id: 'properties', label: 'My Properties', icon: '🏘️', href: '/owner/properties' },
      { id: 'add-property', label: 'Add Property', icon: '➕', href: '/owner/add-property' },
      { id: 'applications', label: 'Applications', icon: '📋', href: '/owner/applications' },
      { id: 'messages', label: 'Messages', icon: '💬', href: '/owner/messages' },
      { id: 'analytics', label: 'Analytics', icon: '📊', href: '/owner/analytics' },
      { id: 'profile', label: 'Profile', icon: '👤', href: '/profile' },
    ],
    agent: [
      { id: 'dashboard', label: 'Dashboard', icon: '🏠', href: '/agent' },
      { id: 'properties', label: 'Manage Properties', icon: '🏘️', href: '/agent/properties' },
      { id: 'clients', label: 'Clients', icon: '👥', href: '/agent/clients' },
      { id: 'leads', label: 'Leads', icon: '🎯', href: '/agent/leads' },
      { id: 'tours', label: 'Property Tours', icon: '🚶', href: '/agent/tours' },
      { id: 'commissions', label: 'Commissions', icon: '💰', href: '/agent/commissions' },
      { id: 'messages', label: 'Messages', icon: '💬', href: '/agent/messages' },
      { id: 'profile', label: 'Profile', icon: '👤', href: '/profile' },
    ],
    admin: [
      { id: 'dashboard', label: 'Admin Dashboard', icon: '⚙️', href: '/admin' },
      { id: 'properties', label: 'All Properties', icon: '🏘️', href: '/admin/validation' },
      { id: 'users', label: 'Users', icon: '👥', href: '/admin/users' },
      { id: 'agents', label: 'Agents', icon: '🤵', href: '/admin/agents' },
      { id: 'verification', label: 'Verification Queue', icon: '✅', href: '/admin/verification' },
      { id: 'reports', label: 'Reports', icon: '📊', href: '/admin/reports' },
      { id: 'settings', label: 'Settings', icon: '⚙️', href: '/admin/settings' },
    ]
  }

  const items = navigationItems[userRole]

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200',
        'lg:translate-x-0 lg:static lg:inset-0',
        isOpen ? 'translate-x-0' : '-translate-x-full',
        className
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="font-display text-xl font-bold text-brand-violet">
                RealEST
              </div>
              <StatusBadge variant="info" size="sm">{userRole}</StatusBadge>
            </div>
            <RealEstButton
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="lg:hidden"
              aria-label="Close sidebar"
            >
              ✕
            </RealEstButton>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 p-4 space-y-2">
            {items.map((item) => (
              <a
                key={item.id}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  activeItem === item.id
                    ? 'bg-brand-violet text-white shadow-md'
                    : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </a>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            <div className="space-y-2">
              <RealEstButton variant="ghost" size="sm" className="w-full justify-start">
                <span className="text-lg mr-3">❓</span>
                Help & Support
              </RealEstButton>
              <RealEstButton variant="ghost" size="sm" className="w-full justify-start">
                <span className="text-lg mr-3">🚪</span>
                Sign Out
              </RealEstButton>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

// ================================================================
// BREADCRUMB NAVIGATION COMPONENT
// ================================================================

interface BreadcrumbItem {
  label: string
  href?: string
  isActive?: boolean
}

interface BreadcrumbNavigationProps {
  items: BreadcrumbItem[]
  className?: string
}

export function BreadcrumbNavigation({ items, className }: BreadcrumbNavigationProps) {
  return (
    <nav className={cn('flex items-center space-x-2 text-sm', className)} aria-label="Breadcrumb">
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <span className="text-muted-foreground">/</span>
          )}
          {item.href && !item.isActive ? (
            <a
              href={item.href}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {item.label}
            </a>
          ) : (
            <span
              className={cn(
                item.isActive ? 'text-foreground font-medium' : 'text-muted-foreground'
              )}
            >
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  )
}

// ================================================================
// QUICK ACTIONS BAR
// ================================================================

interface QuickActionsBarProps {
  actions: Array<{
    id: string
    label: string
    icon: string
    onClick: () => void
    variant?: 'default' | 'primary' | 'success' | 'warning'
    badge?: number
  }>
  className?: string
}

export function QuickActionsBar({ actions, className }: QuickActionsBarProps) {
  return (
    <div className={cn(
      'flex items-center gap-2 p-4 bg-card border border-border rounded-lg',
      className
    )}>
      {actions.map((action) => (
        <RealEstButton
          key={action.id}
          variant={action.variant === 'primary' ? 'neon' : 'ghost'}
          size="sm"
          onClick={action.onClick}
          className="relative"
        >
          <span className="mr-2">{action.icon}</span>
          {action.label}
          {action.badge && (
            <span className="absolute -top-1 -right-1 bg-brand-neon text-brand-dark text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {action.badge}
            </span>
          )}
        </RealEstButton>
      ))}
    </div>
  )
}

// ================================================================
// PROPERTY SEARCH BAR (SPECIALIZED NAVIGATION)
// ================================================================

interface PropertySearchBarProps {
  onSearch?: (query: string) => void
  onFilterChange?: (filters: any) => void
  placeholder?: string
  showFilters?: boolean
  className?: string
}

export function PropertySearchBar({
  onSearch,
  onFilterChange,
  placeholder = "Search properties by location, type, or features...",
  showFilters = true,
  className
}: PropertySearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)

  const handleSearch = () => {
    onSearch?.(searchQuery)
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search Input */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-4 pr-12 py-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring focus:border-transparent"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <RealEstButton
            variant="ghost"
            size="sm"
            onClick={handleSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2"
          >
            🔍
          </RealEstButton>
        </div>

        {showFilters && (
          <RealEstButton
            variant="tertiary"
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className="shrink-0"
          >
            🔧 Filters
          </RealEstButton>
        )}
      </div>

      {/* Quick Search Tags */}
      <div className="flex flex-wrap gap-2">
        {['Lagos', 'Abuja', 'Port Harcourt', 'Apartments', 'Duplexes', 'Under ₦2M'].map((tag) => (
          <StatusBadge
            key={tag}
            variant="info"
            className="cursor-pointer hover:bg-brand-violet/20"
            onClick={() => setSearchQuery(tag)}
          >
            {tag}
          </StatusBadge>
        ))}
      </div>

      {/* Filters Panel */}
      {isFiltersOpen && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
          <div>
            <label className="block text-sm font-medium mb-2">Property Type</label>
            <select className="w-full p-2 border border-input rounded bg-background">
              <option>Any Type</option>
              <option>Apartment</option>
              <option>Duplex</option>
              <option>Bungalow</option>
              <option>Boys Quarters</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Price Range</label>
            <select className="w-full p-2 border border-input rounded bg-background">
              <option>Any Price</option>
              <option>Under ₦1M</option>
              <option>₦1M - ₦3M</option>
              <option>₦3M - ₦5M</option>
              <option>Over ₦5M</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Bedrooms</label>
            <select className="w-full p-2 border border-input rounded bg-background">
              <option>Any</option>
              <option>1+</option>
              <option>2+</option>
              <option>3+</option>
              <option>4+</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Features</label>
            <div className="space-y-1">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="rounded" />
                NEPA Power
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="rounded" />
                Water Supply
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="rounded" />
                Gated Community
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
