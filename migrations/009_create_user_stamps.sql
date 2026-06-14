-- Migration: 009_create_user_stamps.sql

create table public.user_stamps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  stamp_id uuid not null references public.stamps(id) on delete cascade,
  place_id uuid not null references public.places(id) on delete cascade,
  quest_id uuid references public.quests(id) on delete set null,
  earned_at timestamptz not null default now(),
  unique (user_id, stamp_id, quest_id)
);

comment on table public.user_stamps is 'Tracks which stamps a user has earned.';