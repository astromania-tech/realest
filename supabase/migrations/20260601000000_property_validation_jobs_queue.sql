-- ============================================================
-- Migration: property validation async job queue
-- Purpose  : Store async validation jobs for documents, images,
--            duplicate checks and full property validation runs.
-- ============================================================

create table if not exists public.property_validation_jobs (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  job_kind text not null default 'property',
  source text not null default 'admin_validation',
  status text not null default 'queued',
  attempts integer not null default 0,
  retry_count integer not null default 0,
  last_error text,
  failure_reason text,
  final_property_status text,
  queued_at timestamptz not null default now(),
  started_at timestamptz,
  finished_at timestamptz,
  updated_at timestamptz not null default now(),
  next_retry_at timestamptz,
  request_payload jsonb,
  result jsonb,
  requested_by uuid references public.users(id) on delete set null
);

alter table public.property_validation_jobs
  add column if not exists job_kind text not null default 'property';

alter table public.property_validation_jobs
  add column if not exists source text not null default 'admin_validation';

alter table public.property_validation_jobs
  add column if not exists status text not null default 'queued';

alter table public.property_validation_jobs
  add column if not exists attempts integer not null default 0;

alter table public.property_validation_jobs
  add column if not exists retry_count integer not null default 0;

alter table public.property_validation_jobs
  add column if not exists last_error text;

alter table public.property_validation_jobs
  add column if not exists failure_reason text;

alter table public.property_validation_jobs
  add column if not exists final_property_status text;

alter table public.property_validation_jobs
  add column if not exists queued_at timestamptz not null default now();

alter table public.property_validation_jobs
  add column if not exists started_at timestamptz;

alter table public.property_validation_jobs
  add column if not exists finished_at timestamptz;

alter table public.property_validation_jobs
  add column if not exists updated_at timestamptz not null default now();

alter table public.property_validation_jobs
  add column if not exists next_retry_at timestamptz;

alter table public.property_validation_jobs
  add column if not exists request_payload jsonb;

alter table public.property_validation_jobs
  add column if not exists result jsonb;

alter table public.property_validation_jobs
  add column if not exists requested_by uuid;

create index if not exists idx_property_validation_jobs_property_id
  on public.property_validation_jobs (property_id);

create index if not exists idx_property_validation_jobs_status
  on public.property_validation_jobs (status);

create index if not exists idx_property_validation_jobs_job_kind
  on public.property_validation_jobs (job_kind);

create index if not exists idx_property_validation_jobs_queued_at
  on public.property_validation_jobs (queued_at desc);

create index if not exists idx_property_validation_jobs_next_retry_at
  on public.property_validation_jobs (next_retry_at)
  where next_retry_at is not null;

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger property_validation_jobs_updated_at
  before update on public.property_validation_jobs
  for each row execute procedure public.set_updated_at();

create or replace function public.retry_property_validation_job(p_job_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_job jsonb;
begin
  with updated as (
    update public.property_validation_jobs
    set
      status = 'queued',
      retry_count = retry_count + 1,
      attempts = 0,
      last_error = null,
      failure_reason = null,
      final_property_status = null,
      next_retry_at = null,
      started_at = null,
      finished_at = null,
      updated_at = now()
    where id = p_job_id
    returning *
  )
  select to_jsonb(updated) into v_job
  from updated;

  if v_job is null then
    return jsonb_build_object('ok', false, 'error', 'Job not found');
  end if;

  return jsonb_build_object('ok', true, 'job', v_job);
end;
$$;
