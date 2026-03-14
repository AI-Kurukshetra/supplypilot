import { cache } from "react";

import { requireAppContext } from "@/lib/auth/session";
import type {
  AuditLogRecord,
  Carrier,
  Customer,
  DashboardMetrics,
  DocumentRecord,
  ExceptionRecord,
  Facility,
  NotificationRecord,
  NotificationCenter,
  Order,
  SearchSuggestion,
  Shipment,
  ShipmentEvent,
  ShipmentListFilters,
  ShipmentMilestone,
  TrendPoint,
  WebhookEndpoint,
  Profile,
  OrganizationMember,
} from "@/lib/domain/types";
import { createAdminClient } from "@/lib/supabase/admin";
import { average, sum } from "@/lib/utils";

type ShipmentView = Shipment & {
  customer: Customer;
  carrier: Carrier;
  orderNumber: string;
  originName: string;
  destinationName: string;
  openExceptionCount: number;
};

type SupabaseRow = Record<string, unknown>;

function mapCustomerRecord(record: SupabaseRow): Customer {
  return {
    id: String(record.id),
    organizationId: String(record.organization_id),
    name: String(record.name),
    code: String(record.code),
    segment: String(record.segment),
    contactName: String(record.contact_name ?? ""),
    contactEmail: String(record.contact_email ?? ""),
    createdAt: String(record.created_at),
  };
}

function mapCarrierRecord(record: SupabaseRow): Carrier {
  return {
    id: String(record.id),
    organizationId: String(record.organization_id),
    name: String(record.name),
    scac: String(record.scac),
    mode: String(record.mode) as Carrier["mode"],
    onTimeRate: Number(record.on_time_rate ?? 0),
    activeExceptions: Number(record.active_exceptions ?? 0),
    createdAt: String(record.created_at),
  };
}

function mapFacilityRecord(record: SupabaseRow): Facility {
  return {
    id: String(record.id),
    organizationId: String(record.organization_id),
    name: String(record.name),
    code: String(record.code),
    city: String(record.city),
    region: String(record.region),
    country: String(record.country),
    type: String(record.facility_type) as Facility["type"],
    createdAt: String(record.created_at),
  };
}

function mapOrderRecord(record: SupabaseRow): Order {
  return {
    id: String(record.id),
    organizationId: String(record.organization_id),
    customerId: String(record.customer_id),
    orderNumber: String(record.order_number),
    reference: String(record.customer_reference ?? ""),
    promisedDeliveryAt: String(record.promised_delivery_at),
    valueUsd: Number(record.value_usd ?? 0),
    createdAt: String(record.created_at),
  };
}

function mapShipmentRecord(record: SupabaseRow): Shipment {
  return {
    id: String(record.id),
    organizationId: String(record.organization_id),
    orderId: String(record.order_id),
    customerId: String(record.customer_id),
    carrierId: String(record.carrier_id),
    originFacilityId: String(record.origin_facility_id),
    destinationFacilityId: String(record.destination_facility_id),
    shipmentReference: String(record.shipment_reference),
    externalReference: String(record.external_reference ?? ""),
    trackingToken: String(record.tracking_token),
    status: String(record.status) as Shipment["status"],
    riskLevel: String(record.risk_level) as Shipment["riskLevel"],
    mode: String(record.mode) as Shipment["mode"],
    promisedDeliveryAt: String(record.promised_delivery_at),
    eta: String(record.eta),
    actualDeliveryAt: record.actual_delivery_at ? String(record.actual_delivery_at) : null,
    lastEventAt: String(record.last_event_at ?? record.updated_at),
    lastUpdateAt: String(record.last_update_at ?? record.updated_at),
    createdAt: String(record.created_at),
    updatedAt: String(record.updated_at),
    summary: String(record.summary ?? ""),
  };
}

function mapMilestoneRecord(record: SupabaseRow): ShipmentMilestone {
  return {
    id: String(record.id),
    shipmentId: String(record.shipment_id),
    organizationId: String(record.organization_id),
    sequence: Number(record.sequence_number),
    label: String(record.label),
    plannedAt: String(record.planned_at),
    actualAt: record.actual_at ? String(record.actual_at) : null,
    status: String(record.milestone_status) as ShipmentMilestone["status"],
  };
}

function mapEventRecord(record: SupabaseRow): ShipmentEvent {
  return {
    id: String(record.id),
    shipmentId: String(record.shipment_id),
    organizationId: String(record.organization_id),
    occurredAt: String(record.occurred_at),
    eventType: String(record.event_type) as ShipmentEvent["eventType"],
    title: String(record.title),
    description: String(record.description ?? ""),
    source: String(record.source ?? ""),
    isCustomerVisible: Boolean(record.is_customer_visible),
  };
}

function mapExceptionRecord(record: SupabaseRow): ExceptionRecord {
  return {
    id: String(record.id),
    shipmentId: String(record.shipment_id),
    organizationId: String(record.organization_id),
    customerId: String(record.customer_id),
    carrierId: String(record.carrier_id),
    type: String(record.exception_type) as ExceptionRecord["type"],
    status: String(record.status) as ExceptionRecord["status"],
    riskLevel: String(record.risk_level) as ExceptionRecord["riskLevel"],
    title: String(record.title),
    description: String(record.description ?? ""),
    ownerProfileId: record.owner_profile_id ? String(record.owner_profile_id) : null,
    resolutionNotes: record.resolution_notes ? String(record.resolution_notes) : null,
    openedAt: String(record.opened_at),
    updatedAt: String(record.updated_at),
    resolvedAt: record.resolved_at ? String(record.resolved_at) : null,
  };
}

function mapDocumentRecord(record: SupabaseRow): DocumentRecord {
  return {
    id: String(record.id),
    organizationId: String(record.organization_id),
    shipmentId: String(record.shipment_id),
    customerId: String(record.customer_id),
    type: String(record.document_type) as DocumentRecord["type"],
    fileName: String(record.file_name),
    filePath: String(record.file_path),
    fileSizeBytes: Number(record.file_size_bytes ?? 0),
    isCustomerVisible: Boolean(record.is_customer_visible),
    createdAt: String(record.created_at),
  };
}

function mapAuditLogRecord(record: SupabaseRow): AuditLogRecord {
  return {
    id: String(record.id),
    organizationId: String(record.organization_id),
    actorProfileId: record.actor_profile_id ? String(record.actor_profile_id) : null,
    shipmentId: record.shipment_id ? String(record.shipment_id) : null,
    exceptionId: record.exception_id ? String(record.exception_id) : null,
    action: String(record.action),
    summary: String(record.summary),
    createdAt: String(record.created_at),
  };
}

async function getShipmentDataContext() {
  const context = await requireAppContext();
  return {
    organizationId: context.organization.id,
    context,
    supabase: createAdminClient(),
  };
}

async function buildSupabaseShipmentViewModels(shipments: SupabaseRow[], organizationId: string) {
  const supabase = createAdminClient();
  const [customersResult, carriersResult, ordersResult, facilitiesResult, exceptionsResult] = await Promise.all([
    supabase.from("customers").select("*").eq("organization_id", organizationId),
    supabase.from("carriers").select("*").eq("organization_id", organizationId),
    supabase.from("orders").select("*").eq("organization_id", organizationId),
    supabase.from("facilities").select("*").eq("organization_id", organizationId),
    supabase
      .from("exceptions")
      .select("shipment_id, status")
      .eq("organization_id", organizationId)
      .neq("status", "resolved"),
  ]);

  if (customersResult.error) throw customersResult.error;
  if (carriersResult.error) throw carriersResult.error;
  if (ordersResult.error) throw ordersResult.error;
  if (facilitiesResult.error) throw facilitiesResult.error;
  if (exceptionsResult.error) throw exceptionsResult.error;

  const customerMap = new Map((customersResult.data ?? []).map((row) => [String(row.id), mapCustomerRecord(row as SupabaseRow)]));
  const carrierMap = new Map((carriersResult.data ?? []).map((row) => [String(row.id), mapCarrierRecord(row as SupabaseRow)]));
  const orderMap = new Map((ordersResult.data ?? []).map((row) => [String(row.id), mapOrderRecord(row as SupabaseRow)]));
  const facilityMap = new Map((facilitiesResult.data ?? []).map((row) => [String(row.id), mapFacilityRecord(row as SupabaseRow)]));
  const openExceptionCounts = new Map<string, number>();

  for (const record of exceptionsResult.data ?? []) {
    const shipmentId = String(record.shipment_id);
    openExceptionCounts.set(shipmentId, (openExceptionCounts.get(shipmentId) ?? 0) + 1);
  }

  return shipments.map((row) => {
    const shipment = mapShipmentRecord(row);
    const customer = customerMap.get(shipment.customerId)!;
    const carrier = carrierMap.get(shipment.carrierId)!;
    const order = orderMap.get(shipment.orderId)!;
    const origin = facilityMap.get(shipment.originFacilityId)!;
    const destination = facilityMap.get(shipment.destinationFacilityId)!;

    return {
      ...shipment,
      customer,
      carrier,
      orderNumber: order.orderNumber,
      originName: `${origin.city}, ${origin.region}`,
      destinationName: `${destination.city}, ${destination.region}`,
      openExceptionCount: openExceptionCounts.get(shipment.id) ?? 0,
    };
  });
}

function buildTrendPoints(values: string[], slots = 6): TrendPoint[] {
  const bucketSize = 7 * 24 * 3600000;
  const now = Date.now();
  const start = now - bucketSize * (slots - 1);
  const counts = Array.from({ length: slots }, () => 0);

  for (const value of values) {
    const timestamp = new Date(value).getTime();
    if (Number.isNaN(timestamp) || timestamp < start) {
      continue;
    }

    const index = Math.min(slots - 1, Math.floor((timestamp - start) / bucketSize));
    counts[index] += 1;
  }

  return counts.map((count, index) => {
    const bucketDate = new Date(start + index * bucketSize);
    return {
      label: new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(bucketDate),
      value: count,
    };
  });
}

function mapProfileRecord(record: SupabaseRow): Profile {
  return {
    id: String(record.id),
    authUserId: record.auth_user_id ? String(record.auth_user_id) : null,
    fullName: String(record.full_name),
    email: String(record.email),
    title: String(record.title ?? ""),
    createdAt: String(record.created_at),
    updatedAt: String(record.updated_at),
    notificationPreferences: (record.notification_preferences ?? {
      emailExceptionCreated: false,
      emailEtaChanged: false,
      emailShipmentDelayed: false,
      emailMilestoneReached: false,
    }) as Profile["notificationPreferences"],
  };
}

function mapOrganizationMemberRecord(record: SupabaseRow): OrganizationMember {
  return {
    id: String(record.id),
    organizationId: String(record.organization_id),
    profileId: String(record.profile_id),
    role: String(record.role) as OrganizationMember["role"],
    customerId: record.customer_id ? String(record.customer_id) : null,
    createdAt: String(record.created_at),
  };
}

function mapWebhookEndpointRecord(record: SupabaseRow): WebhookEndpoint {
  return {
    id: String(record.id),
    organizationId: String(record.organization_id),
    label: String(record.label),
    url: String(record.url),
    subscribedEvents: Array.isArray(record.subscribed_events)
      ? record.subscribed_events.map((item) => String(item))
      : [],
    createdAt: String(record.created_at),
  };
}

export const getDashboardMetrics = cache(async (): Promise<DashboardMetrics> => {
  const { organizationId, supabase } = await getShipmentDataContext();
  const [shipmentsResult, exceptionsResult] = await Promise.all([
    supabase.from("shipments").select("promised_delivery_at, actual_delivery_at, status").eq("organization_id", organizationId),
    supabase
      .from("exceptions")
      .select("id")
      .eq("organization_id", organizationId)
      .neq("status", "resolved"),
  ]);

  if (shipmentsResult.error) throw shipmentsResult.error;
  if (exceptionsResult.error) throw exceptionsResult.error;

  const shipments = shipmentsResult.data ?? [];
  const delivered = shipments.filter((shipment) => shipment.actual_delivery_at);
  const onTimeDelivered = delivered.filter(
    (shipment) =>
      new Date(String(shipment.actual_delivery_at)).getTime() <=
      new Date(String(shipment.promised_delivery_at)).getTime(),
  );

  return {
    totalShipments: shipments.length,
    onTimeRate: delivered.length ? (onTimeDelivered.length / delivered.length) * 100 : 0,
    delayedShipments: shipments.filter((shipment) => shipment.status === "delayed").length,
    openExceptions: (exceptionsResult.data ?? []).length,
  };
});

export const getDashboardData = cache(async () => {
  const { organizationId, supabase } = await getShipmentDataContext();
  const metrics = await getDashboardMetrics();
  const [shipmentsResult, eventsResult, exceptionsResult, carriersResult, profilesResult] = await Promise.all([
    supabase.from("shipments").select("*").eq("organization_id", organizationId).order("updated_at", { ascending: false }),
    supabase
      .from("shipment_events")
      .select("*")
      .eq("organization_id", organizationId)
      .eq("event_type", "eta_change")
      .order("occurred_at", { ascending: false })
      .limit(6),
    supabase
      .from("exceptions")
      .select("*")
      .eq("organization_id", organizationId)
      .neq("status", "resolved")
      .order("updated_at", { ascending: false })
      .limit(6),
    supabase.from("carriers").select("*").eq("organization_id", organizationId).order("name"),
    supabase.from("profiles").select("*").eq("default_organization_id", organizationId),
  ]);

  if (shipmentsResult.error) throw shipmentsResult.error;
  if (eventsResult.error) throw eventsResult.error;
  if (exceptionsResult.error) throw exceptionsResult.error;
  if (carriersResult.error) throw carriersResult.error;
  if (profilesResult.error) throw profilesResult.error;

  const shipmentViews = await buildSupabaseShipmentViewModels(shipmentsResult.data ?? [], organizationId);
  const shipmentMap = new Map(shipmentViews.map((shipment) => [shipment.id, shipment]));
  const profileMap = new Map((profilesResult.data ?? []).map((row) => {
    const profile = mapProfileRecord(row as SupabaseRow);
    return [profile.id, profile];
  }));

  const atRiskShipments = shipmentViews
    .filter((shipment) => shipment.riskLevel === "high" || shipment.riskLevel === "critical")
    .slice(0, 8);
  const etaChangeFeed = (eventsResult.data ?? []).map((row) => {
    const event = mapEventRecord(row as SupabaseRow);
    return {
      ...event,
      shipment: shipmentMap.get(event.shipmentId)!,
    };
  });
  const openExceptions = (exceptionsResult.data ?? []).map((row) => {
    const exceptionRecord = mapExceptionRecord(row as SupabaseRow);
    return {
      ...exceptionRecord,
      shipment: shipmentMap.get(exceptionRecord.shipmentId)!,
      customer: shipmentMap.get(exceptionRecord.shipmentId)!.customer,
      owner: exceptionRecord.ownerProfileId ? profileMap.get(exceptionRecord.ownerProfileId) ?? null : null,
    };
  });

  const carriers = await getCarriersData();

  return {
    metrics,
    atRiskShipments,
    etaChangeFeed,
    openExceptions,
    carrierPerformance: carriers,
  };
});

export async function getShipmentList(filters: ShipmentListFilters = {}) {
  const { organizationId, supabase } = await getShipmentDataContext();
  let query = supabase
    .from("shipments")
    .select("*", { count: "exact" })
    .eq("organization_id", organizationId);

  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  if (filters.risk && filters.risk !== "all") {
    query = query.eq("risk_level", filters.risk);
  }

  if (filters.customerId && filters.customerId !== "all") {
    query = query.eq("customer_id", filters.customerId);
  }

  if (filters.carrierId && filters.carrierId !== "all") {
    query = query.eq("carrier_id", filters.carrierId);
  }

  if (filters.dateRange && filters.dateRange !== "all") {
    const thresholdDays = filters.dateRange === "today" ? 1 : Number.parseInt(filters.dateRange, 10);
    const threshold = new Date(Date.now() - thresholdDays * 24 * 3600000).toISOString();
    query = query.gte("eta", threshold);
  }

  if (filters.query?.trim()) {
    const normalized = filters.query.trim();
    query = query.or(
      `id.ilike.%${normalized}%,shipment_reference.ilike.%${normalized}%,external_reference.ilike.%${normalized}%`,
    );
  }

  const currentPage = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 12;
  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize - 1;

  const { data, error, count } = await query.order("updated_at", { ascending: false }).range(start, end);

  if (error) {
    throw error;
  }

  const items = await buildSupabaseShipmentViewModels((data ?? []) as SupabaseRow[], organizationId);
  const total = count ?? items.length;

  return {
    items,
    total,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
    currentPage,
    filters,
  };
}

export async function getShipmentSearchSuggestions({
  limit = 10,
  includeTrackingTokens = false,
}: {
  limit?: number;
  includeTrackingTokens?: boolean;
} = {}): Promise<SearchSuggestion[]> {
  const { organizationId, supabase } = await getShipmentDataContext();
  const { data, error } = await supabase
    .from("shipments")
    .select("shipment_reference, external_reference, tracking_token, summary")
    .eq("organization_id", organizationId)
    .order("shipment_reference")
    .limit(limit);

  if (error) {
    throw error;
  }

  const suggestions = new Map<string, SearchSuggestion>();
  for (const row of data ?? []) {
    suggestions.set(String(row.shipment_reference), {
      value: String(row.shipment_reference),
      label: `${String(row.external_reference ?? "")} · ${String(row.summary ?? "")}`,
    });

    if (row.external_reference) {
      suggestions.set(String(row.external_reference), {
        value: String(row.external_reference),
        label: String(row.shipment_reference),
      });
    }

    if (includeTrackingTokens) {
      suggestions.set(String(row.tracking_token), {
        value: String(row.tracking_token),
        label: String(row.shipment_reference),
      });
    }
  }

  return Array.from(suggestions.values()).slice(0, limit);
}

export async function getShipmentDetail(shipmentId: string) {
  const { organizationId, supabase } = await getShipmentDataContext();
  const { data: shipmentRow, error: shipmentError } = await supabase
    .from("shipments")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("id", shipmentId)
    .maybeSingle();

  if (shipmentError) {
    throw shipmentError;
  }

  if (!shipmentRow) {
    return null;
  }

  const shipmentView = (await buildSupabaseShipmentViewModels([shipmentRow as SupabaseRow], organizationId))[0];
  const [milestonesResult, eventsResult, exceptionsResult, documentsResult, auditLogsResult] = await Promise.all([
    supabase
      .from("shipment_milestones")
      .select("*")
      .eq("organization_id", organizationId)
      .eq("shipment_id", shipmentId)
      .order("sequence_number"),
    supabase
      .from("shipment_events")
      .select("*")
      .eq("organization_id", organizationId)
      .eq("shipment_id", shipmentId)
      .order("occurred_at", { ascending: false }),
    supabase
      .from("exceptions")
      .select("*")
      .eq("organization_id", organizationId)
      .eq("shipment_id", shipmentId)
      .order("updated_at", { ascending: false }),
    supabase
      .from("documents")
      .select("*")
      .eq("organization_id", organizationId)
      .eq("shipment_id", shipmentId)
      .order("created_at", { ascending: false }),
    supabase
      .from("audit_logs")
      .select("*")
      .eq("organization_id", organizationId)
      .eq("shipment_id", shipmentId)
      .order("created_at", { ascending: false }),
  ]);

  if (milestonesResult.error) throw milestonesResult.error;
  if (eventsResult.error) throw eventsResult.error;
  if (exceptionsResult.error) throw exceptionsResult.error;
  if (documentsResult.error) throw documentsResult.error;
  if (auditLogsResult.error) throw auditLogsResult.error;

  return {
    shipment: shipmentView,
    customer: shipmentView.customer,
    carrier: shipmentView.carrier,
    milestones: (milestonesResult.data ?? []).map((row) => mapMilestoneRecord(row as SupabaseRow)),
    events: (eventsResult.data ?? []).map((row) => mapEventRecord(row as SupabaseRow)),
    exceptions: (exceptionsResult.data ?? []).map((row) => mapExceptionRecord(row as SupabaseRow)),
    documents: (documentsResult.data ?? []).map((row) => mapDocumentRecord(row as SupabaseRow)),
    auditLogs: (auditLogsResult.data ?? []).map((row) => mapAuditLogRecord(row as SupabaseRow)),
    internalNotes: (eventsResult.data ?? [])
      .map((row) => mapEventRecord(row as SupabaseRow))
      .filter((event) => event.eventType === "internal_note"),
  };
}

export async function getExceptionsDashboard() {
  const { organizationId, supabase } = await getShipmentDataContext();
  const [exceptionsResult, shipmentsResult, profilesResult] = await Promise.all([
    supabase.from("exceptions").select("*").eq("organization_id", organizationId).order("updated_at", { ascending: false }),
    supabase.from("shipments").select("*").eq("organization_id", organizationId),
    supabase.from("profiles").select("*").eq("default_organization_id", organizationId),
  ]);

  if (exceptionsResult.error) throw exceptionsResult.error;
  if (shipmentsResult.error) throw shipmentsResult.error;
  if (profilesResult.error) throw profilesResult.error;

  const exceptionRows = (exceptionsResult.data ?? []).map((row) => mapExceptionRecord(row as SupabaseRow));
  const openExceptions = exceptionRows.filter((exceptionRecord) => exceptionRecord.status !== "resolved");
  const resolvedDurations = exceptionRows
    .filter((exceptionRecord) => exceptionRecord.resolvedAt)
    .map(
      (exceptionRecord) =>
        (new Date(exceptionRecord.resolvedAt!).getTime() - new Date(exceptionRecord.openedAt).getTime()) / 3600000,
    );
  const shipmentViews = await buildSupabaseShipmentViewModels(shipmentsResult.data ?? [], organizationId);
  const shipmentMap = new Map(shipmentViews.map((shipment) => [shipment.id, shipment]));
  const profileMap = new Map((profilesResult.data ?? []).map((row) => {
    const profile = mapProfileRecord(row as SupabaseRow);
    return [profile.id, profile];
  }));

  return {
    metrics: {
      openCount: openExceptions.length,
      criticalCount: openExceptions.filter((exceptionRecord) => exceptionRecord.riskLevel === "critical").length,
      investigatingCount: openExceptions.filter((exceptionRecord) => exceptionRecord.status === "investigating")
        .length,
      averageResolutionHours: average(resolvedDurations),
    },
    items: openExceptions.map((exceptionRecord) => ({
      ...exceptionRecord,
      shipment: shipmentMap.get(exceptionRecord.shipmentId)!,
      customer: shipmentMap.get(exceptionRecord.shipmentId)!.customer,
      carrier: shipmentMap.get(exceptionRecord.shipmentId)!.carrier,
      owner: exceptionRecord.ownerProfileId
        ? profileMap.get(exceptionRecord.ownerProfileId) ?? null
        : null,
    })),
  };
}

export async function getCustomersData() {
  const { organizationId, supabase } = await getShipmentDataContext();
  const [customersResult, shipmentsResult, exceptionsResult] = await Promise.all([
    supabase.from("customers").select("*").eq("organization_id", organizationId).order("name"),
    supabase.from("shipments").select("customer_id, status").eq("organization_id", organizationId),
    supabase
      .from("exceptions")
      .select("customer_id, status")
      .eq("organization_id", organizationId)
      .neq("status", "resolved"),
  ]);

  if (customersResult.error) throw customersResult.error;
  if (shipmentsResult.error) throw shipmentsResult.error;
  if (exceptionsResult.error) throw exceptionsResult.error;

  const shipmentCounts = new Map<string, number>();
  const delayedCounts = new Map<string, number>();
  const exceptionCounts = new Map<string, number>();

  for (const shipment of shipmentsResult.data ?? []) {
    const customerId = String(shipment.customer_id);
    shipmentCounts.set(customerId, (shipmentCounts.get(customerId) ?? 0) + 1);

    if (shipment.status === "delayed") {
      delayedCounts.set(customerId, (delayedCounts.get(customerId) ?? 0) + 1);
    }
  }

  for (const exceptionRecord of exceptionsResult.data ?? []) {
    const customerId = String(exceptionRecord.customer_id);
    exceptionCounts.set(customerId, (exceptionCounts.get(customerId) ?? 0) + 1);
  }

  return (customersResult.data ?? []).map((customerRow) => {
    const customer = mapCustomerRecord(customerRow as SupabaseRow);
    return {
      ...customer,
      shipmentCount: shipmentCounts.get(customer.id) ?? 0,
      delayedCount: delayedCounts.get(customer.id) ?? 0,
      openExceptions: exceptionCounts.get(customer.id) ?? 0,
    };
  });
}

export async function getCarriersData() {
  const { organizationId, supabase } = await getShipmentDataContext();
  const [carriersResult, shipmentsResult] = await Promise.all([
    supabase.from("carriers").select("*").eq("organization_id", organizationId).order("name"),
    supabase
      .from("shipments")
      .select("carrier_id, status, actual_delivery_at, promised_delivery_at")
      .eq("organization_id", organizationId),
  ]);

  if (carriersResult.error) throw carriersResult.error;
  if (shipmentsResult.error) throw shipmentsResult.error;

  return (carriersResult.data ?? []).map((carrierRow) => {
    const carrier = mapCarrierRecord(carrierRow as SupabaseRow);
    const carrierShipments = (shipmentsResult.data ?? []).filter((shipment) => String(shipment.carrier_id) === carrier.id);
    const delivered = carrierShipments.filter((shipment) => shipment.actual_delivery_at);
    const onTimeDelivered = delivered.filter(
      (shipment) =>
        new Date(String(shipment.actual_delivery_at)).getTime() <=
        new Date(String(shipment.promised_delivery_at)).getTime(),
    );

    return {
      ...carrier,
      shipmentCount: carrierShipments.length,
      onTimeRate: delivered.length ? (onTimeDelivered.length / delivered.length) * 100 : carrier.onTimeRate,
      delayedCount: carrierShipments.filter((shipment) => shipment.status === "delayed").length,
    };
  });
}

export async function getReportsData() {
  const metrics = await getDashboardMetrics();
  const { organizationId, supabase } = await getShipmentDataContext();
  const [shipmentsResult, exceptionsResult, carrierBreakdown] = await Promise.all([
    supabase
      .from("shipments")
      .select("created_at, promised_delivery_at, actual_delivery_at")
      .eq("organization_id", organizationId),
    supabase.from("exceptions").select("created_at").eq("organization_id", organizationId),
    getCarriersData(),
  ]);

  if (shipmentsResult.error) throw shipmentsResult.error;
  if (exceptionsResult.error) throw exceptionsResult.error;

  const deliveredShipments = (shipmentsResult.data ?? []).filter((shipment) => shipment.actual_delivery_at);
  const averageDelayDuration = average(
    deliveredShipments.map((shipment) =>
      Math.max(
        0,
        (new Date(String(shipment.actual_delivery_at)).getTime() -
          new Date(String(shipment.promised_delivery_at)).getTime()) /
          3600000,
      ),
    ),
  );
  const carrierPerformance = average(carrierBreakdown.map((carrier) => carrier.onTimeRate));

  return {
    metrics: {
      ...metrics,
      averageDelayDuration: averageDelayDuration || 0,
      carrierPerformance: carrierPerformance || 0,
    },
    shipmentVolumeTrend: buildTrendPoints((shipmentsResult.data ?? []).map((shipment) => String(shipment.created_at))),
    exceptionTrend: buildTrendPoints((exceptionsResult.data ?? []).map((exceptionRecord) => String(exceptionRecord.created_at))),
    carrierBreakdown,
  };
}

export async function getDocumentsData() {
  const { organizationId, supabase } = await getShipmentDataContext();
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  const documentRows = (data ?? []).map((row) => mapDocumentRecord(row as SupabaseRow));
  const [shipmentsResult, customersResult] = await Promise.all([
    supabase.from("shipments").select("*").eq("organization_id", organizationId),
    supabase.from("customers").select("*").eq("organization_id", organizationId),
  ]);

  if (shipmentsResult.error) throw shipmentsResult.error;
  if (customersResult.error) throw customersResult.error;

  const shipmentViews = await buildSupabaseShipmentViewModels(shipmentsResult.data ?? [], organizationId);
  const shipmentMap = new Map(shipmentViews.map((shipment) => [shipment.id, shipment]));
  const customerMap = new Map(
    (customersResult.data ?? []).map((row) => {
      const customer = mapCustomerRecord(row as SupabaseRow);
      return [customer.id, customer];
    }),
  );

  return documentRows
    .map((document) => ({
      ...document,
      shipment: shipmentMap.get(document.shipmentId),
      customer: customerMap.get(document.customerId),
    }))
    .filter(
      (document): document is DocumentRecord & { shipment: ShipmentView; customer: Customer } =>
        Boolean(document.shipment && document.customer),
    );
}

export async function getNotificationCenter(profileId: string): Promise<NotificationCenter> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    throw error;
  }

  const items: NotificationRecord[] = (data ?? []).map((record) => ({
    id: String(record.id),
    organizationId: String(record.organization_id),
    profileId: String(record.profile_id),
    shipmentId: record.shipment_id ? String(record.shipment_id) : null,
    exceptionId: record.exception_id ? String(record.exception_id) : null,
    channel: String(record.channel) as NotificationRecord["channel"],
    kind: String(record.notification_kind ?? record.kind) as NotificationRecord["kind"],
    title: String(record.title),
    body: String(record.body ?? ""),
    readAt: record.read_at ? String(record.read_at) : null,
    createdAt: String(record.created_at),
  }));

  return {
    unreadCount: items.filter((item) => !item.readAt).length,
    items,
  };
}

export async function getPortalShipment(referenceOrToken: string) {
  const supabase = createAdminClient();
  const searchValue = referenceOrToken.trim();
  const { data: shipmentRow, error: shipmentError } = await supabase
    .from("shipments")
    .select("*")
    .or(`shipment_reference.ilike.${searchValue},tracking_token.ilike.${searchValue}`)
    .maybeSingle();

  if (shipmentError) {
    throw shipmentError;
  }

  if (!shipmentRow) {
    return null;
  }

  const shipment = mapShipmentRecord(shipmentRow as SupabaseRow);
  const shipmentView = (await buildSupabaseShipmentViewModels([shipmentRow as SupabaseRow], shipment.organizationId))[0];
  const [customerResult, milestonesResult, eventsResult, documentsResult] = await Promise.all([
    supabase.from("customers").select("*").eq("id", shipment.customerId).maybeSingle(),
    supabase
      .from("shipment_milestones")
      .select("*")
      .eq("organization_id", shipment.organizationId)
      .eq("shipment_id", shipment.id)
      .order("sequence_number"),
    supabase
      .from("shipment_events")
      .select("*")
      .eq("organization_id", shipment.organizationId)
      .eq("shipment_id", shipment.id)
      .eq("is_customer_visible", true)
      .order("occurred_at", { ascending: false }),
    supabase
      .from("documents")
      .select("*")
      .eq("organization_id", shipment.organizationId)
      .eq("shipment_id", shipment.id)
      .eq("is_customer_visible", true)
      .order("created_at", { ascending: false }),
  ]);

  if (customerResult.error) throw customerResult.error;
  if (milestonesResult.error) throw milestonesResult.error;
  if (eventsResult.error) throw eventsResult.error;
  if (documentsResult.error) throw documentsResult.error;

  return {
    shipment: shipmentView,
    customer: customerResult.data ? mapCustomerRecord(customerResult.data as SupabaseRow) : shipmentView.customer,
    milestones: (milestonesResult.data ?? []).map((row) => mapMilestoneRecord(row as SupabaseRow)),
    events: (eventsResult.data ?? []).map((row) => mapEventRecord(row as SupabaseRow)),
    documents: (documentsResult.data ?? []).map((row) => mapDocumentRecord(row as SupabaseRow)),
  };
}

export async function getRiskSummary(): Promise<TrendPoint[]> {
  const { organizationId, supabase } = await getShipmentDataContext();
  const { data, error } = await supabase.from("shipments").select("risk_level").eq("organization_id", organizationId);
  if (error) throw error;

  return [
    { label: "Low", value: (data ?? []).filter((shipment) => shipment.risk_level === "low").length },
    { label: "Medium", value: (data ?? []).filter((shipment) => shipment.risk_level === "medium").length },
    { label: "High", value: (data ?? []).filter((shipment) => shipment.risk_level === "high").length },
    { label: "Critical", value: (data ?? []).filter((shipment) => shipment.risk_level === "critical").length },
  ];
}

export async function getOperationalSnapshot() {
  const { organizationId, supabase } = await getShipmentDataContext();
  const [notificationsResult, customersResult, carriersResult, shipmentsResult, exceptionsResult, ordersResult] =
    await Promise.all([
      supabase.from("notifications").select("read_at").eq("organization_id", organizationId),
      supabase.from("customers").select("id", { count: "exact" }).eq("organization_id", organizationId),
      supabase.from("carriers").select("id", { count: "exact" }).eq("organization_id", organizationId),
      supabase.from("shipments").select("id, order_id, status").eq("organization_id", organizationId),
      supabase.from("exceptions").select("*").eq("organization_id", organizationId).neq("status", "resolved"),
      supabase.from("orders").select("id, value_usd").eq("organization_id", organizationId),
    ]);

  if (notificationsResult.error) throw notificationsResult.error;
  if (customersResult.error) throw customersResult.error;
  if (carriersResult.error) throw carriersResult.error;
  if (shipmentsResult.error) throw shipmentsResult.error;
  if (exceptionsResult.error) throw exceptionsResult.error;
  if (ordersResult.error) throw ordersResult.error;

  const delayedShipments = (shipmentsResult.data ?? []).filter((shipment) => shipment.status === "delayed");
  const orderValueMap = new Map((ordersResult.data ?? []).map((order) => [String(order.id), Number(order.value_usd ?? 0)]));

  return {
    totalNotifications: (notificationsResult.data ?? []).length,
    unreadNotifications: (notificationsResult.data ?? []).filter((notification) => !notification.read_at).length,
    activeCustomers: customersResult.count ?? 0,
    activeCarriers: carriersResult.count ?? 0,
    delayedShipmentValue: sum(delayedShipments.map((shipment) => orderValueMap.get(String(shipment.order_id)) ?? 0)),
    openExceptions: (exceptionsResult.data ?? []).map((row) => mapExceptionRecord(row as SupabaseRow)),
  };
}

export async function getShipmentMilestones(shipmentId: string): Promise<ShipmentMilestone[]> {
  const { organizationId, supabase } = await getShipmentDataContext();
  const { data, error } = await supabase
    .from("shipment_milestones")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("shipment_id", shipmentId)
    .order("sequence_number");

  if (error) throw error;
  return (data ?? []).map((row) => mapMilestoneRecord(row as SupabaseRow));
}

export async function getUnreadNotifications(profileId: string): Promise<NotificationRecord[]> {
  const center = await getNotificationCenter(profileId);
  return center.items.filter((notification) => !notification.readAt);
}

export async function getOpenExceptions(): Promise<ExceptionRecord[]> {
  const { organizationId, supabase } = await getShipmentDataContext();
  const { data, error } = await supabase
    .from("exceptions")
    .select("*")
    .eq("organization_id", organizationId)
    .neq("status", "resolved");
  if (error) throw error;
  return (data ?? []).map((row) => mapExceptionRecord(row as SupabaseRow));
}

export async function getShipmentFilterOptions() {
  const { organizationId, supabase } = await getShipmentDataContext();
  const [customersResult, carriersResult] = await Promise.all([
    supabase.from("customers").select("id, name").eq("organization_id", organizationId).order("name"),
    supabase.from("carriers").select("id, name").eq("organization_id", organizationId).order("name"),
  ]);

  if (customersResult.error) throw customersResult.error;
  if (carriersResult.error) throw carriersResult.error;

  return {
    customers: (customersResult.data ?? []).map((item) => ({ label: String(item.name), value: String(item.id) })),
    carriers: (carriersResult.data ?? []).map((item) => ({ label: String(item.name), value: String(item.id) })),
  };
}

export async function getPortalSampleShipments(limit = 3) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("shipments")
    .select("id, shipment_reference, tracking_token")
    .order("updated_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: String(row.id),
    shipmentReference: String(row.shipment_reference),
    trackingToken: String(row.tracking_token),
  }));
}

export async function getSettingsData() {
  const context = await requireAppContext();
  const organizationId = context.organization.id;
  const supabase = createAdminClient();
  const [membersResult, profilesResult, webhooksResult] = await Promise.all([
    supabase.from("organization_members").select("*").eq("organization_id", organizationId).order("created_at"),
    supabase.from("profiles").select("*").eq("default_organization_id", organizationId),
    supabase.from("webhook_endpoints").select("*").eq("organization_id", organizationId).order("created_at", { ascending: false }),
  ]);

  if (membersResult.error) throw membersResult.error;
  if (profilesResult.error) throw profilesResult.error;
  if (webhooksResult.error) throw webhooksResult.error;

  const profileMap = new Map((profilesResult.data ?? []).map((row) => {
    const profile = mapProfileRecord(row as SupabaseRow);
    return [profile.id, profile];
  }));

  return {
    members: (membersResult.data ?? []).map((row) => {
      const member = mapOrganizationMemberRecord(row as SupabaseRow);
      return {
        ...member,
        profile: profileMap.get(member.profileId) ?? null,
      };
    }),
    webhookEndpoints: (webhooksResult.data ?? []).map((row) => mapWebhookEndpointRecord(row as SupabaseRow)),
  };
}
