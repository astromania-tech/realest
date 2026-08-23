-- Migration: align properties.status to match application expectations
-- The codebase uses status = 'live' for published properties, but the DB constraint
-- only allows 'active'. This renames 'active' → 'live' throughout.

BEGIN;

-- 1. Drop the old constraint
ALTER TABLE public.properties
  DROP CONSTRAINT IF EXISTS properties_status_check;

-- 2. Rename any existing 'active' rows to 'live'
UPDATE public.properties
  SET status = 'live'
  WHERE status = 'active';

-- 3. Add updated constraint with 'live' replacing 'active'
ALTER TABLE public.properties
  ADD CONSTRAINT properties_status_check
  CHECK (status = ANY (ARRAY[
    'live'::text,
    'draft'::text,
    'pending_ml_validation'::text,
    'sold'::text,
    'rented'::text,
    'inactive'::text
  ]));

COMMIT;
