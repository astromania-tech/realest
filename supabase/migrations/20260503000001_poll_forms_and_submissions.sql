-- Migration: Poll catalog + submissions (persona-segmented launch intelligence polls)

CREATE TABLE IF NOT EXISTS poll_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS poll_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES poll_forms(id) ON DELETE CASCADE,
  question_key TEXT NOT NULL,
  segment TEXT NOT NULL,
  prompt TEXT NOT NULL,
  question_type TEXT NOT NULL,
  options JSONB,
  is_required BOOLEAN NOT NULL DEFAULT true,
  display_order INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (form_id, question_key)
);

CREATE TABLE IF NOT EXISTS poll_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES poll_forms(id) ON DELETE RESTRICT,
  segment TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  opt_in_email_results BOOLEAN NOT NULL DEFAULT false,
  referral_code TEXT,
  source TEXT NOT NULL DEFAULT 'web',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS poll_submission_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES poll_submissions(id) ON DELETE CASCADE,
  question_key TEXT NOT NULL,
  answer JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (submission_id, question_key)
);

CREATE INDEX IF NOT EXISTS poll_questions_form_segment_idx ON poll_questions (form_id, segment, display_order);
CREATE INDEX IF NOT EXISTS poll_submissions_form_segment_idx ON poll_submissions (form_id, segment);
CREATE INDEX IF NOT EXISTS poll_submissions_email_idx ON poll_submissions (email);
CREATE INDEX IF NOT EXISTS poll_submission_answers_submission_idx ON poll_submission_answers (submission_id);
CREATE INDEX IF NOT EXISTS poll_submission_answers_question_key_idx ON poll_submission_answers (question_key);

ALTER TABLE poll_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_submission_answers ENABLE ROW LEVEL SECURITY;

-- Public can read active forms and questions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'poll_forms' AND policyname = 'public_can_read_active_poll_forms'
  ) THEN
    CREATE POLICY "public_can_read_active_poll_forms"
      ON poll_forms
      FOR SELECT
      USING (is_active = true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'poll_questions' AND policyname = 'public_can_read_poll_questions'
  ) THEN
    CREATE POLICY "public_can_read_poll_questions"
      ON poll_questions
      FOR SELECT
      USING (true);
  END IF;
END $$;

-- Public can insert submissions + answers
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'poll_submissions' AND policyname = 'public_can_insert_poll_submissions'
  ) THEN
    CREATE POLICY "public_can_insert_poll_submissions"
      ON poll_submissions
      FOR INSERT
      TO public
      WITH CHECK (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'poll_submission_answers' AND policyname = 'public_can_insert_poll_submission_answers'
  ) THEN
    CREATE POLICY "public_can_insert_poll_submission_answers"
      ON poll_submission_answers
      FOR INSERT
      TO public
      WITH CHECK (true);
  END IF;
END $$;

-- Admin can read responses
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'poll_submissions' AND policyname = 'admins_can_select_poll_submissions'
  ) THEN
    CREATE POLICY "admins_can_select_poll_submissions"
      ON poll_submissions
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM users
          WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'poll_submission_answers' AND policyname = 'admins_can_select_poll_submission_answers'
  ) THEN
    CREATE POLICY "admins_can_select_poll_submission_answers"
      ON poll_submission_answers
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM users
          WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
      );
  END IF;
END $$;

INSERT INTO poll_forms (slug, title, description, is_active)
VALUES (
  'realest-launch-intelligence-2026',
  'RealEST Launch Intelligence Poll',
  'Persona-based market intelligence poll for demand, supply, and partnerships.',
  true
)
ON CONFLICT (slug) DO UPDATE
SET title = EXCLUDED.title,
    description = EXCLUDED.description,
    is_active = EXCLUDED.is_active,
    updated_at = now();

WITH selected_form AS (
  SELECT id FROM poll_forms WHERE slug = 'realest-launch-intelligence-2026' LIMIT 1
)
INSERT INTO poll_questions (
  form_id,
  question_key,
  segment,
  prompt,
  question_type,
  options,
  is_required,
  display_order
)
SELECT
  selected_form.id,
  q.question_key,
  q.segment,
  q.prompt,
  q.question_type,
  q.options::jsonb,
  q.is_required,
  q.display_order
FROM selected_form
CROSS JOIN (
  VALUES
    -- Buyers & Renters (12)
    ('q01_looking_timeline','buyer_renter','Are you currently looking for a property?','single_choice','[{"value":"yes_now","label":"Yes now"},{"value":"within_6_months","label":"Within 6 months"},{"value":"within_1_year","label":"Within 1 year"}]',true,1),
    ('q02_property_type','buyer_renter','What are you searching for?','single_choice','[{"value":"apartment","label":"Apartment"},{"value":"house","label":"House"},{"value":"land","label":"Land"},{"value":"commercial","label":"Commercial property"}]',true,2),
    ('q03_transaction_type','buyer_renter','Are you looking to buy, rent, or lease?','single_choice','[{"value":"buy","label":"Buy"},{"value":"rent","label":"Rent"},{"value":"lease","label":"Lease"}]',true,3),
    ('q04_city','buyer_renter','Which city are you interested in?','text',NULL,true,4),
    ('q05_neighbourhood','buyer_renter','Which area or neighborhood?','text',NULL,true,5),
    ('q06_budget_range','buyer_renter','What is your price range?','single_choice','[{"value":"under_5m","label":"Under ₦5M / ₦500k yearly"},{"value":"5m_20m","label":"₦5M - ₦20M / ₦500k - ₦2M yearly"},{"value":"20m_50m","label":"₦20M - ₦50M / ₦2M - ₦5M yearly"},{"value":"50m_plus","label":"₦50M+ / ₦5M+ yearly"}]',true,6),
    ('q07_bedrooms','buyer_renter','How many bedrooms do you need?','single_choice','[{"value":"studio","label":"Studio"},{"value":"1_bed","label":"1 bedroom"},{"value":"2_bed","label":"2 bedrooms"},{"value":"3_bed","label":"3 bedrooms"},{"value":"4_plus","label":"4+ bedrooms"}]',true,7),
    ('q08_priority_factor','buyer_renter','What is most important to you?','single_choice','[{"value":"location","label":"Location"},{"value":"price","label":"Price"},{"value":"security","label":"Security"},{"value":"condition","label":"Property condition"}]',true,8),
    ('q09_fake_listing_experience','buyer_renter','Have you experienced fake property listings before?','single_choice','[{"value":"yes","label":"Yes"},{"value":"no","label":"No"}]',true,9),
    ('q10_search_duration','buyer_renter','How long have you been searching?','single_choice','[{"value":"under_1_month","label":"Under 1 month"},{"value":"1_to_3_months","label":"1-3 months"},{"value":"3_to_6_months","label":"3-6 months"},{"value":"6_plus_months","label":"6+ months"}]',true,10),
    ('q11_search_frustration','buyer_renter','What frustrates you the most when searching for property?','text',NULL,true,11),
    ('q12_willing_to_pay_for_verified','buyer_renter','Would you pay for verified listings and property transparency?','single_choice','[{"value":"yes","label":"Yes"},{"value":"maybe","label":"Maybe"},{"value":"no","label":"No"}]',true,12),

    -- Owners / Landlords (8)
    ('q13_has_property_to_list','owner_landlord','Do you own property you want to sell or rent?','single_choice','[{"value":"yes","label":"Yes"},{"value":"no","label":"No"}]',true,13),
    ('q14_owner_property_type','owner_landlord','What type of property do you own?','single_choice','[{"value":"apartment","label":"Apartment"},{"value":"house","label":"House"},{"value":"land","label":"Land"},{"value":"commercial","label":"Commercial property"}]',true,14),
    ('q15_owner_city','owner_landlord','Which city is the property located in?','text',NULL,true,15),
    ('q16_current_advertising_channel','owner_landlord','How do you currently advertise your property?','multi_choice','[{"value":"agent","label":"Agent"},{"value":"online_listing","label":"Online listing"},{"value":"word_of_mouth","label":"Word of mouth"}]',true,16),
    ('q17_owner_biggest_challenge','owner_landlord','What challenges do you face selling or renting property?','text',NULL,true,17),
    ('q18_time_to_close','owner_landlord','How long does it typically take to find a tenant or buyer?','single_choice','[{"value":"under_1_month","label":"Under 1 month"},{"value":"1_to_3_months","label":"1-3 months"},{"value":"3_to_6_months","label":"3-6 months"},{"value":"6_plus_months","label":"6+ months"}]',true,18),
    ('q19_prefer_verified_buyers','owner_landlord','Would you prefer a platform with verified serious buyers?','single_choice','[{"value":"yes","label":"Yes"},{"value":"maybe","label":"Maybe"},{"value":"no","label":"No"}]',true,19),
    ('q20_open_to_realest_listing','owner_landlord','Are you open to listing your property on RealEST?','single_choice','[{"value":"yes","label":"Yes"},{"value":"maybe_later","label":"Maybe later"},{"value":"no","label":"No"}]',true,20),

    -- Agents (10)
    ('q21_agent_licensed','agent','Are you a licensed real estate agent?','single_choice','[{"value":"yes","label":"Yes"},{"value":"no","label":"No"}]',true,21),
    ('q22_agent_city','agent','Which city do you operate in?','text',NULL,true,22),
    ('q23_agent_listing_volume','agent','How many property listings do you currently manage?','single_choice','[{"value":"1_10","label":"1-10"},{"value":"11_50","label":"11-50"},{"value":"51_200","label":"51-200"},{"value":"200_plus","label":"200+"}]',true,23),
    ('q24_agent_advertising_channels','agent','Where do you currently advertise properties?','text',NULL,true,24),
    ('q25_agent_biggest_challenge','agent','What is your biggest challenge as an agent?','single_choice','[{"value":"fake_leads","label":"Fake leads"},{"value":"fake_clients","label":"Fake clients"},{"value":"fake_listings","label":"Fake listings"},{"value":"other","label":"Other"}]',true,25),
    ('q26_agent_deals_per_month','agent','How many deals do you close per month?','single_choice','[{"value":"0_1","label":"0-1"},{"value":"2_5","label":"2-5"},{"value":"6_10","label":"6-10"},{"value":"10_plus","label":"10+"}]',true,26),
    ('q27_pay_for_premium_exposure','agent','Would you pay for premium listing exposure?','single_choice','[{"value":"yes","label":"Yes"},{"value":"maybe","label":"Maybe"},{"value":"no","label":"No"}]',true,27),
    ('q28_need_verified_leads','agent','Would verified property leads benefit your business?','single_choice','[{"value":"yes","label":"Yes"},{"value":"maybe","label":"Maybe"},{"value":"no","label":"No"}]',true,28),
    ('q29_need_agent_dashboard','agent','Would you like access to a professional agent dashboard?','single_choice','[{"value":"yes","label":"Yes"},{"value":"maybe","label":"Maybe"},{"value":"no","label":"No"}]',true,29),
    ('q30_interested_verified_agent_program','agent','Are you interested in becoming a RealEST verified agent?','single_choice','[{"value":"yes","label":"Yes"},{"value":"maybe","label":"Maybe"},{"value":"no","label":"No"}]',true,30),

    -- Investors (6)
    ('q31_investor_interest','investor','Are you interested in investing in property?','single_choice','[{"value":"yes","label":"Yes"},{"value":"no","label":"No"}]',true,31),
    ('q32_investment_type','investor','What type of investment interests you?','single_choice','[{"value":"rental_property","label":"Rental property"},{"value":"land_banking","label":"Land banking"},{"value":"commercial_property","label":"Commercial property"},{"value":"development","label":"Development"}]',true,32),
    ('q33_investor_target_cities','investor','Which cities are you interested in?','text',NULL,true,33),
    ('q34_investment_range','investor','What is your investment range?','single_choice','[{"value":"under_20m","label":"Under ₦20M"},{"value":"20m_100m","label":"₦20M - ₦100M"},{"value":"100m_500m","label":"₦100M - ₦500M"},{"value":"500m_plus","label":"₦500M+"}]',true,34),
    ('q35_confidence_data_needs','investor','What information would help you invest confidently?','text',NULL,true,35),
    ('q36_use_market_analytics','investor','Would you use market analytics and property insights?','single_choice','[{"value":"yes","label":"Yes"},{"value":"maybe","label":"Maybe"},{"value":"no","label":"No"}]',true,36),

    -- Developers & Agencies (5)
    ('q37_is_developer_or_agency','developer_agency','Are you a property developer or agency?','single_choice','[{"value":"yes","label":"Yes"},{"value":"no","label":"No"}]',true,37),
    ('q38_developer_volume','developer_agency','How many properties do you manage or develop annually?','single_choice','[{"value":"1_10","label":"1-10"},{"value":"11_50","label":"11-50"},{"value":"51_200","label":"51-200"},{"value":"200_plus","label":"200+"}]',true,38),
    ('q39_want_early_project_listing_access','developer_agency','Would you like early access to list projects on RealEST?','single_choice','[{"value":"yes","label":"Yes"},{"value":"maybe","label":"Maybe"},{"value":"no","label":"No"}]',true,39),
    ('q40_need_buyer_demand_insights','developer_agency','Would direct buyer demand insights benefit your business?','single_choice','[{"value":"yes","label":"Yes"},{"value":"maybe","label":"Maybe"},{"value":"no","label":"No"}]',true,40),
    ('q41_interested_partnership','developer_agency','Are you interested in partnership opportunities?','single_choice','[{"value":"yes","label":"Yes"},{"value":"maybe","label":"Maybe"},{"value":"no","label":"No"}]',true,41),

    -- Financial Institutions (3)
    ('q42_offers_mortgage_financing','bank_mortgage','Does your organization offer mortgage financing?','single_choice','[{"value":"yes","label":"Yes"},{"value":"no","label":"No"}]',true,42),
    ('q43_interest_connecting_buyers_to_mortgages','bank_mortgage','Would you be interested in connecting buyers with mortgage solutions?','single_choice','[{"value":"yes","label":"Yes"},{"value":"maybe","label":"Maybe"},{"value":"no","label":"No"}]',true,43),
    ('q44_partner_with_verified_platform','bank_mortgage','Would your institution partner with a verified property platform?','single_choice','[{"value":"yes","label":"Yes"},{"value":"maybe","label":"Maybe"},{"value":"no","label":"No"}]',true,44)
) AS q(question_key, segment, prompt, question_type, options, is_required, display_order)
ON CONFLICT (form_id, question_key) DO UPDATE
SET segment = EXCLUDED.segment,
    prompt = EXCLUDED.prompt,
    question_type = EXCLUDED.question_type,
    options = EXCLUDED.options,
    is_required = EXCLUDED.is_required,
    display_order = EXCLUDED.display_order,
    updated_at = now();
