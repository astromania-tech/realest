-- =============================================================================
-- Migration: Rename app_role → user_role
-- Timestamp: 20260402000000
--
-- OBJECTIVES:
--   • Rename public.app_role enum to public.user_role for consistent naming
--   • Update public.users.role column type
--   • Recreate all RLS policies and functions that reference the old type
--
-- EXECUTION ORDER:
--   1.  Create new public.user_role enum (identical values)
--   2.  Drop RLS policies that have ::public.app_role casts
--   3.  Drop handle_new_user trigger + function (references public.app_role)
--   4.  Alter public.users.role from app_role → user_role
--   5.  Drop old public.app_role enum
--   6.  Recreate handle_new_user() with user_role
--   7.  Recreate trigger
--   8.  Recreate all dropped RLS policies with ::public.user_role casts
-- =============================================================================

-- =============================================================================
-- STEP 1: Create new user_role enum
-- =============================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public' AND t.typname = 'user_role'
  ) THEN
    CREATE TYPE public.user_role AS ENUM ('user', 'agent', 'owner', 'admin');
  END IF;
END;
$$;

-- =============================================================================
-- STEP 2: Drop all RLS policies that reference ::public.app_role
-- AND all policies on public.users (any column reference blocks type change)
-- =============================================================================

-- public.users — drop ALL policies (ALTER COLUMN TYPE requires no dependents)
DROP POLICY IF EXISTS "users_select_own"            ON public.users;
DROP POLICY IF EXISTS "users_update_own"            ON public.users;
DROP POLICY IF EXISTS "users_admin_all"             ON public.users;
DROP POLICY IF EXISTS "users_select_public_owners"  ON public.users;

-- public.admin_audit_log
DROP POLICY IF EXISTS "admins_view_audit_logs"     ON public.admin_audit_log;

-- public.agents
DROP POLICY IF EXISTS "Admins can manage agents"   ON public.agents;

-- public.kyc_requests
DROP POLICY IF EXISTS "Admins can manage KYC requests" ON public.kyc_requests;

-- public.owners
DROP POLICY IF EXISTS "Admins can manage owners"   ON public.owners;

-- public.payments
DROP POLICY IF EXISTS "Admins can view all payments" ON public.payments;

-- public.reviews
DROP POLICY IF EXISTS "Admins can manage reviews"  ON public.reviews;

-- public.properties
DROP POLICY IF EXISTS "agents_or_admins_insert_properties" ON public.properties;

-- =============================================================================
-- STEP 3: Drop handle_new_user trigger + function
-- The trigger must be dropped first, then the function.
-- NB: DROP FUNCTION ... CASCADE would also drop the trigger.
-- =============================================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- =============================================================================
-- STEP 4: Alter public.users.role column to use new user_role type
-- Must drop the default first (it is bound to the old app_role type),
-- change the column type, then re-add the default with the new type.
-- =============================================================================
ALTER TABLE public.users
  ALTER COLUMN role DROP DEFAULT;

ALTER TABLE public.users
  ALTER COLUMN role TYPE public.user_role
  USING role::text::public.user_role;

ALTER TABLE public.users
  ALTER COLUMN role SET DEFAULT 'user'::public.user_role;

-- =============================================================================
-- STEP 5: Drop old app_role enum (no more dependents)
-- =============================================================================
DROP TYPE IF EXISTS public.app_role;

-- =============================================================================
-- STEP 6: Recreate handle_new_user() with user_role
-- =============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role public.user_role;
BEGIN
  BEGIN
    v_role := COALESCE(
      (NEW.raw_user_meta_data ->> 'user_type')::public.user_role,
      'user'::public.user_role
    );
  EXCEPTION WHEN invalid_text_representation THEN
    v_role := 'user'::public.user_role;
  END;

  INSERT INTO public.users (id, email, phone, full_name, role, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.phone,
    COALESCE(
      NEW.raw_user_meta_data ->> 'full_name',
      NEW.raw_user_meta_data ->> 'name',
      split_part(NEW.email, '@', 1)
    ),
    v_role,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email      = EXCLUDED.email,
    updated_at = NOW();

  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- =============================================================================
-- STEP 7: Recreate trigger
-- =============================================================================
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- STEP 8: Recreate all dropped RLS policies with ::public.user_role casts
-- =============================================================================

-- public.users: own record read
CREATE POLICY "users_select_own"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

-- public.users: own record update (cannot escalate own role)
CREATE POLICY "users_update_own"
  ON public.users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = (SELECT role FROM public.users WHERE id = auth.uid())
  );

-- public.users: admin unrestricted access
CREATE POLICY "users_admin_all"
  ON public.users FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.users u
            WHERE u.id = auth.uid() AND u.role = 'admin'::public.user_role)
  );

-- public.users: owner profiles publicly readable
CREATE POLICY "users_select_public_owners"
  ON public.users FOR SELECT
  USING (role = 'owner'::public.user_role AND deleted_at IS NULL);

-- public.admin_audit_log: admin read
CREATE POLICY "admins_view_audit_logs"
  ON public.admin_audit_log FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.users
                 WHERE id = auth.uid() AND role = 'admin'::public.user_role));

-- public.agents: admin manage
CREATE POLICY "Admins can manage agents"
  ON public.agents FOR ALL
  USING (EXISTS (SELECT 1 FROM public.users
                 WHERE id = auth.uid() AND role = 'admin'::public.user_role));

-- public.kyc_requests: admin manage
CREATE POLICY "Admins can manage KYC requests"
  ON public.kyc_requests FOR ALL
  USING (EXISTS (SELECT 1 FROM public.users
                 WHERE id = auth.uid() AND role = 'admin'::public.user_role));

-- public.owners: admin manage
CREATE POLICY "Admins can manage owners"
  ON public.owners FOR ALL
  USING (EXISTS (SELECT 1 FROM public.users
                 WHERE id = auth.uid() AND role = 'admin'::public.user_role));

-- public.payments: admin read all
CREATE POLICY "Admins can view all payments"
  ON public.payments FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.users
                 WHERE id = auth.uid() AND role = 'admin'::public.user_role));

-- public.reviews: admin manage
CREATE POLICY "Admins can manage reviews"
  ON public.reviews FOR ALL
  USING (EXISTS (SELECT 1 FROM public.users
                 WHERE id = auth.uid() AND role = 'admin'::public.user_role));

-- public.properties: agents or admins can insert
CREATE POLICY "agents_or_admins_insert_properties"
  ON public.properties FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
        AND role = ANY(ARRAY['agent'::public.user_role, 'admin'::public.user_role])
    )
  );

-- =============================================================================
-- SANITY CHECK
-- =============================================================================
DO $$
DECLARE
  v_old_enum_exists BOOLEAN;
  v_new_enum_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public' AND t.typname = 'app_role'
  ) INTO v_old_enum_exists;

  SELECT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public' AND t.typname = 'user_role'
  ) INTO v_new_enum_exists;

  RAISE NOTICE '=== Migration 20260402 complete ===';
  RAISE NOTICE 'old app_role exists : % (expected false)', v_old_enum_exists;
  RAISE NOTICE 'new user_role exists: % (expected true)',  v_new_enum_exists;

  IF v_old_enum_exists THEN
    RAISE EXCEPTION 'ABORT: public.app_role still exists — drop failed.';
  END IF;

  IF NOT v_new_enum_exists THEN
    RAISE EXCEPTION 'ABORT: public.user_role not found — creation failed.';
  END IF;
END;
$$;
