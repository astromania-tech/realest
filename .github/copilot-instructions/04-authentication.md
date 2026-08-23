# Authentication & Authorization Patterns

## Authentication Flow Architecture

RealEST uses **Supabase Auth** with a three-tier client system:

```
Authentication Layers
├── Client-side (lib/supabase/client.ts)     → Browser-safe, anon key
├── Server-side (lib/supabase/server.ts)     → SSR, service role optional
└── Middleware (lib/supabase/middleware.ts)  → Route protection, session management
```

## User Roles & Permissions

### Role Hierarchy
```typescript
export type UserRole = 'user' | 'owner' 'admin' | 'admin'

// Role capabilities
const ROLE_PERMISSIONS = {
  user: [
    'view_properties',
    'send_inquiries',
    'save_properties',
    'manage_profile'
  ],
  owner: [
    'view_properties',
    'send_inquiries',
    'create_listing',
    'edit_own_listing',
    'view_inquiries',
    'analytics_basic'
  ],
  admin: [
    'validate_documents',
    'verify_properties',
    'manage_users',
    'view_all_listings',
    'analytics_full'
  ]
} as const
```

### Role-Based Route Access
```typescript
// lib/app-mode.ts
export function canAccessRoute(role: UserRole, path: string): boolean {
  const routeAccess = {
    '/admin': ['admin'],
    '/owner': ['owner', 'admin'],
    '/profile': ['user', 'owner', 'agent', 'admin'],
    '/search': ['user', 'owner', 'agent', 'admin'owner, null], // Public
    '/': [null] // Public (unauthenticated)
  }
  
  return routeAccess[path]?.includes(role) ?? false
}
```

## Client-Side Authentication

### Auth Context Provider
```tsx
// components/providers/auth-provider.tsx
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/lib/supabase/types'

interface AuthContextType {
  user: User | null
  profile: Profile | null
  isAuthenticated: boolean
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (data: RegistrationData) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      }
      setIsLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          await fetchProfile(session.user.id)
        } else {
          setProfile(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId: string) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    setProfile(data)
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    if (error) throw error
  }

  const signUp = async (data: RegistrationData) => {
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.full_name,
          user_type: data.user_type  // passed via raw_user_meta_data; DB trigger reads this
                                     // and casts it to users.role (UserRole enum)
        }
      }
    })
    if (error) throw error
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      isAuthenticated: !!user,
      isLoading,
      signIn,
      signUp,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
```

### Protected Client Component
```tsx
'use client'

import { useAuth } from '@/components/providers/auth-provider'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function OwnerDashboard() {
  const { user, profile, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login?redirect=/owner')
    }
    // ⚠️ profile.user_type is sourced from users.role via getUserProfile() in lib/auth.ts
    // Never query profiles.user_type directly — that column does not exist
    if (profile && profile.user_type !== 'owner' && profile.user_type !== 'admin') {
      router.push('/') // Unauthorized
    }
  }, [user, profile, isLoading])

  if (isLoading) return <LoadingSpinner />
  if (!user || !profile) return null

  return (
    <div>
      <h1>Welcome, {profile.full_name}</h1>
      {/* Dashboard content */}
    </div>
  )
}
```

## Server-Side Authentication

### Server Component Pattern
```tsx
// app/owner/page.tsx
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function OwnerDashboardPage() {
  const supabase = createServerClient()
  
  // Get authenticated user
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login?redirect=/owner')
  }

  // ⚠️ Role check: query users table — profiles has NO user_type column
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!userData || (userData.role !== 'owner' && userData.role !== 'admin')) {
    redirect('/')
  }

  // Fetch owner's properties
  const { data: properties } = await supabase
    .from('properties')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div>
      <h1>Welcome, {profile.full_name}</h1>
      <PropertyList properties={properties} />
    </div>
  )
}
```

### Route Handler Authentication
```typescript
// app/api/properties/route.ts
import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = createServerClient()
  
  // Verify authentication
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  // ⚠️ Role check: query users table — profiles has NO user_type column
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!userData || !['owner', 'admin'].includes(userData.role)) {
    return NextResponse.json(
      { error: 'Forbidden - Property owners only' },
      { status: 403 }
    )
  }

  const body = await request.json()
  
  // Create property with owner_id
  const { data, error: insertError } = await supabase
    .from('properties')
    .insert({
      ...body,
      owner_id: user.id,
      status: 'pending_ml_validation'
    })
    .select()
    .single()

  if (insertError) {
    return NextResponse.json(
      { error: insertError.message },
      { status: 500 }
    )
  }

  return NextResponse.json({ data }, { status: 201 })
}
```

## Middleware Authentication

### Session Management & Route Protection
```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { getAppMode, isRouteAccessible } from '@/lib/app-mode'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })
  
  const pathname = request.nextUrl.pathname
  const appMode = getAppMode()

  // Check route accessibility based on app mode
  if (!isRouteAccessible(pathname)) {
    if (appMode === 'coming-soon') {
      const url = request.nextUrl.clone()
      url.pathname = '/not-found'
      return NextResponse.rewrite(url)
    }
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  // Create Supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ request })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({ request })
          response.cookies.set({ name, value: '', ...options })
        }
      }
    }
  )

  // Refresh session if exists
  await supabase.auth.getUser()

  // Protected route patterns
  const protectedRoutes = ['/owner', '/user', '/admin', '/profile']
  const isProtected = protectedRoutes.some(route => pathname.startsWith(route))

  if (isProtected) {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/login'
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }

    // Role-based access control — query users table (profiles has NO user_type column)
    if (pathname.startsWith('/admin')) {
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      if (userData?.role !== 'admin') {
        return NextResponse.redirect(new URL('/', request.url))
      }
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
  ]
}
```

## Row-Level Security (RLS) Policies

### Profiles Table
```sql
-- Users can read own profile
CREATE POLICY "users_read_own_profile" ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update own profile
CREATE POLICY "users_update_own_profile" ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Admins can read all profiles
-- ⚠️ Role check uses users.role, NOT profiles.user_type
CREATE POLICY "admins_read_all_profiles" ON profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

### Properties Table
```sql
-- Anyone can read live properties
CREATE POLICY "anyone_read_live_properties" ON properties
  FOR SELECT
  USING (status = 'live');

-- Owners can read own properties
CREATE POLICY "owners_read_own_properties" ON properties
  FOR SELECT
  USING (owner_id = auth.uid());

-- Owners can create properties
CREATE POLICY "owners_create_properties" ON properties
  FOR INSERT
  WITH CHECK (owner_id = auth.uid());

-- Owners can update own properties (except verification fields)
CREATE POLICY "owners_update_own_properties" ON properties
  FOR UPDATE
  USING (owner_id = auth.uid());

-- Admins can read all properties
-- ⚠️ Role check uses users.role, NOT profiles.user_type
CREATE POLICY "admins_read_all_properties" ON properties
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update verification status
CREATE POLICY "admins_update_verification" ON properties
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

### Inquiries Table
```sql
-- Users can create inquiries
CREATE POLICY "users_create_inquiries" ON inquiries
  FOR INSERT
  WITH CHECK (sender_id = auth.uid());

-- Users can read inquiries they sent or received
CREATE POLICY "users_read_own_inquiries" ON inquiries
  FOR SELECT
  USING (
    sender_id = auth.uid() OR
    receiver_id = auth.uid()
  );

-- Users can update inquiries they received (mark as read)
CREATE POLICY "receivers_update_inquiries" ON inquiries
  FOR UPDATE
  USING (receiver_id = auth.uid());
```

## OAuth Providers (Future)

### Google OAuth Setup
```typescript
// app/auth/login/page.tsx
import { createClient } from '@/lib/supabase/client'

export function LoginPage() {
  const supabase = createClient()

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`
      }
    })
  }

  return (
    <RealEstButton onClick={signInWithGoogle} variant="neutral">
      <GoogleIcon /> Continue with Google
    </RealEstButton>
  )
}
```

### OAuth Callback Handler
```typescript
// app/auth/callback/route.ts
import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createServerClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  // Redirect to dashboard or profile setup
  return NextResponse.redirect(requestUrl.origin)
}
```

## Password Security

### Password Requirements
```typescript
// lib/auth.ts
export interface PasswordValidation {
  minLength: boolean          // >= 8 characters
  hasUppercase: boolean       // A-Z
  hasLowercase: boolean       // a-z
  hasNumber: boolean          // 0-9
  hasSpecialChar: boolean     // !@#$%^&*
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

### Password Reset Flow
```typescript
// app/auth/forgot-password/page.tsx
export function ForgotPasswordPage() {
  const supabase = createClient()

  const handleResetRequest = async (email: string) => {
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/auth/reset-password`
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input label="Email" type="email" {...register('email')} />
      <RealEstButton type="submit" variant="neon">
        Send Reset Link
      </RealEstButton>
    </form>
  )
}

// app/auth/reset-password/page.tsx
export function ResetPasswordPage() {
  const supabase = createClient()

  const handlePasswordUpdate = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })
    
    if (!error) {
      // Redirect to login or dashboard
      router.push('/auth/login?message=password-updated')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input 
        label="New Password" 
        type="password" 
        {...register('password')}
      />
      <PasswordStrengthIndicator password={watch('password')} />
      <RealEstButton type="submit" variant="neon">
        Update Password
      </RealEstButton>
    </form>
  )
}
```

## Email Verification

### Email Confirmation Flow
```typescript
// On signup, Supabase sends confirmation email automatically
// Configure in Supabase Dashboard → Authentication → Email Templates

// app/auth/verify-email/page.tsx
export function VerifyEmailPage() {
  return (
    <div className="text-center">
      <h1 className="font-heading text-3xl">Check Your Email</h1>
      <p className="font-body text-muted-foreground">
        We've sent a verification link to your email address.
        Click the link to activate your account.
      </p>
      
      <RealEstButton 
        onClick={() => router.push('/auth/login')}
        variant="neon"
      >
        Go to Login
      </RealEstButton>
    </div>
  )
}
```

## Session Management

### Auto-Refresh Token
Supabase handles token refresh automatically. Configure in client:

```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: true,      // Auto-refresh JWT
        persistSession: true,         // Persist in localStorage
        detectSessionInUrl: true      // Handle OAuth callbacks
      }
    }
  )
```

### Manual Session Check
```typescript
// Check if session is valid
const { data: { session } } = await supabase.auth.getSession()

if (session) {
  console.log('Session expires at:', session.expires_at)
  console.log('Time until expiry:', session.expires_at - Date.now() / 1000)
}
```

## Security Best Practices

1. **Never expose service role key** in client-side code
2. **Always use RLS policies** - Don't rely on client-side checks alone
3. **Validate user roles** on both client and server
4. **Use HTTPS only** in production
5. **Implement rate limiting** for auth endpoints
6. **Log authentication events** for security audits
7. **Use secure cookie options** in middleware
8. **Validate redirect URLs** to prevent open redirects

## Reference Files

- **Client Auth**: `lib/supabase/client.ts`
- **Server Auth**: `lib/supabase/server.ts`
- **Middleware**: `lib/supabase/middleware.ts`
- **Auth Utilities**: `lib/auth.ts`
- **Auth Provider**: `components/providers/auth-provider.tsx`
- **Login Page**: `app/(auth)/login/page.tsx`
- **Registration**: `app/(auth)/register/page.tsx`
