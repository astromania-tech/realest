create table if not exists public.property_verification_cases (
  property_id uuid primary key references public.properties(id) on delete cascade,
  state text not null,
  claims jsonb not null default '[]'::jsonb,
  opened_at timestamptz not null default now()
);

create table if not exists public.property_verification_evidence (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  layer text not null check (layer in ('submitted', 'documentary', 'physical')),
  recorded_at timestamptz not null default now(),
  body jsonb not null
);

create index if not exists idx_property_verification_evidence_property
  on public.property_verification_evidence (property_id, recorded_at);
