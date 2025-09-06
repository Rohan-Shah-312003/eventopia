-- Create clubs table
-- Stores information about student clubs and organizations

create table if not exists public.clubs (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  type text not null,
  president_user uuid references public.users(id),
  vice_president_user uuid references public.users(id),
  faculty_coordinator_user uuid references public.users(id),
  budget_amount decimal(10,2) default 0,
  logo_url text,
  description text,
  status text not null default 'active' check (status in ('active', 'inactive', 'pending')),
  total_members integer default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.clubs enable row level security;

-- RLS Policies for clubs table
create policy "Anyone can view active clubs"
  on public.clubs for select
  using (status = 'active');

create policy "Club admins can view their clubs"
  on public.clubs for select
  using (
    president_user = auth.uid() or 
    vice_president_user = auth.uid() or 
    faculty_coordinator_user = auth.uid()
  );

create policy "Admins can view all clubs"
  on public.clubs for select
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can insert clubs"
  on public.clubs for insert
  with check (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins and club leaders can update clubs"
  on public.clubs for update
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    ) or
    president_user = auth.uid() or 
    vice_president_user = auth.uid() or 
    faculty_coordinator_user = auth.uid()
  );
