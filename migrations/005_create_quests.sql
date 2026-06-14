-- Migration: 005_create_quests.sql

create table public.quests (
  id uuid primary key default gen_random_uuid(),
  city_id uuid not null references public.cities(id) on delete cascade,
  title text not null,
  description text,
  difficulty text not null default 'easy' check (difficulty in ('easy', 'medium', 'hard')),
  estimated_duration_minutes integer,
  estimated_budget_min integer,
  estimated_budget_max integer,
  cover_image_url text,
  is_published boolean not null default false,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.quests is 'Curated bundles/roadmaps of places for users to complete.';