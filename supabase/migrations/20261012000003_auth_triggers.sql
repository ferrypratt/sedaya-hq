-- ==============================================================================
-- Migration: 20261012000003_auth_triggers.sql
-- Description: Trigger on auth.users to create profiles on signup
-- ==============================================================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role, position)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    'officer',
    coalesce(new.raw_user_meta_data->>'position', 'Branding Officer')
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger firing after user creation in Supabase auth
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
