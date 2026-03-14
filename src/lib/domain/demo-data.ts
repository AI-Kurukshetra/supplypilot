import { average } from "@/lib/utils";
import { deriveExceptionType, deriveRiskLevel } from "@/lib/domain/risk";
import type {
  AuditLogRecord,
  Carrier,
  Customer,
  DocumentRecord,
  ExceptionRecord,
  Facility,
  NotificationRecord,
  Order,
  Organization,
  OrganizationMember,
  Profile,
  Shipment,
  ShipmentEvent,
  ShipmentMilestone,
  TrendPoint,
  WebhookEndpoint,
} from "@/lib/domain/types";

const organizationId = "org_demo_supplypilot";
const now = new Date("2026-03-14T10:00:00.000Z");

function isoHours(offsetHours: number) {
  return new Date(now.getTime() + offsetHours * 3600000).toISOString();
}

const organization: Organization = {
  id: organizationId,
  name: "Northstar Logistics Group",
  slug: "northstar-logistics-group",
  timezone: "America/Chicago",
  createdAt: isoHours(-24 * 160),
  updatedAt: isoHours(-5),
};

const profiles: Profile[] = [
  {
    id: "profile_admin_01",
    authUserId: null,
    fullName: "Avery Morgan",
    email: "avery@supplypilot.demo",
    title: "Director of Operations",
    createdAt: isoHours(-24 * 100),
    updatedAt: isoHours(-4),
    notificationPreferences: {
      emailExceptionCreated: true,
      emailEtaChanged: true,
      emailShipmentDelayed: true,
      emailMilestoneReached: false,
    },
  },
  {
    id: "profile_mgr_01",
    authUserId: null,
    fullName: "Jordan Patel",
    email: "jordan@supplypilot.demo",
    title: "Operations Manager",
    createdAt: isoHours(-24 * 90),
    updatedAt: isoHours(-3),
    notificationPreferences: {
      emailExceptionCreated: true,
      emailEtaChanged: true,
      emailShipmentDelayed: true,
      emailMilestoneReached: true,
    },
  },
  {
    id: "profile_agent_01",
    authUserId: null,
    fullName: "Casey Nguyen",
    email: "casey@supplypilot.demo",
    title: "Operations Agent",
    createdAt: isoHours(-24 * 80),
    updatedAt: isoHours(-6),
    notificationPreferences: {
      emailExceptionCreated: true,
      emailEtaChanged: false,
      emailShipmentDelayed: true,
      emailMilestoneReached: false,
    },
  },
  {
    id: "profile_customer_01",
    authUserId: null,
    fullName: "Riley Chen",
    email: "riley@bluepeakretail.demo",
    title: "Customer Logistics Lead",
    createdAt: isoHours(-24 * 70),
    updatedAt: isoHours(-12),
    notificationPreferences: {
      emailExceptionCreated: true,
      emailEtaChanged: true,
      emailShipmentDelayed: true,
      emailMilestoneReached: true,
    },
  },
];

const customers: Customer[] = [
  ["customer_01", "BluePeak Retail", "BPR", "Retail"],
  ["customer_02", "Atlas Industrial", "ATL", "Industrial"],
  ["customer_03", "Northline Foods", "NLF", "Food"],
  ["customer_04", "Summit Health Devices", "SHD", "Medical"],
  ["customer_05", "Verity Consumer Goods", "VCG", "Consumer"],
  ["customer_06", "Meridian Home", "MDH", "Home"],
].map(([id, name, code, segment], index) => ({
  id,
  organizationId,
  name,
  code,
  segment,
  contactName: ["Mila Brooks", "Theo Ruiz", "Isla Carter", "Nina Shah", "Luca West", "Mason Young"][index],
  contactEmail: `${code.toLowerCase()}@example.com`,
  createdAt: isoHours(-(24 * 70 + index * 8)),
}));

const carrierSeed: Array<[string, string, string, Carrier["mode"], number]> = [
  ["carrier_01", "TriSpan Freight", "TSFG", "truckload", 97.1],
  ["carrier_02", "BlueRoute Express", "BREX", "ltl", 93.6],
  ["carrier_03", "Meridian Air Cargo", "MACO", "air", 95.4],
  ["carrier_04", "Harborline Ocean", "HLOC", "ocean", 88.3],
  ["carrier_05", "NorthRail Connect", "NRCT", "truckload", 91.2],
];

const carriers: Carrier[] = carrierSeed.map(([id, name, scac, mode, onTimeRate], index) => ({
  id,
  organizationId,
  name,
  scac,
  mode,
  onTimeRate,
  activeExceptions: 0,
  createdAt: isoHours(-(24 * 120 + index * 10)),
}));

const facilities: Facility[] = [
  ["facility_01", "Los Angeles DC", "LAX-DC", "Los Angeles", "CA", "US", "origin"],
  ["facility_02", "Dallas Crossdock", "DAL-XD", "Dallas", "TX", "US", "crossdock"],
  ["facility_03", "Chicago Hub", "CHI-HB", "Chicago", "IL", "US", "hub"],
  ["facility_04", "Savannah Port", "SAV-PT", "Savannah", "GA", "US", "origin"],
  ["facility_05", "Newark Final Mile", "EWR-FM", "Newark", "NJ", "US", "destination"],
  ["facility_06", "Atlanta Regional DC", "ATL-RD", "Atlanta", "GA", "US", "destination"],
  ["facility_07", "Phoenix Fulfillment", "PHX-FF", "Phoenix", "AZ", "US", "destination"],
  ["facility_08", "Seattle Regional Hub", "SEA-RH", "Seattle", "WA", "US", "destination"],
].map(([id, name, code, city, region, country, type], index) => ({
  id,
  organizationId,
  name,
  code,
  city,
  region,
  country,
  type: type as Facility["type"],
  createdAt: isoHours(-(24 * 150 + index * 3)),
}));

const members: OrganizationMember[] = [
  {
    id: "member_admin_01",
    organizationId,
    profileId: profiles[0].id,
    role: "org_admin",
    customerId: null,
    createdAt: isoHours(-24 * 90),
  },
  {
    id: "member_mgr_01",
    organizationId,
    profileId: profiles[1].id,
    role: "ops_manager",
    customerId: null,
    createdAt: isoHours(-24 * 80),
  },
  {
    id: "member_agent_01",
    organizationId,
    profileId: profiles[2].id,
    role: "ops_agent",
    customerId: null,
    createdAt: isoHours(-24 * 70),
  },
  {
    id: "member_customer_01",
    organizationId,
    profileId: profiles[3].id,
    role: "customer_user",
    customerId: customers[0].id,
    createdAt: isoHours(-24 * 60),
  },
];

const orders: Order[] = Array.from({ length: 56 }, (_, index) => {
  const customer = customers[index % customers.length];

  return {
    id: `order_${String(index + 1).padStart(3, "0")}`,
    organizationId,
    customerId: customer.id,
    orderNumber: `SO-${2026000 + index + 1}`,
    reference: `PO-${8000 + index}`,
    promisedDeliveryAt: isoHours(-30 + index * 2.5),
    valueUsd: 18000 + (index % 9) * 3250,
    createdAt: isoHours(-(24 * 15) + index * 1.2),
  };
});

const shipments: Shipment[] = orders.map((order, index) => {
  const carrier = carriers[index % carriers.length];
  const customer = customers[index % customers.length];
  const origin = facilities[index % 4];
  const destination = facilities[4 + (index % 4)];
  const createdAt = isoHours(-(24 * 12) + index * 0.8);
  const promisedDeliveryAt = order.promisedDeliveryAt;
  const etaShiftHours = [-9, -4, -1, 2, 7, 14][index % 6];
  const eta = new Date(new Date(promisedDeliveryAt).getTime() + etaShiftHours * 3600000).toISOString();
  const delivered = index % 5 === 0;
  const actualDeliveryAt = delivered ? isoHours(-18 + index * 0.2) : null;
  const lastUpdateOffset = [-2, -5, -7, -11, -16, -22][index % 6];
  const lastUpdateAt = isoHours(lastUpdateOffset);
  const lastEventAt = isoHours(lastUpdateOffset + 1);

  return {
    id: `shipment_${String(index + 1).padStart(3, "0")}`,
    organizationId,
    orderId: order.id,
    customerId: customer.id,
    carrierId: carrier.id,
    originFacilityId: origin.id,
    destinationFacilityId: destination.id,
    shipmentReference: `SP-${20260300 + index + 1}`,
    externalReference: `BK-${54000 + index}`,
    trackingToken: `trk_${customer.code.toLowerCase()}_${index + 1}`,
    status: delivered ? "delivered" : index % 6 === 3 ? "delayed" : index % 6 === 4 ? "at_hub" : "in_transit",
    riskLevel: "low",
    mode: (["ftl", "ltl", "air", "ocean"] as const)[index % 4],
    promisedDeliveryAt,
    eta,
    actualDeliveryAt,
    lastEventAt,
    lastUpdateAt,
    createdAt,
    updatedAt: lastUpdateAt,
    summary: `${carrier.name} handling ${customer.name} shipment from ${origin.city} to ${destination.city}.`,
  };
});

const milestones: ShipmentMilestone[] = shipments.flatMap((shipment, index) => {
  const created = new Date(shipment.createdAt).getTime();
  const plannedBase = [
    created + 6 * 3600000,
    created + 22 * 3600000,
    created + 42 * 3600000,
    new Date(shipment.promisedDeliveryAt).getTime(),
  ];
  const completedPattern = index % 5;

  const milestoneSeed: Array<[string, number]> = [
    ["Pickup confirmed", 0],
    ["Departed origin", 1],
    ["Arrived regional hub", 2],
    ["Delivered", 3],
  ];

  return milestoneSeed.map(([label, sequence]) => {
    const plannedAt = new Date(plannedBase[sequence]).toISOString();
    const actualAt =
      shipment.actualDeliveryAt || sequence < completedPattern
        ? new Date(plannedBase[sequence] + (sequence === 3 ? 2 : 0) * 3600000).toISOString()
        : null;
    const late = !actualAt && plannedBase[sequence] < now.getTime() && sequence < 3;

    return {
      id: `milestone_${shipment.id}_${sequence + 1}`,
      shipmentId: shipment.id,
      organizationId,
      sequence: sequence + 1,
      label,
      plannedAt,
      actualAt,
      status: actualAt ? "completed" : late ? "late" : "upcoming",
    } satisfies ShipmentMilestone;
  });
});

const shipmentsWithRisk = shipments.map((shipment) => {
  const shipmentMilestones = milestones.filter((milestone) => milestone.shipmentId === shipment.id);
  const riskLevel = deriveRiskLevel(shipment, shipmentMilestones, now);

  return {
    ...shipment,
    riskLevel,
    status:
      riskLevel === "critical"
        ? "exception"
        : new Date(shipment.eta) > new Date(shipment.promisedDeliveryAt)
          ? "delayed"
          : shipment.status,
  };
});

const shipmentEvents: ShipmentEvent[] = shipmentsWithRisk.flatMap((shipment, index) => {
  const customer = customers.find((item) => item.id === shipment.customerId)!;
  const delayedHours = Math.round(
    (new Date(shipment.eta).getTime() - new Date(shipment.promisedDeliveryAt).getTime()) / 3600000,
  );

  return [
    {
      id: `event_${shipment.id}_1`,
      shipmentId: shipment.id,
      organizationId,
      occurredAt: new Date(new Date(shipment.createdAt).getTime() + 2 * 3600000).toISOString(),
      eventType: "scan",
      title: "Booking confirmed",
      description: `${customer.name} order tender accepted by carrier.`,
      source: "carrier_edi",
      isCustomerVisible: true,
    },
    {
      id: `event_${shipment.id}_2`,
      shipmentId: shipment.id,
      organizationId,
      occurredAt: shipment.lastEventAt,
      eventType: delayedHours > 0 ? "eta_change" : "milestone",
      title: delayedHours > 0 ? "ETA adjusted" : "In-transit checkpoint",
      description:
        delayedHours > 0
          ? `ETA moved by ${delayedHours} hours due to network congestion.`
          : "Carrier reported a routine checkpoint update.",
      source: "gps_ping",
      isCustomerVisible: true,
    },
    {
      id: `event_${shipment.id}_3`,
      shipmentId: shipment.id,
      organizationId,
      occurredAt: isoHours(-(index % 8) - 1),
      eventType: "internal_note",
      title: "Ops note",
      description:
        index % 4 === 0
          ? "Customer requested proactive outreach if ETA slips beyond 4 hours."
          : "Ops team monitoring route variance and dock availability.",
      source: "ops_console",
      isCustomerVisible: false,
    },
  ];
});

const exceptions: ExceptionRecord[] = shipmentsWithRisk.flatMap((shipment, index) => {
  const type = deriveExceptionType(
    shipment,
    milestones.filter((milestone) => milestone.shipmentId === shipment.id),
    shipment.riskLevel,
  );

  if (!type) {
    return [];
  }

  const ownerProfileId = profiles[(index % 2) + 1]?.id ?? profiles[1].id;
  const resolved = index % 5 === 0;

  return [
    {
      id: `exception_${shipment.id}`,
      shipmentId: shipment.id,
      organizationId,
      customerId: shipment.customerId,
      carrierId: shipment.carrierId,
      type,
      status: resolved ? "resolved" : index % 3 === 0 ? "investigating" : "open",
      riskLevel: shipment.riskLevel,
      title:
        type === "eta_breach"
          ? "Promised ETA breached"
          : type === "missed_milestone"
            ? "Critical milestone missed"
            : "Tracking has gone stale",
      description:
        type === "eta_breach"
          ? "Projected arrival is later than the customer promise date."
          : type === "missed_milestone"
            ? "The shipment missed a planned operational milestone."
            : "No meaningful update has been received within the monitoring threshold.",
      ownerProfileId,
      resolutionNotes: resolved ? "Carrier confirmed recovery plan and customer notified." : null,
      openedAt: isoHours(-(index % 10) - 18),
      updatedAt: isoHours(-(index % 4) - 1),
      resolvedAt: resolved ? isoHours(-(index % 3) - 1) : null,
    },
  ];
});

carriers.forEach((carrier) => {
  const carrierExceptions = exceptions.filter(
    (exceptionRecord) => exceptionRecord.carrierId === carrier.id && exceptionRecord.status !== "resolved",
  );
  carrier.activeExceptions = carrierExceptions.length;
});

const notifications: NotificationRecord[] = profiles.flatMap((profile, profileIndex) =>
  shipmentsWithRisk.slice(profileIndex * 4, profileIndex * 4 + 6).map((shipment, index) => {
    const matchingException = exceptions.find((exceptionRecord) => exceptionRecord.shipmentId === shipment.id);

    return {
      id: `notification_${profile.id}_${index + 1}`,
      organizationId,
      profileId: profile.id,
      shipmentId: shipment.id,
      exceptionId: matchingException?.id ?? null,
      channel: "in_app",
      kind:
        index % 4 === 0
          ? "exception_created"
          : index % 4 === 1
            ? "eta_changed"
            : index % 4 === 2
              ? "shipment_delayed"
              : "milestone_reached",
      title:
        index % 4 === 0
          ? "Exception opened"
          : index % 4 === 1
            ? "ETA shifted"
            : index % 4 === 2
              ? "Shipment delayed"
              : "Milestone reached",
      body: `${shipment.shipmentReference} requires attention for ${customers.find((item) => item.id === shipment.customerId)?.name}.`,
      readAt: index % 3 === 0 ? isoHours(-index - 2) : null,
      createdAt: isoHours(-index - profileIndex - 1),
    };
  }),
);

const documents: DocumentRecord[] = shipmentsWithRisk.slice(0, 24).flatMap((shipment, index) => [
  {
    id: `document_${shipment.id}_bol`,
    organizationId,
    shipmentId: shipment.id,
    customerId: shipment.customerId,
    type: "bol",
    fileName: `${shipment.shipmentReference}-bol.pdf`,
    filePath: `${organizationId}/${shipment.id}/bol.pdf`,
    fileSizeBytes: 250000 + index * 3200,
    isCustomerVisible: true,
    createdAt: isoHours(-index - 12),
  },
  {
    id: `document_${shipment.id}_invoice`,
    organizationId,
    shipmentId: shipment.id,
    customerId: shipment.customerId,
    type: "invoice",
    fileName: `${shipment.shipmentReference}-invoice.pdf`,
    filePath: `${organizationId}/${shipment.id}/invoice.pdf`,
    fileSizeBytes: 180000 + index * 2100,
    isCustomerVisible: index % 2 === 0,
    createdAt: isoHours(-index - 8),
  },
]);

const auditLogs: AuditLogRecord[] = exceptions.flatMap((exceptionRecord, index) => [
  {
    id: `audit_${exceptionRecord.id}_1`,
    organizationId,
    actorProfileId: profiles[1].id,
    shipmentId: exceptionRecord.shipmentId,
    exceptionId: exceptionRecord.id,
    action: "exception.created",
    summary: "Automated exception created from risk rule.",
    createdAt: exceptionRecord.openedAt,
  },
  {
    id: `audit_${exceptionRecord.id}_2`,
    organizationId,
    actorProfileId: index % 2 === 0 ? profiles[2].id : profiles[1].id,
    shipmentId: exceptionRecord.shipmentId,
    exceptionId: exceptionRecord.id,
    action: "exception.assigned",
    summary: "Exception owner assigned for follow-up.",
    createdAt: isoHours(-(index % 8) - 1),
  },
]);

const webhookEndpoints: WebhookEndpoint[] = [
  {
    id: "webhook_01",
    organizationId,
    label: "Customer alert relay",
    url: "https://example.com/hooks/customer-alerts",
    subscribedEvents: ["shipment.delayed", "exception.created"],
    createdAt: isoHours(-24 * 25),
  },
  {
    id: "webhook_02",
    organizationId,
    label: "Carrier data sync",
    url: "https://example.com/hooks/carrier-sync",
    subscribedEvents: ["shipment.updated", "milestone.reached"],
    createdAt: isoHours(-24 * 18),
  },
];

function buildShipmentVolumeTrend(): TrendPoint[] {
  return Array.from({ length: 8 }, (_, index) => ({
    label: `W${index + 1}`,
    value: 28 + ((index * 7) % 13),
  }));
}

function buildExceptionTrend(): TrendPoint[] {
  return Array.from({ length: 8 }, (_, index) => ({
    label: `W${index + 1}`,
    value: 3 + ((index * 5) % 6),
  }));
}

export const demoData = {
  organization,
  profiles,
  members,
  customers,
  carriers,
  facilities,
  orders,
  shipments: shipmentsWithRisk,
  milestones,
  shipmentEvents,
  exceptions,
  notifications,
  documents,
  auditLogs,
  webhookEndpoints,
  shipmentVolumeTrend: buildShipmentVolumeTrend(),
  exceptionTrend: buildExceptionTrend(),
  averageCarrierOnTimeRate: average(carriers.map((carrier) => carrier.onTimeRate)),
};
