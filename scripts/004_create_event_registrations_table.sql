-- Create event registrations table
-- Tracks user registrations for events

create table if not exists public.event_registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  registration_type text not null default 'participant' check (registration_type in ('participant', 'volunteer')),
  status text not null default 'registered' check (status in ('registered', 'attended', 'cancelled')),
  registration_data jsonb default '{}'::jsonb,
  registered_at timestamp with time zone default now(),
  
  -- Ensure unique registration per user per event
  unique(event_id, user_id)
);

-- Enable RLS
alter table public.event_registrations enable row level security;

-- RLS Policies for event registrations
create policy "Users can view their own registrations"
  on public.event_registrations for select
  using (user_id = auth.uid());

create policy "Club admins can view registrations for their events"
  on public.event_registrations for select
  using (
    exists (
      select 1 from public.events e
      join public.clubs c on e.event_owner_club = c.id
      where e.id = event_id and (
        c.president_user = auth.uid() or 
        c.vice_president_user = auth.uid() or 
        c.faculty_coordinator_user = auth.uid()
      )
    )
  );

create policy "Admins can view all registrations"
  on public.event_registrations for select
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Users can register for events"
  on public.event_registrations for insert
  with check (user_id = auth.uid());

create policy "Users can update their own registrations"
  on public.event_registrations for update
  using (user_id = auth.uid());

-- Function to update event participant count
create or replace function update_event_participant_count()
returns trigger
language plpgsql
as $$
begin
  if TG_OP = 'INSERT' then
    update public.events 
    set current_participants = current_participants + 1
    where id = NEW.event_id;
    return NEW;
  elsif TG_OP = 'DELETE' then
    update public.events 
    set current_participants = current_participants - 1
    where id = OLD.event_id;
    return OLD;
  end if;
  return null;
end;
$$;

-- Trigger to automatically update participant count
create trigger update_participant_count_trigger
  after insert or delete on public.event_registrations
  for each row
  execute function update_event_participant_count();
