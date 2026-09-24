# RealEST Copilot Instructions

**MASTER INDEX** - AI coding agents guide for the RealEST property marketplace.


## 📚 Complete Instruction System

This is a **multi-layered, context-aware AI instruction system** providing deep, domain-specific guidance. Start here, then explore specialized instruction files:

### 🧠 Meta-Cognitive Reasoning System (NEW)

| File | Purpose | When to Use |
|------|---------|------------|
| **[META-COGNITIVE-SYSTEM.md](copilot-instructions/META-COGNITIVE-SYSTEM.md)** | ⚠️ ACTIVATION RULES: Complex task classification, default entry point | ALL complex decisions (architecture, cross-domain, types, design) |
| **[Meta-Cognitive Architect Skill](../.agents/skills/meta-cognitive-architect/README.md)** | Modular reasoning framework (CORE-SKILL + ANALYSIS-PROMPT + EXECUTION-PROMPT) | Invoked by: `@meta-cognitive-architect [task]` |

### How the System Works

1. **Receive Task** → Classify complexity
2. **Auto-Invoke Analysis** → Deep 5-phase reasoning loop
3. **Review Output** → Check Global Confidence Score (GCS ≥ 0.85)
4. **Execute** → If approved, follow implementation prompt
5. **Commit** → Enforce AI-COMMIT-RULES.md (type check + lint)

**Philosophy:** Never provide first-guess responses. Always use deliberate, System 2 thinking.

See [META-COGNITIVE-SYSTEM.md](copilot-instructions/META-COGNITIVE-SYSTEM.md) for:
- Auto-invoke triggers (when to use)
- Skip triggers (when to avoid)
- 2-prompt operating system (Analysis + Execution)
- RealEST-specific context layers
- Confidence scoring reference

### Core Instruction Files

| File | Purpose | When to Use |
|------|---------|-------------|
| **[AI-COMMIT-RULES.md](copilot-instructions/AI-COMMIT-RULES.md)** | ⚠️ MANDATORY commit workflow: typecheck → lint → user consent | BEFORE EVERY COMMIT - No exceptions |
| **[00-architecture-overview.md](copilot-instructions/00-architecture-overview.md)** | System architecture, tech stack, project structure, phase status | Understanding big picture, architectural decisions, project organization |
| **[01-design-system.md](copilot-instructions/01-design-system.md)** | Complete design system: colors, typography, spacing, shadows, accessibility | Styling components, brand compliance, OKLCH colors, 60-30-10 rule |
| **[02-component-library.md](copilot-instructions/02-component-library.md)** | 70-25-5 component strategy, HeroUI integration, Nigerian market components | Building UI, selecting components, composition patterns |
| **[03-typescript-types.md](copilot-instructions/03-typescript-types.md)** | Database schema, types, Zod schemas, Nigerian location data | Type safety, form validation, database queries, API responses |
| **[04-authentication.md](copilot-instructions/04-authentication.md)** | Auth patterns, RLS policies, role-based access, middleware | User auth, protected routes, permission checks, security |
| **[05-nigerian-market.md](copilot-instructions/05-nigerian-market.md)** | Cultural context, infrastructure realities, localization, BQ features | Nigerian-specific features, cultural sensitivity, local patterns |
| **[07-api-documentation.md](copilot-instructions/07-api-documentation.md)** | ⚠️ MANDATORY: Auto-documentation workflow, OpenAPI spec, endpoint docs, Nigerian context | Creating/updating/deleting APIs - EVERY change must update docs |
| **[08-documentation-and-summary-rules.md](copilot-instructions/08-documentation-and-summary-rules.md)** | ⚠️ ENFORCED: Prevents doc clutter, no duplicate files, consolidation rules | Commit reviews will reject violations - one topic = one file |
| **[PROMPTS.md](copilot-instructions/PROMPTS.md)** | Battle-tested prompt templates for common tasks | Quick-start prompts, task templates, examples |

### How to Use This System

1. **Start Here** (this file) - Get overview and quick reference
2. **Explore Specialized Files** - Deep dive into relevant domain
3. **Use Prompt Templates** - Copy and customize from PROMPTS.md
4. **Reference Documentation** - Links to `docs/` folder for detailed guides

---

## Quick Start Architecture Overview

### Tech Stack
- **Frontend**: Next.js 16 + React 19 + TypeScript + HeroUI v3 (primary) + Tailwind CSS v4
- **Backend**: Supabase (PostgreSQL + PostGIS for geospatial, Auth, Storage, Realtime)
- **Design**: RealEST custom OKLCH color system + 4-tier typography (Lufga, Neulis Neue, Space Grotesk, JetBrains Mono)
- **Deployment**: Vercel (recommended)

### Directory Structure
- **`app/`** - Next.js 16 App Router with route groups: `(auth)`, `(demo)`, `(onboarding)`, `(public)`, `admin/`, `user/`, `owner/`
- **`components/`** - Reusable UI: `realest/` (custom), `heroui/`, `untitledui/` (status only), `ui/` (base utilities)
- **`lib/`** - Core utilities: `supabase/` (client/server/middleware), `auth.ts`, `app-mode.ts`, `email-service.ts`
- **`styles/`** - Global CSS + token system in `tokens/colors.css` with CSS variables
- **`docs/`** - Comprehensive guides: theme system, form patterns, design architecture

### App Mode System

The project uses environment-driven configuration via `NEXT_PUBLIC_APP_MODE`:

- **`coming-soon`** - Marketing-only mode, full route lockdown, no auth required
- **`full-site`** - Production mode with all features and authentication
- **`development`** or **`demo`** - All features accessible for testing

Control via `.env.local`:
```bash
NEXT_PUBLIC_APP_MODE=coming-soon npm run dev
NEXT_PUBLIC_APP_MODE=full-site npm run dev
NEXT_PUBLIC_APP_MODE=development npm run dev
```

See `lib/app-mode.ts` for configuration logic and `middleware.ts` for route access control.

## Design System Patterns

### Color Tokens (70% Dark Green, 30% Neutral, 10% Accent)
- **Primary Dark** (`#07402F`): Brand foundation, deep neutral text, dark mode backgrounds
- **Primary Neutral** (`#2E322E`): Secondary text, borders, form elements
- **Primary Accent** (`#ADF434`): CTAs, verification badges, success states (10% rule - use sparingly)

Semantic CSS variables in `styles/tokens/colors.css`:
```css
--background, --foreground, --primary, --secondary, --muted-foreground, --destructive, --success, --warning
```

### Theme Provider
Global theme system in `components/providers/realest-theme-provider.tsx`:
- Supports `light`, `dark`, `system` modes with localStorage persistence
- Exposes `useRealEstTheme()` hook for theme-aware components
- Automatically maps brand colors to HeroUI component variables

Use semantic classes (prefer over raw colors):
```tsx
<div className="bg-background text-foreground">
  <button className="bg-primary text-primary-foreground">Verify</button>
</div>
```

### HeroUI v3 Integration
- **Primary usage** (70%): Form inputs, buttons, cards, modals, dropdowns from `@heroui/react`
- **HeroUI CSS variables** override in theme provider: `--heroui-primary-*` → brand accent, `--heroui-secondary-*` → brand dark green
- Check `components/heroui/` for custom wrapped components with RealEST styling

## Critical Workflows

### Development
```bash
npm run dev                                    # Default: full-site mode
NEXT_PUBLIC_APP_MODE=coming-soon npm run dev  # Coming-soon page test
NEXT_PUBLIC_APP_MODE=development npm run dev  # Demo pages enabled
```

### Email Templates
Email system uses React Email templates in `emails/templates/` (see `copilot-instructions/06-email-system.md`):
```bash
npm run email:dev     # Visual preview server at http://localhost:3001
npm run email:export  # Validate all 24 templates build cleanly (run before commits)
```

### Route Access Control
Test route lockdown in current mode:
```bash
npm run test:lockdown  # Validates routes accessible per NEXT_PUBLIC_APP_MODE
```

### Database & Migrations
Supabase migrations stored in project:
```bash
supabase start               # Local Postgres
supabase db push            # Apply pending migrations
supabase gen types typescript  # Generate TypeScript types (auto in CI)
```

## Authentication & User Types

### Auth System
- **Client**: `lib/supabase/client.ts` - Browser-safe Supabase client with anon key
- **Server**: `lib/supabase/server.ts` - Server-side with service role for RLS bypasses
- **Middleware**: `lib/supabase/middleware.ts` - Runs on every request, enforces route access per app mode

Core functions in `lib/auth.ts`:
- `getCurrentUser()`, `getUserProfile(userId)`, `validatePassword()`, `isPasswordValid()`

### User Profiles
Three role types stored in `profiles` table:
- **`user`** - Search and inquire on properties
- **`owner`** - List and manage properties
- **`agent`** - Manage listings on behalf of owners
- **`admin`** - Verify properties, documents, manage disputes

Dashboard routes in `app/` (gated by role):
- `profile/` - User-specific features
- `owner/` - Owner listing management
- `agent/` - Agent management features
- `admin/` - Verification workflows

## Form Patterns

All forms follow RealEST conventions (see Confluence **Design / Form patterns**):

### Standard Form Structure
1. Use React Hook Form + Zod for validation
2. HeroUI Input/Select/Textarea components
3. Real-time validation feedback with error states
4. Nigerian market context: State/LGA selects, property types (Boys Quarters), Naira currency, +234 phone format

### Example Form Component
```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input, Button } from '@heroui/react'

const schema = z.object({
  email: z.string().email(),
  phone: z.string().regex(/^\+234\d{10}$/, 'Invalid Nigerian phone')
})

export function ContactForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema)
  })
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input {...register('email')} placeholder="Email" />
      {errors.email && <span className="text-destructive">{errors.email.message}</span>}
      <Button type="submit">Send</Button>
    </form>
  )
}
```

## Supabase Integration Patterns

### Client-Side Data Fetching
```tsx
const supabase = createClient()
const { data, error } = await supabase
  .from('properties')
  .select('*')
  .eq('verified_status', 'approved')
```

### Server-Side with RLS
Use `lib/supabase/server.ts` in Server Components and Route Handlers:
```tsx
const supabase = createServerClient(...)
const { data } = await supabase.from('profiles').select('*')
```

### Real-time Subscriptions
For live updates (property status changes, inquiries):
```tsx
const channel = supabase
  .channel('property-updates')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'properties' },
    (payload) => setProperties([...properties, payload.new])
  )
  .subscribe()
```

## Conventions & Patterns

### File Naming
- Components: PascalCase (`PropertyCard.tsx`)
- Utilities/Hooks: camelCase (`useAuth.ts`, `emailService.ts`)
- Styles: lowercase with hyphens (`property-card.css`)

### Component Organization
1. Imports
2. Type definitions / Props interface
3. Component function
4. Default export
5. Exports for index.ts re-export

### TypeScript
- Strict mode enabled
- All component props must have explicit types
- Use `type` for types, `interface` for component prop shapes
- Avoid `any` - use proper typing or `unknown`

### Responsive Design
Mobile-first approach using Tailwind breakpoints (`sm`, `md`, `lg`, `xl`):
```tsx
<div className="text-sm md:text-base lg:text-lg">
  Responsive typography
</div>
```

### CSS Variables
Always use theme tokens from `styles/tokens/colors.css`:
```css
color: var(--foreground);
background: var(--primary);
border: 1px solid var(--border);
```

## Important Files to Understand

| File | Purpose |
|------|---------|
| `lib/app-mode.ts` | App mode configuration logic - READ FIRST for conditional features |
| `lib/supabase/middleware.ts` | Route access control per app mode - critical for feature gating |
| `components/providers/realest-theme-provider.tsx` | Global theme system and HeroUI overrides |
| Confluence **Design / Theme system** | Theme usage guide |
| Confluence **Design / Form patterns** | Form architecture and component patterns |
| `styles/tokens/colors.css` | Color token definitions - source of truth |
| `commitlint.config.js` | Commit message conventions (enforced) |

## Common Tasks

### Adding a New Page
1. Create route in `app/[section]/page.tsx`
2. If auth required, check app mode access in `lib/app-mode.ts`
3. Import RealEstThemeProvider components via `useRealEstTheme()` for theme awareness
4. Use HeroUI components from `@heroui/react`
5. Apply semantic CSS classes from `styles/tokens/colors.css`

### Adding Authentication to a Route
1. Create middleware check in `lib/supabase/middleware.ts`
2. Add to `isRouteAccessible()` logic
3. Use `getCurrentUser()` in Server Components
4. Redirect to `/login` if not authenticated

### Styling a Component
1. Use Tailwind utilities (preferred)
2. Reference CSS variables for colors: `className="text-[var(--foreground)]"`
3. Or use semantic classes: `className="text-foreground"`
4. Never hardcode hex colors

### Testing Feature Behind App Mode
1. Set `NEXT_PUBLIC_APP_MODE` in `.env.local`
2. Run `npm run dev` and test routes
3. Use `npm run test:lockdown` to verify route access control

## Gotchas & Patterns to Avoid

- ❌ Don't hardcode color hex values - use CSS variables
- ❌ Don't use HeroUI components directly without checking for RealEST wrappers in `components/heroui/`
- ❌ Don't bypass middleware - all route protection must go through `middleware.ts`
- ❌ Don't commit environment secrets to `.env.local` - use `.env.example` as template
- ❌ Don't ignore TypeScript strict mode errors
- ✅ Do use app mode checks: `if (getAppMode() === 'coming-soon') { ... }`
- ✅ Do leverage `useRealEstTheme()` for dynamic theme-aware styling
- ✅ Do follow 4-tier typography system: Display (Lufga), Heading (Neulis Neue), Body (Space Grotesk), Mono (JetBrains Mono)

## 🎯 Quick Decision Matrix

**"Which instruction file should I read?"**

| Your Task | Read This File | Key Sections |
|-----------|----------------|--------------|
| Build a new page/component | [02-component-library.md](copilot-instructions/02-component-library.md) | HeroUI patterns, composition examples |
| Style a component | [01-design-system.md](copilot-instructions/01-design-system.md) | Color usage, typography, spacing |
| Add authentication | [04-authentication.md](copilot-instructions/04-authentication.md) | Auth patterns, RLS policies |
| Define database types | [03-typescript-types.md](copilot-instructions/03-typescript-types.md) | Schema, Zod validation |
| Nigerian market feature | [05-nigerian-market.md](copilot-instructions/05-nigerian-market.md) | BQ, NEPA, localization |
| Create/modify/delete API endpoint | [07-api-documentation.md](copilot-instructions/07-api-documentation.md) | Mandatory workflow, OpenAPI spec, Nigerian context |
| Understand project structure | [00-architecture-overview.md](copilot-instructions/00-architecture-overview.md) | Routes, data flow, phases |
| Start a new task | [PROMPTS.md](copilot-instructions/PROMPTS.md) | Template prompts |

## Essential documentation (Confluence)

Product docs are in Confluence, not this repo. A clone will not have `docs/product/`, `docs/engineering/`, `docs/design/`, `docs/launch/`, or `docs/api/*.md`.

### Design
- Design architecture, Branding, Theme system, Form patterns, Logo, Amenity badge

### Engineering
- Environment setup, Branch management, Import migration

### Launch
- Waitlist features, Email setup, Poll and referral, Referral rewards spec

### Product
- Product overview, Roadmap, Launch strategy, Page structure, Component organization, ML validation

### API
- Auto-documentation, Endpoint inventory, Add-endpoint workflow, OpenAPI endpoint template

Onboarding in git: root `README.md`, `CONTRIBUTING.md`, `AGENTS.md`, and this folder.
