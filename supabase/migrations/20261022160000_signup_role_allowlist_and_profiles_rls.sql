-- Signup may only mint marketplace roles from Auth metadata.
-- Staff/admin roles are invite- or promote-only.
-- Also close world-readable profiles SELECT from 20241202.

BEGIN;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_raw text;
  v_role public.user_role;
BEGIN
  v_raw := NEW.raw_user_meta_data ->> 'user_type';

  IF v_raw IN ('user', 'owner', 'agent') THEN
    v_role := v_raw::public.user_role;
  ELSE
    -- Invalid strings and staff/admin values never elevate from self-signup.
    v_role := 'user'::public.user_role;
  END IF;

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

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;

-- Own row only. Public marketplace cards go through Prisma API projections.
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

COMMIT;
