# Design System & Branding Guidelines

## Brand Philosophy: "Subtle Power, Verifiable Impact"

RealEST's visual identity communicates **trust through verification** using a Conservative Professional Palette that balances:
- Natural authority (Dark Green foundation)
- Professional restraint (Deep Neutral hierarchy)  
- Verified authenticity (Acid Green verification signal)

### Core Brand Pillars
1. **Trust** - Every element reinforces verification and authenticity
2. **Modernity** - Contemporary design without sacrificing professionalism
3. **Efficiency** - Clear hierarchy, scannable content, action-oriented
4. **Authority** - Premium quality signals through subtle sophistication
5. **Accessibility** - WCAG 2.1 AA compliance, inclusive design

## Color System (60-30-10 Rule)

### Primary Colors (OKLCH Format)

```css
/* 60% FOUNDATION - Primary Dark */
--brand-dark: oklch(0.30 0.06 165);     /* #07402F */
--brand-dark-hover: oklch(0.35 0.06 165);
--brand-dark-pressed: oklch(0.25 0.06 165);

/* 30% SECONDARY - Primary Neutral */
--brand-neutral: oklch(0.26 0.01 155);  /* #2E322E */
--brand-neutral-hover: oklch(0.30 0.01 155);
--brand-neutral-muted: oklch(0.26 0.01 155 / 0.12);
--brand-neutral-border: oklch(0.26 0.01 155 / 0.25);

/* 10% ACCENT - Primary Accent (Acid Green) */
--brand-accent: oklch(0.89 0.24 128);   /* #ADF434 */
--brand-accent-hover: oklch(0.85 0.24 128);
--brand-accent-muted: oklch(0.89 0.24 128 / 0.15);
--brand-accent-border: oklch(0.89 0.24 128 / 0.3);
```

### Color Usage Guidelines

#### Primary Dark (#07402F) - 60% Usage
**Brand Essence**: Natural authority, environmental consciousness, premium trustworthiness

✅ **Use For:**
- Main backgrounds (dark mode)
- Navigation bars
- Footer sections
- Card containers (dark mode)
- Hero section overlays
- Primary heading text (light mode)
- Property detail page headers

❌ **Avoid:**
- Small text on dark backgrounds
- CTAs (use Acid Green instead)
- Form inputs (use neutral grays)

**Nigerian Context**: Green symbolizes national pride, progress, agriculture - creates immediate cultural resonance

#### Primary Neutral (#2E322E) - 30% Usage
**Brand Essence**: Sophisticated restraint, professional maturity, content hierarchy

✅ **Use For:**
- Body text (light mode)
- Secondary information
- Form labels
- Borders and dividers
- Card backgrounds (light mode)
- Disabled states
- Secondary buttons

❌ **Avoid:**
- Primary CTAs
- Success states (use semantic colors)
- Hero headlines

**UX Benefit**: Provides excellent readability hierarchy without coldness of pure grays

#### Primary Accent (#ADF434) - 10% Usage ⚠️
**Brand Essence**: Verification signal, growth, success, active status

✅ **Use For (SPARINGLY):**
- Primary CTAs ("List Property", "Find Verified Properties")
- "RealEST Verified ✓" badge
- Success states and confirmations
- Active navigation items
- Key progress indicators
- Form submit buttons
- Real-time status indicators

❌ **Never Use For:**
- Backgrounds (too vibrant)
- Body text (readability issues)
- Large UI sections
- More than 10% of visible UI

**Critical Rule**: If more than 2-3 elements on screen use Acid Green, you're overusing it.

### Semantic Colors (System Feedback)

```css
/* Success (Property Verified) */
--success: oklch(0.70 0.18 145);
--success-bg: oklch(0.70 0.18 145 / 0.12);
--success-border: oklch(0.70 0.18 145 / 0.3);

/* Warning (Pending Review) */
--warning: oklch(0.78 0.18 80);
--warning-bg: oklch(0.78 0.18 80 / 0.12);
--warning-border: oklch(0.78 0.18 80 / 0.3);

/* Danger (Rejected/Error) */
--danger: oklch(0.60 0.22 25);
--danger-bg: oklch(0.60 0.22 25 / 0.12);
--danger-border: oklch(0.60 0.22 25 / 0.3);

/* Info (Informational) */
--info: oklch(0.65 0.15 240);
--info-bg: oklch(0.65 0.15 240 / 0.12);
--info-border: oklch(0.65 0.15 240 / 0.3);
```

**Usage**:
- `--success`: Property status "live", document approved
- `--warning`: Property status "pending_vetting", ML review required
- `--danger`: Property rejected, validation failed
- `--info`: Informational tooltips, help text

### Extended Grayscale (Derived from Primary Dark)

```css
/* Maintains color harmony by deriving from #07402F */
--gray-50: oklch(0.98 0.005 155);   /* Off-White with green tint */
--gray-100: oklch(0.95 0.008 155);  /* Very light gray-green */
--gray-200: oklch(0.88 0.012 155);  /* Light gray-green */
--gray-300: oklch(0.78 0.015 155);  /* Medium light */
--gray-400: oklch(0.65 0.018 155);  /* Medium */
--gray-500: oklch(0.52 0.020 155);  /* True middle gray */
--gray-600: oklch(0.42 0.022 155);  /* Medium dark */
--gray-700: oklch(0.32 0.025 155);  /* Dark */
--gray-800: oklch(0.26 0.015 155);  /* Deep neutral */
--gray-900: oklch(0.18 0.020 155);  /* Very dark */
--gray-950: oklch(0.15 0.025 155);  /* Deepest */
```

## Typography System (4-Tier Architecture)

### Font Families & Their Purpose

```css
/* Display - Lufga (600 weight only) */
--font-display: 'Lufga', 'Playfair Display', serif;
/* Use: Hero headlines, brand moments, landing page impact */

/* Heading - Neulis Neue (700 weight only) */
--font-heading: 'Neulis Neue', 'Space Grotesk', sans-serif;
/* Use: Page titles, section headers, card titles, h1-h6 */

/* Body - Space Grotesk (300-700 variable) */
--font-body: 'Space Grotesk', 'Open Sauce Sans', 'Inter', sans-serif;
/* Use: Paragraphs, descriptions, form labels, UI text */

/* Mono - JetBrains Mono (400-700 variable) */
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
/* Use: Property IDs, coordinates, timestamps, code */
```

### Type Scale (Fluid/Responsive)

```css
/* Mobile → Desktop responsive sizing */
--text-xs: clamp(0.75rem, 0.7rem + 0.25vw, 0.8125rem);     /* 12-13px */
--text-sm: clamp(0.875rem, 0.825rem + 0.25vw, 0.9375rem);  /* 14-15px */
--text-base: clamp(1rem, 0.95rem + 0.25vw, 1.0625rem);     /* 16-17px */
--text-lg: clamp(1.125rem, 1.05rem + 0.375vw, 1.25rem);    /* 18-20px */
--text-xl: clamp(1.25rem, 1.15rem + 0.5vw, 1.5rem);        /* 20-24px */
--text-2xl: clamp(1.5rem, 1.35rem + 0.75vw, 1.875rem);     /* 24-30px */
--text-3xl: clamp(1.875rem, 1.65rem + 1.125vw, 2.5rem);    /* 30-40px */
--text-4xl: clamp(2.25rem, 1.95rem + 1.5vw, 3.125rem);     /* 36-50px */
--text-5xl: clamp(3rem, 2.5rem + 2.5vw, 4.5rem);           /* 48-72px */
--text-6xl: clamp(3.75rem, 3rem + 3.75vw, 6rem);           /* 60-96px */
```

### Typography Usage Examples

```tsx
// Display Typography (Hero Headlines)
<h1 className="font-display text-5xl font-semibold text-primary-dark">
  Find Your Next Move
</h1>

// Heading Typography (Section Titles)
<h2 className="font-heading text-3xl font-bold text-foreground">
  Verified Properties in Lagos
</h2>

// Body Typography (Descriptions)
<p className="font-body text-base text-muted-foreground leading-relaxed">
  This 3-bedroom flat in Lekki features modern amenities including NEPA power backup...
</p>

// Mono Typography (Technical Data)
<span className="font-mono text-sm text-gray-600">
  Property ID: RE-LG-001234
</span>
<span className="font-mono text-xs text-gray-500">
  6.4281° N, 3.4219° E
</span>
```

## Spacing System (4px Base Unit)

```css
/* Scale follows 4px multiples */
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
--space-24: 6rem;     /* 96px */
--space-32: 8rem;     /* 128px */
```

### Component-Specific Spacing
- **Card Padding**: `--space-6` (24px)
- **Form Spacing**: `--space-4` (16px)
- **Section Gaps**: `--space-16` (64px)
- **Button Padding**: `--space-4` horizontal, `--space-3` vertical

## Border Radius & Shadows

### Radius System (Minimal Borders, Emphasis on Shadows)

```css
--radius-xs: 0.25rem;    /* 4px - Small badges */
--radius-sm: 0.375rem;   /* 6px - Tight buttons */
--radius-md: 0.625rem;   /* 10px - Standard buttons */
--radius-lg: 1rem;       /* 16px - Input fields */
--radius-xl: 1.5rem;     /* 24px - Cards (PRIMARY) */
--radius-2xl: 2rem;      /* 32px - Large modals */
--radius-full: 9999px;   /* Circular badges */
```

**Philosophy**: Generous radius creates approachable, modern feel. Cards use `--radius-xl` (24px) for premium aesthetic.

### Shadow System (Elevation Hierarchy)

```css
/* Standard Shadows */
--shadow-xs: 0 1px 2px oklch(0.26 0.08 258 / 0.05);
--shadow-sm: 0 1px 3px oklch(0.26 0.08 258 / 0.1), 0 1px 2px oklch(0.26 0.08 258 / 0.06);
--shadow-md: 0 4px 6px oklch(0.26 0.08 258 / 0.07), 0 2px 4px oklch(0.26 0.08 258 / 0.06);
--shadow-lg: 0 10px 15px oklch(0.26 0.08 258 / 0.1), 0 4px 6px oklch(0.26 0.08 258 / 0.05);
--shadow-xl: 0 20px 25px oklch(0.26 0.08 258 / 0.1), 0 10px 10px oklch(0.26 0.08 258 / 0.04);

/* Colored Shadows (Interactive Elements) */
--shadow-accent: 0 4px 14px oklch(0.89 0.24 128 / 0.25);  /* Acid Green glow */
--shadow-dark: 0 4px 14px oklch(0.30 0.06 165 / 0.25);    /* Dark Green glow */
```

**Usage**:
- Cards: `--shadow-md` default, `--shadow-lg` on hover
- Buttons: `--shadow-sm` default, `--shadow-md` on hover
- Primary CTAs: `--shadow-accent` for subtle glow
- Modals: `--shadow-xl`

## Component Design Patterns

### Button Hierarchy

```tsx
// Primary CTA (Acid Green - Use Sparingly)
<button className="bg-primary text-primary-foreground shadow-accent">
  List Property
</button>

// Secondary Action (Dark Green)
<button className="bg-secondary text-secondary-foreground">
  View Details
</button>

// Tertiary/Ghost (Neutral)
<button className="text-foreground border border-border hover:bg-muted">
  Learn More
</button>
```

### Card Design Philosophy

```tsx
<Card className="rounded-xl shadow-md hover:shadow-lg transition-shadow">
  <CardHeader className="space-y-2">
    <Badge variant="success">RealEST Verified ✓</Badge>
    <CardTitle className="font-heading text-2xl">Property Title</CardTitle>
  </CardHeader>
  <CardContent className="font-body text-muted-foreground">
    Description content...
  </CardContent>
</Card>
```

**Key Principles**:
- Generous padding (`space-6`)
- Large radius (`radius-xl`)
- Subtle shadows (depth without weight)
- Clear hierarchy (badge → title → content)

## Dark Mode Strategy

### Automatic Theme Variables

```css
/* Light Mode (Default) */
:root {
  --background: oklch(0.98 0.005 155);      /* gray-50 */
  --foreground: oklch(0.26 0.01 155);       /* brand-neutral */
  --primary: oklch(0.89 0.24 128);          /* brand-accent */
  --primary-foreground: oklch(0.18 0.020 155); /* gray-900 */
}

/* Dark Mode */
:root[class~="dark"] {
  --background: oklch(0.18 0.020 155);      /* gray-900 */
  --foreground: oklch(0.98 0.005 155);      /* gray-50 */
  --primary: oklch(0.89 0.24 128);          /* brand-accent (unchanged) */
  --primary-foreground: oklch(0.18 0.020 155); /* gray-900 */
}
```

**Implementation**: Use `useRealEstTheme()` hook from `components/providers/realest-theme-provider.tsx`

## Nigerian Market Design Considerations

### Color Cultural Meanings
- **Green**: National color (flag), prosperity, growth, agriculture
- **White**: Peace, unity (flag)
- **Trust indicators**: Green checkmarks, verified badges
- **Avoid**: Overly bright reds (can signal danger/witchcraft in some contexts)

### Typography for Nigerian Audience
- Clear, readable body text (high literacy variance)
- Generous line-height (1.5-1.75)
- Avoid script fonts for critical information
- Support for diacritics (Yoruba, Igbo)

### Infrastructure Status Colors
```tsx
// NEPA/Power Status
<Badge variant="success">Power: Stable</Badge>      // Green
<Badge variant="warning">Power: Intermittent</Badge> // Amber
<Badge variant="danger">Power: No Supply</Badge>     // Red

// Water Status
<Badge variant="info">Borehole Available</Badge>
<Badge variant="success">Public Water</Badge>
```

## Accessibility Requirements (WCAG 2.1 AA)

### Color Contrast Ratios
- **Normal Text** (< 18pt): Minimum 4.5:1
- **Large Text** (≥ 18pt): Minimum 3:1
- **UI Components**: Minimum 3:1

### Acid Green Accessibility Variants
```css
/* For dark backgrounds (white text) */
--accent-text-light: oklch(0.89 0.24 128);  /* Pass: 8.2:1 */

/* For light backgrounds (dark text) */
--accent-text-dark: oklch(0.45 0.20 128);   /* Pass: 4.7:1 */
```

### Focus States
- Visible focus indicators (2px outline)
- High contrast focus rings
- Skip to main content link

## Design System Constants

All tokens centralized in: **`lib/constants/design-system.ts`**

```typescript
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '@/lib/constants/design-system'

// Usage in components
const buttonStyles = {
  padding: `${SPACING.scale[3]} ${SPACING.scale[4]}`,
  borderRadius: RADIUS.component.button,
  boxShadow: SHADOWS.component.button,
}
```

## Reference Files

- **Color Tokens**: `styles/tokens/colors.css`
- **Design Showcase**: `app/(demo)/design-showcase/page.tsx`
- Confluence **Design**: architecture, branding, theme system, form patterns
