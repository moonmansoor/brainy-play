create extension if not exists "pgcrypto";

create type public.user_role as enum ('parent', 'admin');
create type public.activity_type as enum (
  'shape-match',
  'count-objects',
  'pattern-complete',
  'sort-game',
  'odd-one-out',
  'sequence-order',
  'memory-cards',
  'logic-game',
  'maze-path'
);
create type public.asset_type as enum ('image', 'audio');

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.user_role not null default 'parent',
  email text not null unique,
  full_name text,
  phone_number text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.children (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references public.profiles (id) on delete cascade,
  display_name text not null,
  birth_date date not null,
  school_name text,
  school_standard text,
  favorite_themes text[] default '{}',
  favorite_color text,
  preferred_reward_style text,
  preferred_avatar_style text,
  avatar_url text,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  type public.activity_type not null,
  age_min int not null check (age_min between 4 and 12),
  age_max int not null check (age_max between 4 and 12),
  difficulty int not null check (difficulty between 1 and 3),
  instructions_text text not null,
  instructions_audio_url text,
  thumbnail_url text,
  config_json jsonb not null default '{}'::jsonb,
  default_theme_id text,
  theme_ids text[] default '{}',
  visual_config_json jsonb not null default '[]'::jsonb,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint age_range_check check (age_min <= age_max)
);

create table if not exists public.activity_assets (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.activities (id) on delete cascade,
  asset_type public.asset_type not null,
  file_url text not null,
  metadata_json jsonb not null default '{}'::jsonb
);

create table if not exists public.activity_items (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.activities (id) on delete cascade,
  order_index int not null default 0,
  prompt_text text,
  config_json jsonb not null default '{}'::jsonb,
  answer_json jsonb not null default '{}'::jsonb,
  asset_references_json jsonb not null default '[]'::jsonb,
  difficulty_override int check (difficulty_override between 1 and 3),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.activity_attempts (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children (id) on delete cascade,
  activity_id uuid not null references public.activities (id) on delete cascade,
  score int not null check (score between 0 and 100),
  stars_earned int not null default 0 check (stars_earned between 0 and 3),
  completed boolean not null default false,
  hints_used int not null default 0,
  mistakes_count int not null default 0,
  duration_seconds int not null default 0,
  started_at timestamptz not null,
  finished_at timestamptz not null
);

create table if not exists public.badges (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  title text not null,
  description text not null,
  image_url text
);

create table if not exists public.child_badges (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children (id) on delete cascade,
  badge_id uuid not null references public.badges (id) on delete cascade,
  awarded_at timestamptz not null default now(),
  unique (child_id, badge_id)
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute procedure public.set_updated_at();

drop trigger if exists children_set_updated_at on public.children;
create trigger children_set_updated_at
before update on public.children
for each row execute procedure public.set_updated_at();

drop trigger if exists activities_set_updated_at on public.activities;
create trigger activities_set_updated_at
before update on public.activities
for each row execute procedure public.set_updated_at();

drop trigger if exists activity_items_set_updated_at on public.activity_items;
create trigger activity_items_set_updated_at
before update on public.activity_items
for each row execute procedure public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.children enable row level security;
alter table public.activities enable row level security;
alter table public.activity_items enable row level security;
alter table public.activity_assets enable row level security;
alter table public.activity_attempts enable row level security;
alter table public.badges enable row level security;
alter table public.child_badges enable row level security;

create policy "profiles select own"
on public.profiles
for select
using (auth.uid() = id);

create policy "profiles insert own"
on public.profiles
for insert
with check (auth.uid() = id and role = 'parent');

create policy "profiles update own"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "parents manage own children"
on public.children
for all
using (auth.uid() = parent_id)
with check (auth.uid() = parent_id);

create policy "published activities are readable"
on public.activities
for select
using (
  is_published
  or exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
);

create policy "admins manage activities"
on public.activities
for all
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
);

create policy "activity items follow activity access"
on public.activity_items
for select
using (
  exists (
    select 1 from public.activities a
    where a.id = activity_id
      and (
        a.is_published
        or exists (
          select 1 from public.profiles p
          where p.id = auth.uid() and p.role = 'admin'
        )
      )
  )
);

create policy "admins manage activity items"
on public.activity_items
for all
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
);

create policy "assets follow activity access"
on public.activity_assets
for select
using (
  exists (
    select 1 from public.activities a
    where a.id = activity_id
      and (
        a.is_published
        or exists (
          select 1 from public.profiles p
          where p.id = auth.uid() and p.role = 'admin'
        )
      )
  )
);

create policy "parents log attempts for own children"
on public.activity_attempts
for insert
with check (
  exists (
    select 1 from public.children c
    where c.id = child_id and c.parent_id = auth.uid()
  )
);

create policy "parents view attempts for own children"
on public.activity_attempts
for select
using (
  exists (
    select 1 from public.children c
    where c.id = child_id and c.parent_id = auth.uid()
  )
);

create policy "badges readable to signed in users"
on public.badges
for select
using (auth.role() = 'authenticated');

create policy "parents view child badges"
on public.child_badges
for select
using (
  exists (
    select 1 from public.children c
    where c.id = child_id and c.parent_id = auth.uid()
  )
);
