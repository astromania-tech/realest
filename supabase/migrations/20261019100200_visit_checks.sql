create table if not exists public.property_visit_checks (
  property_id uuid primary key references public.properties(id) on delete cascade,
  officer_id uuid,
  checked_in_at timestamptz,
  latitude double precision,
  longitude double precision,
  distance_meters double precision,
  photo_path text,
  saw_building boolean,
  address_matches boolean,
  document_matches boolean,
  note text,
  open_issue text,
  correction_document_id uuid references public.property_documents(id) on delete set null,
  voided_at timestamptz
);

insert into storage.buckets (id, name, public)
values ('visit-evidence', 'visit-evidence', false)
on conflict (id) do nothing;
