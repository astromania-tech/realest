-- =============================================================================
-- Migration: Create public.users + Consolidate Role Management
-- Timestamp: 20260401000000
--
-- OBJECTIVES:
--   • Fix `prisma db pull` P4002 cross-schema error — eliminate all FKs
--     from public schema to auth schema (zero cross-schema FK at end)
--   • Single source of truth for role: public.users.role (app_role enum)
--   • public.users kept in sync with auth.users by trigger (no hard FK)
--
-- CROSS-SCHEMA FKs ELIMINATED:
--   • profiles_id_fkey         → auth.users(id)  → replaced with → public.users(id)
--   • user_roles_user_id_fkey  → auth.users(id)  → table dropped entirely
--
-- EXECUTION ORDER:
--   1.  Create public.users table
--   2.  Backfill public.users from profiles + user_roles
--   3.  Update get_user_type() helper (reads public.users.role)
--   4.  Update handle_new_user() trigger (no more user_type reference)
--   5.  Update custom_access_token_hook() (reads public.users.role)
--   6.  Drop ALL policies that depend on profiles.user_type (explicit list)
--   7.  Re-wire profiles FK: drop → auth.users, add → public.users
--   8.  Drop profiles.user_type column (no dependents remain after step 6)
--   9.  Drop user_roles table
--  10.  Drop app_role_to_db_role + safe_to_regrole()
--  11.  Drop user_type_enum
--  12.  Enable RLS on public.users + policies
--  13.  Recreate all dropped policies with updated expressions
--  14.  Sanity check — aborts if any cross-schema FKs remain
-- =============================================================================

-- =============================================================================
-- STEP 1: Create public.users
-- No FK to auth.users — IDs match by convention; enforced by trigger.
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.users (
  id          UUID            NOT NULL PRIMARY KEY,
  email       TEXT            UNIQUE,
  phone       TEXT,
  full_name   TEXT,
  avatar_url  TEXT,
  role        public.app_role NOT NULL DEFAULT 'user',
  is_active   BOOLEAN         NOT NULL DEFAULT TRUE,
  metadata    JSONB           DEFAULT '{}'::JSONB,
  created_at  TIMESTAMPTZ     DEFAULT NOW(),
  updated_at  TIMESTAMPTZ     DEFAULT NOW(),
  deleted_at  TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_users_role       ON public.users (role);
CREATE INDEX IF NOT EXISTS idx_users_email      ON public.users (email);
CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON public.users (deleted_at)
  WHERE deleted_at IS NOT NULL;

-- =============================================================================
-- STEP 2: Backfill public.users from profiles + user_roles
-- Role priority: user_roles.role > profiles.user_type > 'user'
-- =============================================================================
INSERT INTO public.users (id, email, phone, full_name, avatar_url, role, created_at, updated_at)
SELECT
  p.id,
  p.email,
  p.phone,
  p.full_name,
  p.avatar_url,
  COALESCE(ur.role, p.user_type, 'user'::public.app_role) AS role,
  COALESCE(p.created_at, NOW()),
  COALESCE(p.updated_at, NOW())
FROM public.profiles p
LEFT JOIN public.user_roles ur ON ur.user_id = p.id
ON CONFLICT (id) DO UPDATE SET
  email      = EXCLUDED.email,
  phone      = EXCLUDED.phone,
  full_name  = EXCLUDED.full_name,
  avatar_url = EXCLUDED.avatar_url,
  role       = EXCLUDED.role,
  updated_at = EXCLUDED.updated_at;

-- =============================================================================
-- STEP 3: Update get_user_type() — was reading profiles.user_type
-- Now reads public.users.role (same UUID lookup, new table)
-- =============================================================================
CREATE OR REPLACE FUNCTION public.get_user_type(p_uid UUID)
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role::TEXT FROM public.users WHERE id = p_uid;
$$;

-- =============================================================================
-- STEP 4: Update handle_new_user() trigger
-- Writes to public.users + profiles; no longer references user_type column.
-- =============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role public.app_role;
BEGIN
  BEGIN
    v_role := COALESCE(
      (NEW.raw_user_meta_data ->> 'user_type')::public.app_role,
      'user'::public.app_role
    );
  EXCEPTION WHEN invalid_text_representation THEN
    v_role := 'user'::public.app_role;
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

  -- profiles.id will FK → public.users(id) after step 7
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- STEP 5: Update custom_access_token_hook
-- Reads role from public.users — single source of truth for JWT app_metadata.
-- =============================================================================
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event JSONB)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  claims    JSONB := event;
  user_role TEXT;
BEGIN
  SELECT u.role::TEXT INTO user_role
  FROM public.users u
  WHERE u.id = (event ->> 'user_id')::UUID;

  IF user_role IS NULL THEN
    user_role := 'user';
  END IF;

  claims := jsonb_set(claims, '{app_metadata}',       COALESCE(claims -> 'app_metadata', '{}'::JSONB));
  claims := jsonb_set(claims, '{app_metadata,role}',  to_jsonb(user_role));
  claims := jsonb_set(claims, '{role}',               to_jsonb('authenticated'::TEXT));

  RETURN claims;
END;
$$;

-- =============================================================================
-- STEP 6: Drop ALL policies that reference profiles.user_type
-- Must happen BEFORE dropping the column to avoid dependency errors.
-- =============================================================================

-- profiles
DROP POLICY IF EXISTS "profiles_select_public_owners" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_self"          ON public.profiles;

-- admin_audit_log
DROP POLICY IF EXISTS "admins_view_audit_logs" ON public.admin_audit_log;

-- agents
DROP POLICY IF EXISTS "Admins can manage agents" ON public.agents;

-- kyc_requests
DROP POLICY IF EXISTS "Admins can manage KYC requests" ON public.kyc_requests;

-- owners
DROP POLICY IF EXISTS "Admins can manage owners" ON public.owners;

-- payments
DROP POLICY IF EXISTS "Admins can view all payments" ON public.payments;

-- reviews
DROP POLICY IF EXISTS "Admins can manage reviews" ON public.reviews;

-- properties
DROP POLICY IF EXISTS "agents_or_admins_insert_properties"  ON public.properties;
DROP POLICY IF EXISTS "properties_insert_owner_agent_jwt"   ON public.properties;

-- =============================================================================
-- STEP 7: Re-wire profiles FK
-- Drop cross-schema constraint (auth.users), add intra-schema (public.users).
-- =============================================================================
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_users_id_fkey
  FOREIGN KEY (id) REFERENCES public.users(id) ON DELETE CASCADE;

-- =============================================================================
-- STEP 8: Drop profiles.user_type column
-- All dependencies removed in steps 3 and 6 above.
-- =============================================================================
DROP INDEX  IF EXISTS public.idx_profiles_user_type;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS user_type;

-- =============================================================================
-- STEP 9: Drop user_roles table
-- Drops user_roles_user_id_fkey → auth.users (second cross-schema FK).
-- =============================================================================
DROP TABLE IF EXISTS public.user_roles;

-- =============================================================================
-- STEP 10: Drop app_role_to_db_role + safe_to_regrole()
-- =============================================================================
DROP FUNCTION IF EXISTS public.safe_to_regrole(public.app_role);
DROP TABLE  IF EXISTS public.app_role_to_db_role;

-- =============================================================================
-- STEP 11: Drop user_type_enum (exact duplicate of app_role)
-- =============================================================================
DROP TYPE IF EXISTS public.user_type_enum;

-- =============================================================================
-- STEP 12: Enable RLS on public.users + baseline policies
-- =============================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Own record: read
CREATE POLICY "users_select_own"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

-- Own record: update (cannot escalate own role)
CREATE POLICY "users_update_own"
  ON public.users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = (SELECT role FROM public.users WHERE id = auth.uid())
  );

-- Admin: unrestricted access
CREATE POLICY "users_admin_all"
  ON public.users FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.users u
            WHERE u.id = auth.uid() AND u.role = 'admin'::public.app_role)
  );

-- Public: owner profiles readable (for property listing contact info)
CREATE POLICY "users_select_public_owners"
  ON public.users FOR SELECT
  USING (role = 'owner'::public.app_role AND deleted_at IS NULL);

-- =============================================================================
-- STEP 13: Recreate all dropped policies with updated expressions
-- All admin checks now query public.users.role instead of profiles.user_type.
-- =============================================================================

-- Helper macro used in comments:
--   admin_check = EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')

-- profiles: self-insert (no longer checks user_type; role lives on public.users)
CREATE POLICY "profiles_insert_self"
  ON public.profiles FOR INSERT
  WITH CHECK (id = auth.uid());

-- admin_audit_log: admin read
CREATE POLICY "admins_view_audit_logs"
  ON public.admin_audit_log FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.users
                 WHERE id = auth.uid() AND role = 'admin'::public.app_role));

-- agents: admin manage
CREATE POLICY "Admins can manage agents"
  ON public.agents FOR ALL
  USING (EXISTS (SELECT 1 FROM public.users
                 WHERE id = auth.uid() AND role = 'admin'::public.app_role));

-- kyc_requests: admin manage
CREATE POLICY "Admins can manage KYC requests"
  ON public.kyc_requests FOR ALL
  USING (EXISTS (SELECT 1 FROM public.users
                 WHERE id = auth.uid() AND role = 'admin'::public.app_role));

-- owners: admin manage
CREATE POLICY "Admins can manage owners"
  ON public.owners FOR ALL
  USING (EXISTS (SELECT 1 FROM public.users
                 WHERE id = auth.uid() AND role = 'admin'::public.app_role));

-- payments: admin read all
CREATE POLICY "Admins can view all payments"
  ON public.payments FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.users
                 WHERE id = auth.uid() AND role = 'admin'::public.app_role));

-- reviews: admin manage
CREATE POLICY "Admins can manage reviews"
  ON public.reviews FOR ALL
  USING (EXISTS (SELECT 1 FROM public.users
                 WHERE id = auth.uid() AND role = 'admin'::public.app_role));

-- properties: agents or admins can insert
-- Updated to check public.users.role instead of profiles.user_type
CREATE POLICY "agents_or_admins_insert_properties"
  ON public.properties FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
        AND role = ANY(ARRAY['agent'::public.app_role, 'admin'::public.app_role])
    )
  );

-- properties: owner/agent insert using JWT app_metadata.role
-- JWT claim is now app_metadata.role (set by custom_access_token_hook)
-- Old: auth.jwt() ->> 'user_type'
-- New: auth.jwt() -> 'app_metadata' ->> 'role'
CREATE POLICY "properties_insert_owner_agent_jwt"
  ON public.properties FOR INSERT
  WITH CHECK (
    (
      owner_id = auth.uid()
      AND (auth.jwt() -> 'app_metadata' ->> 'role') = ANY(ARRAY['owner', 'agent'])
    )
    OR
    (
      agent_id = auth.uid()
      AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'agent'
    )
  );

-- =============================================================================
-- STEP 14: Sanity check — aborts if any cross-schema FKs remain
-- =============================================================================
DO $$
DECLARE
  v_users      BIGINT;
  v_profiles   BIGINT;
  v_fk_to_auth BIGINT;
BEGIN
  SELECT COUNT(*) INTO v_users    FROM public.users;
  SELECT COUNT(*) INTO v_profiles FROM public.profiles;

  SELECT COUNT(*) INTO v_fk_to_auth
  FROM pg_constraint c
  JOIN pg_class     cl ON cl.oid = c.conrelid
  JOIN pg_namespace n  ON  n.oid = cl.relnamespace
  WHERE c.contype = 'f'
    AND n.nspname  = 'public'
    AND pg_get_constraintdef(c.oid) ILIKE '%auth.users%';

  RAISE NOTICE '=== Migration 20260401 complete ===';
  RAISE NOTICE 'public.users rows    : %', v_users;
  RAISE NOTICE 'public.profiles rows : %', v_profiles;
  RAISE NOTICE 'Cross-schema FKs → auth.users remaining: % (expected 0)', v_fk_to_auth;

  IF v_fk_to_auth > 0 THEN
    RAISE EXCEPTION 'ABORT: % FK(s) to auth.users still present. Migration incomplete.', v_fk_to_auth;
  END IF;

  IF v_users < v_profiles THEN
    RAISE WARNING 'public.users (%) fewer rows than public.profiles (%) — check backfill',
      v_users, v_profiles;
  END IF;
END;
$$;
