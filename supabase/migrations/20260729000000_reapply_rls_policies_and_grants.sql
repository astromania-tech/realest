-- Reapply minimal RLS for browser-facing tables.
-- Keeps onboarding/profile flows and public property/agent browsing working.

BEGIN;

ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Public agents directory and onboarding/profile flows need table privileges.
GRANT SELECT ON TABLE public.agents TO anon, authenticated;
GRANT INSERT ON TABLE public.agents TO authenticated;

GRANT SELECT ON TABLE public.kyc_requests TO authenticated;
GRANT INSERT ON TABLE public.kyc_requests TO authenticated;

GRANT SELECT ON TABLE public.owners TO authenticated;
GRANT INSERT ON TABLE public.owners TO authenticated;

GRANT SELECT ON TABLE public.properties TO anon, authenticated;

-- Properties need a live-read policy because public pages query them from the browser.
DROP POLICY IF EXISTS "properties_select_live" ON public.properties;
DROP POLICY IF EXISTS "agents_select_public_verified" ON public.agents;
DROP POLICY IF EXISTS "properties_select_live" ON public.properties;
DROP POLICY IF EXISTS "properties_update_own" ON public.properties;
DROP POLICY IF EXISTS "properties_delete_own" ON public.properties;

CREATE POLICY "agents_select_public_verified"
  ON public.agents FOR SELECT
  USING (
    verified = true
    OR auth.uid() = profile_id
    OR COALESCE((auth.jwt() -> 'app_metadata' ->> 'role')::public.user_role, 'user'::public.user_role) = 'admin'::public.user_role
  );

CREATE POLICY "properties_select_live"
  ON public.properties FOR SELECT
  USING (
    status = ANY (ARRAY['live', 'active'])
    OR auth.uid() = owner_id
    OR auth.uid() = agent_id
    OR COALESCE((auth.jwt() -> 'app_metadata' ->> 'role')::public.user_role, 'user'::public.user_role) = 'admin'::public.user_role
  );

CREATE POLICY "properties_update_own"
  ON public.properties FOR UPDATE
  USING (
    auth.uid() = owner_id
    OR auth.uid() = agent_id
    OR COALESCE((auth.jwt() -> 'app_metadata' ->> 'role')::public.user_role, 'user'::public.user_role) = 'admin'::public.user_role
  )
  WITH CHECK (
    auth.uid() = owner_id
    OR auth.uid() = agent_id
    OR COALESCE((auth.jwt() -> 'app_metadata' ->> 'role')::public.user_role, 'user'::public.user_role) = 'admin'::public.user_role
  );

CREATE POLICY "properties_delete_own"
  ON public.properties FOR DELETE
  USING (
    auth.uid() = owner_id
    OR auth.uid() = agent_id
    OR COALESCE((auth.jwt() -> 'app_metadata' ->> 'role')::public.user_role, 'user'::public.user_role) = 'admin'::public.user_role
  );

COMMIT;