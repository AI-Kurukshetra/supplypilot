import { cache } from "react";

import { requireAppContext } from "@/lib/auth/session";
import { demoData } from "@/lib/domain/demo-data";
import type {
  AuditLogRecord,
  Carrier,
  Customer,
  DashboardMetrics,
  DocumentRecord,
  ExceptionRecord,
  Facility,
  NotificationRecord,
  Order,
  SearchSuggestion,
  Shipment,
  ShipmentEvent,
  ShipmentListFilters,
  ShipmentMilestone,
  TrendPoint,
} from "@/lib/domain/types";
import { isDemoMode } from "@/lib/env";
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

function buildShipmentView(shipment: Shipment): ShipmentView {
  const customer = demoData.customers.find((item) => item.id === shipment.customerId)!;
  const carrier = demoData.carriers.find((item) => item.id === shipment.carrierId)!;
  const order = demoData.orders.find((item) => item.id === shipment.orderId)!;
  const origin = demoData.facilities.find((item) => item.id === shipment.originFacilityId)!;
  const destination = demoData.facilities.find((item) => item.id === shipment.destinationFacilityId)!;
  const openExceptionCount = demoData.exceptions.filter(
    (exceptionRecord) => exceptionRecord.shipmentId === shipment.id && exceptionRecord.status !== "resolved",
  ).length;

  return {
    ...shipment,
    customer,
    carrier,
    orderNumber: order.orderNumber,
    originName: `${origin.city}, ${origin.region}`,
    destinationName: `${destination.city}, ${destination.region}`,
    openExceptionCount,
  };
}

export const getDashboardMetrics = cache(async (): Promise<DashboardMetrics> => {
  const totalShipments = demoData.shipments.length;
  const delivered = demoData.shipments.filter((shipment) => shipment.actualDeliveryAt);
  const onTimeDelivered = delivered.filter(
    (shipment) => new Date(shipment.actualDeliveryAt!).getTime() <= new Date(shipment.promisedDeliveryAt).getTime(),
  );

  return {
    totalShipments,
    onTimeRate: delivered.length ? (onTimeDelivered.length / delivered.length) * 100 : 0,
    delayedShipments: demoData.shipments.filter((shipment) => shipment.status === "delayed").length,
    openExceptions: demoData.exceptions.filter((exceptionRecord) => exceptionRecord.status !== "resolved").length,
  };
});

export const getDashboardData = cache(async () => {
  const metrics = await getDashboardMetrics();
  const atRiskShipments = demoData.shipments
    .filter((shipment) => shipment.riskLevel === "high" || shipment.riskLevel === "critical")
    .slice(0, 8)
    .map(buildShipmentView);
  const etaChangeFeed = demoData.shipmentEvents
    .filter((event) => event.eventType === "eta_change")
    .slice(0, 6)
    .map((event) => ({
      ...event,
      shipment: demoData.shipments.find((shipment) => shipment.id === event.shipmentId)!,
    }));
  const openExceptions = demoData.exceptions
    .filter((exceptionRecord) => exceptionRecord.status !== "resolved")
    .slice(0, 6)
    .map((exceptionRecord) => ({
      ...exceptionRecord,
      shipment: demoData.shipments.find((shipment) => shipment.id === exceptionRecord.shipmentId)!,
      customer: demoData.customers.find((customer) => customer.id === exceptionRecord.customerId)!,
      owner: exceptionRecord.ownerProfileId
        ? demoData.profiles.find((profile) => profile.id === exceptionRecord.ownerProfileId) ?? null
        : null,
    }));

  return {
    metrics,
    atRiskShipments,
    etaChangeFeed,
    openExceptions,
    carrierPerformance: demoData.carriers,
  };
});

export async function getShipmentList(filters: ShipmentListFilters = {}) {
  if (!isDemoMode()) {
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

    const { data, error, count } = await query
      .order("updated_at", { ascending: false })
      .range(start, end);

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

  const currentPage = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 12;
  const query = filters.query?.trim().toLowerCase();

  const filtered = demoData.shipments
    .filter((shipment) => {
      if (filters.status && filters.status !== "all" && shipment.status !== filters.status) {
        return false;
      }

      if (filters.risk && filters.risk !== "all" && shipment.riskLevel !== filters.risk) {
        return false;
      }

      if (filters.customerId && filters.customerId !== "all" && shipment.customerId !== filters.customerId) {
        return false;
      }

      if (filters.carrierId && filters.carrierId !== "all" && shipment.carrierId !== filters.carrierId) {
        return false;
      }

      if (filters.dateRange && filters.dateRange !== "all") {
        const shipmentDate = new Date(shipment.eta).getTime();
        const thresholdDays = filters.dateRange === "today" ? 1 : Number.parseInt(filters.dateRange, 10);
        const threshold = Date.now() - thresholdDays * 24 * 3600000;

        if (shipmentDate < threshold) {
          return false;
        }
      }

      if (query) {
        return (
          shipment.id.toLowerCase().includes(query) ||
          shipment.shipmentReference.toLowerCase().includes(query) ||
          shipment.externalReference.toLowerCase().includes(query)
        );
      }

      return true;
    })
    .sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime());

  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const start = (currentPage - 1) * pageSize;

  return {
    items: filtered.slice(start, start + pageSize).map(buildShipmentView),
    total,
    pageCount,
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
  if (!isDemoMode()) {
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

      if (includeTrackingTokens && row.tracking_token) {
        suggestions.set(String(row.tracking_token), {
          value: String(row.tracking_token),
          label: String(row.shipment_reference),
        });
      }
    }

    return Array.from(suggestions.values()).slice(0, limit);
  }

  const suggestions = new Map<string, SearchSuggestion>();

  for (const shipment of demoData.shipments) {
    suggestions.set(shipment.shipmentReference, {
      value: shipment.shipmentReference,
      label: `${shipment.externalReference} · ${shipment.summary}`,
    });

    if (shipment.externalReference) {
      suggestions.set(shipment.externalReference, {
        value: shipment.externalReference,
        label: shipment.shipmentReference,
      });
    }

    if (includeTrackingTokens) {
      suggestions.set(shipment.trackingToken, {
        value: shipment.trackingToken,
        label: shipment.shipmentReference,
      });
    }
  }

  return Array.from(suggestions.values()).slice(0, limit);
}

export async function getShipmentDetail(shipmentId: string) {
  if (!isDemoMode()) {
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

  const shipment = demoData.shipments.find((item) => item.id === shipmentId);
  if (!shipment) {
    return null;
  }

  return {
    shipment: buildShipmentView(shipment),
    customer: demoData.customers.find((item) => item.id === shipment.customerId)!,
    carrier: demoData.carriers.find((item) => item.id === shipment.carrierId)!,
    milestones: demoData.milestones
      .filter((milestone) => milestone.shipmentId === shipmentId)
      .sort((left, right) => left.sequence - right.sequence),
    events: demoData.shipmentEvents
      .filter((event) => event.shipmentId === shipmentId)
      .sort((left, right) => new Date(right.occurredAt).getTime() - new Date(left.occurredAt).getTime()),
    exceptions: demoData.exceptions
      .filter((exceptionRecord) => exceptionRecord.shipmentId === shipmentId)
      .sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()),
    documents: demoData.documents.filter((document) => document.shipmentId === shipmentId),
    auditLogs: demoData.auditLogs
      .filter((log) => log.shipmentId === shipmentId)
      .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()),
    internalNotes: demoData.shipmentEvents
      .filter((event) => event.shipmentId === shipmentId && event.eventType === "internal_note")
      .sort((left, right) => new Date(right.occurredAt).getTime() - new Date(left.occurredAt).getTime()),
  };
}

export async function getExceptionsDashboard() {
  const openExceptions = demoData.exceptions.filter((exceptionRecord) => exceptionRecord.status !== "resolved");
  const resolvedDurations = demoData.exceptions
    .filter((exceptionRecord) => exceptionRecord.resolvedAt)
    .map((exceptionRecord) => {
      return (
        (new Date(exceptionRecord.resolvedAt!).getTime() - new Date(exceptionRecord.openedAt).getTime()) /
        3600000
      );
    });

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
      shipment: demoData.shipments.find((shipment) => shipment.id === exceptionRecord.shipmentId)!,
      customer: demoData.customers.find((customer) => customer.id === exceptionRecord.customerId)!,
      carrier: demoData.carriers.find((carrier) => carrier.id === exceptionRecord.carrierId)!,
      owner: exceptionRecord.ownerProfileId
        ? demoData.profiles.find((profile) => profile.id === exceptionRecord.ownerProfileId) ?? null
        : null,
    })),
  };
}

export async function getCustomersData() {
  return demoData.customers.map((customer) => {
    const customerShipments = demoData.shipments.filter((shipment) => shipment.customerId === customer.id);
    const customerExceptions = demoData.exceptions.filter(
      (exceptionRecord) => exceptionRecord.customerId === customer.id && exceptionRecord.status !== "resolved",
    );

    return {
      ...customer,
      shipmentCount: customerShipments.length,
      delayedCount: customerShipments.filter((shipment) => shipment.status === "delayed").length,
      openExceptions: customerExceptions.length,
    };
  });
}

export async function getCarriersData() {
  return demoData.carriers.map((carrier) => {
    const carrierShipments = demoData.shipments.filter((shipment) => shipment.carrierId === carrier.id);
    const delivered = carrierShipments.filter((shipment) => shipment.actualDeliveryAt);
    const onTimeDelivered = delivered.filter(
      (shipment) => new Date(shipment.actualDeliveryAt!).getTime() <= new Date(shipment.promisedDeliveryAt).getTime(),
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
  const deliveredShipments = demoData.shipments.filter((shipment) => shipment.actualDeliveryAt);
  const averageDelayDuration =
    average(
      deliveredShipments.map((shipment) =>
        Math.max(
          0,
          (new Date(shipment.actualDeliveryAt!).getTime() - new Date(shipment.promisedDeliveryAt).getTime()) /
            3600000,
        ),
      ),
    ) || 0;

  return {
    metrics: {
      ...metrics,
      averageDelayDuration,
      carrierPerformance: demoData.averageCarrierOnTimeRate,
    },
    shipmentVolumeTrend: demoData.shipmentVolumeTrend,
    exceptionTrend: demoData.exceptionTrend,
    carrierBreakdown: await getCarriersData(),
  };
}

export async function getDocumentsData() {
  return demoData.documents.map((document) => ({
    ...document,
    shipment: demoData.shipments.find((shipment) => shipment.id === document.shipmentId)!,
    customer: demoData.customers.find((customer) => customer.id === document.customerId)!,
  }));
}

export async function getNotificationCenter(profileId: string) {
  const items = demoData.notifications
    .filter((notification) => notification.profileId === profileId)
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());

  return {
    unreadCount: items.filter((item) => !item.readAt).length,
    items,
  };
}

export async function getPortalShipment(referenceOrToken: string) {
  const normalized = referenceOrToken.trim().toLowerCase();
  const shipment = demoData.shipments.find(
    (item) =>
      item.shipmentReference.toLowerCase() === normalized || item.trackingToken.toLowerCase() === normalized,
  );

  if (!shipment) {
    return null;
  }

  return {
    shipment: buildShipmentView(shipment),
    customer: demoData.customers.find((item) => item.id === shipment.customerId)!,
    milestones: demoData.milestones.filter((milestone) => milestone.shipmentId === shipment.id),
    events: demoData.shipmentEvents.filter(
      (event) => event.shipmentId === shipment.id && event.isCustomerVisible,
    ),
    documents: demoData.documents.filter(
      (document) => document.shipmentId === shipment.id && document.isCustomerVisible,
    ),
  };
}

export async function getRiskSummary(): Promise<TrendPoint[]> {
  return [
    {
      label: "Low",
      value: demoData.shipments.filter((shipment) => shipment.riskLevel === "low").length,
    },
    {
      label: "Medium",
      value: demoData.shipments.filter((shipment) => shipment.riskLevel === "medium").length,
    },
    {
      label: "High",
      value: demoData.shipments.filter((shipment) => shipment.riskLevel === "high").length,
    },
    {
      label: "Critical",
      value: demoData.shipments.filter((shipment) => shipment.riskLevel === "critical").length,
    },
  ];
}

export async function getOperationalSnapshot() {
  const openExceptions = demoData.exceptions.filter((exceptionRecord) => exceptionRecord.status !== "resolved");
  const delayedShipments = demoData.shipments.filter((shipment) => shipment.status === "delayed");

  return {
    totalNotifications: demoData.notifications.length,
    unreadNotifications: demoData.notifications.filter((notification) => !notification.readAt).length,
    activeCustomers: demoData.customers.length,
    activeCarriers: demoData.carriers.length,
    delayedShipmentValue: sum(
      delayedShipments.map((shipment) => {
        const order = demoData.orders.find((item) => item.id === shipment.orderId)!;
        return order.valueUsd;
      }),
    ),
    openExceptions,
  };
}

export async function getShipmentMilestones(shipmentId: string): Promise<ShipmentMilestone[]> {
  return demoData.milestones.filter((milestone) => milestone.shipmentId === shipmentId);
}

export async function getUnreadNotifications(profileId: string): Promise<NotificationRecord[]> {
  return demoData.notifications.filter((notification) => notification.profileId === profileId && !notification.readAt);
}

export async function getOpenExceptions(): Promise<ExceptionRecord[]> {
  return demoData.exceptions.filter((exceptionRecord) => exceptionRecord.status !== "resolved");
}
