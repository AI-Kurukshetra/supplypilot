insert into public.organizations (id, name, slug, timezone)
values ('00000000-0000-4000-8000-000000000001', 'Northstar Logistics Group', 'northstar-logistics-group', 'America/Chicago')
on conflict (id) do nothing;

insert into public.profiles (id, auth_user_id, default_organization_id, email, full_name, title, notification_preferences)
values
  ('10000000-0000-4000-8000-000000000001', null, '00000000-0000-4000-8000-000000000001', 'avery@northstarlogistics.example', 'Avery Morgan', 'Director of Operations', '{"emailExceptionCreated":true,"emailEtaChanged":true,"emailShipmentDelayed":true,"emailMilestoneReached":false}'),
  ('10000000-0000-4000-8000-000000000002', null, '00000000-0000-4000-8000-000000000001', 'jordan@northstarlogistics.example', 'Jordan Patel', 'Operations Manager', '{"emailExceptionCreated":true,"emailEtaChanged":true,"emailShipmentDelayed":true,"emailMilestoneReached":true}'),
  ('10000000-0000-4000-8000-000000000003', null, '00000000-0000-4000-8000-000000000001', 'casey@northstarlogistics.example', 'Casey Nguyen', 'Operations Agent', '{"emailExceptionCreated":true,"emailEtaChanged":false,"emailShipmentDelayed":true,"emailMilestoneReached":false}'),
  ('10000000-0000-4000-8000-000000000004', null, '00000000-0000-4000-8000-000000000001', 'riley@bluepeakretail.example', 'Riley Chen', 'Customer Logistics Lead', '{"emailExceptionCreated":true,"emailEtaChanged":true,"emailShipmentDelayed":true,"emailMilestoneReached":true}')
on conflict (id) do nothing;

insert into public.customers (id, organization_id, name, code, segment, contact_name, contact_email)
values
  ('20000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000001', 'BluePeak Retail', 'BPR', 'Retail', 'Mila Brooks', 'bpr@example.com'),
  ('20000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000001', 'Atlas Industrial', 'ATL', 'Industrial', 'Theo Ruiz', 'atl@example.com'),
  ('20000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000001', 'Northline Foods', 'NLF', 'Food', 'Isla Carter', 'nlf@example.com'),
  ('20000000-0000-4000-8000-000000000004', '00000000-0000-4000-8000-000000000001', 'Summit Health Devices', 'SHD', 'Medical', 'Nina Shah', 'shd@example.com'),
  ('20000000-0000-4000-8000-000000000005', '00000000-0000-4000-8000-000000000001', 'Verity Consumer Goods', 'VCG', 'Consumer', 'Luca West', 'vcg@example.com'),
  ('20000000-0000-4000-8000-000000000006', '00000000-0000-4000-8000-000000000001', 'Meridian Home', 'MDH', 'Home', 'Mason Young', 'mdh@example.com')
on conflict (id) do nothing;

insert into public.carriers (id, organization_id, name, scac, mode, on_time_rate)
values
  ('30000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000001', 'TriSpan Freight', 'TSFG', 'truckload', 97.10),
  ('30000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000001', 'BlueRoute Express', 'BREX', 'ltl', 93.60),
  ('30000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000001', 'Meridian Air Cargo', 'MACO', 'air', 95.40),
  ('30000000-0000-4000-8000-000000000004', '00000000-0000-4000-8000-000000000001', 'Harborline Ocean', 'HLOC', 'ocean', 88.30),
  ('30000000-0000-4000-8000-000000000005', '00000000-0000-4000-8000-000000000001', 'NorthRail Connect', 'NRCT', 'truckload', 91.20)
on conflict (id) do nothing;

insert into public.facilities (id, organization_id, name, code, city, region, country, facility_type)
values
  ('40000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000001', 'Los Angeles DC', 'LAX-DC', 'Los Angeles', 'CA', 'US', 'origin'),
  ('40000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000001', 'Dallas Crossdock', 'DAL-XD', 'Dallas', 'TX', 'US', 'crossdock'),
  ('40000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000001', 'Chicago Hub', 'CHI-HB', 'Chicago', 'IL', 'US', 'hub'),
  ('40000000-0000-4000-8000-000000000004', '00000000-0000-4000-8000-000000000001', 'Savannah Port', 'SAV-PT', 'Savannah', 'GA', 'US', 'origin'),
  ('40000000-0000-4000-8000-000000000005', '00000000-0000-4000-8000-000000000001', 'Newark Final Mile', 'EWR-FM', 'Newark', 'NJ', 'US', 'destination'),
  ('40000000-0000-4000-8000-000000000006', '00000000-0000-4000-8000-000000000001', 'Atlanta Regional DC', 'ATL-RD', 'Atlanta', 'GA', 'US', 'destination'),
  ('40000000-0000-4000-8000-000000000007', '00000000-0000-4000-8000-000000000001', 'Phoenix Fulfillment', 'PHX-FF', 'Phoenix', 'AZ', 'US', 'destination'),
  ('40000000-0000-4000-8000-000000000008', '00000000-0000-4000-8000-000000000001', 'Seattle Regional Hub', 'SEA-RH', 'Seattle', 'WA', 'US', 'destination')
on conflict (id) do nothing;

insert into public.organization_members (id, organization_id, profile_id, role, customer_id)
values
  ('50000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'org_admin', null),
  ('50000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000002', 'ops_manager', null),
  ('50000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000003', 'ops_agent', null),
  ('50000000-0000-4000-8000-000000000004', '00000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000004', 'customer_user', '20000000-0000-4000-8000-000000000001')
on conflict (id) do nothing;

insert into public.orders (id, organization_id, customer_id, order_number, customer_reference, promised_delivery_at, value_usd)
select
  gen_random_uuid(),
  '00000000-0000-4000-8000-000000000001',
  (array[
    '20000000-0000-4000-8000-000000000001'::uuid,
    '20000000-0000-4000-8000-000000000002'::uuid,
    '20000000-0000-4000-8000-000000000003'::uuid,
    '20000000-0000-4000-8000-000000000004'::uuid,
    '20000000-0000-4000-8000-000000000005'::uuid,
    '20000000-0000-4000-8000-000000000006'::uuid
  ])[(g % 6) + 1],
  'SO-' || (2026000 + g),
  'PO-' || (8000 + g),
  timezone('utc', now()) + ((g - 30) || ' hours')::interval,
  18000 + ((g % 9) * 3250)
from generate_series(1, 56) as g
where not exists (
  select 1
  from public.orders
  where order_number = 'SO-' || (2026000 + g)
);

with source_orders as (
  select row_number() over (order by order_number) as rn, id, customer_id, promised_delivery_at
  from public.orders
  where organization_id = '00000000-0000-4000-8000-000000000001'
)
insert into public.shipments (
  organization_id,
  order_id,
  customer_id,
  carrier_id,
  origin_facility_id,
  destination_facility_id,
  shipment_reference,
  external_reference,
  tracking_token,
  mode,
  status,
  risk_level,
  promised_delivery_at,
  eta,
  actual_delivery_at,
  last_event_at,
  last_update_at,
  summary
)
select
  '00000000-0000-4000-8000-000000000001',
  source_orders.id,
  source_orders.customer_id,
  (array[
    '30000000-0000-4000-8000-000000000001'::uuid,
    '30000000-0000-4000-8000-000000000002'::uuid,
    '30000000-0000-4000-8000-000000000003'::uuid,
    '30000000-0000-4000-8000-000000000004'::uuid,
    '30000000-0000-4000-8000-000000000005'::uuid
  ])[(source_orders.rn % 5) + 1],
  (array[
    '40000000-0000-4000-8000-000000000001'::uuid,
    '40000000-0000-4000-8000-000000000002'::uuid,
    '40000000-0000-4000-8000-000000000003'::uuid,
    '40000000-0000-4000-8000-000000000004'::uuid
  ])[(source_orders.rn % 4) + 1],
  (array[
    '40000000-0000-4000-8000-000000000005'::uuid,
    '40000000-0000-4000-8000-000000000006'::uuid,
    '40000000-0000-4000-8000-000000000007'::uuid,
    '40000000-0000-4000-8000-000000000008'::uuid
  ])[(source_orders.rn % 4) + 1],
  'SP-' || (20260300 + source_orders.rn),
  'BK-' || (54000 + source_orders.rn),
  'trk_sp_' || source_orders.rn,
  (array['ftl', 'ltl', 'air', 'ocean'])[(source_orders.rn % 4) + 1],
  case
    when source_orders.rn % 5 = 0 then 'delivered'::public.shipment_status
    when source_orders.rn % 6 = 3 then 'delayed'::public.shipment_status
    when source_orders.rn % 6 = 4 then 'at_hub'::public.shipment_status
    else 'in_transit'::public.shipment_status
  end,
  case
    when source_orders.rn % 6 = 5 then 'critical'::public.risk_level
    when source_orders.rn % 6 = 4 then 'high'::public.risk_level
    when source_orders.rn % 6 = 3 then 'medium'::public.risk_level
    else 'low'::public.risk_level
  end,
  source_orders.promised_delivery_at,
  source_orders.promised_delivery_at + (((array[-9,-4,-1,2,7,14])[(source_orders.rn % 6) + 1]) || ' hours')::interval,
  case when source_orders.rn % 5 = 0 then source_orders.promised_delivery_at - interval '1 hour' else null end,
  timezone('utc', now()) - (((source_orders.rn % 12) + 1) || ' hours')::interval,
  timezone('utc', now()) - (((source_orders.rn % 18) + 2) || ' hours')::interval,
  'Seeded operational shipment for dashboard and exception workflows.'
from source_orders
where not exists (
  select 1
  from public.shipments
  where shipment_reference = 'SP-' || (20260300 + source_orders.rn)
);

insert into public.shipment_milestones (organization_id, shipment_id, sequence_number, label, planned_at, actual_at, milestone_status)
select
  shipments.organization_id,
  shipments.id,
  milestone.sequence_number,
  milestone.label,
  shipments.created_at + (milestone.hours_after || ' hours')::interval,
  case
    when milestone.sequence_number < ((row_number() over (order by shipments.shipment_reference) % 4) + 1)
      or shipments.actual_delivery_at is not null
    then shipments.created_at + ((milestone.hours_after + 1) || ' hours')::interval
    else null
  end,
  case
    when milestone.sequence_number < ((row_number() over (order by shipments.shipment_reference) % 4) + 1)
      or shipments.actual_delivery_at is not null
    then 'completed'
    when shipments.created_at + (milestone.hours_after || ' hours')::interval < timezone('utc', now()) and milestone.sequence_number < 4
    then 'late'
    else 'upcoming'
  end
from public.shipments
cross join (
  values
    (1, 'Pickup confirmed', 6),
    (2, 'Departed origin', 22),
    (3, 'Arrived regional hub', 42),
    (4, 'Delivered', 60)
) as milestone(sequence_number, label, hours_after)
where not exists (
  select 1
  from public.shipment_milestones
  where shipment_id = public.shipments.id
    and sequence_number = milestone.sequence_number
);

insert into public.shipment_events (organization_id, shipment_id, event_type, title, description, source, occurred_at, is_customer_visible)
select
  shipments.organization_id,
  shipments.id,
  event.event_type,
  event.title,
  event.description,
  event.source,
  shipments.created_at + (event.hours_after || ' hours')::interval,
  event.is_customer_visible
from public.shipments
cross join (
  values
    ('scan', 'Booking confirmed', 'Carrier tender accepted by operations team.', 'carrier_edi', 2, true),
    ('eta_change', 'ETA adjusted', 'ETA shifted due to active network conditions.', 'gps_ping', 18, true),
    ('internal_note', 'Ops note', 'Operations team monitoring route variance and dock capacity.', 'ops_console', 20, false)
) as event(event_type, title, description, source, hours_after, is_customer_visible)
where not exists (
  select 1
  from public.shipment_events
  where shipment_id = public.shipments.id
    and title = event.title
);

insert into public.exceptions (organization_id, shipment_id, customer_id, carrier_id, exception_type, status, risk_level, title, description, owner_profile_id, opened_at)
select
  shipments.organization_id,
  shipments.id,
  shipments.customer_id,
  shipments.carrier_id,
  case
    when shipments.status = 'delayed' then 'eta_breach'::public.exception_type
    when shipments.risk_level = 'critical' then 'missed_milestone'::public.exception_type
    else 'stale_tracking'::public.exception_type
  end,
  case when shipments.actual_delivery_at is not null then 'resolved'::public.exception_status when shipments.risk_level = 'critical' then 'investigating'::public.exception_status else 'open'::public.exception_status end,
  shipments.risk_level,
  case
    when shipments.status = 'delayed' then 'Promised ETA breached'
    when shipments.risk_level = 'critical' then 'Critical milestone missed'
    else 'Tracking has gone stale'
  end,
  'Seeded exception from delay, stale tracking, or missed milestone rule.',
  '10000000-0000-4000-8000-000000000002',
  shipments.last_update_at
from public.shipments
where shipments.risk_level in ('high', 'critical')
  and not exists (
    select 1
    from public.exceptions
    where shipment_id = shipments.id
  );

with ranked_notifications as (
  select
    member.profile_id,
    shipments.id as shipment_id,
    exceptions.id as exception_id,
    shipments.shipment_reference,
    row_number() over (partition by member.profile_id order by shipments.shipment_reference) as seq
  from public.organization_members member
  join public.shipments shipments on shipments.organization_id = member.organization_id
  left join public.exceptions exceptions on exceptions.shipment_id = shipments.id
  where member.profile_id in (
    '10000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000002',
    '10000000-0000-4000-8000-000000000003',
    '10000000-0000-4000-8000-000000000004'
  )
)
insert into public.notifications (organization_id, profile_id, shipment_id, exception_id, channel, notification_kind, title, body, read_at)
select
  '00000000-0000-4000-8000-000000000001',
  ranked_notifications.profile_id,
  ranked_notifications.shipment_id,
  ranked_notifications.exception_id,
  'in_app',
  'exception_created',
  'Exception opened',
  ranked_notifications.shipment_reference || ' requires attention in the operations workspace.',
  case when ranked_notifications.seq % 3 = 0 then timezone('utc', now()) - interval '2 hours' else null end
from ranked_notifications
where ranked_notifications.seq <= 6
  and not exists (
    select 1
    from public.notifications
    where profile_id = ranked_notifications.profile_id
      and shipment_id = ranked_notifications.shipment_id
      and notification_kind = 'exception_created'
  );

with ranked_shipments as (
  select
    shipments.*,
    row_number() over (order by shipments.shipment_reference) as seq
  from public.shipments
)
insert into public.documents (organization_id, shipment_id, customer_id, document_type, file_name, file_path, file_size_bytes, is_customer_visible)
select
  ranked_shipments.organization_id,
  ranked_shipments.id,
  ranked_shipments.customer_id,
  'bol'::public.document_type,
  ranked_shipments.shipment_reference || '-bol.pdf',
  ranked_shipments.organization_id || '/' || ranked_shipments.id || '/bol.pdf',
  240000,
  true
from ranked_shipments
where ranked_shipments.seq <= 24
  and not exists (
    select 1
    from public.documents
    where shipment_id = ranked_shipments.id
      and document_type = 'bol'
  );

insert into public.audit_logs (organization_id, actor_profile_id, shipment_id, exception_id, action, summary, payload)
select
  exceptions.organization_id,
  '10000000-0000-4000-8000-000000000002',
  exceptions.shipment_id,
  exceptions.id,
  'exception.created',
  'Automated exception created from seeded risk logic.',
  jsonb_build_object('source', 'seed.sql')
from public.exceptions
where not exists (
  select 1
  from public.audit_logs
  where exception_id = public.exceptions.id
    and action = 'exception.created'
);

insert into public.webhook_endpoints (id, organization_id, label, url, subscribed_events)
values
  ('90000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000001', 'Customer alert relay', 'https://example.com/hooks/customer-alerts', array['shipment.delayed', 'exception.created']),
  ('90000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000001', 'Carrier data sync', 'https://example.com/hooks/carrier-sync', array['shipment.updated', 'milestone.reached'])
on conflict (id) do nothing;
