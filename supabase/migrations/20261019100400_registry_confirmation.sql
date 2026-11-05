alter table public.property_verification_cases
  add column if not exists registry_reference text,
  add column if not exists registry_matches boolean,
  add column if not exists registry_confirmed_at timestamptz;

alter table public.property_verification_evidence
  drop constraint if exists property_verification_evidence_layer_check;

alter table public.property_verification_evidence
  add constraint property_verification_evidence_layer_check
  check (layer in ('submitted', 'documentary', 'physical', 'registry'));
