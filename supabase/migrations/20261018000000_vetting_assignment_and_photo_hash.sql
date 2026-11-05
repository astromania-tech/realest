-- Photo hashes are stored so a later duplicate check does not re-read every nearby image.
-- A pending_vetting listing stays unassigned until one admin sets the officer and visit day.
-- The RealEST Verified write stays a separate approve action.

ALTER TABLE public.property_media
  ADD COLUMN IF NOT EXISTS d_hash TEXT;

ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS vetting_officer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS vetting_visit_on DATE;

CREATE INDEX IF NOT EXISTS idx_properties_vetting_officer
  ON public.properties (vetting_officer_id)
  WHERE vetting_officer_id IS NOT NULL;
