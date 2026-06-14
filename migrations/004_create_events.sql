-- Migration: 004_create_events.sql

create table public.events (
  id uuid primary key default gen_random_uuid(),
  city_id uuid not null references public.cities(id) on delete cascade,
  place_id uuid references public.places(id) on delete set null,
  title text not null,
  description text,
  start_time timestamptz,
  end_time timestamptz,
  price_min integer,
  price_max integer,
  source_url text,
  image_url text,
  tags text[] not null default '{}',
  status text not null default 'draft' check (status in ('draft', 'published', 'expired', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.events is 'Time-bound activities at a place or city area.';