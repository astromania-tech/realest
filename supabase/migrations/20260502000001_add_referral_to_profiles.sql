-- ──────────────────────────────────────────────────────────────────────────────
-- Migration: add referral infrastructure to profiles
-- Each registered user gets a referral_code (carried over from waitlist if they
-- signed up from wait list first), a referred_by FK, a raw referred_by_code for
-- cases where the referrer is still waitlist-only, and a running referral_count.
-- ──────────────────────────────────────────────────────────────────────────────

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS referral_code     VARCHAR(20) UNIQUE,
  ADD COLUMN IF NOT EXISTS referred_by       UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS referred_by_code  VARCHAR(20),   -- raw code for waitlist-only referrers
  ADD COLUMN IF NOT EXISTS referral_count    INT NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON profiles(referral_code);
CREATE INDEX IF NOT EXISTS idx_profiles_referred_by   ON profiles(referred_by);

-- ─── Trigger: auto-generate referral_code on INSERT ──────────────────────────
-- Carries over the waitlist referral_code for existing waitlist members so that
-- a single person always has the same code across both systems.
CREATE OR REPLACE FUNCTION profiles_set_referral_code()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_code TEXT;
BEGIN
  -- Try to carry over an existing code from the waitlist
  SELECT referral_code INTO v_code
  FROM waitlist
  WHERE lower(email) = lower(NEW.email)
    AND referral_code IS NOT NULL
  LIMIT 1;

  -- Generate a fresh 8-char uppercase code if nothing was found
  IF v_code IS NULL THEN
    v_code := upper(substring(replace(gen_random_uuid()::text, '-', ''), 1, 8));
  END IF;

  NEW.referral_code := v_code;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_set_referral_code_trigger ON profiles;
CREATE TRIGGER profiles_set_referral_code_trigger
  BEFORE INSERT ON profiles
  FOR EACH ROW
  WHEN (NEW.referral_code IS NULL)
  EXECUTE FUNCTION profiles_set_referral_code();

-- ─── RPC: atomically increment referral_count ────────────────────────────────
CREATE OR REPLACE FUNCTION increment_profile_referral_count(p_id UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE profiles SET referral_count = referral_count + 1 WHERE id = p_id;
END;
$$;

-- ─── Back-fill existing profiles ─────────────────────────────────────────────
-- Assign referral_code to rows that were created before this migration ran.
-- Prefer the matching waitlist code; fall back to a fresh UUID-derived code.
UPDATE profiles p
SET referral_code = sub.code
FROM (
  SELECT
    p2.id,
    COALESCE(
      (
        SELECT w.referral_code
        FROM waitlist w
        WHERE lower(w.email) = lower(p2.email)
          AND w.referral_code IS NOT NULL
        LIMIT 1
      ),
      upper(substring(replace(gen_random_uuid()::text, '-', ''), 1, 8))
    ) AS code
  FROM profiles p2
  WHERE p2.referral_code IS NULL
) sub
WHERE p.id = sub.id;
