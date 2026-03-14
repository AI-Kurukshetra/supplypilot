import { cache } from "react";

import { demoData } from "@/lib/domain/demo-data";
import type {
  Carrier,
  Customer,
  DashboardMetrics,
  ExceptionRecord,
  NotificationRecord,
  SearchSuggestion,
  Shipment,
  ShipmentListFilters,
  ShipmentMilestone,
  TrendPoint,
} from "@/lib/domain/types";
import { average, sum } from "@/lib/utils";

type ShipmentView = Shipment & {
  customer: Customer;
  carrier: Carrier;
  orderNumber: string;
  originName: string;
  destinationName: string;
  openExceptionCount: number;
};

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
