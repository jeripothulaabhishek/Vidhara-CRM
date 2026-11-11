-- ==============================================================================
-- VIDHARA DASHBOARD — PHASE 2 COMPLETE DATABASE SCHEMA & SECURITY POLICIES
-- PostgreSQL / Supabase Schema with strict RLS, Storage, Triggers, and Realtime
-- ==============================================================================

-- Enable required PostgreSQL extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ==============================================================================
-- 1. ENUMS
-- ==============================================================================

-- User roles: strictly ADMIN or MEMBER
do $$ begin
  create type public.app_role as enum ('ADMIN', 'MEMBER');
exception
  when duplicate_object then null;
end $$;

-- Task lifecycle status matching Phase 2 specifications
do $$ begin
  create type public.task_status as enum (
    'NEW',
    'ACCEPTED',
    'IN_PROGRESS',
    'IN_REVIEW',
    'REVISION',
    'COMPLETED',
    'REJECTED'
  );
exception
  when duplicate_object then null;
end $$;

-- Task Priority
do $$ begin
  create type public.task_priority as enum ('urgent', 'high', 'medium', 'low');
exception
  when duplicate_object then null;
end $$;

-- ==============================================================================
-- 2. TABLES
-- ==============================================================================

-- 2.1 PROFILES TABLE
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text not null,
  avatar_url text,
  role public.app_role not null default 'MEMBER',
  agency_role text default 'Creative Member',
  department text default 'Design',
  created_at timestamptz default timezone('utc', now()) not null,
  updated_at timestamptz default timezone('utc', now()) not null
);

-- 2.2 TASKS TABLE
create table if not exists public.tasks (
  id uuid default gen_random_uuid() primary key,
  task_number serial,
  title text not null,
  description text,
  design_category text not null,
  platform text default 'General',
  dimensions text default 'Standard',
  main_content text,
  instructions text,
  priority public.task_priority not null default 'medium',
  status public.task_status not null default 'NEW',
  client_name text default 'Direct Client',
  created_by uuid references public.profiles(id) on delete set null not null,
  assigned_to uuid references public.profiles(id) on delete set null,
  deadline timestamptz,
  scheduled_time text default '10:00',
  duration_minutes integer default 60,
  is_pinned boolean default false,
  pin_note text,
  rejection_reason text,
  deliverable_preview text,
  tags text[] default array[]::text[],
  created_at timestamptz default timezone('utc', now()) not null,
  updated_at timestamptz default timezone('utc', now()) not null,
  completed_at timestamptz
);

-- 2.3 TASK ATTACHMENTS TABLE
create table if not exists public.task_attachments (
  id uuid default gen_random_uuid() primary key,
  task_id uuid references public.tasks(id) on delete cascade not null,
  file_name text not null,
  file_size bigint not null,
  file_type text not null,
  storage_path text not null,
  is_deliverable boolean default false,
  uploaded_by uuid references public.profiles(id) on delete set null not null,
  created_at timestamptz default timezone('utc', now()) not null
);

-- 2.4 TASK LINKS TABLE
create table if not exists public.task_links (
  id uuid default gen_random_uuid() primary key,
  task_id uuid references public.tasks(id) on delete cascade not null,
  title text not null,
  url text not null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default timezone('utc', now()) not null
);

-- 2.5 TASK COMMENTS TABLE
create table if not exists public.task_comments (
  id uuid default gen_random_uuid() primary key,
  task_id uuid references public.tasks(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  is_revision_note boolean default false,
  created_at timestamptz default timezone('utc', now()) not null
);

-- 2.6 TASK ACTIVITY HISTORY TABLE
create table if not exists public.task_activity (
  id uuid default gen_random_uuid() primary key,
  task_id uuid references public.tasks(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  details jsonb default '{}'::jsonb,
  created_at timestamptz default timezone('utc', now()) not null
);

-- 2.7 NOTIFICATIONS TABLE
create table if not exists public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  message text not null,
  type text not null,
  is_read boolean default false,
  action_url text,
  created_at timestamptz default timezone('utc', now()) not null
);

-- ==============================================================================
-- 3. INDEXES FOR PERFORMANCE
-- ==============================================================================
create index if not exists idx_tasks_created_by on public.tasks(created_by);
create index if not exists idx_tasks_assigned_to on public.tasks(assigned_to);
create index if not exists idx_tasks_status on public.tasks(status);
create index if not exists idx_tasks_deadline on public.tasks(deadline);
create index if not exists idx_task_attachments_task on public.task_attachments(task_id);
create index if not exists idx_task_comments_task on public.task_comments(task_id);
create index if not exists idx_task_activity_task on public.task_activity(task_id);
create index if not exists idx_notifications_user_read on public.notifications(user_id, is_read);

-- ==============================================================================
-- 4. SECURITY DEFINER HELPER: IS_ADMIN()
-- ==============================================================================
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public, pg_temp
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid() and role = 'ADMIN'
  );
$$;

-- Grant execution to authenticated users
grant execute on function public.is_admin() to authenticated;

-- ==============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

alter table public.profiles enable row level security;
alter table public.tasks enable row level security;
alter table public.task_attachments enable row level security;
alter table public.task_links enable row level security;
alter table public.task_comments enable row level security;
alter table public.task_activity enable row level security;
alter table public.notifications enable row level security;

-- Drop existing policies if any to avoid duplicates
drop policy if exists "Admin view all profiles" on public.profiles;
drop policy if exists "Member view own profile" on public.profiles;
drop policy if exists "Admin update profiles" on public.profiles;
drop policy if exists "Member update own profile non-role" on public.profiles;

-- 5.1 PROFILES POLICIES
create policy "Admin view all profiles"
  on public.profiles for select
  using (public.is_admin() or id = auth.uid());

create policy "Admin update profiles"
  on public.profiles for update
  using (public.is_admin());

create policy "Member update own profile non-role"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid() and role = (select role from public.profiles where id = auth.uid()));

-- 5.2 TASKS POLICIES
drop policy if exists "Admin all tasks" on public.tasks;
drop policy if exists "Member view own tasks" on public.tasks;
drop policy if exists "Member insert own tasks" on public.tasks;
drop policy if exists "Member update own draft tasks" on public.tasks;

create policy "Admin all tasks"
  on public.tasks for all
  using (public.is_admin());

create policy "Member view own tasks"
  on public.tasks for select
  using (created_by = auth.uid());

create policy "Member insert own tasks"
  on public.tasks for insert
  with check (
    created_by = auth.uid()
    and status = 'NEW'
    and assigned_to is null
  );

create policy "Member update own draft tasks"
  on public.tasks for update
  using (
    created_by = auth.uid()
    and status in ('NEW', 'REVISION')
  )
  with check (
    created_by = auth.uid()
    and status in ('NEW', 'REVISION')
  );

-- 5.3 TASK ATTACHMENTS POLICIES
drop policy if exists "Admin all attachments" on public.task_attachments;
drop policy if exists "Member view own task attachments" on public.task_attachments;
drop policy if exists "Member upload reference attachments" on public.task_attachments;

create policy "Admin all attachments"
  on public.task_attachments for all
  using (public.is_admin());

create policy "Member view own task attachments"
  on public.task_attachments for select
  using (
    exists (
      select 1 from public.tasks
      where id = task_attachments.task_id and created_by = auth.uid()
    )
  );

create policy "Member upload reference attachments"
  on public.task_attachments for insert
  with check (
    uploaded_by = auth.uid()
    and is_deliverable = false
    and exists (
      select 1 from public.tasks
      where id = task_attachments.task_id and created_by = auth.uid()
    )
  );

-- 5.4 TASK LINKS POLICIES
drop policy if exists "Admin all links" on public.task_links;
drop policy if exists "Member own task links" on public.task_links;

create policy "Admin all links"
  on public.task_links for all
  using (public.is_admin());

create policy "Member own task links"
  on public.task_links for select
  using (
    exists (
      select 1 from public.tasks
      where id = task_links.task_id and created_by = auth.uid()
    )
  );

create policy "Member insert own task links"
  on public.task_links for insert
  with check (
    exists (
      select 1 from public.tasks
      where id = task_links.task_id and created_by = auth.uid()
    )
  );

-- 5.5 TASK COMMENTS POLICIES
drop policy if exists "Admin all comments" on public.task_comments;
drop policy if exists "Member own task comments select" on public.task_comments;
drop policy if exists "Member own task comments insert" on public.task_comments;

create policy "Admin all comments"
  on public.task_comments for all
  using (public.is_admin());

create policy "Member own task comments select"
  on public.task_comments for select
  using (
    exists (
      select 1 from public.tasks
      where id = task_comments.task_id and created_by = auth.uid()
    )
  );

create policy "Member own task comments insert"
  on public.task_comments for insert
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.tasks
      where id = task_comments.task_id and created_by = auth.uid()
    )
  );

-- 5.6 TASK ACTIVITY POLICIES
drop policy if exists "Admin all activity" on public.task_activity;
drop policy if exists "Member own task activity select" on public.task_activity;

create policy "Admin all activity"
  on public.task_activity for all
  using (public.is_admin());

create policy "Member own task activity select"
  on public.task_activity for select
  using (
    exists (
      select 1 from public.tasks
      where id = task_activity.task_id and created_by = auth.uid()
    )
  );

-- 5.7 NOTIFICATIONS POLICIES
drop policy if exists "Users own notifications select" on public.notifications;
drop policy if exists "Users own notifications update" on public.notifications;

create policy "Users own notifications select"
  on public.notifications for select
  using (user_id = auth.uid());

create policy "Users own notifications update"
  on public.notifications for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ==============================================================================
-- 6. AUTOMATIC TRIGGERS & FUNCTIONS
-- ==============================================================================

-- 6.1 Trigger on auth.users to auto-create profile as MEMBER
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'avatar_url', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'),
    'MEMBER' -- Always default to MEMBER for safety
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 6.2 Trigger on task status update to record activity
create or replace function public.handle_task_status_change()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if (old.status is distinct from new.status) then
    insert into public.task_activity (task_id, user_id, action, details)
    values (
      new.id,
      auth.uid(),
      'STATUS_CHANGED',
      jsonb_build_object(
        'from', old.status,
        'to', new.status,
        'timestamp', now()
      )
    );
  end if;
  return new;
end;
$$;

drop trigger if exists on_task_status_changed on public.tasks;
create trigger on_task_status_changed
  after update on public.tasks
  for each row execute procedure public.handle_task_status_change();

-- ==============================================================================
-- 7. SUPABASE STORAGE BUCKET: task-files
-- ==============================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'task-files',
  'task-files',
  false,
  10485760, -- 10 MB in bytes
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
)
on conflict (id) do update set
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];

-- Storage RLS: Admins have full access
drop policy if exists "Admin full access to task-files" on storage.objects;
create policy "Admin full access to task-files"
  on storage.objects for all
  using (bucket_id = 'task-files' and public.is_admin());

-- Storage RLS: Members can view files belonging to their tasks
drop policy if exists "Members view permitted task files" on storage.objects;
create policy "Members view permitted task files"
  on storage.objects for select
  using (
    bucket_id = 'task-files'
    and (
      public.is_admin()
      or exists (
        select 1 from public.tasks
        where id::text = (storage.foldername(name))[1]
        and created_by = auth.uid()
      )
    )
  );

-- Storage RLS: Members can upload references only
drop policy if exists "Members upload reference files" on storage.objects;
create policy "Members upload reference files"
  on storage.objects for insert
  with check (
    bucket_id = 'task-files'
    and (storage.foldername(name))[2] = 'references'
    and exists (
      select 1 from public.tasks
      where id::text = (storage.foldername(name))[1]
      and created_by = auth.uid()
    )
  );

-- ==============================================================================
-- 8. REALTIME CONFIGURATION
-- ==============================================================================
do $$ begin
  alter publication supabase_realtime add table public.tasks;
  alter publication supabase_realtime add table public.task_comments;
  alter publication supabase_realtime add table public.notifications;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;

-- ==============================================================================
-- 9. ADMIN BOOTSTRAP HELPER
-- Run this query after signing up your primary owner account:
--
-- update public.profiles
-- set role = 'ADMIN'
-- where email = 'YOUR_EMAIL@HERE.COM';
-- ==============================================================================

