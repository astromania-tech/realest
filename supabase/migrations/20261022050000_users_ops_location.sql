-- Staff operating territory for Connect field assignment.
-- Source of truth: columns on users (not metadata.field_ops).

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS ops_state text,
  ADD COLUMN IF NOT EXISTS ops_lga text,
  ADD COLUMN IF NOT EXISTS ops_state_code text;

-- Backfill from any invites that already wrote metadata.field_ops.
UPDATE public.users
SET
  ops_state = COALESCE(
    ops_state,
    NULLIF(trim(metadata->'field_ops'->>'state'), '')
  ),
  ops_lga = COALESCE(
    ops_lga,
    NULLIF(trim(metadata->'field_ops'->>'lga'), '')
  ),
  ops_state_code = COALESCE(
    ops_state_code,
    NULLIF(upper(trim(metadata->'field_ops'->>'state_code')), '')
  )
WHERE metadata ? 'field_ops';

CREATE INDEX IF NOT EXISTS idx_users_ops_state
  ON public.users (ops_state)
  WHERE ops_state IS NOT NULL;
