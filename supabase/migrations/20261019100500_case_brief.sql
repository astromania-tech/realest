alter table public.property_verification_cases
  add column if not exists judgment text,
  add column if not exists state_log jsonb not null default '[]'::jsonb;
