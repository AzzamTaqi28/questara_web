-- Migration: 011_create_submissions.sql

create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  city_id uuid references public.cities(id) on delete set null,
  type text not null default 'event' check (type in ('event', 'place')),
  title text not null,
  location_text text,
  date_text text,
  source_url text,
  notes text,
  extracted_data jsonb not null default '{}',
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'converted')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

comment on table public.submissions is 'Community-submitted event or place suggestions.';