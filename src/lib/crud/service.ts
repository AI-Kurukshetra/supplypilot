import { requireAppContext } from "@/lib/auth/session";
import {
  type CrudEntityName,
  crudEntityConfigs,
  crudEntityOrder,
  getCrudEntityConfig,
} from "@/lib/crud/config";
import { createAdminClient } from "@/lib/supabase/admin";

export type CrudOptionSet = {
  label: string;
  value: string;
};

export type CrudRecord = {
  id: string;
  [key: string]: unknown;
};

export type CrudWorkspaceData = {
  entityName: CrudEntityName;
  entity: ReturnType<typeof getCrudEntityConfig>;
  records: CrudRecord[];
  optionSets: Record<string, CrudOptionSet[]>;
  context: Awaited<ReturnType<typeof requireAppContext>>;
};

const managerRoles = new Set(["org_admin", "ops_manager"]);

function parseDateTime(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error("Invalid date value.");
  }

  return parsed.toISOString();
}

function formatOptionLabel(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }

  return String(record.id ?? "Record");
}

export async function requireCrudManagerContext() {
  const context = await requireAppContext();

  if (!managerRoles.has(context.member.role)) {
    throw new Error("You do not have permission to manage CRUD data.");
  }

  return context;
}

async function getProfilesOptions(organizationId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .eq("default_organization_id", organizationId)
    .order("full_name", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map((profile) => ({
    value: profile.id,
    label: `${profile.full_name} · ${profile.email}`,
  }));
}

export async function getCrudOptionSets(organizationId: string): Promise<Record<string, CrudOptionSet[]>> {
  const supabase = createAdminClient();

  const [
    profiles,
    customersResult,
    carriersResult,
    facilitiesResult,
    ordersResult,
    shipmentsResult,
    exceptionsResult,
  ] = await Promise.all([
    getProfilesOptions(organizationId),
    supabase.from("customers").select("id, name, code").eq("organization_id", organizationId).order("name"),
    supabase.from("carriers").select("id, name, scac").eq("organization_id", organizationId).order("name"),
    supabase.from("facilities").select("id, name, code").eq("organization_id", organizationId).order("name"),
    supabase.from("orders").select("id, order_number").eq("organization_id", organizationId).order("order_number"),
    supabase
      .from("shipments")
      .select("id, shipment_reference, tracking_token")
      .eq("organization_id", organizationId)
      .order("shipment_reference"),
    supabase.from("exceptions").select("id, title").eq("organization_id", organizationId).order("updated_at", { ascending: false }),
  ]);

  if (customersResult.error) throw customersResult.error;
  if (carriersResult.error) throw carriersResult.error;
  if (facilitiesResult.error) throw facilitiesResult.error;
  if (ordersResult.error) throw ordersResult.error;
  if (shipmentsResult.error) throw shipmentsResult.error;
  if (exceptionsResult.error) throw exceptionsResult.error;

  return {
    profiles,
    customers: (customersResult.data ?? []).map((item) => ({
      value: item.id,
      label: `${item.name} · ${item.code}`,
    })),
    carriers: (carriersResult.data ?? []).map((item) => ({
      value: item.id,
      label: `${item.name} · ${item.scac}`,
    })),
    facilities: (facilitiesResult.data ?? []).map((item) => ({
      value: item.id,
      label: `${item.name} · ${item.code}`,
    })),
    orders: (ordersResult.data ?? []).map((item) => ({
      value: item.id,
      label: item.order_number,
    })),
    shipments: (shipmentsResult.data ?? []).map((item) => ({
      value: item.id,
      label: `${item.shipment_reference} · ${item.tracking_token}`,
    })),
    exceptions: (exceptionsResult.data ?? []).map((item) => ({
      value: item.id,
      label: item.title,
    })),
  };
}

export async function listCrudRecords(entityName: CrudEntityName, organizationId: string): Promise<CrudRecord[]> {
  const entity = getCrudEntityConfig(entityName);
  const supabase = createAdminClient();

  const query = supabase
    .from(entity.table)
    .select("*")
    .eq(entity.scope, organizationId)
    .order(entity.orderBy, { ascending: entity.orderAscending ?? false });

  const { data, error } = entity.limit ? await query.limit(entity.limit) : await query;

  if (error) {
    throw error;
  }

  return (data ?? []) as CrudRecord[];
}

export async function getCrudWorkspaceData(entityName: CrudEntityName): Promise<CrudWorkspaceData> {
  const context = await requireCrudManagerContext();
  const organizationId = context.organization.id;
  const entity = getCrudEntityConfig(entityName);
  const [records, optionSets] = await Promise.all([
    listCrudRecords(entityName, organizationId),
    getCrudOptionSets(organizationId),
  ]);

  return {
    entityName,
    entity,
    records,
    optionSets,
    context,
  };
}

function parseFieldValue(formData: FormData, field: (typeof crudEntityConfigs)[CrudEntityName]["formFields"][number]) {
  const rawValue = formData.get(field.key);

  if (field.type === "checkbox") {
    return rawValue === "on";
  }

  if (typeof rawValue !== "string") {
    if (field.required) {
      throw new Error(`${field.label} is required.`);
    }

    return null;
  }

  const trimmed = rawValue.trim();
  if (!trimmed) {
    if (field.required) {
      throw new Error(`${field.label} is required.`);
    }

    return null;
  }

  switch (field.type) {
    case "number": {
      const parsed = Number(trimmed);
      if (Number.isNaN(parsed)) {
        throw new Error(`${field.label} must be a valid number.`);
      }

      return parsed;
    }
    case "datetime-local":
      return parseDateTime(trimmed);
    case "json":
      return JSON.parse(trimmed);
    case "tags":
      return trimmed
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);
    default:
      return trimmed;
  }
}

function buildPayload(
  entityName: CrudEntityName,
  formData: FormData,
  organizationId: string,
) {
  const entity = getCrudEntityConfig(entityName);
  const payload: Record<string, unknown> = {};

  for (const field of entity.formFields) {
    const value = parseFieldValue(formData, field);
    if (value === null) {
      continue;
    }

    payload[field.key] = value;
  }

  if (entity.scope === "organization_id") {
    payload.organization_id = organizationId;
  }

  if (entityName === "profiles") {
    payload.default_organization_id = organizationId;
  }

  if (entityName === "organization_members") {
    payload.organization_id = organizationId;
  }

  return payload;
}

export async function createCrudRecord(entityName: CrudEntityName, formData: FormData) {
  const context = await requireCrudManagerContext();
  const payload = buildPayload(entityName, formData, context.organization.id);
  const entity = getCrudEntityConfig(entityName);
  const supabase = createAdminClient();

  const { error } = await supabase.from(entity.table).insert(payload);
  if (error) {
    throw error;
  }
}

async function assertRecordOwnership(entityName: CrudEntityName, recordId: string, organizationId: string) {
  const entity = getCrudEntityConfig(entityName);
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from(entity.table)
    .select("id")
    .eq("id", recordId)
    .eq(entity.scope, organizationId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error("Record not found for the current organization.");
  }
}

export async function updateCrudRecord(entityName: CrudEntityName, recordId: string, formData: FormData) {
  const context = await requireCrudManagerContext();
  await assertRecordOwnership(entityName, recordId, context.organization.id);

  const payload = buildPayload(entityName, formData, context.organization.id);
  const entity = getCrudEntityConfig(entityName);
  const supabase = createAdminClient();

  const { error } = await supabase
    .from(entity.table)
    .update(payload)
    .eq("id", recordId);

  if (error) {
    throw error;
  }
}

export async function deleteCrudRecord(entityName: CrudEntityName, recordId: string) {
  const context = await requireCrudManagerContext();
  await assertRecordOwnership(entityName, recordId, context.organization.id);

  const entity = getCrudEntityConfig(entityName);
  const supabase = createAdminClient();

  const { error } = await supabase.from(entity.table).delete().eq("id", recordId);
  if (error) {
    throw error;
  }
}

export function getDefaultCrudEntity(value: string | undefined): CrudEntityName {
  if (value && value in crudEntityConfigs) {
    return value as CrudEntityName;
  }

  return crudEntityOrder[0];
}

export function getEntityLinkLabel(entityName: CrudEntityName) {
  return getCrudEntityConfig(entityName).label;
}

export function formatCrudValue(value: unknown, optionSets?: Record<string, CrudOptionSet[]>) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  if (Array.isArray(value)) {
    return value.join(", ");
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  if (typeof value === "string" && optionSets) {
    for (const options of Object.values(optionSets)) {
      const match = options.find((option) => option.value === value);
      if (match) {
        return match.label;
      }
    }
  }

  return String(value);
}

export function getCrudRecordTitle(
  record: CrudRecord,
  entityName: CrudEntityName,
  optionSets: Record<string, CrudOptionSet[]>,
) {
  const entity = getCrudEntityConfig(entityName);
  const primaryValue = record[entity.primaryField];

  if (typeof primaryValue === "string" && primaryValue.trim()) {
    return formatCrudValue(primaryValue, optionSets);
  }

  return formatOptionLabel(record, ["name", "title", "label", "id"]);
}
