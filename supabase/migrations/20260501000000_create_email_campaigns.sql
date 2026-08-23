-- ============================================================
-- Migration: create email_campaigns table
-- Purpose  : Stores all email marketing campaign records.
--            Supports both Resend Broadcasts (resend_audience)
--            and Resend Batch API DB-segment (db_segment) sends.
-- ============================================================

create table if not exists public.email_campaigns (
  id               uuid        primary key default gen_random_uuid(),
  name             text        not null,
  template_name    text        not null,
  subject          text        not null,
  -- 'resend_audience' | 'db_segment'
  audience_type    text        not null,
  -- Resend audience UUID (for resend_audience type only)
  audience_id      text,
  -- JSON filter for DB-segment queries e.g. {"role":"owner"}
  audience_filter  jsonb,
  -- 'broadcast' | 'batch'
  send_mode        text        not null,
  -- 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed' | 'cancelled'
  status           text        not null default 'draft',
  -- Serialised template props for reproducible preview / re-sending
  template_props   jsonb,
  scheduled_at     timestamptz,
  sent_at          timestamptz,
  total_recipients integer     default 0,
  sent_count       integer     default 0,
  failed_count     integer     default 0,
  -- Resend broadcast ID or first batch message ID
  resend_id        text,
  created_by       uuid        not null references public.profiles(id) on delete restrict,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

-- Indexes
create index if not exists idx_email_campaigns_status
  on public.email_campaigns (status);

create index if not exists idx_email_campaigns_created_by
  on public.email_campaigns (created_by);

create index if not exists idx_email_campaigns_created_at
  on public.email_campaigns (created_at desc);

-- updated_at trigger (reuse existing helper if available, else define inline)
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger email_campaigns_updated_at
  before update on public.email_campaigns
  for each row execute procedure public.set_updated_at();

-- Row-Level Security
alter table public.email_campaigns enable row level security;

-- Admins can do everything
create policy "admin_full_access_email_campaigns"
  on public.email_campaigns
  for all
  using (
    exists (
      select 1 from public.users
      where users.id = auth.uid()
        and users.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.users
      where users.id = auth.uid()
        and users.role = 'admin'
    )
  );
