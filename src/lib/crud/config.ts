export type CrudEntityName =
  | "profiles"
  | "organization_members"
  | "customers"
  | "carriers"
  | "facilities"
  | "orders"
  | "shipments"
  | "shipment_milestones"
  | "shipment_events"
  | "exceptions"
  | "notifications"
  | "documents"
  | "audit_logs"
  | "webhook_endpoints";

export type CrudFieldType =
  | "text"
  | "email"
  | "textarea"
  | "number"
  | "datetime-local"
  | "select"
  | "checkbox"
  | "json"
  | "tags";

export type CrudOption = {
  label: string;
  value: string;
};

export type CrudFieldConfig = {
  key: string;
  label: string;
  type: CrudFieldType;
  section?: string;
  required?: boolean;
  placeholder?: string;
  step?: string;
  helperText?: string;
  staticOptions?: CrudOption[];
  optionSource?: string;
};

export type CrudEntityConfig = {
  name: CrudEntityName;
  label: string;
  description: string;
  table: string;
  orderBy: string;
  orderAscending?: boolean;
  limit?: number;
  scope: "organization_id" | "default_organization_id";
  createEnabled?: boolean;
  updateEnabled?: boolean;
  deleteEnabled?: boolean;
  primaryField: string;
  summaryFields: string[];
  formFields: CrudFieldConfig[];
};

const roleOptions: CrudOption[] = [
  { label: "Org admin", value: "org_admin" },
  { label: "Ops manager", value: "ops_manager" },
  { label: "Ops agent", value: "ops_agent" },
  { label: "Customer user", value: "customer_user" },
];

const carrierModeOptions: CrudOption[] = [
  { label: "Truckload", value: "truckload" },
  { label: "LTL", value: "ltl" },
  { label: "Ocean", value: "ocean" },
  { label: "Air", value: "air" },
  { label: "Parcel", value: "parcel" },
];

const facilityTypeOptions: CrudOption[] = [
  { label: "Origin", value: "origin" },
  { label: "Destination", value: "destination" },
  { label: "Hub", value: "hub" },
  { label: "Crossdock", value: "crossdock" },
];

const shipmentModeOptions: CrudOption[] = [
  { label: "FTL", value: "ftl" },
  { label: "LTL", value: "ltl" },
  { label: "Air", value: "air" },
  { label: "Ocean", value: "ocean" },
];

const shipmentStatusOptions: CrudOption[] = [
  { label: "Planned", value: "planned" },
  { label: "Booked", value: "booked" },
  { label: "In transit", value: "in_transit" },
  { label: "At hub", value: "at_hub" },
  { label: "Out for delivery", value: "out_for_delivery" },
  { label: "Delayed", value: "delayed" },
  { label: "Delivered", value: "delivered" },
  { label: "Exception", value: "exception" },
];

const riskOptions: CrudOption[] = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
  { label: "Critical", value: "critical" },
];

const exceptionStatusOptions: CrudOption[] = [
  { label: "Open", value: "open" },
  { label: "Investigating", value: "investigating" },
  { label: "Resolved", value: "resolved" },
];

const exceptionTypeOptions: CrudOption[] = [
  { label: "ETA breach", value: "eta_breach" },
  { label: "Stale tracking", value: "stale_tracking" },
  { label: "Missed milestone", value: "missed_milestone" },
  { label: "Carrier delay", value: "carrier_delay" },
  { label: "Customs hold", value: "customs_hold" },
  { label: "Documentation issue", value: "documentation_issue" },
];

const documentTypeOptions: CrudOption[] = [
  { label: "BOL", value: "bol" },
  { label: "POD", value: "pod" },
  { label: "Invoice", value: "invoice" },
  { label: "Manifest", value: "manifest" },
  { label: "Customs", value: "customs" },
];

const milestoneStatusOptions: CrudOption[] = [
  { label: "Upcoming", value: "upcoming" },
  { label: "Completed", value: "completed" },
  { label: "Late", value: "late" },
];

const notificationChannelOptions: CrudOption[] = [
  { label: "In app", value: "in_app" },
  { label: "Email", value: "email" },
];

const notificationKindOptions: CrudOption[] = [
  { label: "Exception created", value: "exception_created" },
  { label: "ETA changed", value: "eta_changed" },
  { label: "Shipment delayed", value: "shipment_delayed" },
  { label: "Milestone reached", value: "milestone_reached" },
];

export const crudEntityOrder: CrudEntityName[] = [
  "customers",
  "carriers",
  "facilities",
  "orders",
  "shipments",
  "shipment_milestones",
  "shipment_events",
  "exceptions",
  "documents",
  "webhook_endpoints",
  "profiles",
  "organization_members",
  "notifications",
  "audit_logs",
];

export const crudEntityConfigs: Record<CrudEntityName, CrudEntityConfig> = {
  customers: {
    name: "customers",
    label: "Customers",
    description: "Manage customer accounts and contacts.",
    table: "customers",
    orderBy: "updated_at",
    scope: "organization_id",
    primaryField: "name",
    summaryFields: ["code", "segment", "contact_email"],
    formFields: [
      { key: "name", label: "Name", type: "text", required: true },
      { key: "code", label: "Code", type: "text", required: true },
      { key: "segment", label: "Segment", type: "text", required: true },
      { key: "contact_name", label: "Contact name", type: "text" },
      { key: "contact_email", label: "Contact email", type: "email", required: true, helperText: "Used for SupplyPilot customer notifications and portal updates." },
    ],
  },
  carriers: {
    name: "carriers",
    label: "Carriers",
    description: "Manage carrier master data and performance baselines.",
    table: "carriers",
    orderBy: "updated_at",
    scope: "organization_id",
    primaryField: "name",
    summaryFields: ["scac", "mode", "on_time_rate"],
    formFields: [
      { key: "name", label: "Name", type: "text", required: true },
      { key: "scac", label: "SCAC", type: "text", required: true },
      { key: "mode", label: "Mode", type: "select", required: true, staticOptions: carrierModeOptions },
      { key: "on_time_rate", label: "On-time rate", type: "number", step: "0.01" },
    ],
  },
  facilities: {
    name: "facilities",
    label: "Facilities",
    description: "Manage origins, destinations, hubs, and crossdocks.",
    table: "facilities",
    orderBy: "updated_at",
    scope: "organization_id",
    primaryField: "name",
    summaryFields: ["code", "city", "facility_type"],
    formFields: [
      { key: "name", label: "Name", type: "text", required: true },
      { key: "code", label: "Code", type: "text", required: true },
      { key: "city", label: "City", type: "text", required: true },
      { key: "region", label: "Region", type: "text", required: true },
      { key: "country", label: "Country", type: "text", required: true },
      { key: "facility_type", label: "Facility type", type: "select", required: true, staticOptions: facilityTypeOptions },
    ],
  },
  orders: {
    name: "orders",
    label: "Orders",
    description: "Create and maintain order headers tied to customers.",
    table: "orders",
    orderBy: "promised_delivery_at",
    scope: "organization_id",
    primaryField: "order_number",
    summaryFields: ["customer_id", "customer_reference", "promised_delivery_at"],
    formFields: [
      { key: "customer_id", label: "Customer", type: "select", required: true, optionSource: "customers" },
      { key: "order_number", label: "Order number", type: "text", required: true },
      { key: "customer_reference", label: "Customer reference", type: "text" },
      { key: "promised_delivery_at", label: "Promised delivery", type: "datetime-local", required: true },
      { key: "value_usd", label: "Value (USD)", type: "number", step: "0.01" },
    ],
  },
  shipments: {
    name: "shipments",
    label: "Shipments",
    description: "Create and update shipment records with linked order and route data.",
    table: "shipments",
    orderBy: "updated_at",
    scope: "organization_id",
    primaryField: "shipment_reference",
    summaryFields: ["status", "risk_level", "eta"],
    limit: 40,
    formFields: [
      { key: "order_id", label: "Order", type: "select", required: true, optionSource: "orders" },
      { key: "customer_id", label: "Customer", type: "select", required: true, optionSource: "customers", section: "Planning" },
      { key: "carrier_id", label: "Carrier", type: "select", required: true, optionSource: "carriers", section: "Planning" },
      { key: "mode", label: "Mode", type: "select", required: true, staticOptions: shipmentModeOptions, section: "Planning" },
      { key: "status", label: "Status", type: "select", required: true, staticOptions: shipmentStatusOptions, section: "Planning" },
      { key: "risk_level", label: "Risk", type: "select", required: true, staticOptions: riskOptions, section: "Planning" },
      { key: "origin_facility_id", label: "Origin facility", type: "select", required: true, optionSource: "facilities", section: "Route" },
      { key: "destination_facility_id", label: "Destination facility", type: "select", required: true, optionSource: "facilities", section: "Route" },
      { key: "shipment_reference", label: "Shipment reference", type: "text", required: true, section: "References" },
      { key: "external_reference", label: "External reference", type: "text", section: "References" },
      { key: "tracking_token", label: "Tracking token", type: "text", required: true, section: "References" },
      { key: "promised_delivery_at", label: "Promised delivery", type: "datetime-local", required: true, section: "Timing" },
      { key: "eta", label: "ETA", type: "datetime-local", required: true, section: "Timing" },
      { key: "actual_delivery_at", label: "Actual delivery", type: "datetime-local", section: "Timing" },
      { key: "last_event_at", label: "Last event", type: "datetime-local", section: "Timing" },
      { key: "last_update_at", label: "Last update", type: "datetime-local", section: "Timing" },
      { key: "summary", label: "Summary", type: "textarea", section: "Summary", helperText: "Operational summary shown across dashboards and detail pages." },
    ],
  },
  shipment_milestones: {
    name: "shipment_milestones",
    label: "Milestones",
    description: "Manage the planned and actual shipment timeline checkpoints.",
    table: "shipment_milestones",
    orderBy: "sequence_number",
    orderAscending: true,
    scope: "organization_id",
    primaryField: "label",
    summaryFields: ["shipment_id", "sequence_number", "milestone_status"],
    limit: 60,
    formFields: [
      { key: "shipment_id", label: "Shipment", type: "select", required: true, optionSource: "shipments" },
      { key: "sequence_number", label: "Sequence", type: "number", required: true, step: "1" },
      { key: "label", label: "Label", type: "text", required: true },
      { key: "planned_at", label: "Planned at", type: "datetime-local", required: true },
      { key: "actual_at", label: "Actual at", type: "datetime-local" },
      { key: "milestone_status", label: "Status", type: "select", required: true, staticOptions: milestoneStatusOptions },
    ],
  },
  shipment_events: {
    name: "shipment_events",
    label: "Events",
    description: "Capture milestone scans, ETA changes, and internal notes.",
    table: "shipment_events",
    orderBy: "occurred_at",
    scope: "organization_id",
    primaryField: "title",
    summaryFields: ["shipment_id", "event_type", "occurred_at"],
    limit: 60,
    formFields: [
      { key: "shipment_id", label: "Shipment", type: "select", required: true, optionSource: "shipments" },
      { key: "event_type", label: "Event type", type: "text", required: true },
      { key: "title", label: "Title", type: "text", required: true },
      { key: "description", label: "Description", type: "textarea" },
      { key: "source", label: "Source", type: "text" },
      { key: "occurred_at", label: "Occurred at", type: "datetime-local", required: true },
      { key: "is_customer_visible", label: "Customer visible", type: "checkbox" },
    ],
  },
  exceptions: {
    name: "exceptions",
    label: "Exceptions",
    description: "Track exception ownership, severity, and resolution notes.",
    table: "exceptions",
    orderBy: "updated_at",
    scope: "organization_id",
    primaryField: "title",
    summaryFields: ["exception_type", "status", "risk_level"],
    limit: 50,
    formFields: [
      { key: "shipment_id", label: "Shipment", type: "select", required: true, optionSource: "shipments" },
      { key: "customer_id", label: "Customer", type: "select", required: true, optionSource: "customers" },
      { key: "carrier_id", label: "Carrier", type: "select", required: true, optionSource: "carriers" },
      { key: "exception_type", label: "Type", type: "select", required: true, staticOptions: exceptionTypeOptions },
      { key: "status", label: "Status", type: "select", required: true, staticOptions: exceptionStatusOptions },
      { key: "risk_level", label: "Risk", type: "select", required: true, staticOptions: riskOptions },
      { key: "title", label: "Title", type: "text", required: true },
      { key: "description", label: "Description", type: "textarea" },
      { key: "owner_profile_id", label: "Owner", type: "select", optionSource: "profiles" },
      { key: "resolution_notes", label: "Resolution notes", type: "textarea" },
      { key: "opened_at", label: "Opened at", type: "datetime-local", required: true },
      { key: "resolved_at", label: "Resolved at", type: "datetime-local" },
    ],
  },
  documents: {
    name: "documents",
    label: "Documents",
    description: "Manage shipment document metadata and visibility.",
    table: "documents",
    orderBy: "updated_at",
    scope: "organization_id",
    primaryField: "file_name",
    summaryFields: ["document_type", "shipment_id", "is_customer_visible"],
    formFields: [
      { key: "shipment_id", label: "Shipment", type: "select", required: true, optionSource: "shipments", section: "Linking" },
      { key: "customer_id", label: "Customer", type: "select", required: true, optionSource: "customers", section: "Linking" },
      { key: "document_type", label: "Document type", type: "select", required: true, staticOptions: documentTypeOptions, section: "Metadata" },
      { key: "file_name", label: "File name", type: "text", required: true, section: "Metadata" },
      { key: "file_path", label: "File path", type: "text", required: true, section: "Metadata", helperText: "Storage object path in the Supabase bucket." },
      { key: "file_size_bytes", label: "File size (bytes)", type: "number", step: "1", section: "Metadata" },
      { key: "is_customer_visible", label: "Customer visible", type: "checkbox", section: "Visibility", helperText: "If enabled, this document can appear in the customer portal." },
    ],
  },
  webhook_endpoints: {
    name: "webhook_endpoints",
    label: "Webhooks",
    description: "Configure outbound webhook endpoints and event subscriptions.",
    table: "webhook_endpoints",
    orderBy: "updated_at",
    scope: "organization_id",
    primaryField: "label",
    summaryFields: ["url", "subscribed_events"],
    formFields: [
      { key: "label", label: "Label", type: "text", required: true },
      { key: "url", label: "URL", type: "text", required: true },
      { key: "secret", label: "Secret", type: "text" },
      { key: "subscribed_events", label: "Subscribed events", type: "tags", helperText: "Comma-separated event names." },
    ],
  },
  profiles: {
    name: "profiles",
    label: "Profiles",
    description: "Manage user profile records used by membership and notifications.",
    table: "profiles",
    orderBy: "updated_at",
    scope: "default_organization_id",
    primaryField: "full_name",
    summaryFields: ["email", "title"],
    formFields: [
      { key: "full_name", label: "Full name", type: "text", required: true },
      { key: "email", label: "Email", type: "text", required: true },
      { key: "title", label: "Title", type: "text", required: true },
      { key: "auth_user_id", label: "Auth user ID", type: "text" },
      { key: "notification_preferences", label: "Notification preferences", type: "json", helperText: "JSON object." },
    ],
  },
  organization_members: {
    name: "organization_members",
    label: "Members",
    description: "Assign profiles to the organization with role and optional customer scope.",
    table: "organization_members",
    orderBy: "updated_at",
    scope: "organization_id",
    primaryField: "profile_id",
    summaryFields: ["role", "customer_id"],
    formFields: [
      { key: "profile_id", label: "Profile", type: "select", required: true, optionSource: "profiles", section: "Identity" },
      { key: "role", label: "Role", type: "select", required: true, staticOptions: roleOptions, section: "Access" },
      { key: "customer_id", label: "Customer scope", type: "select", optionSource: "customers", section: "Access", helperText: "Optional. Use for customer-specific users or scoped account teams." },
    ],
  },
  notifications: {
    name: "notifications",
    label: "Notifications",
    description: "Manage in-app and email notification records.",
    table: "notifications",
    orderBy: "created_at",
    scope: "organization_id",
    primaryField: "title",
    summaryFields: ["notification_kind", "channel", "read_at"],
    limit: 60,
    formFields: [
      { key: "profile_id", label: "Profile", type: "select", required: true, optionSource: "profiles" },
      { key: "shipment_id", label: "Shipment", type: "select", optionSource: "shipments" },
      { key: "exception_id", label: "Exception", type: "select", optionSource: "exceptions" },
      { key: "channel", label: "Channel", type: "select", required: true, staticOptions: notificationChannelOptions },
      { key: "notification_kind", label: "Kind", type: "select", required: true, staticOptions: notificationKindOptions },
      { key: "title", label: "Title", type: "text", required: true },
      { key: "body", label: "Body", type: "textarea", required: true },
      { key: "read_at", label: "Read at", type: "datetime-local" },
    ],
  },
  audit_logs: {
    name: "audit_logs",
    label: "Audit logs",
    description: "Inspect and manage audit trail records.",
    table: "audit_logs",
    orderBy: "created_at",
    scope: "organization_id",
    primaryField: "action",
    summaryFields: ["summary", "shipment_id", "exception_id"],
    limit: 60,
    formFields: [
      { key: "actor_profile_id", label: "Actor profile", type: "select", optionSource: "profiles" },
      { key: "shipment_id", label: "Shipment", type: "select", optionSource: "shipments" },
      { key: "exception_id", label: "Exception", type: "select", optionSource: "exceptions" },
      { key: "action", label: "Action", type: "text", required: true },
      { key: "summary", label: "Summary", type: "textarea", required: true },
      { key: "payload", label: "Payload", type: "json", helperText: "JSON payload." },
    ],
  },
};

export function getCrudEntityConfig(name: CrudEntityName) {
  return crudEntityConfigs[name];
}
