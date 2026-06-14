-- Migration: 001_create_profiles.sql
-- Profiles table — auth_id links to Supabase Auth user, id is local primary key

create extension if not exists "pgcrypto";

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  auth_id uuid unique,
  username text unique,
  display_name text,
  avatar_url text,
  home_city text,
  role text not null default 'user' check (role in ('user', 'admin')),
  xp integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'User profiles. id is local PK, auth_id links to Supabase Auth.';