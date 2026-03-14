import { RoleBadge, RiskBadge, ShipmentStatusBadge, StatusBadge } from "@/components/app/status-badge";
import type { CrudEntityName } from "@/lib/crud/config";
import type { RiskLevel, ShipmentStatus, UserRole } from "@/lib/domain/types";
import { formatCrudValue, type CrudOptionSet, type CrudRecord } from "@/lib/crud/service";

function countBy(records: CrudRecord[], key: string, value: string) {
  return records.filter((record) => record[key] === value).length;
}

function countTruthy(records: CrudRecord[], key: string) {
  return records.filter((record) => Boolean(record[key])).length;
}

function uniqueCount(records: CrudRecord[], key: string) {
  return new Set(records.map((record) => record[key]).filter(Boolean)).size;
}

export function CrudEntityInsights({
  entityName,
  records,
  optionSets,
}: {
  entityName: CrudEntityName;
  records: CrudRecord[];
  optionSets: Record<string, CrudOptionSet[]>;
}) {
  if (entityName === "shipments") {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        <InsightCard label="Delayed" value={countBy(records, "status", "delayed")} helper="Loads currently behind promise" />
        <InsightCard label="Critical risk" value={countBy(records, "risk_level", "critical")} helper="Highest urgency shipments" />
        <InsightCard label="Active carriers" value={uniqueCount(records, "carrier_id")} helper="Carriers represented in the workspace" />
      </div>
    );
  }

  if (entityName === "documents") {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        <InsightCard label="Customer visible" value={countTruthy(records, "is_customer_visible")} helper="Portal-safe documents" />
        <InsightCard label="Unique types" value={uniqueCount(records, "document_type")} helper="Distinct document categories" />
        <InsightCard label="Linked shipments" value={uniqueCount(records, "shipment_id")} helper="Shipments with document coverage" />
      </div>
    );
  }

  if (entityName === "organization_members") {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        <InsightCard label="Admins" value={countBy(records, "role", "org_admin")} helper="Organization administrators" />
        <InsightCard label="Ops team" value={countBy(records, "role", "ops_manager") + countBy(records, "role", "ops_agent")} helper="Operational users" />
        <InsightCard label="Customer scoped" value={countTruthy(records, "customer_id")} helper="Users tied to a customer account" />
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <InsightCard label="Loaded records" value={records.length} helper="Current dataset size" />
      <InsightCard label="Distinct references" value={uniqueCount(records, "id")} helper="Unique records in scope" />
      <InsightCard label="Primary field" value={formatCrudValue(records[0]?.id ?? "—", optionSets)} helper="Latest record in view" />
    </div>
  );
}

function InsightCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: number | string;
  helper: string;
}) {
  return (
    <article className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-4">
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--muted)]">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[var(--foreground)]">{value}</p>
      <p className="mt-2 text-sm text-[var(--muted)]">{helper}</p>
    </article>
  );
}

export function CrudRecordMeta({
  entityName,
  record,
  optionSets,
}: {
  entityName: CrudEntityName;
  record: CrudRecord;
  optionSets: Record<string, CrudOptionSet[]>;
}) {
  if (entityName === "shipments") {
    return (
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {typeof record.status === "string" ? <ShipmentStatusBadge status={record.status as ShipmentStatus} /> : null}
        {typeof record.risk_level === "string" ? <RiskBadge risk={record.risk_level as RiskLevel} /> : null}
        <MetaPill label={formatCrudValue(record.customer_id, optionSets)} />
        <MetaPill label={formatCrudValue(record.carrier_id, optionSets)} />
        <MetaPill label={`${formatCrudValue(record.origin_facility_id, optionSets)} → ${formatCrudValue(record.destination_facility_id, optionSets)}`} />
      </div>
    );
  }

  if (entityName === "documents") {
    return (
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {typeof record.document_type === "string" ? (
          <StatusBadge label={String(record.document_type)} tone="info" />
        ) : null}
        <MetaPill label={formatCrudValue(record.shipment_id, optionSets)} />
        <MetaPill label={formatCrudValue(record.customer_id, optionSets)} />
        {record.is_customer_visible ? <StatusBadge label="customer visible" tone="success" /> : <StatusBadge label="internal only" tone="neutral" />}
      </div>
    );
  }

  if (entityName === "organization_members") {
    return (
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {typeof record.role === "string" ? <RoleBadge role={record.role as UserRole} /> : null}
        <MetaPill label={formatCrudValue(record.profile_id, optionSets)} />
        {record.customer_id ? <MetaPill label={`Scoped: ${formatCrudValue(record.customer_id, optionSets)}`} /> : <MetaPill label="All customers" />}
      </div>
    );
  }

  return null;
}

function MetaPill({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-[var(--border)] bg-[var(--surface-strong)] px-3 py-1 text-xs text-[var(--muted)]">
      {label}
    </span>
  );
}
