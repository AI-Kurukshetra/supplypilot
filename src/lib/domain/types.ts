export const userRoles = ["org_admin", "ops_manager", "ops_agent", "customer_user"] as const;
export type UserRole = (typeof userRoles)[number];

export const shipmentStatuses = [
  "planned",
  "booked",
  "in_transit",
  "at_hub",
  "out_for_delivery",
  "delayed",
  "delivered",
  "exception",
] as const;
export type ShipmentStatus = (typeof shipmentStatuses)[number];

export const riskLevels = ["low", "medium", "high", "critical"] as const;
export type RiskLevel = (typeof riskLevels)[number];

export const exceptionStatuses = ["open", "investigating", "resolved"] as const;
export type ExceptionStatus = (typeof exceptionStatuses)[number];

export const exceptionTypes = [
  "eta_breach",
  "stale_tracking",
  "missed_milestone",
  "carrier_delay",
  "customs_hold",
  "documentation_issue",
] as const;
export type ExceptionType = (typeof exceptionTypes)[number];

export const documentTypes = ["bol", "pod", "invoice", "manifest", "customs"] as const;
export type DocumentType = (typeof documentTypes)[number];

export type Organization = {
  id: string;
  name: string;
  slug: string;
  timezone: string;
  createdAt: string;
  updatedAt: string;
};

export type Profile = {
  id: string;
  authUserId: string | null;
  fullName: string;
  email: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  notificationPreferences: {
    emailExceptionCreated: boolean;
    emailEtaChanged: boolean;
    emailShipmentDelayed: boolean;
    emailMilestoneReached: boolean;
  };
};

export type OrganizationMember = {
  id: string;
  organizationId: string;
  profileId: string;
  role: UserRole;
  customerId: string | null;
  createdAt: string;
};

export type Customer = {
  id: string;
  organizationId: string;
  name: string;
  code: string;
  segment: string;
  contactName: string;
  contactEmail: string;
  createdAt: string;
};

export type Carrier = {
  id: string;
  organizationId: string;
  name: string;
  scac: string;
  mode: "truckload" | "ltl" | "ocean" | "air" | "parcel";
  onTimeRate: number;
  activeExceptions: number;
  createdAt: string;
};

export type Facility = {
  id: string;
  organizationId: string;
  name: string;
  code: string;
  city: string;
  region: string;
  country: string;
  type: "origin" | "destination" | "hub" | "crossdock";
  createdAt: string;
};

export type Order = {
  id: string;
  organizationId: string;
  customerId: string;
  orderNumber: string;
  reference: string;
  promisedDeliveryAt: string;
  valueUsd: number;
  createdAt: string;
};

export type Shipment = {
  id: string;
  organizationId: string;
  orderId: string;
  customerId: string;
  carrierId: string;
  originFacilityId: string;
  destinationFacilityId: string;
  shipmentReference: string;
  externalReference: string;
  trackingToken: string;
  status: ShipmentStatus;
  riskLevel: RiskLevel;
  mode: "ftl" | "ltl" | "air" | "ocean";
  promisedDeliveryAt: string;
  eta: string;
  actualDeliveryAt: string | null;
  lastEventAt: string;
  lastUpdateAt: string;
  createdAt: string;
  updatedAt: string;
  summary: string;
};

export type ShipmentMilestone = {
  id: string;
  shipmentId: string;
  organizationId: string;
  sequence: number;
  label: string;
  plannedAt: string;
  actualAt: string | null;
  status: "upcoming" | "completed" | "late";
};

export type ShipmentEvent = {
  id: string;
  shipmentId: string;
  organizationId: string;
  occurredAt: string;
  eventType: "scan" | "eta_change" | "milestone" | "exception" | "internal_note";
  title: string;
  description: string;
  source: string;
  isCustomerVisible: boolean;
};

export type ExceptionRecord = {
  id: string;
  shipmentId: string;
  organizationId: string;
  customerId: string;
  carrierId: string;
  type: ExceptionType;
  status: ExceptionStatus;
  riskLevel: RiskLevel;
  title: string;
  description: string;
  ownerProfileId: string | null;
  resolutionNotes: string | null;
  openedAt: string;
  updatedAt: string;
  resolvedAt: string | null;
};

export type NotificationRecord = {
  id: string;
  organizationId: string;
  profileId: string;
  shipmentId: string | null;
  exceptionId: string | null;
  channel: "in_app" | "email";
  kind: "exception_created" | "eta_changed" | "shipment_delayed" | "milestone_reached";
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
};

export type DocumentRecord = {
  id: string;
  organizationId: string;
  shipmentId: string;
  customerId: string;
  type: DocumentType;
  fileName: string;
  filePath: string;
  fileSizeBytes: number;
  isCustomerVisible: boolean;
  createdAt: string;
};

export type AuditLogRecord = {
  id: string;
  organizationId: string;
  actorProfileId: string | null;
  shipmentId: string | null;
  exceptionId: string | null;
  action: string;
  summary: string;
  createdAt: string;
};

export type WebhookEndpoint = {
  id: string;
  organizationId: string;
  label: string;
  url: string;
  subscribedEvents: string[];
  createdAt: string;
};

export type ShipmentListFilters = {
  query?: string;
  status?: ShipmentStatus | "all";
  risk?: RiskLevel | "all";
  customerId?: string | "all";
  carrierId?: string | "all";
  dateRange?: "today" | "7d" | "30d" | "90d" | "all";
  page?: number;
  pageSize?: number;
};

export type DashboardMetrics = {
  totalShipments: number;
  onTimeRate: number;
  delayedShipments: number;
  openExceptions: number;
};

export type TrendPoint = {
  label: string;
  value: number;
};
