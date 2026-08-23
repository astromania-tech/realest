# TypeScript Types & Data Models

## Database Schema (Supabase PostgreSQL)

### Core Tables

#### `users` - Role & Account Status ⚠️ Role Source of Truth
```typescript
export interface UserRecord {
  id: string;                          // UUID (FK to auth.users)
  role: 'user' | 'agent' | 'owner' | 'admin';  // UserRole enum — SINGLE SOURCE OF TRUTH
  email: string | null;
  phone: string | null;
  full_name: string | null;
  avatar_url: string | null;
  is_active: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}
```

#### `profiles` - User Metadata (NO role column)
```typescript
export interface Profile {
  id: string;                          // UUID (FK to auth.users via users)
  email: string;
  full_name: string | null;
  phone: string | null;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  // ❌ NO user_type field — role lives on users.role
}
```

> ⚠️ **Critical**: `profiles` has NO `user_type` column. Always query `users.role` for role checks.
> `getUserProfile()` in `lib/auth.ts` maps `users.role` → `profile.user_type` for UI backward compat.

**RLS Policies**:
- Users can read/update own profile
- Admins can read all profiles
- Service role bypasses all restrictions

#### `properties` - Property Listings
```typescript
export interface Property {
  id: string;                          // UUID
  owner_id: string;                    // FK to profiles.id
  property_type: PropertyType;
  title: string;
  description: string;
  address: string;
  state: NigerianState;                // 36 states + FCT
  lga: string;                         // Local Government Area
  landmark: string | null;
  latitude: number;                    // PostGIS coordinates
  longitude: number;
  price: number;                       // In Naira (₦)
  price_frequency: 'sale' | 'annual' | 'monthly' | 'nightly';
  
  // Property Details
  bedrooms: number | null;
  bathrooms: number | null;
  size_sqm: number | null;
  has_bq: boolean;                     // Boys Quarters (Nigerian)
  
  // Infrastructure (Nigerian Market)
  nepa_status: NEPAStatus;
  water_source: WaterSource;
  internet_type: InternetType;
  security_type: SecurityType[];       // Array of security features
  
  // Verification & Status
  status: PropertyStatus;
  verified_at: string | null;
  is_featured: boolean;
  is_duplicate: boolean;
  
  // Metadata
  created_at: string;
  updated_at: string;
  views_count: number;
  inquiries_count: number;
}

// Enums
export type PropertyType = 
  | 'house'
  | 'apartment'
  | 'land'
  | 'commercial'
  | 'event_center'
  | 'hotel'
  | 'shop'
  | 'office';

export type PropertyStatus = 
  | 'draft'
  | 'pending_ml_validation'
  | 'pending_vetting'
  | 'pending_duplicate_review'
  | 'live'
  | 'rejected'
  | 'unlisted';

export type NEPAStatus = 
  | 'stable'           // 20+ hours daily
  | 'intermittent'     // 8-20 hours daily
  | 'poor'             // < 8 hours daily
  | 'none'             // No power supply
  | 'generator_only';  // Backup generator required

export type WaterSource =
  | 'borehole'
  | 'public_water'
  | 'well'
  | 'water_vendor'
  | 'none';

export type InternetType =
  | 'fiber'
  | 'starlink'
  | '4g'
  | '3g'
  | 'none';

export type SecurityType =
  | 'gated_community'
  | 'security_post'
  | 'cctv'
  | 'perimeter_fence'
  | 'security_dogs'
  | 'none';
```

**RLS Policies**:
- Anyone can read properties with `status = 'live'`
- Owners can CRUD own properties
- Admins can read/update all properties

#### `property_documents` - Document Validation
```typescript
export interface PropertyDocument {
  id: string;
  property_id: string;                 // FK to properties.id
  document_type: DocumentType;
  file_url: string;                    // Supabase Storage URL
  file_name: string;
  file_size: number;                   // In bytes
  mime_type: string;
  
  // ML Validation
  ml_validation_status: MLValidationStatus;
  ml_confidence_score: number | null;  // 0.0 - 1.0
  ml_validation_notes: string | null;
  ml_validated_at: string | null;
  
  // Metadata
  uploaded_at: string;
}

export type DocumentType =
  | 'title_deed'
  | 'survey_plan'
  | 'certificate_of_occupancy'
  | 'building_approval'
  | 'owner_id'
  | 'power_of_attorney'
  | 'tax_receipt'
  | 'other';

export type MLValidationStatus =
  | 'pending'
  | 'passed'
  | 'failed'
  | 'review_required'
  | 'skipped';
```

#### `property_media` - Images & Videos
```typescript
export interface PropertyMedia {
  id: string;
  property_id: string;
  media_type: 'image' | 'video' | 'virtual_tour';
  file_url: string;
  thumbnail_url: string | null;
  alt_text: string | null;
  display_order: number;
  is_primary: boolean;
  uploaded_at: string;
}
```

#### `inquiries` - Contact Requests
```typescript
export interface Inquiry {
  id: string;
  property_id: string;
  sender_id: string;                   // FK to profiles.id
  receiver_id: string;                 // Property owner
  message: string;
  contact_phone: string | null;
  contact_email: string;
  status: InquiryStatus;
  created_at: string;
  responded_at: string | null;
}

export type InquiryStatus =
  | 'new'
  | 'read'
  | 'responded'
  | 'closed';
```

#### `waitlist` - Pre-Launch Signups
```typescript
export interface WaitlistEntry {
  id: string;
  email: string;                       // Unique constraint
  first_name: string;
  last_name: string | null;
  phone: string | null;
  status: WaitlistStatus;
  position_in_queue: number;
  subscribed_at: string;
  notified_at: string | null;
}

export type WaitlistStatus =
  | 'active'
  | 'notified'
  | 'unsubscribed'
  | 'bounced';
```

## Nigerian Location Data

### States & LGAs
```typescript
export interface NigerianState {
  code: string;                        // e.g., 'LA' for Lagos
  name: string;
  capital: string;
  lgas: string[];                      // Local Government Areas
}

export const NIGERIAN_STATES: NigerianState[] = [
  {
    code: 'LA',
    name: 'Lagos',
    capital: 'Ikeja',
    lgas: [
      'Agege', 'Ajeromi-Ifelodun', 'Alimosho', 'Amuwo-Odofin',
      'Apapa', 'Badagry', 'Epe', 'Eti-Osa', 'Ibeju-Lekki',
      'Ifako-Ijaiye', 'Ikeja', 'Ikorodu', 'Kosofe', 'Lagos Island',
      'Lagos Mainland', 'Mushin', 'Ojo', 'Oshodi-Isolo',
      'Shomolu', 'Surulere'
    ]
  },
  {
    code: 'AB',
    name: 'Abia',
    capital: 'Umuahia',
    lgas: [
      'Aba North', 'Aba South', 'Arochukwu', 'Bende', 'Ikwuano',
      'Isiala Ngwa North', 'Isiala Ngwa South', 'Isuikwuato',
      'Obi Ngwa', 'Ohafia', 'Osisioma', 'Ugwunagbo', 'Ukwa East',
      'Ukwa West', 'Umuahia North', 'Umuahia South', 'Umu Nneochi'
    ]
  },
  // ... 34 more states + FCT
]

// Helper functions
export function getStateByCode(code: string): NigerianState | undefined
export function getLGAsByState(stateCode: string): string[]
export function validateNigerianAddress(address: Address): boolean
```

## Form Validation Schemas (Zod)

### Property Listing Schema
```typescript
import { z } from 'zod'

export const propertyListingSchema = z.object({
  // Basic Info
  property_type: z.enum([
    'house', 'apartment', 'land', 'commercial', 
    'event_center', 'hotel', 'shop', 'office'
  ]),
  title: z.string()
    .min(10, 'Title must be at least 10 characters')
    .max(100, 'Title must be less than 100 characters'),
  description: z.string()
    .min(50, 'Description must be at least 50 characters')
    .max(2000, 'Description must be less than 2000 characters'),
  
  // Location
  address: z.string().min(10),
  state: z.string().length(2, 'Invalid state code'),
  lga: z.string().min(3),
  landmark: z.string().optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  
  // Pricing
  price: z.number().min(1000, 'Price must be at least ₦1,000'),
  price_frequency: z.enum(['sale', 'annual', 'monthly', 'nightly']),
  
  // Property Details
  bedrooms: z.number().min(0).max(20).optional(),
  bathrooms: z.number().min(0).max(20).optional(),
  size_sqm: z.number().min(1).optional(),
  has_bq: z.boolean().default(false),
  
  // Infrastructure (Nigerian)
  nepa_status: z.enum(['stable', 'intermittent', 'poor', 'none', 'generator_only']),
  water_source: z.enum(['borehole', 'public_water', 'well', 'water_vendor', 'none']),
  internet_type: z.enum(['fiber', 'starlink', '4g', '3g', 'none']),
  security_type: z.array(z.enum([
    'gated_community', 'security_post', 'cctv', 
    'perimeter_fence', 'security_dogs', 'none'
  ]))
})

export type PropertyListingInput = z.infer<typeof propertyListingSchema>
```

### User Registration Schema
```typescript
export const userRegistrationSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain uppercase letter')
    .regex(/[a-z]/, 'Password must contain lowercase letter')
    .regex(/[0-9]/, 'Password must contain number')
    .regex(/[!@#$%^&*]/, 'Password must contain special character'),
  full_name: z.string().min(3, 'Name must be at least 3 characters'),
  phone: z.string()
    .regex(/^\+234[0-9]{10}$/, 'Invalid Nigerian phone number')
    .optional(),
  user_type: z.enum(['user', 'owner', 'agent', 'admin']), // form field; maps to users.role via DB trigger
  terms_accepted: z.boolean().refine(val => val === true, {
    message: 'You must accept terms and conditions'
  })
})

export type UserRegistrationInput = z.infer<typeof userRegistrationSchema>
```

### Inquiry Schema
```typescript
export const inquirySchema = z.object({
  message: z.string()
    .min(20, 'Message must be at least 20 characters')
    .max(1000, 'Message must be less than 1000 characters'),
  contact_phone: z.string()
    .regex(/^\+234[0-9]{10}$/, 'Invalid Nigerian phone number')
    .optional(),
  contact_email: z.string().email('Invalid email address'),
  property_id: z.string().uuid('Invalid property ID')
})

export type InquiryInput = z.infer<typeof inquirySchema>
```

## API Response Types

### Standard API Response
```typescript
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Usage example
export async function createProperty(
  data: PropertyListingInput
): Promise<ApiResponse<Property>> {
  try {
    const property = await supabase
      .from('properties')
      .insert(data)
      .select()
      .single()
    
    return {
      success: true,
      data: property.data,
      message: 'Property created successfully'
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}
```

### Paginated Response
```typescript
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  }
}

// Usage
export type PropertyListResponse = PaginatedResponse<Property>
```

## Supabase Client Types

### Type-Safe Query Example
```typescript
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/types'

const supabase = createClient()

// Type-safe query
const { data, error } = await supabase
  .from('properties')
  .select(`
    *,
    owner:profiles(full_name, avatar_url),
    media:property_media(*),
    documents:property_documents(*)
  `)
  .eq('status', 'live')
  .order('created_at', { ascending: false })
  .limit(20)

// data is typed as:
// {
//   properties: Property[]
//   owner: Pick<Profile, 'full_name' | 'avatar_url'>
//   media: PropertyMedia[]
//   documents: PropertyDocument[]
// }
```

### PostGIS Spatial Queries (Type-Safe)
```typescript
// Find properties within 5km radius
const { data } = await supabase
  .rpc('properties_within_radius', {
    lat: 6.5244,
    lng: 3.3792,
    radius_km: 5
  })

// RPC function signature
export type PropertiesWithinRadius = {
  lat: number;
  lng: number;
  radius_km: number;
} => Property[]
```

## Authentication Types

### Auth Context
```typescript
export interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<ApiResponse<User>>;
  signUp: (data: UserRegistrationInput) => Promise<ApiResponse<User>>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<ApiResponse<Profile>>;
}
```

### Password Validation
```typescript
export interface PasswordValidation {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

export function validatePassword(password: string): PasswordValidation {
  return {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  }
}

export function isPasswordValid(password: string): boolean {
  const validation = validatePassword(password)
  return Object.values(validation).every(Boolean)
}
```

## Email Template Types

```typescript
export interface WaitlistEmailData {
  email: string;
  firstName: string;
  lastName?: string;
  position?: number;
  totalCount?: number;
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export type EmailTemplateFunction<T> = (
  data: T,
  context?: Partial<TemplateContext>
) => EmailTemplate
```

## Utility Types

### Nigerian Market Specific
```typescript
export interface InfrastructureStatus {
  nepa: NEPAStatus;
  water: WaterSource;
  internet: InternetType;
  security: SecurityType[];
}

export interface PropertyAmenities {
  has_bq: boolean;                     // Boys Quarters
  parking_spaces: number;
  has_pool: boolean;
  has_gym: boolean;
  has_generator: boolean;
  has_inverter: boolean;
  kitchen_type: 'built_in' | 'separate' | 'none';
}
```

### Geospatial Types
```typescript
export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface BoundingBox {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface ProximitySearch {
  center: Coordinates;
  radius_km: number;
  property_type?: PropertyType;
  min_price?: number;
  max_price?: number;
}
```

## Type Generation

Auto-generate types from Supabase schema:

```bash
# Generate TypeScript types
supabase gen types typescript --local > lib/supabase/types.ts

# Or from remote project
supabase gen types typescript --project-id <project-ref> > lib/supabase/types.ts
```

## Type Safety Best Practices

1. **Always use generated types** from `lib/supabase/types.ts`
2. **Define Zod schemas** for form validation
3. **Use type guards** for runtime checks
4. **Avoid `any`** - use `unknown` and narrow types
5. **Export types** from component files for reusability

## Reference Files

- **Generated Types**: `lib/supabase/types.ts`
- **Auth Types**: `lib/auth.ts`
- **Waitlist Types**: `lib/waitlist.ts`
- **Email Types**: `lib/email-templates/types.ts`
- **Design System Constants**: `lib/constants/design-system.ts`
