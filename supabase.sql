-- required for gen_random_uuid()
create extension if not exists "pgcrypto";

-- TABLES
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color text default 'indigo',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  status text not null check (status in ('todo','in_progress','blocked','done')) default 'todo',
  notes text,
  tags text[] default '{}',
  due_date date,
  position double precision default 1000,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- INDEXES
create index if not exists items_project_id_idx on public.items (project_id);
create index if not exists items_user_id_idx on public.items (user_id);
create index if not exists items_status_idx on public.items (status);
create index if not exists items_position_idx on public.items (position);

-- RLS
alter table public.projects enable row level security;
alter table public.items enable row level security;

-- POLICIES (drop-then-create to avoid "already exists")
drop policy if exists "projects owner read" on public.projects;
create policy "projects owner read" on public.projects
for select using (auth.uid() = user_id);

drop policy if exists "projects owner write" on public.projects;
create policy "projects owner write" on public.projects
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "items owner read" on public.items;
create policy "items owner read" on public.items
for select using (auth.uid() = user_id);

drop policy if exists "items owner write" on public.items;
create policy "items owner write" on public.items
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
