-- Add minimal self-service policies for authenticated onboarding/profile flows.

BEGIN;

DROP POLICY IF EXISTS "agents_select_own" ON public.agents;
DROP POLICY IF EXISTS "agents_insert_own" ON public.agents;
DROP POLICY IF EXISTS "owners_select_own" ON public.owners;
DROP POLICY IF EXISTS "owners_insert_own" ON public.owners;
DROP POLICY IF EXISTS "kyc_requests_select_own" ON public.kyc_requests;
DROP POLICY IF EXISTS "kyc_requests_insert_own" ON public.kyc_requests;

CREATE POLICY "agents_select_own"
  ON public.agents FOR SELECT
  USING (auth.uid() = profile_id);

CREATE POLICY "agents_insert_own"
  ON public.agents FOR INSERT
  WITH CHECK (
    auth.uid() = profile_id
    AND public.get_user_type(auth.uid()) = 'agent'
  );

CREATE POLICY "owners_select_own"
  ON public.owners FOR SELECT
  USING (auth.uid() = profile_id);

CREATE POLICY "owners_insert_own"
  ON public.owners FOR INSERT
  WITH CHECK (
    auth.uid() = profile_id
    AND public.get_user_type(auth.uid()) = 'owner'
  );

CREATE POLICY "kyc_requests_select_own"
  ON public.kyc_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "kyc_requests_insert_own"
  ON public.kyc_requests FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND public.get_user_type(auth.uid()) IN ('agent', 'owner')
  );

COMMIT;