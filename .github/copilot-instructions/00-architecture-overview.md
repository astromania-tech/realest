# RealEST Architecture Overview

## System Philosophy

RealEST is Nigeria's first **geo-verified, proof-first property marketplace** built on three foundational pillars:

1. **Immutability** - One physical property = One verified listing (zero duplicates)
2. **Dual-Layer Validation** - ML document verification + Physical on-site vetting
3. **Geospatial Precision** - PostGIS-powered location accuracy with live mapping

## Core Technology Stack

### Frontend Architecture
```
Next.js 16 App Router
├── React 19 (Server Components + Client Components)
├── TypeScript (Strict Mode)
├── Tailwind CSS v4 (@theme inline)
└── Component Strategy (Current vs Target)
    ├── Current (Dec 2025): ~20% HeroUI, ~5% UntitledUI, ~75% Shadcn
    └── Target: 70% HeroUI v3, 25% UntitledUI, 5% Shadcn
```

### Backend & Database
```
Supabase PostgreSQL
├── PostGIS Extension (Geospatial queries)
├── Row-Level Security (RLS) Policies
├── Realtime Subscriptions
├── Storage (Images, Documents)
└── Edge Functions (ML triggers, notifications)
```

### Design System (OKLCH-based)
```
RealEST Conservative Professional Palette
├── Primary Dark (#07402F) - 60% Foundation
├── Primary Neutral (#2E322E) - 30% Secondary
└── Primary Accent (#ADF434) - 10% Acid Green CTAs
```

## Project Structure Philosophy

### Route Groups (App Router)
- **`(auth)/`** - Authentication flows (login, signup, password reset)
- **`(public)/`** - Marketing, landing, search (unauthenticated)
- **`(demo)/`** - Design showcase, form patterns (development only)
- **`(onboarding)/`** - Profile setup post-registration
- **`(dashboard)/`** - Placeholder group (currently minimal/unused)
- **`admin/`** - Admin dashboard (property validation, user management)
- **`user/`** - User-specific features (saved searches, inquiries)
- **`owner/`** - Owner dashboard (listings, analytics)
- **`search/`** - Dedicated search page (live)
- **`realest-status/`** - Status/health page (live)
- **`api/`** - API route handlers

### Component Organization
```
components/
├── realest/          # Custom brand components (Logo, LocationPin)
├── heroui/          # HeroUI v3 wrappers (RealEstButton, RealEstCard)
├── untitledui/      # Status indicators, progress rings
├── providers/       # Theme provider, app mode provider
├── patterns/        # Reusable patterns (SearchBar, PropertyCard)
└── ui/              # Base utilities (Badge, Skeleton)
```

### Library Structure
```
lib/
├── supabase/
│   ├── client.ts       # Browser-safe client
│   ├── server.ts       # Server-side with service role
│   ├── middleware.ts   # Route protection & app mode enforcement
│   └── types.ts        # Auto-generated from DB schema
├── auth.ts             # Authentication utilities
├── app-mode.ts         # Environment-driven feature flags
├── email-service.ts    # Resend integration
└── constants/
    └── design-system.ts # Design token constants
```

## App Mode System (Critical)

### Environment-Driven Configuration
```typescript
NEXT_PUBLIC_APP_MODE determines feature availability:

'coming-soon'  → Marketing only, full route lockdown
'full-site'    → Production with auth, all features
'development'  → Demo pages enabled, full access
'demo'         → Staging/testing mode
```

### Middleware-Enforced Access Control
- All routes validated in `lib/supabase/middleware.ts`
- `isRouteAccessible()` checks current mode
- Protected routes: `/admin`, `/user`, `/owner`, `/(demo)`
- Coming-soon mode: Only `/`, `/not-found` accessible

## Data Flow Architecture

### Property Listing Workflow
```
1. Owner creates listing → status: 'pending_ml_validation'
2. ML service validates documents → status: 'pending_vetting'
3. Admin physically vets property → status: 'live'
4. Property appears in marketplace
```

### Duplicate Prevention Logic
```typescript
// Multi-layer duplicate detection
1. Exact address match check (string equality)
2. Geospatial proximity check (PostGIS ST_DWithin)
3. Image hash comparison (Phase 4 - ML)
4. Textual description similarity (Phase 4 - NLP)
5. Admin manual review queue for flagged duplicates
```

### Authentication Flow
```
Supabase Auth
├── Client-side: lib/supabase/client.ts
├── Server-side: lib/supabase/server.ts
├── users table: role enum (user|owner|agent|admin) — single source of truth
├── profiles table: user metadata (full_name, phone, avatar_url) — NO role column
└── RLS policies enforce row-level access
```

> ⚠️ **Schema Note**: Role is stored on `public.users.role` (UserRole enum), NOT on `profiles.user_type`.
> Always query `users.role` for role checks. `profiles` has no `user_type` column.

## Nigerian Market Context (Critical)

### Localization Requirements
- **Property Types**: BQ (Boys Quarters), Self-contained, Face-me-I-face-you
- **Infrastructure**: NEPA/Power status, Borehole/Water, Internet, Roads
- **Security**: Gated Community, Security Post, CCTV
- **Location**: State/LGA dropdowns (36 states + FCT)
- **Currency**: Naira (₦) formatting
- **Phone**: +234 format validation

### Cultural Considerations
- Green = National color, progress, trust (brand alignment)
- Property ownership verification critical (fraud prevention)
- Extended family considerations (BQ common)
- Infrastructure challenges (NEPA, water) are listing features

## Performance & Optimization

### Font Loading Strategy
```typescript
// Critical fonts preloaded in app/layout.tsx
<link rel="preload" href="/fonts/Lufga-SemiBold.woff2" />
<link rel="preload" href="/fonts/SpaceGrotesk-Variable.woff2" />
```

### Image Optimization
- Supabase Storage with transformations
- Next.js Image component with responsive sizes
- Lazy loading for property galleries

### Code Splitting
- Server Components by default
- Client Components only when needed ('use client')
- Dynamic imports for heavy components

## Security Considerations

### RLS Policies
- `profiles` table: Users can only read/update own profile
- `properties` table: Owners can CRUD own, users can read live only
- `inquiries` table: Sender/receiver can read own
- Admins bypass RLS with service role key (server-side only)

### Environment Variables (Never commit)
```bash
NEXT_PUBLIC_SUPABASE_URL          # Public
NEXT_PUBLIC_SUPABASE_ANON_KEY     # Public
SUPABASE_SERVICE_ROLE_KEY         # SECRET - Server only
RESEND_API_KEY                     # SECRET - Email sending
```

## Development Workflow

### Branch Strategy
```
main      → Production (coming-soon mode)
develop   → Active development (development mode)
staging   → QA testing (full-site mode)
feat/*    → Feature branches (merge to develop)
```

### Critical Commands
```bash
npm run dev                           # Default: full-site
NEXT_PUBLIC_APP_MODE=coming-soon npm run dev
npm run test:lockdown                 # Validate route access
npm run email:preview                 # Preview email templates
supabase db push                      # Apply migrations
supabase gen types typescript         # Regenerate types
```

## Phase Completion Status

### ✅ Phase 1 Complete (Design Foundation)
- OKLCH color system integrated
- 4-tier typography (Lufga, Neulis Neue, Space Grotesk, JetBrains Mono)
- Design token foundation in `lib/constants/design-system.ts`
- Theme provider with light/dark mode

### ✅ Phase 2 Complete (Component Library)
- HeroUI v3 integration (70% usage)
- UntitledUI status components (25% usage)
- RealEST custom components (Logo, Buttons, Cards)
- Nigerian market components (Infrastructure indicators)

### 🚧 Phase 3 In Progress (Features & Integration)
- Advanced search with PostGIS
- Realtime notifications
- Premium listing features
- Analytics dashboards

### 📋 Phase 4 Planned (ML & Automation)
- Automated document validation (OCR, ML)
- Image hash duplicate detection
- Vetting team mobile app
- Transaction tracking & monetization

## Key Architectural Decisions

### Why HeroUI v3 as Primary Library?
- Modern React 19 support
- Built-in accessibility (ARIA)
- Customizable via CSS variables (brand integration)
- Component composition patterns
- Active development & community

### Why OKLCH Color Space?
- Perceptual uniformity (consistent lightness)
- Better dark mode support
- Future-proof (CSS Color Level 4)
- Predictable color manipulation

### Why Supabase Over Traditional Backend?
- PostgreSQL with PostGIS (geospatial native)
- Built-in auth, storage, realtime
- Row-level security (data isolation)
- Faster development (less boilerplate)
- Edge function deployment

### Why Next.js 16 App Router?
- Server Components (performance)
- Streaming SSR
- Route groups (logical organization)
- Built-in optimization (images, fonts)
- Vercel deployment integration

## Integration Points

### Mapbox GL JS (Geolocation)
- Interactive property maps
- Geocoding API (address → coordinates)
- Radius search visualization
- Marker clustering

### Resend (Email Service)
- Waitlist confirmations
- Property status notifications
- Inquiry alerts to owners
- Admin notifications

### Vercel Analytics
- User behavior tracking
- Performance monitoring
- Core Web Vitals

## Anti-Patterns to Avoid

❌ **Never hardcode colors** - Use CSS variables from `styles/tokens/colors.css`
❌ **Don't bypass middleware** - All route protection through `middleware.ts`
❌ **Avoid 'use client' unless needed** - Default to Server Components
❌ **Don't duplicate component wrappers** - Check `components/heroui/` first
❌ **Never commit `.env.local`** - Use `.env.example` as template
❌ **Don't ignore app mode checks** - Use `getAppMode()` for conditional features

## Reference Documentation

- **Design System**: `docs/realest-ng-design-architecture.md`
- **Brand Decisions**: `docs/realest-ng-branding.md`
- **Form Patterns**: `docs/form-patterns.md`
- **Theme System**: `docs/theme-system.md`
- **Page Structure**: `docs/page-structure.md`
- **Roadmap**: `docs/ROADMAP.md`
- **Phase Summaries**: `docs/phase-{1,2}-completion-summary.md`

### Database Access Architecture

- Supabase is used SOLELY for authentication (user auth, JWT/session, RLS enforcement).
- All application data access (API routes, server components, data fetching, mutations) MUST use Prisma.
- Never use Supabase for DB reads/writes outside the authentication layer.
- This is a hard architectural rule for all contributors and AI agents.
