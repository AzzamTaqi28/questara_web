-- Migration: 006_create_quest_stops.sql

create table public.quest_stops (
  id uuid primary key default gen_random_uuid(),
  quest_id uuid not null references public.quests(id) on delete cascade,
  place_id uuid not null references public.places(id) on delete cascade,
  position integer not null,
  required boolean not null default true,
  hint text,
  recommended_duration_minutes integer,
  created_at timestamptz not null default now(),
  unique (quest_id, position),
  unique (quest_id, place_id)
);

comment on table public.quest_stops is 'Ordered stops within a quest.';