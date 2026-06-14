-- Migration: 007_create_stamps.sql

create table public.stamps (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references public.places(id) on delete cascade,
  name text not null,
  description text,
  image_url text,
  rarity text not null default 'common' check (rarity in ('common', 'rare', 'epic', 'legendary')),
  created_at timestamptz not null default now()
);

comment on table public.stamps is 'Collectible digital items awarded for visiting a place.';