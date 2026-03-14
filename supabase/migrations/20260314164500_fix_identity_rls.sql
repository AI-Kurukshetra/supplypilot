create or replace function app.current_profile_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select profiles.id
  from public.profiles
  where profiles.auth_user_id = auth.uid()
  limit 1
$$;

drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
for select using (
  auth.uid() = auth_user_id
  or exists (
    select 1
    from public.organization_members source_member
    join public.organization_members target_member
      on target_member.profile_id = public.profiles.id
     and target_member.organization_id = source_member.organization_id
    join public.profiles source_profile
      on source_profile.id = source_member.profile_id
    where source_profile.auth_user_id = auth.uid()
      and source_member.role in ('org_admin', 'ops_manager', 'ops_agent')
  )
);

drop policy if exists members_select on public.organization_members;
create policy members_select on public.organization_members
for select using (
  exists (
    select 1
    from public.profiles current_profile
    where current_profile.id = public.organization_members.profile_id
      and current_profile.auth_user_id = auth.uid()
  )
  or exists (
    select 1
    from public.organization_members current_member
    join public.profiles current_profile
      on current_profile.id = current_member.profile_id
    where current_member.organization_id = public.organization_members.organization_id
      and current_profile.auth_user_id = auth.uid()
      and current_member.role in ('org_admin', 'ops_manager', 'ops_agent')
  )
);
