-- Create events table
-- Stores comprehensive event information with approval workflow

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null,
  event_owner_club uuid not null references public.clubs(id) on delete cascade,
  venue text not null,
  date_time timestamp with time zone not null,
  equipments_json jsonb default '[]'::jsonb,
  participants_details_json jsonb default '[]'::jsonb,
  volunteer_details_json jsonb default '[]'::jsonb,
  event_manager_details_json jsonb default '{}'::jsonb,
  revenue_generated decimal(10,2) default 0,
  description text,
  status text not null default 'draft' check (status in ('draft', 'pending_approval', 'approved', 'rejected', 'completed', 'cancelled')),
  approval_notes text,
  approved_by uuid references public.users(id),
  approved_at timestamp with time zone,
  max_participants integer,
  current_participants integer default 0,
  registration_deadline timestamp with time zone,
  created_by uuid not null references public.users(id),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.events enable row level security;

-- RLS Policies for events table
create policy "Anyone can view approved events"
  on public.events for select
  using (status = 'approved');

create policy "Club members can view their club events"
  on public.events for select
  using (
    exists (
      select 1 from public.clubs c
      where c.id = event_owner_club and (
        c.president_user = auth.uid() or 
        c.vice_president_user = auth.uid() or 
        c.faculty_coordinator_user = auth.uid()
      )
    )
  );

create policy "Event creators can view their events"
  on public.events for select
  using (created_by = auth.uid());

create policy "Admins can view all events"
  on public.events for select
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Club admins can create events for their clubs"
  on public.events for insert
  with check (
    exists (
      select 1 from public.clubs c
      where c.id = event_owner_club and (
        c.president_user = auth.uid() or 
        c.vice_president_user = auth.uid() or 
        c.faculty_coordinator_user = auth.uid()
      )
    ) and created_by = auth.uid()
  );

create policy "Club admins can update their club events"
  on public.events for update
  using (
    exists (
      select 1 from public.clubs c
      where c.id = event_owner_club and (
        c.president_user = auth.uid() or 
        c.vice_president_user = auth.uid() or 
        c.faculty_coordinator_user = auth.uid()
      )
    ) or created_by = auth.uid()
  );

create policy "Admins can update all events"
  on public.events for update
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );
