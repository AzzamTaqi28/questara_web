-- Migration: 002_create_cities.sql

create table public.cities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  province text,
  country text not null default 'Indonesia',
  lat double precision,
  lng double precision,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

comment on table public.cities is 'Geographic markets/cities for quests and places.';