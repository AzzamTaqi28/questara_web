-- Migration: 008_create_check_ins.sql

create table public.check_ins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  place_id uuid not null references public.places(id) on delete cascade,
  quest_id uuid references public.quests(id) on delete set null,
  lat double precision,
  lng double precision,
  method text not null default 'gps' check (method in ('gps', 'qr', 'manual_admin')),
  is_valid boolean not null default false,
  distance_meters double precision,
  created_at timestamptz not null default now()
);

comment on table public.check_ins is 'User check-in attempts at places.';