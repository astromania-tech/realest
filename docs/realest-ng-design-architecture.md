# RealEST Design System Architecture

## Complete Brand & Component Strategy Documentation

---

## Table of Contents

1. [Brand Identity & Color System](#1-brand-identity--color-system)
2. [Typography Architecture](#2-typography-architecture)
3. [Component Library Strategy](#3-component-library-strategy)
4. [Spacing & Layout System](#4-spacing--layout-system)
5. [Border & Radius Design](#5-border--radius-design)
6. [UX Writing & Microcopy Guidelines](#6-ux-writing--microcopy-guidelines)
7. [State & Status Design Patterns](#7-state--status-design-patterns)
8. [Responsive Design Tokens](#8-responsive-design-tokens)
9. [Implementation Roadmap](#9-implementation-roadmap)

---

## 1. Brand Identity & Color System

### 1.1 Color Architecture (60-30-10 Rule)

#### Primary Palette (OKLCH Format)

```css
:root {
  /* PRIMARY DARK (60% - Foundation) */
  --brand-dark: oklch(0.30 0.06 165); /* #07402F */
  --brand-dark-hover: oklch(0.35 0.06 165); /* Lighter hover state */
  --brand-dark-pressed: oklch(0.25 0.06 165); /* Pressed state */
  
  /* PRIMARY ACCENT (10% - Acid Green) */
  --brand-accent: oklch(0.89 0.24 128); /* #ADF434 */
  --brand-accent-hover: oklch(0.85 0.24 128); /* Hover state */
  --brand-accent-muted: oklch(0.89 0.24 128 / 0.15); /* Backgrounds */
  --brand-accent-border: oklch(0.89 0.24 128 / 0.3); /* Borders */
  
  /* PRIMARY NEUTRAL (30% - Deep Neutral) */
  --brand-neutral: oklch(0.26 0.01 155); /* #2E322E */
  --brand-neutral-hover: oklch(0.30 0.01 155);
  --brand-neutral-muted: oklch(0.26 0.01 155 / 0.12);
  --brand-neutral-border: oklch(0.26 0.01 155 / 0.25);
}
```

#### Extended Grayscale (Derived from Primary Dark)

```css
:root {
  /* GRAYSCALE DERIVED FROM #07402F (Dark Green) */
  --gray-50: oklch(0.98 0.005 155); /* Off-White with subtle green tint */
  --gray-100: oklch(0.95 0.008 155); /* Very light gray-green */
  --gray-200: oklch(0.88 0.012 155); /* Light gray-green */
  --gray-300: oklch(0.78 0.015 155); /* Medium light gray */
  --gray-400: oklch(0.65 0.018 155); /* Medium gray */
  --gray-500: oklch(0.52 0.020 155); /* True middle gray */
  --gray-600: oklch(0.42 0.022 155); /* Medium dark gray */
  --gray-700: oklch(0.32 0.025 155); /* Dark gray */
  --gray-800: oklch(0.26 0.015 155); /* Deep neutral equivalent */
  --gray-900: oklch(0.18 0.020 155); /* Very dark gray */
  --gray-950: oklch(0.15 0.025 155); /* Deepest backgrounds */
}
```

#### Accessible Neon Variations

```css
:root {
  /* ACID GREEN ACCESSIBILITY VARIANTS */
  --accent-text-light: oklch(0.89 0.24 128); /* On dark backgrounds */
  --accent-text-dark: oklch(0.45 0.20 128); /* On light backgrounds (WCAG AA) */
  --accent-background: oklch(0.89 0.24 128 / 0.08); /* Subtle fills */
  --accent-badge: oklch(0.89 0.24 128 / 0.18); /* Badge backgrounds */
  
  /* ACID GREEN SHADES FOR DATA VISUALIZATION */
  --accent-100: oklch(0.96 0.12 128);
  --accent-200: oklch(0.94 0.18 128);
  --accent-300: oklch(0.92 0.20 128);
  --accent-400: oklch(0.89 0.24 128); /* Primary */
  --accent-500: oklch(0.82 0.22 128);
  --accent-600: oklch(0.75 0.20 128);
  --accent-700: oklch(0.68 0.18 128);
  --accent-800: oklch(0.58 0.16 128);
  --accent-900: oklch(0.48 0.14 128);
}
```

#### Semantic Color Tokens

```css
:root {
  /* SEMANTIC COLORS */
  --success: oklch(0.70 0.18 145); /* Green for verified */
  --success-bg: oklch(0.70 0.18 145 / 0.12);
  --success-border: oklch(0.70 0.18 145 / 0.3);
  
  --warning: oklch(0.78 0.18 80); /* Amber for pending */
  --warning-bg: oklch(0.78 0.18 80 / 0.12);
  --warning-border: oklch(0.78 0.18 80 / 0.3);
  
  --danger: oklch(0.60 0.22 25); /* Red for rejected */
  --danger-bg: oklch(0.60 0.22 25 / 0.12);
  --danger-border: oklch(0.60 0.22 25 / 0.3);
  
  --info: oklch(0.65 0.15 240); /* Blue for informational */
  --info-bg: oklch(0.65 0.15 240 / 0.12);
  --info-border: oklch(0.65 0.15 240 / 0.3);
}
```

### 1.2 Color Usage Guidelines

#### 60% - Primary Dark Foundation
- **Use for:** Main backgrounds, navigation bars, headers, footer, card backgrounds in dark mode
- **Typography:** Primary heading color, body text in light mode
- **Examples:** `bg-gray-900`, `text-gray-900`

#### 30% - Violet Secondary Accent
- **Use for:** Secondary CTAs, gradient overlays, feature highlights, onboarding flows
- **Interactive elements:** Hover states, focus rings on important actions
- **Gradients:** `bg-gradient-to-r from-violet to-neon`
- **Examples:** Progress bars, verification badges, premium features

#### 10% - Neon Primary Accent
- **Use for:** Primary CTAs, "Verified" badges, active states, success indicators
- **Interactive elements:** Primary button hover, key form focuses
- **Sparingly:** Data highlights, notification dots, real-time updates
- **Examples:** "List Property" button, "Vetted ✓" badge, search submit

---

## 2. Typography Architecture

### 2.1 Typeface System

```css
@font-face {
  font-family: 'Space Grotesk';
  src: url('/fonts/SpaceGrotesk-Variable.woff2') format('woff2-variations');
  font-weight: 300 700;
  font-display: swap;
}

@font-face {
  font-family: 'Neulis Neue';
  src: url('/fonts/NeulisNeue-Bold.woff2') format('woff2');
  font-weight: 700;
  font-display: swap;
}

@font-face {
  font-family: 'JetBrains Mono';
  src: url('/fonts/JetBrainsMono-Variable.woff2') format('woff2-variations');
  font-weight: 400 700;
  font-display: swap;
}

@font-face {
  font-family: 'Lufga';
  src: url('/fonts/Lufga-SemiBold.woff2') format('woff2');
  font-weight: 600;
  font-display: swap;
}

:root {
  /* FONT FAMILIES */
  --font-body: 'Space Grotesk', 'Open Sauce Sans', 'Inter', system-ui, sans-serif;
  --font-heading: 'Neulis Neue', 'Space Grotesk', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
  --font-display: 'Lufga', 'Playfair Display', serif;
}
```

### 2.2 Type Scale (Fluid Typography)

```css
:root {
  /* FLUID TYPE SCALE (Mobile → Desktop) */
  --text-xs: clamp(0.75rem, 0.7rem + 0.25vw, 0.8125rem); /* 12px → 13px */
  --text-sm: clamp(0.875rem, 0.825rem + 0.25vw, 0.9375rem); /* 14px → 15px */
  --text-base: clamp(1rem, 0.95rem + 0.25vw, 1.0625rem); /* 16px → 17px */
  --text-lg: clamp(1.125rem, 1.05rem + 0.375vw, 1.25rem); /* 18px → 20px */
  --text-xl: clamp(1.25rem, 1.15rem + 0.5vw, 1.5rem); /* 20px → 24px */
  --text-2xl: clamp(1.5rem, 1.35rem + 0.75vw, 1.875rem); /* 24px → 30px */
  --text-3xl: clamp(1.875rem, 1.65rem + 1.125vw, 2.5rem); /* 30px → 40px */
  --text-4xl: clamp(2.25rem, 1.95rem + 1.5vw, 3.125rem); /* 36px → 50px */
  --text-5xl: clamp(3rem, 2.5rem + 2.5vw, 4.5rem); /* 48px → 72px */
  --text-6xl: clamp(3.75rem, 3rem + 3.75vw, 6rem); /* 60px → 96px */
}
```

### 2.3 Typography Roles & Usage

#### Display Typeface (Lufga)
```css
.display-hero {
  font-family: var(--font-display);
  font-size: var(--text-6xl);
  font-weight: 600;
  line-height: 1.1;
  letter-spacing: -0.02em;
  color: var(--gray-900);
}

.display-section {
  font-family: var(--font-display);
  font-size: var(--text-4xl);
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: -0.015em;
}
```
**Use for:** Homepage hero ("Find Your Dream Property"), major section headers, marketing landing pages

#### Heading Typeface (Neulis Neue)
```css
.heading-primary {
  font-family: var(--font-heading);
  font-size: var(--text-3xl);
  font-weight: 700;
  line-height: 1.25;
  letter-spacing: -0.01em;
  color: var(--gray-900);
}

.heading-secondary {
  font-family: var(--font-heading);
  font-size: var(--text-2xl);
  font-weight: 700;
  line-height: 1.3;
  letter-spacing: -0.005em;
}

.heading-tertiary {
  font-family: var(--font-heading);
  font-size: var(--text-xl);
  font-weight: 600;
  line-height: 1.4;
}
```
**Use for:** Page titles, card headers, modal titles, dashboard section headers

#### Body Typeface (Space Grotesk)
```css
.body-large {
  font-family: var(--font-body);
  font-size: var(--text-lg);
  font-weight: 400;
  line-height: 1.6;
  color: var(--gray-700);
}

.body-base {
  font-family: var(--font-body);
  font-size: var(--text-base);
  font-weight: 400;
  line-height: 1.65;
  color: var(--gray-700);
}

.body-small {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: 400;
  line-height: 1.5;
  color: var(--gray-600);
}
```
**Use for:** All body content, descriptions, form labels, navigation links

#### Monospace Typeface (JetBrains Mono)
```css
.mono-code {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  font-weight: 400;
  line-height: 1.5;
  letter-spacing: -0.01em;
  background: var(--gray-100);
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
}

.mono-data {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: 500;
  letter-spacing: 0;
  color: var(--gray-600);
}
```
**Use for:** Property IDs, coordinates, timestamps, API responses, technical data displays

### 2.4 Text Color Hierarchy

```css
:root {
  /* TEXT COLOR TOKENS */
  --text-primary: var(--gray-900); /* Main headings, important content */
  --text-secondary: var(--gray-700); /* Body text, descriptions */
  --text-tertiary: var(--gray-600); /* Helper text, captions */
  --text-disabled: var(--gray-400); /* Disabled form fields */
  --text-placeholder: var(--gray-500); /* Input placeholders */
  --text-inverse: oklch(0.99 0 0); /* Text on dark backgrounds */
  --text-accent: var(--brand-neon); /* Highlighted keywords, links */
  --text-accent-secondary: var(--brand-violet);
}
```

---

## 3. Component Library Strategy

### 3.1 HeroUI vs Shadcn vs UntitledUI Decision Matrix

#### **Primary Library: HeroUI (70% of components)**

**Use HeroUI for:**
- ✅ **Navigation & Layout**
  - Navbar, Sidebar, Breadcrumbs, Tabs
  - Header, Footer components
  
- ✅ **Content Display**
  - Cards (Property cards, feature cards)
  - Image, Avatar, Chip, Badge components
  - Modal, Drawer, Popover for overlays
  
- ✅ **Forms & Inputs**
  - Input, Textarea, Select, Checkbox, Radio, Switch
  - Date Picker, File Upload components
  
- ✅ **Interactive Elements**
  - Button (primary CTAs with neon accents)
  - Dropdown, Menu, Tooltip
  - Accordion, Collapse
  
- ✅ **Data Display**
  - Table (property listings, admin dashboard)
  - Pagination, Skeleton loaders
  - Progress bars

**HeroUI Configuration:**
```tsx
// tailwind.config.ts
import { heroui } from "@heroui/react";

export default {
  plugins: [
    heroui({
      themes: {
        light: {
          colors: {
            primary: {
              DEFAULT: "#ADF434",
              foreground: "#07402F",
            },
            secondary: {
              DEFAULT: "#2E322E",
              foreground: "#F8F9F7",
            },
            default: {
              DEFAULT: "#07402F",
              foreground: "#F8F9F7",
            },
          },
        },
      },
    }),
  ],
};
```

#### **Replacement: UntitledUI (25% - State & Status Components)**

**Replace Shadcn with UntitledUI for:**
- ✅ **Status Indicators**
  - **Badge components** (Verified, Pending, Rejected, Live)
  - **Status dots** (Available, Booked, Under Review)
  - **Pills** for property types (Sale, Rent, Lease)
  
- ✅ **Microcopy & Feedback**
  - **Toast notifications** (Success, Error, Info)
  - **Alert banners** (Warnings, system messages)
  - **Inline validation** messages
  
- ✅ **Data Detail Display**
  - **Description lists** (Property specs: beds, baths, sqft)
  - **Stat cards** (Views, Inquiries, Days listed)
  - **Tag groups** (Amenities, Features)

**UntitledUI Badge Pattern:**
```tsx
// components/ui/status-badge.tsx
import { Badge } from '@/components/ui-untitled/badge';

export function PropertyStatusBadge({ status }: { status: 'live' | 'pending' | 'rejected' }) {
  const variants = {
    live: { color: 'success', icon: '✓', label: 'Vetted & Live' },
    pending: { color: 'warning', icon: '◷', label: 'Under Review' },
    rejected: { color: 'error', icon: '✕', label: 'Not Approved' },
  };

  const { color, icon, label } = variants[status];

  return (
    <Badge variant="subtle" color={color} size="sm">
      <span className="mr-1">{icon}</span>
      {label}
    </Badge>
  );
}
```

#### **Retained: Shadcn/UI (5% - Complex Patterns)**

**Keep Shadcn only for:**
- ✅ **Command Palette** (Search with ⌘K)
- ✅ **Combobox** (Location autocomplete with geocoding)
- ✅ **Context Menu** (Right-click actions on property cards)

### 3.2 Component Customization Standards

#### HeroUI Button with Brand Colors
```tsx
// components/ui/hero-button.tsx
import { Button } from "@heroui/react";

export function PrimaryButton({ children, ...props }) {
  return (
    <Button
      color="primary"
      size="lg"
      className="
        font-body font-semibold
        bg-brand-neon hover:bg-brand-neon-hover
        text-brand-dark
        shadow-lg shadow-brand-neon/30
        transition-all duration-200
        hover:scale-105 hover:shadow-xl
      "
      {...props}
    >
      {children}
    </Button>
  );
}

export function SecondaryButton({ children, ...props }) {
  return (
    <Button
      variant="bordered"
      size="lg"
      className="
        font-body font-medium
        border-2 border-brand-violet
        text-brand-violet hover:bg-brand-violet-muted
        transition-all duration-200
      "
      {...props}
    >
      {children}
    </Button>
  );
}
```

---

## 4. Spacing & Layout System

### 4.1 Consistent Spacing Scale

```css
:root {
  /* SPATIAL SCALE (Based on 4px base unit) */
  --space-px: 1px;
  --space-0: 0;
  --space-0.5: 0.125rem; /* 2px */
  --space-1: 0.25rem;    /* 4px */
  --space-1.5: 0.375rem; /* 6px */
  --space-2: 0.5rem;     /* 8px */
  --space-2.5: 0.625rem; /* 10px */
  --space-3: 0.75rem;    /* 12px */
  --space-3.5: 0.875rem; /* 14px */
  --space-4: 1rem;       /* 16px */
  --space-5: 1.25rem;    /* 20px */
  --space-6: 1.5rem;     /* 24px */
  --space-7: 1.75rem;    /* 28px */
  --space-8: 2rem;       /* 32px */
  --space-10: 2.5rem;    /* 40px */
  --space-12: 3rem;      /* 48px */
  --space-16: 4rem;      /* 64px */
  --space-20: 5rem;      /* 80px */
  --space-24: 6rem;      /* 96px */
  --space-32: 8rem;      /* 128px */
}
```

### 4.2 Component Spacing Patterns

#### Card Spacing
```css
.property-card {
  padding: var(--space-6); /* 24px all sides */
  gap: var(--space-4);     /* 16px between elements */
}

.property-card-header {
  padding-bottom: var(--space-5); /* 20px bottom */
  margin-bottom: var(--space-5);
  border-bottom: 1px solid var(--gray-200);
}

.property-card-image {
  margin: calc(var(--space-6) * -1); /* Bleed to card edges */
  margin-bottom: var(--space-6);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
}
```

#### Form Spacing
```css
.form-group {
  margin-bottom: var(--space-6); /* 24px between fields */
}

.form-label {
  margin-bottom: var(--space-2); /* 8px label-to-input */
}

.form-helper-text {
  margin-top: var(--space-1.5); /* 6px input-to-helper */
}

.form-section {
  margin-bottom: var(--space-12); /* 48px between sections */
}
```

#### Section Spacing
```css
.section-padding {
  padding-top: var(--space-20);    /* 80px */
  padding-bottom: var(--space-20);
}

@media (min-width: 768px) {
  .section-padding {
    padding-top: var(--space-24);   /* 96px on tablet+ */
    padding-bottom: var(--space-24);
  }
}

@media (min-width: 1024px) {
  .section-padding {
    padding-top: var(--space-32);   /* 128px on desktop */
    padding-bottom: var(--space-32);
  }
}
```

### 4.3 Container & Grid System

```css
.container {
  width: 100%;
  margin-inline: auto;
  padding-inline: var(--space-4); /* 16px mobile */
}

@media (min-width: 640px) {
  .container {
    max-width: 640px;
    padding-inline: var(--space-6); /* 24px tablet */
  }
}

@media (min-width: 768px) {
  .container {
    max-width: 768px;
  }
}

@media (min-width: 1024px) {
  .container {
    max-width: 1024px;
    padding-inline: var(--space-8); /* 32px desktop */
  }
}

@media (min-width: 1280px) {
  .container {
    max-width: 1280px;
  }
}

@media (min-width: 1536px) {
  .container {
    max-width: 1440px; /* Max content width */
  }
}
```

---

## 5. Border & Radius Design

### 5.1 Minimal Border Philosophy

**Conservative Professional Approach:**
- **Default:** No borders on cards in light mode
- **Borders used for:** Separation when necessary, form inputs, modals
- **Emphasis:** Shadows and background color contrast over heavy borders

```css
:root {
  /* BORDER WIDTHS */
  --border-width-0: 0;
  --border-width-1: 1px;
  --border-width-2: 2px;
  --border-width-3: 3px;
  
  /* BORDER COLORS */
  --border-default: var(--gray-200);      /* Light mode subtle */
  --border-emphasis: var(--gray-300);     /* Stronger separation */
  --border-muted: var(--gray-100);        /* Very subtle */
  --border-accent: var(--brand-neon-border); /* Neon 30% opacity */
  --border-interactive: var(--brand-violet-border);
}
```

### 5.2 Border Radius System

```css
:root {
  /* BORDER RADIUS SCALE */
  --radius-none: 0;
  --radius-sm: 0.375rem;   /* 6px - Tight corners (badges, pills) */
  --radius-base: 0.5rem;   /* 8px - Buttons, inputs */
  --radius-md: 0.75rem;    /* 12px - Small cards */
  --radius-lg: 1rem;       /* 16px - Standard cards */
  --radius-xl: 1.25rem;    /* 20px - Feature cards */
  --radius-2xl: 1.5rem;    /* 24px - Modal, drawer */
  --radius-3xl: 2rem;      /* 32px - Hero images */
  --radius-full: 9999px;   /* Fully rounded (avatars, pills) */
}
```

### 5.3 Component-Specific Radius

```css
/* PROPERTY CARDS */
.property-card {
  border-radius: var(--radius-xl); /* 20px - Premium feel */
  overflow: hidden;
}

.property-card-image {
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
}

/* BUTTONS */
.button-primary {
  border-radius: var(--radius-base); /* 8px - Standard */
}

.button-icon-only {
  border-radius: var(--radius-full); /* Circular */
}

/* INPUTS */
.input-field {
  border-radius: var(--radius-base); /* 8px */
}

/* BADGES & PILLS */
.badge {
  border-radius: var(--radius-sm); /* 6px - Tight */
}

.pill {
  border-radius: var(--radius-full); /* Fully rounded */
}

/* MODALS */
.modal {
  border-radius: var(--radius-2xl); /* 24px - Prominent */
}

/* TOOLTIPS */
.tooltip {
  border-radius: var(--radius-md); /* 12px - Compact */
}
```

### 5.4 Shadow System (Replacing Heavy Borders)

```css
:root {
  /* SHADOW TOKENS */
  --shadow-xs: 0 1px 2px 0 oklch(0 0 0 / 0.05);
  --shadow-sm: 0 1px 3px 0 oklch(0 0 0 / 0.08), 0 1px 2px -1px oklch(0 0 0 / 0.08);
  --shadow-base: 0 4px 6px -1px oklch(0 0 0 / 0.08), 0 2px 4px -2px oklch(0 0 0 / 0.08);
  --shadow-md: 0 10px 15px -3px oklch(0 0 0 / 0.08), 0 4px 6px -4px oklch(0 0 0 / 0.08);
  --shadow-lg: 0 20px 25px -5px oklch(0 0 0 / 0.08), 0 8px 10px -6px oklch(0 0 0 / 0.08);
  --shadow-xl: 0 25px 50px -12px oklch(0 0 0 / 0.18);
  
  /* COLORED SHADOWS (Brand Accent) */
  --shadow-neon-sm: 0 4px 12px 0 var(--brand-neon-muted);
  --shadow-neon-md: 0 8px 24px 0 oklch(0.92 0.24 130 / 0.25);
  --shadow-neon-lg: 0 12px 32px 0 oklch(0.92 0.24 130 / 0.35);
  
  --shadow-violet-sm: 0 4px 12px 0 var(--brand-violet-muted);
  --shadow-violet-md: 0 8px 24px 0 oklch(0.58 0.18 285 / 0.20);
}
```

**Usage:**
```css
/* Property Card with no border, shadow emphasis */
.property-card {
  background: var(--gray-50);
  border: 0;
  box-shadow: var(--shadow-sm);
  transition: box-shadow 0.2s ease;
}

.property-card:hover {
  box-shadow: var(--shadow-lg);
}

/* Primary CTA with neon glow */
.button-primary {
  background: var(--brand-neon);
  border: 0;
  box-shadow: var(--shadow-neon-sm);
}

.button-primary:hover {
  box-shadow: var(--shadow-neon-md);
}
```

---

## 6. UX Writing & Microcopy Guidelines

### 6.1 Voice & Tone Principles

**RealEST Brand Voice:**
- **Professional** yet approachable
- **Confident** without being arrogant
- **Clear** and jargon-free
- **Action-oriented** and helpful
- **Trustworthy** through transparency

### 6.2 CTA (Call-to-Action) Library

#### Primary Actions
```
✅ PROPERTY LISTING
- "List Your Property" (not "Submit Property")
- "Start Verification Process"
- "Get Verified Today"
- "Claim Your Free Listing"

✅ BROWSING & SEARCH
- "Explore Verified Properties"
- "Find Your Perfect Space"
- "Search Trusted Listings"
- "Discover Premium Homes"

✅ ENGAGEMENT
- "Request Property Details"
- "Schedule a Visit"
- "Connect with Owner"
- "Save to Favorites"

✅ ACCOUNT ACTIONS
- "Create Your Account"
- "Join RealEST Today"
- "Complete Your Profile"
- "Verify Your Identity"
```

#### Secondary Actions
```
- "Learn More About Vetting"
- "See How It Works"
- "View All Features"
- "Compare Properties"
- "Filter Results"
- "Update Preferences"
```

### 6.3 Microcopy Patterns

#### Form Labels
```tsx
// ✅ GOOD: Clear, action-oriented
<Input label="Property Address" placeholder="123 Victoria Island, Lagos" />
<Input label="Asking Price (₦)" placeholder="50,000,000" />

// ❌ AVOID: Vague or technical
<Input label="Address Line 1" />
<Input label="Price Value" />
```

#### Helper Text
```tsx
// ✅ GOOD: Helpful, specific
<Input 
  label="Property Title" 
  description="A clear, descriptive name users will see first"
  placeholder="e.g., Modern 3BR Apartment in Lekki Phase 1"
/>

// ✅ GOOD: Proactive guidance
<Input
  label="Upload Title Document"
  description="Accepted: PDF, JPG, PNG (max 5MB). We'll verify this during vetting."
/>

// ❌ AVOID: Unhelpful or technical
<Input 
  label="Document" 
  description="Upload file"
/>
```

#### Error Messages
```tsx
// ✅ GOOD: Specific, actionable
"Please enter a valid Lagos address with street name and area"
"Your password must be at least 8 characters with one number"
"This property address already exists. Contact support if this is your property."

// ❌ AVOID: Generic or blame-focused
"Invalid input"
"Error occurred"
"You entered wrong data"
```

#### Success Messages
```tsx
// ✅ GOOD: Celebratory, next-step oriented
"Property submitted! Our team will begin verification within 24 hours."
"Profile updated successfully. You're all set!"
"Inquiry sent! The property owner will respond within 48 hours."

// ❌ AVOID: Robotic or incomplete
"Success"
"Saved"
"Done"
```

### 6.4 Status & State Messaging

#### Property Status Labels
```tsx
const statusMessages = {
  pending_ml_validation: {
    label: "Document Review",
    description: "Our AI is verifying your property documents",
    icon: "🔍",
    color: "warning",
    action: "Typically takes 2-4 hours"
  },
  
  pending_vetting: {
    label: "Physical Vetting Scheduled",
    description: "Our team will visit your property within 3 business days",
    icon: "📍",
    color: "info",
    action: "You'll receive a call to schedule"
  },
  
  live: {
    label: "Vetted & Live",
    description: "Your property is now visible to verified users",
    icon: "✓",
    color: "success",
    action: "View your listing"
  },
  
  rejected: {
    label: "Additional Info Needed",
    description: "We need clarification on some details",
    icon: "⚠",
    color: "danger",
    action: "Review feedback & resubmit"
  },
  
  pending_duplicate_review: {
    label: "Duplicate Check",
    description: "We found a similar listing and need to verify uniqueness",
    icon: "🔄",
    color: "warning",
    action: "Our team is reviewing this"
  }
};
```

#### Availability States (For Property Cards)
```tsx
const availabilityStates = {
  available: {
    badge: "Available Now",
    variant: "success",
    description: "Ready for viewing and offers"
  },
  
  under_offer: {
    badge: "Under Offer",
    variant: "warning",
    description: "Offer accepted, pending completion"
  },
  
  sold: {
    badge: "Recently Sold",
    variant: "default",
    description: "See similar properties"
  },
  
  rented: {
    badge: "Currently Rented",
    variant: "default",
    description: "Available from: [Date]"
  },
  
  fully_booked: {
    badge: "Fully Booked",
    variant: "default",
    description: "Next availability: [Date]"
  }
};
```

### 6.5 Tooltip & Help Text Library

#### Property Listing Form
```tsx
const tooltips = {
  propertyType: "Choose the category that best describes your property. This helps buyers find exactly what they're looking for.",
  
  verificationBadge: "Properties with this badge have passed our dual-layer verification: ML document scanning + physical on-site inspection by our team.",
  
  liveLocation: "We use precise GPS coordinates to show your exact property location. This is verified during our physical vetting process.",
  
  mlValidation: "Our AI scans your documents for authenticity, checking against common fraud patterns and verifying key information matches.",
  
  pricingGuidance: "Based on similar verified properties in your area, the average price is ₦[X]. Set a competitive price to attract serious buyers.",
  
  propertyFeatures: "List key amenities and features. Detailed listings receive 3x more inquiries.",
  
  ownerVerification: "We verify your identity and ownership documents to ensure buyer confidence. This protects both parties in the transaction."
};
```

### 6.6 Empty State Messages

```tsx
const emptyStates = {
  noSearchResults: {
    title: "No properties match your search",
    description: "Try adjusting your filters or expanding your search area",
    action: "Clear all filters",
    illustration: "search-empty"
  },
  
  noSavedProperties: {
    title: "You haven't saved any properties yet",
    description: "Click the heart icon on any property to save it here for later",
    action: "Browse properties",
    illustration: "favorite-empty"
  },
  
  noListings: {
    title: "You haven't listed any properties",
    description: "Get started by listing your first property. It's free and takes less than 10 minutes.",
    action: "List your first property",
    illustration: "listing-empty"
  },
  
  noInquiries: {
    title: "No inquiries yet",
    description: "Once buyers are interested, their inquiries will appear here. Make sure your listing has high-quality photos and detailed information.",
    action: "Improve your listing",
    illustration: "inbox-empty"
  },
  
  pendingVerification: {
    title: "Your property is being verified",
    description: "We're reviewing your documents and will schedule a physical inspection soon. This typically takes 2-3 business days.",
    action: "View verification status",
    illustration: "verification-pending"
  }
};
```

### 6.7 Onboarding Microcopy

#### Welcome Flow
```tsx
const onboardingSteps = [
  {
    step: 1,
    title: "Welcome to RealEST",
    subtitle: "Nigeria's most trusted property marketplace",
    description: "Every property is verified through AI document scanning and physical on-site vetting by our team.",
    cta: "Get Started"
  },
  
  {
    step: 2,
    title: "What brings you to RealEST?",
    subtitle: "Tell us so we can personalize your experience",
    options: [
      { value: "buyer", label: "I'm looking to buy", icon: "🏠" },
      { value: "renter", label: "I'm looking to rent", icon: "🔑" },
      { value: "owner", label: "I'm listing a property", icon: "📝" },
      { value: "agent", label: "I'm a real estate agent", icon: "💼" }
    ],
    cta: "Continue"
  },
  
  {
    step: 3,
    title: "Set your preferences",
    subtitle: "Where are you looking?",
    description: "We'll show you verified properties that match your needs",
    cta: "Start exploring"
  }
];
```

#### First-Time Property Listing
```tsx
const listingOnboarding = {
  intro: {
    title: "List Your Property in 3 Simple Steps",
    steps: [
      "📝 Provide basic details and upload photos",
      "📄 Upload ownership documents (we verify these)",
      "✓ Get verified and go live within 3 days"
    ],
    note: "Your listing is free. We only charge a small fee when your property is successfully sold or rented.",
    cta: "Start listing"
  },
  
  documentUpload: {
    title: "Upload Ownership Documents",
    subtitle: "Required for verification",
    description: "Don't worry – these documents are encrypted and only viewed by our vetting team. This step ensures buyer confidence and prevents fraud.",
    acceptedDocs: [
      "Certificate of Occupancy (C of O)",
      "Deed of Assignment",
      "Survey Plan",
      "Receipt of Purchase"
    ],
    helpText: "Don't have digital copies? You can submit them during our physical vetting appointment.",
    cta: "Upload documents"
  }
};
```

### 6.8 Notification Copy Patterns

#### Push Notifications
```tsx
const notifications = {
  newInquiry: {
    title: "New inquiry on your property",
    body: "[Property Name] – [Buyer Name] is interested and wants to know more",
    action: "View inquiry"
  },
  
  verificationComplete: {
    title: "Your property is now live! 🎉",
    body: "[Property Name] passed verification and is now visible to buyers",
    action: "View listing"
  },
  
  visitScheduled: {
    title: "Vetting appointment scheduled",
    body: "Our team will visit [Property Address] on [Date] at [Time]",
    action: "View details"
  },
  
  priceAlert: {
    title: "Similar property just sold",
    body: "A property like yours in [Area] sold for ₦[Amount]. Consider adjusting your price.",
    action: "View comparable sales"
  },
  
  matchFound: {
    title: "New property matches your search",
    body: "[Property Type] in [Location] – [Price Range]",
    action: "View property"
  }
};
```

#### Email Subject Lines
```
✅ TRANSACTIONAL
"Your RealEST property is now live"
"Verification scheduled for [Property Name]"
"[Buyer Name] sent you an inquiry"
"Welcome to RealEST – Verify your email"

✅ ENGAGEMENT
"3 new properties match your search"
"Your listing has 12 views this week"
"Complete your profile to unlock premium features"

✅ EDUCATIONAL
"How our dual-layer verification protects you"
"5 tips for faster property verification"
"What buyers look for in Lagos properties"
```

---

## 7. State & Status Design Patterns

### 7.1 Badge Component System (UntitledUI)

```tsx
// components/ui/status-badge.tsx
import { Badge } from '@/components/ui-untitled/badge';
import { cn } from '@/lib/utils';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'default';

interface StatusBadgeProps {
  variant: BadgeVariant;
  label: string;
  icon?: string;
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;
}

export function StatusBadge({ 
  variant, 
  label, 
  icon, 
  size = 'md',
  pulse = false 
}: StatusBadgeProps) {
  return (
    <Badge
      variant="subtle"
      color={variant}
      size={size}
      className={cn(
        "font-body font-medium",
        pulse && "animate-pulse"
      )}
    >
      {icon && <span className="mr-1.5">{icon}</span>}
      {label}
    </Badge>
  );
}

// Usage examples
<StatusBadge variant="success" label="Vetted & Live" icon="✓" />
<StatusBadge variant="warning" label="Pending Review" icon="◷" pulse />
<StatusBadge variant="error" label="Action Required" icon="!" />
<StatusBadge variant="info" label="New Listing" icon="✨" />
```

### 7.2 Status Indicator Dots

```tsx
// components/ui/status-dot.tsx
interface StatusDotProps {
  status: 'available' | 'pending' | 'unavailable';
  label?: string;
  showLabel?: boolean;
}

export function StatusDot({ status, label, showLabel = true }: StatusDotProps) {
  const variants = {
    available: {
      color: 'bg-success',
      label: label || 'Available',
      ring: 'ring-success/20'
    },
    pending: {
      color: 'bg-warning',
      label: label || 'Pending',
      ring: 'ring-warning/20'
    },
    unavailable: {
      color: 'bg-gray-400',
      label: label || 'Unavailable',
      ring: 'ring-gray-400/20'
    }
  };

  const { color, label: defaultLabel, ring } = variants[status];

  return (
    <div className="inline-flex items-center gap-2">
      <span 
        className={cn(
          "relative inline-flex h-2 w-2 rounded-full",
          color
        )}
      >
        <span 
          className={cn(
            "absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping",
            status === 'available' && color
          )}
        />
      </span>
      {showLabel && (
        <span className="text-sm font-medium text-gray-700">
          {defaultLabel}
        </span>
      )}
    </div>
  );
}
```

### 7.3 Property Type Pills

```tsx
// components/ui/property-pill.tsx
interface PropertyPillProps {
  type: 'sale' | 'rent' | 'lease';
  size?: 'sm' | 'md';
}

export function PropertyPill({ type, size = 'md' }: PropertyPillProps) {
  const variants = {
    sale: {
      label: 'For Sale',
      bg: 'bg-brand-neon/10',
      text: 'text-brand-neon-dark',
      border: 'border-brand-neon/30'
    },
    rent: {
      label: 'For Rent',
      bg: 'bg-brand-violet/10',
      text: 'text-brand-violet',
      border: 'border-brand-violet/30'
    },
    lease: {
      label: 'For Lease',
      bg: 'bg-info/10',
      text: 'text-info',
      border: 'border-info/30'
    }
  };

  const { label, bg, text, border } = variants[type];

  return (
    <span 
      className={cn(
        "inline-flex items-center font-body font-semibold rounded-full border",
        bg, text, border,
        size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm'
      )}
    >
      {label}
    </span>
  );
}
```

### 7.4 Progress Indicators

```tsx
// components/ui/verification-progress.tsx
import { Progress } from '@heroui/react';

interface VerificationProgressProps {
  stage: 'submission' | 'ml_validation' | 'physical_vetting' | 'complete';
}

export function VerificationProgress({ stage }: VerificationProgressProps) {
  const stages = {
    submission: { progress: 25, label: 'Documents submitted' },
    ml_validation: { progress: 50, label: 'AI verification in progress' },
    physical_vetting: { progress: 75, label: 'Physical vetting scheduled' },
    complete: { progress: 100, label: 'Verification complete' }
  };

  const { progress, label } = stages[stage];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm font-semibold text-brand-neon">{progress}%</span>
      </div>
      <Progress
        value={progress}
        className="h-2"
        classNames={{
          indicator: "bg-gradient-to-r from-brand-neon to-brand-violet"
        }}
      />
    </div>
  );
}
```

### 7.5 Verification Badge (Premium Component)

```tsx
// components/ui/verified-badge.tsx
import { motion } from 'framer-motion';

export function VerifiedBadge() {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-success/10 border border-success/30"
    >
      <svg 
        className="w-4 h-4 text-success" 
        viewBox="0 0 20 20" 
        fill="currentColor"
      >
        <path 
          fillRule="evenodd" 
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
          clipRule="evenodd" 
        />
      </svg>
      <span className="text-sm font-semibold text-success">Vetted by RealEST</span>
    </motion.div>
  );
}
```

### 7.6 Alert Banners (UntitledUI)

```tsx
// components/ui/alert-banner.tsx
import { Alert, AlertDescription, AlertTitle } from '@/components/ui-untitled/alert';
import { X } from 'lucide-react';

interface AlertBannerProps {
  variant: 'info' | 'success' | 'warning' | 'error';
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  dismissible?: boolean;
  onDismiss?: () => void;
}

export function AlertBanner({ 
  variant, 
  title, 
  description, 
  action,
  dismissible,
  onDismiss 
}: AlertBannerProps) {
  return (
    <Alert variant={variant} className="relative">
      <AlertTitle className="font-heading font-semibold">{title}</AlertTitle>
      <AlertDescription className="font-body text-sm mt-1">
        {description}
      </AlertDescription>
      
      {action && (
        <button
          onClick={action.onClick}
          className="mt-3 text-sm font-semibold underline underline-offset-2"
        >
          {action.label}
        </button>
      )}
      
      {dismissible && (
        <button
          onClick={onDismiss}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </Alert>
  );
}

// Usage
<AlertBanner
  variant="warning"
  title="Document clarification needed"
  description="We need additional information about your Certificate of Occupancy. Please upload a clearer photo showing the registration number."
  action={{
    label: "Upload new document",
    onClick: () => router.push('/dashboard/documents')
  }}
  dismissible
  onDismiss={() => setShowAlert(false)}
/>
```

---

## 8. Responsive Design Tokens

### 8.1 Breakpoint System

```css
:root {
  /* BREAKPOINT TOKENS */
  --breakpoint-xs: 375px;   /* Mobile small */
  --breakpoint-sm: 640px;   /* Mobile large */
  --breakpoint-md: 768px;   /* Tablet */
  --breakpoint-lg: 1024px;  /* Desktop */
  --breakpoint-xl: 1280px;  /* Desktop large */
  --breakpoint-2xl: 1536px; /* Desktop extra large */
}
```

### 8.2 Responsive Typography Classes

```css
/* HEADING RESPONSIVE CLASSES */
.heading-display {
  font-family: var(--font-display);
  font-size: var(--text-4xl);
  font-weight: 600;
  line-height: 1.1;
  letter-spacing: -0.02em;
}

@media (min-width: 768px) {
  .heading-display {
    font-size: var(--text-5xl);
  }
}

@media (min-width: 1024px) {
  .heading-display {
    font-size: var(--text-6xl);
  }
}

.heading-page {
  font-family: var(--font-heading);
  font-size: var(--text-2xl);
  font-weight: 700;
  line-height: 1.25;
}

@media (min-width: 768px) {
  .heading-page {
    font-size: var(--text-3xl);
  }
}

.body-text {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  line-height: 1.6;
}

@media (min-width: 768px) {
  .body-text {
    font-size: var(--text-base);
  }
}

@media (min-width: 1024px) {
  .body-text {
    font-size: var(--text-lg);
  }
}
```

### 8.3 Responsive Component Patterns

#### Property Card Grid
```tsx
// components/property-grid.tsx
<div className="
  grid
  grid-cols-1
  sm:grid-cols-2
  lg:grid-cols-3
  xl:grid-cols-4
  gap-4
  sm:gap-6
  lg:gap-8
">
  {properties.map(property => (
    <PropertyCard key={property.id} {...property} />
  ))}
</div>
```

#### Responsive Form Layout
```tsx
// components/listing-form.tsx
<form className="space-y-8">
  {/* Two-column layout on desktop */}
  <div className="
    grid
    grid-cols-1
    md:grid-cols-2
    gap-6
  ">
    <Input label="Property Title" />
    <Select label="Property Type" />
  </div>
  
  {/* Three-column layout on larger screens */}
  <div className="
    grid
    grid-cols-1
    sm:grid-cols-2
    lg:grid-cols-3
    gap-4
  ">
    <Input label="Bedrooms" type="number" />
    <Input label="Bathrooms" type="number" />
    <Input label="Square Feet" type="number" />
  </div>
</form>
```

### 8.4 Mobile-First Component Adjustments

```css
/* BUTTON RESPONSIVE SIZING */
.button-primary {
  padding: var(--space-3) var(--space-4); /* Mobile: 12px 16px */
  font-size: var(--text-sm);
}

@media (min-width: 768px) {
  .button-primary {
    padding: var(--space-3.5) var(--space-6); /* Tablet: 14px 24px */
    font-size: var(--text-base);
  }
}

/* MODAL RESPONSIVE SIZING */
.modal-content {
  width: calc(100vw - var(--space-4)); /* Mobile: Full width - padding */
  max-height: calc(100vh - var(--space-8));
  border-radius: var(--radius-xl);
}

@media (min-width: 640px) {
  .modal-content {
    width: 90vw;
    max-width: 600px;
  }
}

@media (min-width: 1024px) {
  .modal-content {
    max-width: 800px;
    border-radius: var(--radius-2xl);
  }
}

/* NAVIGATION RESPONSIVE */
.navbar {
  padding: var(--space-4); /* Mobile */
}

@media (min-width: 768px) {
  .navbar {
    padding: var(--space-6) var(--space-8); /* Desktop */
  }
}
```

---

## 9. Implementation Roadmap

### 9.1 Phase 1: Design Token Foundation (Week 1)

**Tasks:**
1. **Color System Setup**
   - Implement OKLCH color tokens in `globals.css`
   - Create color utility classes
   - Test dark mode compatibility
   - Document color usage guidelines

2. **Typography Configuration**
   - Load custom fonts (Space Grotesk, Neulis Neue, JetBrains Mono, Lufga)
   - Implement fluid type scale
   - Create typography utility classes
   - Test across devices

3. **Spacing & Layout Tokens**
   - Define spacing scale in CSS variables
   - Create container system
   - Implement responsive padding/margin utilities

**Deliverables:**
- `app/globals.css` with complete token system
- `tailwind.config.ts` updated with custom theme
- Typography specimen page for testing

### 9.2 Phase 2: Component Library Integration (Week 2-3)

**Tasks:**
1. **HeroUI Setup (Primary Library)**
   - Install and configure HeroUI with custom theme
   - Create wrapper components for common patterns
   - Implement:
     - Navigation (Navbar, Sidebar)
     - Forms (Input, Select, Textarea, Checkbox)
     - Buttons (Primary, Secondary, Ghost variants)
     - Cards (Property card, feature card)
     - Modals and Drawers

2. **UntitledUI Integration (Status Components)**
   - Install UntitledUI badge and alert components
   - Create custom badge variants for property statuses
   - Implement alert banner system
   - Create status dot and pill components

3. **Shadcn Retention (Specialized Components)**
   - Keep Command Palette for search
   - Keep Combobox for location autocomplete
   - Keep Context Menu for property actions

**Deliverables:**
- Component library documentation
- Storybook/component gallery
- Usage guidelines for when to use each library

### 9.3 Phase 3: Core UI Patterns (Week 4-5)

**Tasks:**
1. **Property Card Component**
   ```tsx
   - Image with gradient overlay
   - Property type pill
   - Verification badge
   - Price display with formatting
   - Key specs (beds, baths, sqft)
   - Location with map pin
   - Favorite button
   - Hover animations
   ```

2. **Status & Progress Components**
   - Verification progress tracker
   - Property status badges
   - Availability indicators
   - Timeline component for vetting process

3. **Form Patterns**
   - Multi-step property listing form
   - File upload with preview
   - Location input with geocoding
   - Price input with currency formatting
   - Rich text editor for descriptions

**Deliverables:**
- Property card component family
- Form component library
- Status display components

### 9.4 Phase 4: Page Templates (Week 6-7)

**Tasks:**
1. **Homepage**
   - Hero section with gradient typography
   - Featured properties grid
   - How it works section
   - Trust indicators (verification process)
   - CTA sections

2. **Property Listing Page**
   - Filter sidebar
   - Grid/List view toggle
   - Map view integration
   - Pagination
   - Sort options
   - Active filters display

3. **Property Details Page**
   - Image gallery with lightbox
   - Property information sections
   - Map with exact location
   - Inquiry form
   - Similar properties
   - Verification badge prominent display

4. **Dashboard**
   - Owner dashboard (manage listings)
   - Admin validation queue
   - Analytics cards
   - Inquiry inbox
   - Profile management

**Deliverables:**
- Complete page templates
- Responsive layouts tested
- Animation and interaction patterns

### 9.5 Phase 5: Microinteractions & Polish (Week 8)

**Tasks:**
1. **Animation Library**
   - Page transitions
   - Card hover effects
   - Button interactions
   - Loading states
   - Success/error animations

2. **Empty States**
   - Illustrations for all empty states
   - Actionable CTAs
   - Helpful guidance text

3. **Accessibility Audit**
   - Keyboard navigation
   - Screen reader testing
   - Color contrast validation
   - Focus management
   - ARIA labels

4. **Performance Optimization**
   - Image optimization
   - Font loading strategy
   - Code splitting
   - Lazy loading

**Deliverables:**
- Animation documentation
- Accessibility compliance report
- Performance audit results

---

## 10. Design System Governance

### 10.1 Component Decision Tree

```
Need a new component?
│
├─ Is it for navigation or layout?
│  └─ YES → Use HeroUI
│      (Navbar, Sidebar, Tabs, Breadcrumbs)
│
├─ Is it for displaying property status/state?
│  └─ YES → Use UntitledUI
│      (Badges, Status Dots, Alert Banners)
│
├─ Is it for forms and data input?
│  └─ YES → Use HeroUI
│      (Input, Select, Checkbox, Radio, DatePicker)
│
├─ Is it for specialized search/command functionality?
│  └─ YES → Use Shadcn
│      (Command Palette, Combobox, Context Menu)
│
└─ Is it custom to RealEST business logic?
   └─ YES → Build custom component
       (Property Card, Verification Progress, Owner Dashboard widgets)
```

### 10.2 Quality Checklist for New Components

**Before adding any component, ensure:**

✅ **Accessibility**
- Keyboard navigable
- Proper ARIA labels
- Focus visible states
- Screen reader compatible
- Color contrast meets WCAG AA

✅ **Responsiveness**
- Works on mobile (375px)
- Adapts to tablet (768px)
- Optimized for desktop (1024px+)
- Touch-friendly hit areas (44px min)

✅ **Brand Alignment**
- Uses design tokens (colors, spacing, typography)
- Matches border radius system
- Consistent shadow usage
- Brand voice in microcopy

✅ **Performance**
- Lazy loads when appropriate
- Optimized re-renders
- No layout shift
- Smooth animations (60fps)

✅ **Documentation**
- Props documented
- Usage examples provided
- Dos and don'ts listed
- Added to component gallery

### 10.3 File Structure

```
realest-marketplace/
├── app/
│   ├── globals.css          # Design tokens, base styles
│   ├── (marketing)/         # Public pages
│   └── (dashboard)/         # Authenticated pages
│
├── components/
│   ├── ui/                  # Base UI components
│   │   ├── hero/            # HeroUI wrappers
│   │   ├── untitled/        # UntitledUI components
│   │   └── shadcn/          # Shadcn retained components
│   │
│   ├── property/            # Property-specific components
│   │   ├── property-card.tsx
│   │   ├── property-grid.tsx
│   │   ├── property-filters.tsx
│   │   └── verification-badge.tsx
│   │
│   ├── forms/               # Form components
│   │   ├── listing-form/
│   │   ├── inquiry-form.tsx
│   │   └── search-form.tsx
│   │
│   └── layout/              # Layout components
│       ├── navbar.tsx
│       ├── footer.tsx
│       └── sidebar.tsx
│
├── lib/
│   ├── utils.ts             # Utility functions (cn, formatters)
│   └── constants.ts         # App constants
│
└── styles/
    └── design-tokens.css    # Extracted tokens for reference
```

---

## 11. Brand Applications

### 11.1 Hero Section Example

```tsx
// components/hero-section.tsx
export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gray-950 py-20 md:py-32">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-linear-to-br from-gray-900 via-gray-950 to-gray-900" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--brand-violet-muted),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,var(--brand-neon-muted),transparent_50%)]" />
      
      <div className="container relative z-10">
        <div className="mx-auto max-w-4xl text-center">
          {/* Eyebrow with status indicator */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-brand-neon/10 border border-brand-neon/30 px-4 py-2">
            <StatusDot status="available" showLabel={false} />
            <span className="text-sm font-semibold text-brand-neon">
              Nigeria's Most Trusted Property Marketplace
            </span>
          </div>
          
          {/* Main heading with gradient */}
          <h1 className="heading-display mb-6 bg-linear-to-r from-white via-gray-100 to-brand-neon bg-clip-text text-transparent">
            Find Your Perfect Property,
            <br />
            <span className="text-brand-neon">Verified & Trusted</span>
          </h1>
          
          {/* Description */}
          <p className="body-large mx-auto mb-10 max-w-2xl text-gray-300">
            Every property on RealEST is verified through AI document scanning and 
            physical on-site vetting. No duplicates. No fraud. Just authentic listings 
            you can trust.
          </p>
          
          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="
                bg-brand-neon hover:bg-brand-neon-hover
                text-gray-900 font-semibold
                shadow-neon-md hover:shadow-neon-lg
                transition-all duration-200
                hover:scale-105
                w-full sm:w-auto
              "
            >
              Explore Verified Properties
            </Button>
            
            <Button
              size="lg"
              variant="bordered"
              className="
                border-2 border-brand-violet
                text-brand-violet hover:bg-brand-violet-muted
                font-medium
                w-full sm:w-auto
              "
            >
              List Your Property
            </Button>
          </div>
          
          {/* Trust indicators */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <VerifiedBadge />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-brand-neon">500+</span>
              <span>Verified Properties</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-brand-neon">98%</span>
              <span>Customer Satisfaction</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

### 11.2 Property Card Example

```tsx
// components/property/property-card.tsx
import { Card } from '@heroui/react';
import { Heart, MapPin, Bed, Bath, Square } from 'lucide-react';
import { PropertyPill } from '@/components/ui/property-pill';
import { VerifiedBadge } from '@/components/ui/verified-badge';
import { formatCurrency } from '@/lib/utils';

interface PropertyCardProps {
  id: string;
  title: string;
  price: number;
  location: string;
  type: 'sale' | 'rent' | 'lease';
  bedrooms: number;
  bathrooms: number;
  area: number;
  imageUrl: string;
  isVerified: boolean;
  isFavorited: boolean;
  onFavoriteToggle: (id: string) => void;
}

export function PropertyCard({
  id,
  title,
  price,
  location,
  type,
  bedrooms,
  bathrooms,
  area,
  imageUrl,
  isVerified,
  isFavorited,
  onFavoriteToggle
}: PropertyCardProps) {
  return (
    <Card
      isPressable
      className="
        group
        relative
        overflow-hidden
        border-0
        bg-white
        shadow-sm hover:shadow-xl
        transition-all duration-300
        hover:-translate-y-1
      "
    >
      {/* Image container */}
      <div className="relative h-56 overflow-hidden bg-gray-200">
        <img
          src={imageUrl}
          alt={title}
          className="
            h-full w-full object-cover
            transition-transform duration-500
            group-hover:scale-110
          "
        />
        
        {/* Gradient overlay */}
        <div className="
          absolute inset-0
          bg-linear-to-t from-gray-900/60 via-transparent to-transparent
          opacity-0 group-hover:opacity-100
          transition-opacity duration-300
        " />
        
        {/* Top badges */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
          <PropertyPill type={type} size="sm" />
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFavoriteToggle(id);
            }}
            className="
              rounded-full bg-white/90 backdrop-blur-sm p-2
              hover:bg-white transition-colors
              shadow-sm
            "
          >
            <Heart
              className={cn(
                "w-4 h-4 transition-colors",
                isFavorited ? "fill-red-500 text-red-500" : "text-gray-700"
              )}
            />
          </button>
        </div>
        
        {/* Verified badge */}
        {isVerified && (
          <div className="absolute bottom-3 left-3">
            <div className="
              inline-flex items-center gap-1.5
              px-2.5 py-1
              rounded-full
              bg-white/95 backdrop-blur-sm
              border border-success/20
              shadow-sm
            ">
              <svg className="w-3.5 h-3.5 text-success" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-xs font-semibold text-success">Vetted</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-5 space-y-4">
        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-heading text-gray-900">
            {formatCurrency(price, 'NGN')}
          </span>
          {type === 'rent' && (
            <span className="text-sm text-gray-500 font-body">/month</span>
          )}
        </div>
        
        {/* Title */}
        <h3 className="
          font-heading font-semibold text-lg text-gray-900
          line-clamp-2
          group-hover:text-brand-neon
          transition-colors
        ">
          {title}
        </h3>
        
        {/* Location */}
        <div className="flex items-center gap-2 text-gray-600">
          <MapPin className="w-4 h-4 shrink-0" />
          <span className="text-sm font-body truncate">{location}</span>
        </div>
        
        {/* Specs */}
        <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-1.5">
            <Bed className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">{bedrooms}</span>
          </div>
          
          <div className="flex items-center gap-1.5">
            <Bath className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">{bathrooms}</span>
          </div>
          
          <div className="flex items-center gap-1.5">
            <Square className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">
              {area.toLocaleString()} sqft
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
```

### 11.3 Verification Status Component

```tsx
// components/property/verification-status.tsx
import { Badge } from '@/components/ui-untitled/badge';
import { AlertBanner } from '@/components/ui/alert-banner';
import { VerificationProgress } from '@/components/ui/verification-progress';

interface VerificationStatusProps {
  status: 'pending_ml_validation' | 'pending_vetting' | 'live' | 'rejected' | 'pending_duplicate_review';
  mlConfidence?: number;
  rejectionReason?: string;
  estimatedCompletionDate?: string;
}

export function VerificationStatus({
  status,
  mlConfidence,
  rejectionReason,
  estimatedCompletionDate
}: VerificationStatusProps) {
  const statusConfig = {
    pending_ml_validation: {
      stage: 'ml_validation',
      title: 'Document Verification in Progress',
      description: 'Our AI is analyzing your property documents for authenticity',
      variant: 'info' as const,
      showProgress: true
    },
    pending_vetting: {
      stage: 'physical_vetting',
      title: 'Physical Vetting Scheduled',
      description: `Our team will visit your property by ${estimatedCompletionDate || 'this week'}`,
      variant: 'warning' as const,
      showProgress: true
    },
    live: {
      stage: 'complete',
      title: 'Your Property is Live! 🎉',
      description: 'Your verified listing is now visible to potential buyers',
      variant: 'success' as const,
      showProgress: true,
      action: {
        label: 'View your listing',
        onClick: () => window.open(`/properties/${id}`, '_blank')
      }
    },
    rejected: {
      stage: 'submission',
      title: 'Additional Information Required',
      description: rejectionReason || 'We need clarification on some details',
      variant: 'error' as const,
      showProgress: false,
      action: {
        label: 'Review feedback & update',
        onClick: () => router.push('/dashboard/listings/edit')
      }
    },
    pending_duplicate_review: {
      stage: 'ml_validation',
      title: 'Duplicate Check in Progress',
      description: 'We found a similar listing and are verifying your property is unique',
      variant: 'warning' as const,
      showProgress: true
    }
  };

  const config = statusConfig[status];

  return (
    <div className="space-y-6">
      {/* Alert banner */}
      <AlertBanner
        variant={config.variant}
        title={config.title}
        description={config.description}
        action={config.action}
      />
      
      {/* Progress indicator */}
      {config.showProgress && (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h4 className="font-heading font-semibold text-gray-900 mb-4">
            Verification Progress
          </h4>
          <VerificationProgress stage={config.stage} />
          
          {/* ML Confidence score */}
          {mlConfidence && status === 'pending_ml_validation' && (
            <div className="mt-6 flex items-center justify-between p-4 rounded-lg bg-gray-50">
              <span className="text-sm font-medium text-gray-700">
                Document Confidence Score
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-lg font-bold text-brand-neon">
                  {mlConfidence}%
                </span>
                {mlConfidence >= 90 && (
                  <Badge variant="subtle" color="success" size="sm">
                    High Confidence
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Timeline */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h4 className="font-heading font-semibold text-gray-900 mb-4">
          What's Next?
        </h4>
        <VerificationTimeline currentStatus={status} />
      </div>
    </div>
  );
}
```

### 11.4 Search Bar with Filters

```tsx
// components/search/property-search.tsx
import { Input, Select, Button } from '@heroui/react';
import { Search, MapPin, Home, DollarSign } from 'lucide-react';
import { Command } from '@/components/ui/shadcn/command'; // Shadcn for advanced search

export function PropertySearch() {
  return (
    <div className="w-full">
      {/* Main search bar */}
      <div className="
        relative
        rounded-2xl
        bg-white
        shadow-xl
        border border-gray-200
        p-2
        flex flex-col lg:flex-row
        gap-2
      ">
        {/* Location input with autocomplete */}
        <div className="flex-1 relative">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Enter location (e.g., Lekki, Victoria Island)"
            className="pl-12 border-0 bg-gray-50 focus:bg-white"
            size="lg"
          />
        </div>
        
        {/* Property type */}
        <Select
          placeholder="Property Type"
          className="lg:w-48 border-0 bg-gray-50"
          size="lg"
        >
          <option value="all">All Types</option>
          <option value="house">Houses</option>
          <option value="apartment">Apartments</option>
          <option value="land">Land</option>
          <option value="commercial">Commercial</option>
        </Select>
        
        {/* Price range */}
        <Select
          placeholder="Price Range"
          className="lg:w-48 border-0 bg-gray-50"
          size="lg"
        >
          <option value="all">Any Price</option>
          <option value="0-10m">Under ₦10M</option>
          <option value="10m-50m">₦10M - ₦50M</option>
          <option value="50m-100m">₦50M - ₦100M</option>
          <option value="100m+">Over ₦100M</option>
        </Select>
        
        {/* Search button */}
        <Button
          className="
            bg-brand-neon hover:bg-brand-neon-hover
            text-gray-900 font-semibold
            shadow-neon-sm hover:shadow-neon-md
            transition-all
            lg:w-auto w-full
          "
          size="lg"
        >
          <Search className="w-5 h-5" />
          Search Properties
        </Button>
      </div>
      
      {/* Advanced filters toggle */}
      <div className="mt-4 flex items-center justify-between">
        <button className="
          text-sm font-medium text-brand-violet
          hover:text-brand-violet-hover
          flex items-center gap-2
          transition-colors
        ">
          <span>Advanced Filters</span>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <StatusDot status="available" showLabel={false} />
          <span className="font-medium text-brand-neon">2,847</span>
          <span>verified properties</span>
        </div>
      </div>
    </div>
  );
}
```

---

## 12. Animation & Interaction Guidelines

### 12.1 Animation Tokens

```css
:root {
  /* DURATION TOKENS */
  --duration-instant: 0ms;
  --duration-fast: 150ms;
  --duration-base: 200ms;
  --duration-moderate: 300ms;
  --duration-slow: 500ms;
  --duration-slower: 700ms;
  
  /* EASING FUNCTIONS */
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-smooth: cubic-bezier(0.4, 0, 0.6, 1);
}
```

### 12.2 Interaction Patterns

#### Hover States
```css
/* CARDS */
.card-interactive {
  transition: 
    transform var(--duration-base) var(--ease-out),
    box-shadow var(--duration-base) var(--ease-out);
}

.card-interactive:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

/* BUTTONS */
.button-primary {
  transition: 
    background-color var(--duration-fast) var(--ease-out),
    box-shadow var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-spring);
}

.button-primary:hover {
  transform: scale(1.02);
  box-shadow: var(--shadow-neon-md);
}

.button-primary:active {
  transform: scale(0.98);
}

/* LINKS */
.link-underline {
  position: relative;
}

.link-underline::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--brand-neon);
  transition: width var(--duration-base) var(--ease-out);
}

.link-underline:hover::after {
  width: 100%;
}
```

#### Focus States
```css
/* KEYBOARD FOCUS */
*:focus-visible {
  outline: 3px solid var(--brand-neon);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}

/* FORM INPUTS */
.input-field:focus {
  border-color: var(--brand-neon);
  box-shadow: 0 0 0 3px var(--brand-neon-muted);
  transition: 
    border-color var(--duration-fast) var(--ease-out),
    box-shadow var(--duration-fast) var(--ease-out);
}
```

#### Loading States
```tsx
// components/ui/skeleton-loader.tsx
export function PropertyCardSkeleton() {
  return (
    <div className="animate-pulse space-y-4 rounded-xl border border-gray-200 bg-white p-5">
      {/* Image skeleton */}
      <div className="h-56 rounded-lg bg-gray-200" />
      
      {/* Content skeleton */}
      <div className="space-y-3">
        <div className="h-4 w-20 rounded bg-gray-200" />
        <div className="h-6 w-3/4 rounded bg-gray-200" />
        <div className="h-4 w-1/2 rounded bg-gray-200" />
        <div className="flex gap-4 pt-4">
          <div className="h-4 w-16 rounded bg-gray-200" />
          <div className="h-4 w-16 rounded bg-gray-200" />
          <div className="h-4 w-20 rounded bg-gray-200" />
        </div>
      </div>
    </div>
  );
}
```

### 12.3 Page Transitions

```tsx
// components/layout/page-transition.tsx
import { motion, AnimatePresence } from 'framer-motion';

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 1, 1]
    }
  }
};

export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
```

---

## 13. Accessibility Standards

### 13.1 Color Contrast Requirements

```css
/* WCAG AA COMPLIANT TEXT COLORS */
:root {
  /* On white backgrounds */
  --text-aa-white-bg: var(--gray-700);     /* 4.5:1 contrast ratio */
  --heading-aa-white-bg: var(--gray-900);  /* 7:1 contrast ratio */
  
  /* On dark backgrounds */
  --text-aa-dark-bg: var(--gray-100);      /* 7:1 contrast ratio */
  --heading-aa-dark-bg: oklch(0.99 0 0);   /* Maximum contrast */
  
  /* Acid Green on dark (accessible variant) */
  --accent-aa-dark: oklch(0.89 0.24 128);  /* 7:1 on #07402F */
  
  /* Neon on light (accessible variant) */
  --neon-aa-light: oklch(0.45 0.20 130);   /* 4.5:1 on white */
}
```

### 13.2 Keyboard Navigation

```tsx
// Example: Accessible dropdown menu
import { Menu, MenuButton, MenuItem } from '@heroui/react';

export function AccessibleMenu() {
  return (
    <Menu>
      <MenuButton
        aria-label="Property options"
        className="focus-visible:outline-2 focus-visible:outline-brand-neon"
      >
        Options
      </MenuButton>
      
      <MenuItem
        key="edit"
        onAction={() => handleEdit()}
        className="focus:bg-brand-neon-muted focus:text-gray-900"
      >
        Edit Property
      </MenuItem>
      
      <MenuItem
        key="delete"
        onAction={() => handleDelete()}
        color="danger"
        className="focus:bg-danger-bg"
      >
        Delete Property
      </MenuItem>
    </Menu>
  );
}
```

### 13.3 ARIA Labels & Screen Reader Support

```tsx
// components/property/property-card-accessible.tsx
export function PropertyCardAccessible({ property }: { property: Property }) {
  return (
    <article
      aria-label={`${property.title} - ${formatCurrency(property.price)}`}
      className="property-card"
    >
      <img
        src={property.imageUrl}
        alt={`Exterior view of ${property.title}`}
        loading="lazy"
      />
      
      {property.isVerified && (
        <div
          role="status"
          aria-label="This property has been verified by RealEST"
        >
          <VerifiedBadge />
        </div>
      )}
      
      <button
        onClick={handleFavorite}
        aria-label={
          isFavorited
            ? `Remove ${property.title} from favorites`
            : `Add ${property.title} to favorites`
        }
        aria-pressed={isFavorited}
      >
        <Heart className={cn(isFavorited && "fill-current")} />
      </button>
      
      <div className="property-specs" role="list">
        <div role="listitem" aria-label={`${property.bedrooms} bedrooms`}>
          <Bed aria-hidden="true" />
          <span>{property.bedrooms}</span>
        </div>
        {/* More specs... */}
      </div>
    </article>
  );
}
```

---

## 14. Performance Guidelines

### 14.1 Image Optimization

```tsx
// components/ui/optimized-image.tsx
import Image from 'next/image';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

export function OptimizedImage({
  src,
  alt,
  width = 800,
  height = 600,
  priority = false
}: OptimizedImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      className="object-cover"
      quality={85}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRg..." // Tiny base64 placeholder
    />
  );
}
```

### 14.2 Code Splitting Strategy

```tsx
// Lazy load heavy components
const PropertyMap = dynamic(() => import('@/components/property/property-map'), {
  loading: () => <MapSkeleton />,
  ssr: false // Don't render on server
});

const VirtualTour = dynamic(() => import('@/components/property/virtual-tour'), {
  loading: () => <TourSkeleton />
});

// Usage
export function PropertyDetails() {
  return (
    <>
      {/* Critical content loads immediately */}
      <PropertyHero />
      <PropertyInfo />
      
      {/* Heavy components load on demand */}
      <Suspense fallback={<MapSkeleton />}>
        <PropertyMap />
      </Suspense>
      
      <Suspense fallback={<TourSkeleton />}>
        <VirtualTour />
      </Suspense>
    </>
  );
}
```

---

## 15. Final Recommendations

### 15.1 Design System Maintenance

**Quarterly Reviews:**
- Audit component usage across the app
- Identify and consolidate duplicate patterns
- Update documentation with new patterns
- Performance benchmarking

**Version Control:**
- Tag design system releases (v1.0, v1.1, etc.)
- Maintain changelog of design token updates
- Deprecation warnings for old patterns

### 15.2 Team Adoption

**Developer Onboarding:**
- Component playground/Storybook
- Design token reference sheet
- Video tutorials for complex patterns
- Pair programming sessions

**Design-Dev Handoff:**
- Figma with design tokens plugin
- Component specs with code examples
- Interactive prototypes
- Regular sync meetings

### 15.3 Success Metrics

**Track:**
- Component reuse rate (target: 80%+)
- Design consistency score
- Page load performance
- Accessibility audit scores (target: WCAG AA)
- Developer satisfaction surveys

---

## Conclusion

This comprehensive design system for **RealEST (www.realest.ng)** provides:

✅ **Conservative professional palette** with 60% dark foundation, 30% violet accent, 10% neon highlights  
✅ **Sophisticated typography** with 4 custom typefaces and fluid scaling  
✅ **Strategic component library** prioritizing HeroUI (70%), UntitledUI (25%), Shadcn (5%)  
✅ **Consistent spacing** with 4px base unit system  
✅ **Minimal border design** emphasizing shadows and color contrast  
✅ **Engaging microcopy** with actionable CTAs and helpful guidance  
✅ **Comprehensive status patterns** for property verification workflow  
✅ **Accessible & performant** following WCAG AA standards  

The system is designed to scale with RealEST's growth while maintaining the trust, professionalism, and sophistication required for Nigeria's premier verified property marketplace.