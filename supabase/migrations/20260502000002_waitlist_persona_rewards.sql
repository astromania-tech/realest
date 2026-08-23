-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: persona-aware waitlist rewards and referral milestones
-- Adds waitlist persona/ranking fields, profile waitlist context fields,
-- reward entitlement tables, referral event tables, and waitlist rank history.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE waitlist
  ADD COLUMN IF NOT EXISTS persona TEXT NOT NULL DEFAULT 'buyer_renter',
  ADD COLUMN IF NOT EXISTS persona_details JSONB,
  ADD COLUMN IF NOT EXISTS queue_score INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS queue_rank INT,
  ADD COLUMN IF NOT EXISTS candidate_role TEXT,
  ADD COLUMN IF NOT EXISTS poll_completion_count INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS waitlist_reward_eligible BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE waitlist
SET
  candidate_role = CASE persona
    WHEN 'owner_landlord' THEN 'owner'
    WHEN 'agent' THEN 'agent'
    WHEN 'developer_agency' THEN 'owner'
    ELSE 'user'
  END,
  waitlist_reward_eligible = CASE
    WHEN persona IN ('owner_landlord', 'agent') THEN TRUE
    ELSE FALSE
  END
WHERE candidate_role IS NULL OR waitlist_reward_eligible = FALSE;

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS waitlist_persona TEXT,
  ADD COLUMN IF NOT EXISTS candidate_role TEXT,
  ADD COLUMN IF NOT EXISTS role_activated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS launch_reward_window_ends_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS reward_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  reward_system TEXT NOT NULL,
  description TEXT NOT NULL,
  is_redeemable BOOLEAN NOT NULL DEFAULT FALSE,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reward_entitlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  waitlist_id UUID REFERENCES waitlist(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  reward_key TEXT NOT NULL REFERENCES reward_catalog(key) ON DELETE RESTRICT,
  source_event TEXT NOT NULL,
  source_referral_count INT,
  status TEXT NOT NULL DEFAULT 'active',
  granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_reward_entitlements_email_key
  ON reward_entitlements (user_email, reward_key)
  WHERE status IN ('active', 'redeemed');

CREATE INDEX IF NOT EXISTS idx_reward_entitlements_waitlist_id ON reward_entitlements(waitlist_id);
CREATE INDEX IF NOT EXISTS idx_reward_entitlements_profile_id ON reward_entitlements(profile_id);

CREATE TABLE IF NOT EXISTS reward_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entitlement_id UUID NOT NULL REFERENCES reward_entitlements(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  redemption_context TEXT NOT NULL,
  redemption_reference_id TEXT,
  redeemed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS referral_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_waitlist_id UUID REFERENCES waitlist(id) ON DELETE SET NULL,
  referrer_profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  referred_waitlist_id UUID REFERENCES waitlist(id) ON DELETE SET NULL,
  referred_profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  referral_code TEXT,
  event_type TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_referral_events_referrer_waitlist ON referral_events(referrer_waitlist_id);
CREATE INDEX IF NOT EXISTS idx_referral_events_referrer_profile ON referral_events(referrer_profile_id);
CREATE INDEX IF NOT EXISTS idx_referral_events_event_type ON referral_events(event_type);

CREATE TABLE IF NOT EXISTS waitlist_rank_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  waitlist_id UUID NOT NULL REFERENCES waitlist(id) ON DELETE CASCADE,
  rank INT NOT NULL,
  score INT NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_waitlist_rank_history_waitlist_id ON waitlist_rank_history(waitlist_id);

INSERT INTO reward_catalog (key, name, reward_system, description, is_redeemable, metadata)
VALUES
  ('first_listing_fee_waiver', 'First listing fee waiver', 'waitlist_cohort', 'First listing as an agent or property owner is free within 6 months of launch.', TRUE, '{"window_months":6}'::jsonb),
  ('early_sneak_peek', 'Early sneak peek', 'referral_milestone', 'Private preview access once the referrer reaches 3 valid referrals.', FALSE, '{"threshold":3}'::jsonb),
  ('move_up_waitlist', 'Move up waitlist', 'referral_milestone', 'Queue score boost once the referrer reaches 5 valid referrals.', FALSE, '{"threshold":5}'::jsonb),
  ('early_access', 'Early access', 'referral_milestone', 'Early access entitlement once the referrer reaches 10 valid referrals.', FALSE, '{"threshold":10}'::jsonb),
  ('realest_insider_badge', 'RealEST Insider badge', 'referral_milestone', 'Public insider status unlocked at 20 valid referrals.', FALSE, '{"threshold":20}'::jsonb),
  ('vip_launch_access', 'VIP launch access', 'referral_milestone', 'VIP launch access unlocked at 50 valid referrals.', FALSE, '{"threshold":50}'::jsonb),
  ('realest_ambassador', 'RealEST Ambassador', 'referral_milestone', 'Ambassador status unlocked at 100 valid referrals.', FALSE, '{"threshold":100}'::jsonb)
ON CONFLICT (key) DO UPDATE SET
  name = EXCLUDED.name,
  reward_system = EXCLUDED.reward_system,
  description = EXCLUDED.description,
  is_redeemable = EXCLUDED.is_redeemable,
  metadata = EXCLUDED.metadata;