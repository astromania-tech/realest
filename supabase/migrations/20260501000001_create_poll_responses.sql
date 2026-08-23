-- Migration: Create poll_responses table for city preference survey (and future polls)
-- Each row is an anonymous vote submitted via /poll/city or similar pages.

CREATE TABLE IF NOT EXISTS poll_responses (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  question_key TEXT        NOT NULL,          -- e.g. 'city'
  answer       TEXT        NOT NULL,          -- e.g. 'Lagos'
  ref          TEXT,                          -- campaign ref, e.g. 'frontier', 'milestone'
  ip_address   TEXT,                          -- anonymised after 30 days via scheduled job
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for reporting queries
CREATE INDEX IF NOT EXISTS poll_responses_question_key_idx ON poll_responses (question_key);
CREATE INDEX IF NOT EXISTS poll_responses_created_at_idx  ON poll_responses (created_at DESC);

-- Row Level Security
ALTER TABLE poll_responses ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a poll response (no auth required)
CREATE POLICY "public_can_insert_poll_responses"
  ON poll_responses
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Only admins can read poll results
CREATE POLICY "admins_can_select_poll_responses"
  ON poll_responses
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
  );
