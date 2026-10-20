alter table public.inquiries alter column sender_id drop not null;

alter table public.inquiries add column if not exists guest_name text;
alter table public.inquiries add column if not exists guest_email text;
alter table public.inquiries add column if not exists guest_phone text;

alter table public.inquiries drop constraint if exists inquiries_guest_or_sender;
alter table public.inquiries add constraint inquiries_guest_or_sender check (
  sender_id is not null or guest_email is not null
);
