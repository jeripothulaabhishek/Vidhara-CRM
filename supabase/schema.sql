-- ==============================================================================
-- VIDHARA DASHBOARD — Creative Agency CRM Database Schema
-- Compatible with Supabase Postgres, RLS, and @supabase/ssr
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES TABLE (Linked with Supabase auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text not null,
  avatar_url text,
  role text not null check (role in ('admin', 'art_director', 'senior_designer', 'designer', 'client')) default 'designer',
  agency_role text not null default 'Visual Designer',
  department text default 'Design',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. CLIENT COMPANIES TABLE
create table if not exists public.clients (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  brand_name text not null,
  logo_url text,
  brand_accent text default '#6F00FF',
  tier text check (tier in ('enterprise', 'growth', 'retainer')) default 'retainer',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. TASKS & DELIVERABLES TABLE
create table if not exists public.tasks (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  client_id uuid references public.clients(id) on delete cascade not null,
  assigned_to uuid references public.profiles(id) on delete set null,
  category text not null check (category in (
    'Branding & Identity',
    'UI/UX Design',
    '3D & Motion',
    'Social Media Kit',
    'Pitch Deck & Presentation',
    'Packaging Design'
  )),
  priority text not null check (priority in ('urgent', 'high', 'medium', 'low')) default 'medium',
  status text not null check (status in ('backlog', 'in_progress', 'in_review', 'revision', 'completed')) default 'in_progress',
  due_date date not null,
  scheduled_time text default '10:00',
  duration_minutes integer default 60,
  is_pinned boolean default false,
  pin_note text,
  deliverable_preview text,
  tags text[] default array[]::text[],
  comments_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  completed_at timestamp with time zone
);

-- 4. WEEKLY PINNED TASKS (Reference Image 1)
create table if not exists public.weekly_pins (
  id uuid default uuid_generate_v4() primary key,
  task_id uuid references public.tasks(id) on delete cascade not null,
  note text,
  display_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. REVIEWS & PROOFS TABLE
create table if not exists public.reviews (
  id uuid default uuid_generate_v4() primary key,
  task_id uuid references public.tasks(id) on delete cascade not null,
  version text not null default 'v1.0',
  preview_url text not null,
  status text check (status in ('pending_review', 'changes_requested', 'approved')) default 'pending_review',
  client_feedback text[] default array[]::text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. ACTIVITY LOGS TABLE
create table if not exists public.activity_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  target text not null,
  category text not null,
  preview_image text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. NOTIFICATIONS TABLE
create table if not exists public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  message text not null,
  type text check (type in ('review', 'assignment', 'deadline', 'mention', 'system')) default 'system',
  is_read boolean default false,
  action_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.tasks enable row level security;
alter table public.weekly_pins enable row level security;
alter table public.reviews enable row level security;
alter table public.activity_logs enable row level security;
alter table public.notifications enable row level security;

-- Authenticated studio users can read all active agency records
create policy "Agency members can read all profiles" on public.profiles for select using (true);
create policy "Agency members can read all clients" on public.clients for select using (true);
create policy "Agency members can read all tasks" on public.tasks for select using (true);
create policy "Agency members can insert tasks" on public.tasks for insert with check (auth.role() = 'authenticated');
create policy "Agency members can update tasks" on public.tasks for update using (auth.role() = 'authenticated');
create policy "Agency members can read pins" on public.weekly_pins for select using (true);
create policy "Agency members can read reviews" on public.reviews for select using (true);
create policy "Agency members can read activities" on public.activity_logs for select using (true);
create policy "Users can view their notifications" on public.notifications for select using (auth.uid() = user_id);
create policy "Users can update their notifications" on public.notifications for update using (auth.uid() = user_id);

