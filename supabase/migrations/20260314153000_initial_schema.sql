create extension if not exists pgcrypto;

create schema if not exists app;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type public.user_role as enum ('org_admin', 'ops_manager', 'ops_agent', 'customer_user');
  end if;
  if not exists (select 1 from pg_type where typname = 'shipment_status') then
    create type public.shipment_status as enum ('planned', 'booked', 'in_transit', 'at_hub', 'out_for_delivery', 'delayed', 'delivered', 'exception');
  end if;
  if not exists (select 1 from pg_type where typname = 'risk_level') then
    create type public.risk_level as enum ('low', 'medium', 'high', 'critical');
  end if;
  if not exists (select 1 from pg_type where typname = 'exception_status') then
    create type public.exception_status as enum ('open', 'investigating', 'resolved');
  end if;
  if not exists (select 1 from pg_type where typname = 'exception_type') then
    create type public.exception_type as enum ('eta_breach', 'stale_tracking', 'missed_milestone', 'carrier_delay', 'customs_hold', 'documentation_issue');
  end if;
  if not exists (select 1 from pg_type where typname = 'document_type') then
    create type public.document_type as enum ('bol', 'pod', 'invoice', 'manifest', 'customs');
  end if;
end $$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  timezone text not null default 'UTC',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete cascade,
  default_organization_id uuid references public.organizations(id) on delete set null,
  email text not null unique,
  full_name text not null,
  title text not null default 'Operations User',
  avatar_url text,
  notification_preferences jsonb not null default jsonb_build_object(
    'emailExceptionCreated', true,
    'emailEtaChanged', true,
    'emailShipmentDelayed', true,
    'emailMilestoneReached', false
  ),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  code text not null,
  segment text not null,
  contact_name text,
  contact_email text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, code)
);

create table if not exists public.carriers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  scac text not null,
  mode text not null,
  on_time_rate numeric(5,2) not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, scac)
);

create table if not exists public.facilities (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  code text not null,
  city text not null,
  region text not null,
  country text not null default 'US',
  facility_type text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, code)
);

create table if not exists public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role public.user_role not null,
  customer_id uuid references public.customers(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, profile_id)
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete restrict,
  order_number text not null,
  customer_reference text,
  promised_delivery_at timestamptz not null,
  value_usd numeric(12,2) not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, order_number)
);

create table if not exists public.shipments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  order_id uuid not null references public.orders(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete restrict,
  carrier_id uuid not null references public.carriers(id) on delete restrict,
  origin_facility_id uuid not null references public.facilities(id) on delete restrict,
  destination_facility_id uuid not null references public.facilities(id) on delete restrict,
  shipment_reference text not null,
  external_reference text,
  tracking_token text not null unique,
  mode text not null,
  status public.shipment_status not null default 'planned',
  risk_level public.risk_level not null default 'low',
  promised_delivery_at timestamptz not null,
  eta timestamptz not null,
  actual_delivery_at timestamptz,
  last_event_at timestamptz,
  last_update_at timestamptz not null default timezone('utc', now()),
  summary text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, shipment_reference)
);

create table if not exists public.shipment_milestones (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  shipment_id uuid not null references public.shipments(id) on delete cascade,
  sequence_number integer not null,
  label text not null,
  planned_at timestamptz not null,
  actual_at timestamptz,
  milestone_status text not null default 'upcoming',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (shipment_id, sequence_number)
);

create table if not exists public.shipment_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  shipment_id uuid not null references public.shipments(id) on delete cascade,
  event_type text not null,
  title text not null,
  description text,
  source text,
  occurred_at timestamptz not null,
  is_customer_visible boolean not null default true,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.exceptions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  shipment_id uuid not null references public.shipments(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete restrict,
  carrier_id uuid not null references public.carriers(id) on delete restrict,
  exception_type public.exception_type not null,
  status public.exception_status not null default 'open',
  risk_level public.risk_level not null default 'medium',
  title text not null,
  description text,
  owner_profile_id uuid references public.profiles(id) on delete set null,
  resolution_notes text,
  opened_at timestamptz not null default timezone('utc', now()),
  resolved_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  shipment_id uuid references public.shipments(id) on delete set null,
  exception_id uuid references public.exceptions(id) on delete set null,
  channel text not null default 'in_app',
  notification_kind text not null,
  title text not null,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  shipment_id uuid not null references public.shipments(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete restrict,
  document_type public.document_type not null,
  file_name text not null,
  file_path text not null,
  file_size_bytes bigint not null default 0,
  is_customer_visible boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  actor_profile_id uuid references public.profiles(id) on delete set null,
  shipment_id uuid references public.shipments(id) on delete set null,
  exception_id uuid references public.exceptions(id) on delete set null,
  action text not null,
  summary text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.webhook_endpoints (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  label text not null,
  url text not null,
  secret text not null default encode(gen_random_bytes(24), 'hex'),
  subscribed_events text[] not null default '{}',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_profiles_auth_user_id on public.profiles(auth_user_id);
create index if not exists idx_profiles_default_org on public.profiles(default_organization_id);
create index if not exists idx_members_org_profile on public.organization_members(organization_id, profile_id);
create index if not exists idx_customers_org_name on public.customers(organization_id, name);
create index if not exists idx_carriers_org_name on public.carriers(organization_id, name);
create index if not exists idx_facilities_org_code on public.facilities(organization_id, code);
create index if not exists idx_orders_org_customer_promise on public.orders(organization_id, customer_id, promised_delivery_at);
create index if not exists idx_shipments_org_status on public.shipments(organization_id, status, risk_level);
create index if not exists idx_shipments_org_customer on public.shipments(organization_id, customer_id);
create index if not exists idx_shipments_org_carrier on public.shipments(organization_id, carrier_id);
create index if not exists idx_shipments_eta on public.shipments(eta);
create index if not exists idx_shipment_milestones_shipment on public.shipment_milestones(shipment_id, sequence_number);
create index if not exists idx_shipment_events_shipment_occurred on public.shipment_events(shipment_id, occurred_at desc);
create index if not exists idx_exceptions_org_status on public.exceptions(organization_id, status, risk_level);
create index if not exists idx_notifications_profile_read on public.notifications(profile_id, read_at);
create index if not exists idx_documents_org_shipment on public.documents(organization_id, shipment_id);
create index if not exists idx_audit_logs_org_created on public.audit_logs(organization_id, created_at desc);

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'organizations',
    'profiles',
    'customers',
    'carriers',
    'facilities',
    'organization_members',
    'orders',
    'shipments',
    'shipment_milestones',
    'shipment_events',
    'exceptions',
    'notifications',
    'documents',
    'webhook_endpoints'
  ]
  loop
    execute format('drop trigger if exists set_%1$s_updated_at on public.%1$s;', table_name);
    execute format('create trigger set_%1$s_updated_at before update on public.%1$s for each row execute function public.set_updated_at();', table_name);
  end loop;
end $$;

create or replace function app.current_profile_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id
  from public.profiles
  where auth_user_id = auth.uid()
  limit 1
$$;

create or replace function app.current_organization_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select default_organization_id from public.profiles where id = app.current_profile_id()),
    (select organization_id from public.organization_members where profile_id = app.current_profile_id() order by created_at asc limit 1)
  )
$$;

create or replace function app.current_user_role(target_org uuid)
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.organization_members
  where organization_id = target_org
    and profile_id = app.current_profile_id()
  limit 1
$$;

create or replace function app.current_customer_id(target_org uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select customer_id
  from public.organization_members
  where organization_id = target_org
    and profile_id = app.current_profile_id()
  limit 1
$$;

create or replace function app.is_internal_member(target_org uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(app.current_user_role(target_org) in ('org_admin', 'ops_manager', 'ops_agent'), false)
$$;

create or replace function app.is_org_admin(target_org uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(app.current_user_role(target_org) = 'org_admin', false)
$$;

create or replace function app.can_access_customer(target_org uuid, target_customer uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    app.is_internal_member(target_org)
    or (
      app.current_user_role(target_org) = 'customer_user'
      and app.current_customer_id(target_org) = target_customer
    ),
    false
  )
$$;

create or replace function app.storage_org_id(object_name text)
returns uuid
language sql
immutable
as $$
  select nullif(split_part(object_name, '/', 1), '')::uuid
$$;

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.customers enable row level security;
alter table public.carriers enable row level security;
alter table public.facilities enable row level security;
alter table public.organization_members enable row level security;
alter table public.orders enable row level security;
alter table public.shipments enable row level security;
alter table public.shipment_milestones enable row level security;
alter table public.shipment_events enable row level security;
alter table public.exceptions enable row level security;
alter table public.notifications enable row level security;
alter table public.documents enable row level security;
alter table public.audit_logs enable row level security;
alter table public.webhook_endpoints enable row level security;

drop policy if exists organizations_select on public.organizations;
create policy organizations_select on public.organizations
for select using (app.current_user_role(id) is not null);

drop policy if exists organizations_insert on public.organizations;
create policy organizations_insert on public.organizations
for insert with check (auth.uid() is not null);

drop policy if exists organizations_update on public.organizations;
create policy organizations_update on public.organizations
for update using (app.is_org_admin(id)) with check (app.is_org_admin(id));

drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
for select using (
  id = app.current_profile_id()
  or exists (
    select 1
    from public.organization_members source_member
    join public.organization_members target_member
      on target_member.profile_id = public.profiles.id
     and target_member.organization_id = source_member.organization_id
    where source_member.profile_id = app.current_profile_id()
      and source_member.role in ('org_admin', 'ops_manager', 'ops_agent')
  )
);

drop policy if exists profiles_insert on public.profiles;
create policy profiles_insert on public.profiles
for insert with check (auth.uid() = auth_user_id or auth_user_id is null);

drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles
for update using (id = app.current_profile_id()) with check (id = app.current_profile_id());

drop policy if exists members_select on public.organization_members;
create policy members_select on public.organization_members
for select using (
  profile_id = app.current_profile_id()
  or exists (
    select 1
    from public.organization_members current_member
    where current_member.organization_id = public.organization_members.organization_id
      and current_member.profile_id = app.current_profile_id()
      and current_member.role in ('org_admin', 'ops_manager', 'ops_agent')
  )
);

drop policy if exists members_insert on public.organization_members;
create policy members_insert on public.organization_members
for insert with check (
  app.is_org_admin(organization_id)
  or (
    profile_id = app.current_profile_id()
    and not exists (
      select 1
      from public.organization_members existing_member
      where existing_member.organization_id = public.organization_members.organization_id
    )
  )
);

drop policy if exists members_update on public.organization_members;
create policy members_update on public.organization_members
for update using (app.is_org_admin(organization_id)) with check (app.is_org_admin(organization_id));

drop policy if exists members_delete on public.organization_members;
create policy members_delete on public.organization_members
for delete using (app.is_org_admin(organization_id));

drop policy if exists customers_select on public.customers;
create policy customers_select on public.customers
for select using (app.can_access_customer(organization_id, id));

drop policy if exists customers_manage on public.customers;
create policy customers_manage on public.customers
for all using (app.is_internal_member(organization_id)) with check (app.is_internal_member(organization_id));

drop policy if exists carriers_select on public.carriers;
create policy carriers_select on public.carriers
for select using (app.is_internal_member(organization_id));

drop policy if exists carriers_manage on public.carriers;
create policy carriers_manage on public.carriers
for all using (app.is_internal_member(organization_id)) with check (app.is_internal_member(organization_id));

drop policy if exists facilities_select on public.facilities;
create policy facilities_select on public.facilities
for select using (app.is_internal_member(organization_id));

drop policy if exists facilities_manage on public.facilities;
create policy facilities_manage on public.facilities
for all using (app.is_internal_member(organization_id)) with check (app.is_internal_member(organization_id));

drop policy if exists orders_select on public.orders;
create policy orders_select on public.orders
for select using (app.can_access_customer(organization_id, customer_id));

drop policy if exists orders_manage on public.orders;
create policy orders_manage on public.orders
for all using (app.is_internal_member(organization_id)) with check (app.is_internal_member(organization_id));

drop policy if exists shipments_select on public.shipments;
create policy shipments_select on public.shipments
for select using (app.can_access_customer(organization_id, customer_id));

drop policy if exists shipments_manage on public.shipments;
create policy shipments_manage on public.shipments
for all using (app.is_internal_member(organization_id)) with check (app.is_internal_member(organization_id));

drop policy if exists milestones_select on public.shipment_milestones;
create policy milestones_select on public.shipment_milestones
for select using (
  exists (
    select 1
    from public.shipments
    where public.shipments.id = public.shipment_milestones.shipment_id
      and app.can_access_customer(public.shipments.organization_id, public.shipments.customer_id)
  )
);

drop policy if exists milestones_manage on public.shipment_milestones;
create policy milestones_manage on public.shipment_milestones
for all using (app.is_internal_member(organization_id)) with check (app.is_internal_member(organization_id));

drop policy if exists events_select on public.shipment_events;
create policy events_select on public.shipment_events
for select using (
  app.is_internal_member(organization_id)
  or (
    is_customer_visible
    and exists (
      select 1
      from public.shipments
      where public.shipments.id = public.shipment_events.shipment_id
        and app.can_access_customer(public.shipments.organization_id, public.shipments.customer_id)
    )
  )
);

drop policy if exists events_manage on public.shipment_events;
create policy events_manage on public.shipment_events
for all using (app.is_internal_member(organization_id)) with check (app.is_internal_member(organization_id));

drop policy if exists exceptions_select on public.exceptions;
create policy exceptions_select on public.exceptions
for select using (app.is_internal_member(organization_id));

drop policy if exists exceptions_manage on public.exceptions;
create policy exceptions_manage on public.exceptions
for all using (app.is_internal_member(organization_id)) with check (app.is_internal_member(organization_id));

drop policy if exists notifications_select on public.notifications;
create policy notifications_select on public.notifications
for select using (profile_id = app.current_profile_id());

drop policy if exists notifications_update on public.notifications;
create policy notifications_update on public.notifications
for update using (profile_id = app.current_profile_id()) with check (profile_id = app.current_profile_id());

drop policy if exists notifications_insert on public.notifications;
create policy notifications_insert on public.notifications
for insert with check (app.is_internal_member(organization_id));

drop policy if exists documents_select on public.documents;
create policy documents_select on public.documents
for select using (
  app.is_internal_member(organization_id)
  or (is_customer_visible and app.can_access_customer(organization_id, customer_id))
);

drop policy if exists documents_manage on public.documents;
create policy documents_manage on public.documents
for all using (app.is_internal_member(organization_id)) with check (app.is_internal_member(organization_id));

drop policy if exists audit_logs_select on public.audit_logs;
create policy audit_logs_select on public.audit_logs
for select using (app.is_internal_member(organization_id));

drop policy if exists audit_logs_insert on public.audit_logs;
create policy audit_logs_insert on public.audit_logs
for insert with check (app.is_internal_member(organization_id));

drop policy if exists webhooks_select on public.webhook_endpoints;
create policy webhooks_select on public.webhook_endpoints
for select using (app.is_internal_member(organization_id));

drop policy if exists webhooks_manage on public.webhook_endpoints;
create policy webhooks_manage on public.webhook_endpoints
for all using (app.is_org_admin(organization_id)) with check (app.is_org_admin(organization_id));

insert into storage.buckets (id, name, public)
values ('shipment-documents', 'shipment-documents', false)
on conflict (id) do nothing;

drop policy if exists storage_internal_select on storage.objects;
create policy storage_internal_select on storage.objects
for select to authenticated
using (bucket_id = 'shipment-documents' and app.is_internal_member(app.storage_org_id(name)));

drop policy if exists storage_internal_insert on storage.objects;
create policy storage_internal_insert on storage.objects
for insert to authenticated
with check (bucket_id = 'shipment-documents' and app.is_internal_member(app.storage_org_id(name)));

drop policy if exists storage_internal_update on storage.objects;
create policy storage_internal_update on storage.objects
for update to authenticated
using (bucket_id = 'shipment-documents' and app.is_internal_member(app.storage_org_id(name)))
with check (bucket_id = 'shipment-documents' and app.is_internal_member(app.storage_org_id(name)));

drop policy if exists storage_internal_delete on storage.objects;
create policy storage_internal_delete on storage.objects
for delete to authenticated
using (bucket_id = 'shipment-documents' and app.is_internal_member(app.storage_org_id(name)));
