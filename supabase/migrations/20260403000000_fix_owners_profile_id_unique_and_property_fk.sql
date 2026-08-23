-- =============================================================================
-- Migration: Fix owners table — make profile_id unique, repoint properties FK
-- =============================================================================
-- Problem:
--   • owners.profile_id was NOT unique (allowed multiple owner rows per profile)
--   • properties.owner_id → profiles.id (bypassed the owners table entirely)
-- Fix (mirrors the agents pattern):
--   • owners.profile_id @unique (1-to-1 with profiles)
--   • properties.owner_id → owners.id (proper FK chain)
-- =============================================================================

-- STEP 1: Make owners.profile_id unique (1-to-1 with profiles)
ALTER TABLE public.owners
  ADD CONSTRAINT owners_profile_id_key UNIQUE (profile_id);

-- STEP 2: Auto-create owner records for any profile UUID currently stored in
--         properties.owner_id that doesn't already have an owners row.
INSERT INTO public.owners (id, profile_id, created_at, updated_at)
SELECT gen_random_uuid(), p.owner_id, NOW(), NOW()
FROM public.properties p
WHERE p.owner_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.owners o WHERE o.profile_id = p.owner_id
  );

-- STEP 3: Drop the old FK (properties.owner_id → profiles.id)
ALTER TABLE public.properties
  DROP CONSTRAINT IF EXISTS properties_owner_id_fkey;

-- STEP 4: Repoint properties.owner_id from profile UUID → owners.id
UPDATE public.properties p
SET owner_id = o.id
FROM public.owners o
WHERE o.profile_id = p.owner_id
  AND p.owner_id IS NOT NULL;

-- STEP 5: Add new FK (properties.owner_id → owners.id)
ALTER TABLE public.properties
  ADD CONSTRAINT properties_owner_id_fkey
  FOREIGN KEY (owner_id) REFERENCES public.owners(id) ON DELETE CASCADE;
