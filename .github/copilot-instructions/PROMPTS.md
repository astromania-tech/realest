# AI Agent Prompt Templates

## Quick Reference Prompts

These are battle-tested prompts for common RealEST development tasks. Copy, customize context, and use with AI agents.

---

## 1. Create Property Listing Form Component

```
I need to create a property listing form component for RealEST marketplace.

Context:
- RealEST uses HeroUI v3 (70% usage) for forms
- Must follow Nigerian market patterns (BQ, NEPA, water source)
- Use React Hook Form + Zod validation
- Multi-step form (5 steps): Type → Details → Location → Media → Documents
- Brand colors: Primary Dark (#07402F), Acid Green (#ADF434)
- Must validate Nigerian phone (+234 format) and addresses

Requirements:
1. TypeScript with strict types
2. Form state management with React Hook Form
3. Zod schema validation for each step
4. Progress indicator showing current step
5. Nigerian state/LGA cascading selects
6. Naira currency formatting
7. Infrastructure fields (NEPA, water, security)
8. BQ (Boys Quarters) toggle and details
9. Error handling with user-friendly messages
10. Mobile-responsive design

Reference files:
- Design tokens: lib/constants/design-system.ts
- Form patterns: docs/form-patterns.md
- Nigerian locations: lib/constants/nigerian-locations.ts
- Button component: components/heroui/realest-button.tsx
- HeroUI forms: Use Input, Select, TextArea from @heroui/react

Create the component with all validation and styling.
```

---

## 2. Add Property Card Component with Nigerian Features

```
Create a PropertyCard component that displays property listings with Nigerian market features.

Context:
- Use HeroUI Card component as base
- RealEST color system: Primary Dark (#07402F 60%), Acid Green (#ADF434 10%)
- Must show: RealEST Verified badge, infrastructure status, BQ info
- Responsive: mobile-first, grid layout support
- Card should link to property detail page

Required Elements:
1. Property image with verification badge overlay
2. Property title (font-heading, 2xl)
3. Price in Naira with frequency (/year, /month)
4. Location (State, LGA, neighborhood)
5. Infrastructure indicators:
   - NEPA status badge (stable=green, intermittent=amber)
   - Water source badge
   - Security type (gated, CCTV)
6. BQ availability indicator if has_bq = true
7. Quick stats: bedrooms, bathrooms, size_sqm
8. Property type badge
9. Hover effects: shadow-md → shadow-lg
10. "View Property" button (RealEstButton variant="neon")

Types:
```typescript
interface PropertyCardProps {
  property: Property
  showVerificationBadge?: boolean
  showInfrastructure?: boolean
  className?: string
}
```

Use components:
- Card from @heroui/react
- RealEstButton from @/components/heroui/realest-button
- InfrastructureIndicator from @/components/untitledui/status-components
- VerificationBadge from @/components/realest/badges

Styling:
- Card: rounded-xl, shadow-md
- Generous padding: space-6
- Follow 4-tier typography (Lufga display, Neulis Neue heading, Space Grotesk body)
```

---

## 3. Implement Property Search with PostGIS

```
Create a property search system with geospatial queries using Supabase PostGIS.

Context:
- RealEST uses Supabase PostgreSQL with PostGIS extension
- Properties table has latitude/longitude columns
- Search must support: radius search, filters, pagination
- Nigerian market: State/LGA filters, infrastructure filters

Requirements:
1. Server-side search function in app/api/search/route.ts
2. PostGIS radius search using ST_DWithin
3. Filters:
   - State and LGA (exact match)
   - Property type (enum)
   - Price range (min/max)
   - Bedrooms/bathrooms (min)
   - NEPA status
   - Has BQ
   - Gated community
4. Pagination (page, per_page)
5. Sort options: newest, price_asc, price_desc, distance
6. Return type-safe results with TypeScript

PostGIS Query Example:
```sql
SELECT *, 
  ST_Distance(
    ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography,
    ST_SetSRID(ST_MakePoint($lng, $lat), 4326)::geography
  ) AS distance_meters
FROM properties
WHERE ST_DWithin(
  ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography,
  ST_SetSRID(ST_MakePoint($lng, $lat), 4326)::geography,
  $radius_meters
)
AND status = 'live'
ORDER BY distance_meters ASC
```

Implementation:
- Use lib/supabase/server.ts for database client
- Apply RLS policies (only return status='live')
- Return PaginatedResponse<Property> type
- Handle errors gracefully
- Log queries for debugging
```

---

## 4. Create Admin Property Verification Dashboard

```
Build admin dashboard for property verification workflow.

Context:
- Admins verify properties through 3 stages: ML validation → Physical vetting → Live
- Must display documents, ML scores, property details
- Admin can approve, reject, flag for duplicate review
- Role-based access: only `users.role = 'admin'` (query `users` table, NOT `profiles`)

Dashboard Requirements:
1. Server Component with auth check (admin role only)
2. Tabs for different queues:
   - Pending ML Validation
   - Pending Physical Vetting
   - Flagged Duplicates
3. Property card showing:
   - Owner info
   - Property details
   - Uploaded documents with preview
   - ML validation results (if available)
   - Location on map (Mapbox/Google Maps)
4. Action buttons:
   - Approve (moves to next stage)
   - Reject (sets status='rejected')
   - Flag Duplicate (status='pending_duplicate_review')
5. Admin notes textarea
6. Status history timeline

Database Updates:
```typescript
// Approve from ML validation to vetting
await supabase
  .from('properties')
  .update({ status: 'pending_vetting' })
  .eq('id', propertyId)

// Approve from vetting to live
await supabase
  .from('properties')
  .update({ 
    status: 'live',
    verified_at: new Date().toISOString()
  })
  .eq('id', propertyId)
```

Use Components:
- HeroUI Tabs for queue sections
- PropertyCard for display
- RealEstButton for actions
- VerificationProgress indicator
- Document viewer (PDF/image preview)

Must use service role key for admin operations to bypass RLS.
```

---

## 5. Implement Email Notification System

```
Set up email notification system for property status updates.

Context:
- RealEST uses Resend for email service
- Email templates in lib/email-templates/
- Must notify property owners on status changes
- Nigerian context: professional tone, clear status language

Email Triggers:
1. Property submitted → "We've received your listing"
2. ML validation complete → "Documents validated"
3. Physical vetting scheduled → "Vetting team assigned"
4. Property approved → "Your property is now LIVE!"
5. Property rejected → "Listing requires attention"

Implementation:
1. Create email service function in lib/email-service.ts
2. Use existing template system from lib/email-templates/
3. Trigger emails from:
   - API route handlers (on property create/update)
   - Supabase Edge Functions (on database triggers)
   - Admin dashboard actions

Email Template Structure:
```typescript
interface PropertyStatusEmail {
  to: string                    // Owner email
  property: {
    title: string
    id: string
    status: PropertyStatus
  }
  owner_name: string
  status_message: string
  next_steps: string[]
  cta_url: string               // Link to property dashboard
}
```

Email Copy Style:
- Professional but warm
- Clear status explanation
- Action-oriented next steps
- RealEST brand voice (trustworthy, helpful)

Example Subject Lines:
- "✓ Your Property is Now Live on RealEST"
- "📋 Documents Under Review - Property #RE-LG-001234"
- "🔍 Vetting Team Assigned - Next Steps"

Use Resend:
```typescript
import { Resend } from 'resend'
const resend = new Resend(process.env.RESEND_API_KEY)

await resend.emails.send({
  from: 'RealEST <hello@realest.ng>',
  to: ownerEmail,
  subject: '✓ Your Property is Now Live',
  html: emailTemplate
})
```
```

---

## 6. Build Search Results Page with Map Integration

```
Create search results page with split view: map on right, list on left.

Context:
- RealEST shows properties on interactive map (Mapbox GL JS)
- Users can toggle map/list view on mobile
- Desktop: permanent split view
- Clicking map marker highlights corresponding card

Requirements:
1. Server Component fetching search results
2. Client Component for map interaction
3. Responsive layout:
   - Mobile: Stack (toggle map/list)
   - Desktop: Side-by-side (60% list, 40% map)
4. Map features:
   - Property markers (color by property_type)
   - Cluster markers for multiple properties
   - Popup on marker click
   - Zoom to bounds on search
5. List features:
   - PropertyCard components
   - Infinite scroll or pagination
   - Loading states (skeleton cards)
   - Empty state if no results
6. Filters sidebar (collapsible on mobile)

Map Implementation (Mapbox):
```tsx
'use client'

import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'

export function PropertyMap({ properties }: { properties: Property[] }) {
  const mapContainer = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    if (!mapContainer.current) return
    
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [3.3792, 6.5244], // Lagos, Nigeria
      zoom: 11
    })
    
    properties.forEach(property => {
      new mapboxgl.Marker({ color: '#ADF434' })
        .setLngLat([property.longitude, property.latitude])
        .setPopup(
          new mapboxgl.Popup().setHTML(`
            <h3>${property.title}</h3>
            <p>${formatNaira(property.price)}</p>
          `)
        )
        .addTo(map)
    })
    
    return () => map.remove()
  }, [properties])
  
  return <div ref={mapContainer} className="h-full w-full" />
}
```

Layout Structure:
```tsx
<div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
  <div className="space-y-4">
    {/* Property cards */}
  </div>
  <div className="sticky top-4 h-150">
    <PropertyMap properties={properties} />
  </div>
</div>
```
```

---

## 7. Add User Profile Management

```
Implement user profile management with avatar upload.

Context:
- `users` table stores role (`users.role` enum: user|owner|agent|admin) — single source of truth
- `profiles` table stores user metadata (full_name, phone, bio, avatar_url) — NO role column
- Avatar stored in Supabase Storage
- Users can update their own profile (RLS enforced)
- Role changes require updating `users.role` (admin only)

Features:
1. Profile view page (app/profile/page.tsx)
2. Profile edit form (app/profile/edit/page.tsx)
3. Avatar upload with preview
4. Form fields:
   - Full name (required)
   - Email (read-only, from auth.users)
   - Phone (Nigerian +234 format)
   - User type (user/owner)
5. Password change link
6. Account deletion option

Avatar Upload Implementation:
```typescript
async function uploadAvatar(file: File, userId: string) {
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}-${Date.now()}.${fileExt}`
  const filePath = `avatars/${fileName}`
  
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file)
  
  if (uploadError) throw uploadError
  
  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath)
  
  // Update profile with new avatar URL
  await supabase
    .from('profiles')
    .update({ avatar_url: publicUrl })
    .eq('id', userId)
  
  return publicUrl
}
```

Form Validation:
- Full name: min 3 characters
- Phone: Nigerian format (+234...)
- Avatar: max 2MB, jpeg/png only

Use Components:
- HeroUI Input, Select
- Avatar component with fallback (user initials)
- RealEstButton for save
- File upload with drag-and-drop

Profile Display:
- Avatar (circular, 120px)
- Name, email, phone
- User type badge
- Join date
- Edit button (links to /profile/edit)
```

---

## 8. Implement Waitlist System with Email Confirmation

```
Create waitlist signup with email confirmation and position tracking.

Context:
- Pre-launch feature for RealEST coming-soon mode
- Users sign up with email, first name, last name, phone
- Real-time duplicate email check
- Show waitlist position after signup
- Send confirmation email via Resend

Features:
1. Waitlist modal (WaitlistModal component)
2. Real-time email validation (useEmailValidation hook)
3. API endpoint: POST /api/waitlist
4. Database: waitlist table
5. Email template: waitlist-confirmation
6. Position counter on homepage

API Implementation:
```typescript
// app/api/waitlist/route.ts
export async function POST(request: Request) {
  const { email, firstName, lastName, phone } = await request.json()
  
  // Check if email exists
  const { data: existing } = await supabase
    .from('waitlist')
    .select('*')
    .eq('email', email)
    .single()
  
  if (existing) {
    return NextResponse.json({
      error: `${firstName}, you're already on our waitlist!`,
      position: existing.position_in_queue
    }, { status: 400 })
  }
  
  // Get current waitlist count
  const { count } = await supabase
    .from('waitlist')
    .select('*', { count: 'exact', head: true })
  
  // Insert new entry
  const { data, error } = await supabase
    .from('waitlist')
    .insert({
      email,
      first_name: firstName,
      last_name: lastName,
      phone,
      position_in_queue: (count ?? 0) + 1,
      status: 'active'
    })
    .select()
    .single()
  
  // Send confirmation email
  await sendWaitlistConfirmationEmail({
    email,
    firstName,
    position: data.position_in_queue,
    totalCount: (count ?? 0) + 1
  })
  
  return NextResponse.json({ data }, { status: 201 })
}
```

Real-time Validation Hook:
```typescript
import { useState, useEffect } from 'react'
import { debounce } from 'lodash'

export function useEmailValidation(email: string) {
  const [exists, setExists] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  
  useEffect(() => {
    const checkEmail = debounce(async () => {
      if (!email || !isValidEmail(email)) return
      
      setIsChecking(true)
      const response = await fetch(`/api/waitlist?email=${email}`)
      const data = await response.json()
      setExists(data.exists)
      setIsChecking(false)
    }, 800)
    
    checkEmail()
  }, [email])
  
  return { exists, isChecking }
}
```

Waitlist Counter:
- Show live count on coming-soon page
- Update in real-time (Supabase Realtime subscription)
- Format: "Join 1,234 people on the waitlist"
```

---

## General Prompt Structure Template

When creating your own prompts, follow this structure:

```
[TASK DESCRIPTION]

Context:
- RealEST-specific context (tech stack, design system, conventions)
- Nigerian market context (if applicable)
- Related components/patterns to reference

Requirements:
1. Numbered list of specific features
2. Technical specifications
3. Nigerian market considerations
4. Error handling requirements
5. Mobile responsiveness

Types/Interfaces:
```typescript
// Provide relevant TypeScript types
```

Reference Files:
- List specific files from codebase to reference
- Design system tokens
- Existing components to use
- Documentation to follow

Constraints:
- Performance requirements
- Accessibility needs (WCAG 2.1 AA)
- RLS policy considerations
- App mode restrictions

Expected Output:
- What the final deliverable should look like
- File structure
- Testing considerations
```

---

## Prompt Best Practices

1. **Be Specific**: Reference exact file paths, component names, color codes
2. **Include Context**: Mention RealEST conventions, Nigerian market needs
3. **Provide Examples**: Code snippets, expected output, type definitions
4. **Reference Docs**: Point to relevant documentation files
5. **Set Constraints**: Performance, accessibility, mobile-first
6. **Define Success**: What "done" looks like

## Reference Documentation for Prompts

Always mention these files when relevant:
- Architecture: `.github/copilot-instructions/00-architecture-overview.md`
- Design System: `.github/copilot-instructions/01-design-system.md`
- Components: `.github/copilot-instructions/02-component-library.md`
- Types: `.github/copilot-instructions/03-typescript-types.md`
- Auth: `.github/copilot-instructions/04-authentication.md`
- Nigerian Market: `.github/copilot-instructions/05-nigerian-market.md`
- Form Patterns: `docs/form-patterns.md`
- Theme System: `docs/theme-system.md`
