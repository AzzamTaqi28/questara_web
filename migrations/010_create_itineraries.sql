-- Migration: 010_create_itineraries.sql

create table public.itineraries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  quest_id uuid references public.quests(id) on delete set null,
  title text,
  input_preferences jsonb not null default '{}',
  plan jsonb not null default '{}',
  created_at timestamptz not null default now()
);

comment on table public.itineraries is 'User-generated or AI-generated itineraries.';