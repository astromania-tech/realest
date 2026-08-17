-- Migration: Update schema for new user types, inquiries, reviews, and payments
-- Date: 2024-12-02

-- Drop existing policies that depend on profiles.user_type or user_type_enum
-- RLS policies create a dependency that prevents ALTER TABLE ... TYPE or DROP TYPE.
DO $$ 
BEGIN
    -- Drop policies on profiles (this table exists in the base schema)
    DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
    DROP POLICY IF EXISTS "profiles_select_public_owners" ON public.profiles;
    DROP POLICY IF EXISTS "profiles_insert_self" ON public.profiles;

    -- For other tables, we check if they exist first to avoid errors on a fresh database
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'owners' AND schemaname = 'public') THEN
        DROP POLICY IF EXISTS "Owners can view their own record" ON public.owners;
        DROP POLICY IF EXISTS "Admins can manage owners" ON public.owners;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'agents' AND schemaname = 'public') THEN
        DROP POLICY IF EXISTS "Agents can view their own record" ON public.agents;
        DROP POLICY IF EXISTS "Admins can manage agents" ON public.agents;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'kyc_requests' AND schemaname = 'public') THEN
        DROP POLICY IF EXISTS "Users can view their own KYC requests" ON public.kyc_requests;
        DROP POLICY IF EXISTS "Users can insert their own KYC requests" ON public.kyc_requests;
        DROP POLICY IF EXISTS "Admins can manage KYC requests" ON public.kyc_requests;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'reviews' AND schemaname = 'public') THEN
        DROP POLICY IF EXISTS "Users can view reviews" ON public.reviews;
        DROP POLICY IF EXISTS "Users can insert their own reviews" ON public.reviews;
        DROP POLICY IF EXISTS "Admins can manage reviews" ON public.reviews;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'payments' AND schemaname = 'public') THEN
        DROP POLICY IF EXISTS "Users can view their own payments" ON public.payments;
        DROP POLICY IF EXISTS "Users can insert their own payments" ON public.payments;
        DROP POLICY IF EXISTS "Admins can view all payments" ON public.payments;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'properties' AND schemaname = 'public') THEN
        DROP POLICY IF EXISTS "agents_or_admins_insert_properties" ON public.properties;
        DROP POLICY IF EXISTS "properties_insert_owner_agent_jwt" ON public.properties;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'admin_audit_log' AND schemaname = 'public') THEN
        DROP POLICY IF EXISTS "admins_view_audit_logs" ON public.admin_audit_log;
    END IF;
END $$;

-- Temporarily change reviews.target_type to text to allow user_type_enum to be dropped
ALTER TABLE public.reviews ALTER COLUMN target_type TYPE text;

-- 1. Temporarily change column to text to handle updates safely
-- This works whether the column is currently an enum or already text
ALTER TABLE public.profiles ALTER COLUMN user_type TYPE text;

-- 2. Update existing data (only applies if migrating from old schema/wiped data)
UPDATE profiles SET user_type = 'owner' WHERE user_type = 'property_owner';
UPDATE profiles SET user_type = 'user' WHERE user_type = 'buyer';

-- 3. Recreate the enum type with all desired values
DROP TYPE IF EXISTS user_type_enum;
CREATE TYPE user_type_enum AS ENUM ('owner', 'agent', 'user', 'admin');

-- 4. Re-apply the enum type to the column
ALTER TABLE profiles ALTER COLUMN user_type TYPE user_type_enum USING user_type::user_type_enum;

-- 5. Re-apply the enum type to the reviews.target_type column
ALTER TABLE public.reviews ALTER COLUMN target_type TYPE user_type_enum USING target_type::user_type_enum;

-- Recreate standard profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can manage all profiles" ON public.profiles FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'admin')
);
-- Recreate profiles_select_public_owners (from 20260401)
CREATE POLICY "profiles_select_public_owners"
  ON public.profiles FOR SELECT
  USING (user_type = 'owner' AND deleted_at IS NULL); -- Assuming 'deleted_at' exists on profiles

-- Recreate profiles_insert_self (from 20260401)
CREATE POLICY "profiles_insert_self"
  ON public.profiles FOR INSERT
  WITH CHECK (id = auth.uid());

-- Rename buyer_id to user_id in inquiries
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='inquiries' AND column_name='buyer_id') THEN
    ALTER TABLE inquiries RENAME COLUMN buyer_id TO user_id;
  END IF;
END $$;

-- Create owners table
CREATE TABLE IF NOT EXISTS owners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  business_name TEXT,
  property_types TEXT[],
  phone TEXT,
  verified BOOLEAN DEFAULT FALSE,
  verification_date TIMESTAMP WITH TIME ZONE,
  years_experience INTEGER,
  bio TEXT,
  photo_url TEXT,
  rating NUMERIC,
  total_properties INTEGER,
  whatsapp VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create agents table
CREATE TABLE IF NOT EXISTS agents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  license_number TEXT,
  agency_name TEXT,
  specialization TEXT[],
  phone TEXT,
  verified BOOLEAN DEFAULT FALSE,
  verification_date TIMESTAMP WITH TIME ZONE,
  years_experience INTEGER,
  bio TEXT,
  photo_url TEXT,
  rating NUMERIC,
  total_sales INTEGER,
  total_listings INTEGER,
  whatsapp VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create kyc_requests table
CREATE TABLE IF NOT EXISTS kyc_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user_type TEXT NOT NULL CHECK (user_type IN ('agent', 'owner')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  kyc_provider TEXT NOT NULL,
  kyc_reference_id TEXT,
  documents JSONB,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE,
  rejected_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  target_type user_type_enum NOT NULL CHECK (target_type IN ('property', 'agent', 'owner')),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'NGN',
  type TEXT NOT NULL CHECK (type IN ('listing_fee', 'premium_feature')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  transaction_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for owners
-- Owners can view their own record
CREATE POLICY "Owners can view their own record" ON owners FOR SELECT USING (auth.uid() = profile_id);

-- Admins can manage all owners
CREATE POLICY "Admins can manage owners" ON owners FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'admin')
);

-- RLS Policies for agents
-- Agents can view their own record
CREATE POLICY "Agents can view their own record" ON agents FOR SELECT USING (auth.uid() = profile_id);

-- Admins can manage all agents
CREATE POLICY "Admins can manage agents" ON agents FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'admin')
);

-- RLS Policies for kyc_requests
-- Users can view their own KYC requests
CREATE POLICY "Users can view their own KYC requests" ON kyc_requests FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own KYC requests
CREATE POLICY "Users can insert their own KYC requests" ON kyc_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can manage all KYC requests
CREATE POLICY "Admins can manage KYC requests" ON kyc_requests FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'admin')
);

-- RLS Policies for reviews
-- Users can view all reviews
CREATE POLICY "Users can view reviews" ON reviews FOR SELECT USING (true);

-- Users can insert reviews if they are the reviewer
CREATE POLICY "Users can insert their own reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- Only admins can update/delete reviews
CREATE POLICY "Admins can manage reviews" ON reviews FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'admin')
);

-- RLS Policies for payments
-- Users can view their own payments
CREATE POLICY "Users can view their own payments" ON payments FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own payments
CREATE POLICY "Users can insert their own payments" ON payments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can view all payments
CREATE POLICY "Admins can view all payments" ON payments FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'admin')
);

-- Indexes for performance
CREATE INDEX idx_owners_profile_id ON owners(profile_id);
CREATE INDEX idx_agents_profile_id ON agents(profile_id);
CREATE INDEX idx_kyc_requests_user_id ON kyc_requests(user_id);
CREATE INDEX idx_kyc_requests_status ON kyc_requests(status);
CREATE INDEX idx_reviews_property_id ON reviews(property_id);
CREATE INDEX idx_reviews_reviewer_id ON reviews(reviewer_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_property_id ON payments(property_id);
