-- Migration: 003_create_places.sql

create table public.places (
  id uuid primary key default gen_random_uuid(),
  city_id uuid not null references public.cities(id) on delete cascade,
  name text not null,
  description text,
  category text not null,
  address text,
  lat double precision not null,
  lng double precision not null,
  opening_hours jsonb,
  ticket_price_min integer,
  ticket_price_max integer,
  image_url text,
  source_url text,
  verification_status text not null default 'draft' check (verification_status in ('draft', 'verified', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.places is 'Real-world destinations: museums, cafes, parks, heritage sites.';