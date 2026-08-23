-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: add referral tracking to waitlist
-- Adds: referral_code (auto-generated unique code), referred_by (FK),
--       referral_count (cached counter), atomic RPC increment helper.
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. New columns -----------------------------------------------------------------
ALTER TABLE waitlist
  ADD COLUMN IF NOT EXISTS referral_code  VARCHAR(20)  UNIQUE,
  ADD COLUMN IF NOT EXISTS referred_by    UUID         REFERENCES waitlist(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS referral_count INT          NOT NULL DEFAULT 0;

-- 2. Indexes --------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_waitlist_referral_code ON waitlist (referral_code);
CREATE INDEX IF NOT EXISTS idx_waitlist_referred_by   ON waitlist (referred_by);

-- 3. Back-fill existing rows with a unique 8-char code --------------------------
UPDATE waitlist
SET    referral_code = upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))
WHERE  referral_code IS NULL;

-- 4. Trigger: auto-assign referral_code on INSERT --------------------------------
CREATE OR REPLACE FUNCTION set_waitlist_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER waitlist_set_referral_code
  BEFORE INSERT ON waitlist
  FOR EACH ROW EXECUTE FUNCTION set_waitlist_referral_code();

-- 5. Atomic increment RPC (avoids race conditions on referral_count) -------------
CREATE OR REPLACE FUNCTION increment_waitlist_referral_count(p_id UUID)
RETURNS VOID AS $$
  UPDATE waitlist
  SET    referral_count = referral_count + 1,
         updated_at     = NOW()
  WHERE  id = p_id;
$$ LANGUAGE SQL SECURITY DEFINER;
