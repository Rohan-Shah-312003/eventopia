-- Create indexes for better query performance

-- Users table indexes
create index if not exists idx_users_role on public.users(role);
create index if not exists idx_users_email on public.users(email);

-- Clubs table indexes
create index if not exists idx_clubs_status on public.clubs(status);
create index if not exists idx_clubs_president on public.clubs(president_user);
create index if not exists idx_clubs_name on public.clubs(name);

-- Events table indexes
create index if not exists idx_events_status on public.events(status);
create index if not exists idx_events_club on public.events(event_owner_club);
create index if not exists idx_events_date on public.events(date_time);
create index if not exists idx_events_creator on public.events(created_by);

-- Event registrations indexes
create index if not exists idx_registrations_event on public.event_registrations(event_id);
create index if not exists idx_registrations_user on public.event_registrations(user_id);
create index if not exists idx_registrations_status on public.event_registrations(status);
