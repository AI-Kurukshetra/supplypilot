import { cx } from "@/lib/utils";
import type { ExceptionStatus, ExceptionType, RiskLevel, ShipmentStatus, UserRole } from "@/lib/domain/types";

type BadgeTone = "neutral" | "success" | "warning" | "danger" | "info";

const toneClassNames: Record<BadgeTone, string> = {
  neutral: "border-[var(--border)] bg-[var(--surface-strong)] text-[var(--foreground)]",
  success: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  warning: "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  danger: "border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300",
  info: "border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-300",
};

function badgeToneForRisk(risk: RiskLevel): BadgeTone {
  if (risk === "critical") return "danger";
  if (risk === "high") return "warning";
  if (risk === "medium") return "info";
  return "success";
}

function badgeToneForStatus(status: ShipmentStatus): BadgeTone {
  if (status === "delayed" || status === "exception") return "danger";
  if (status === "at_hub" || status === "out_for_delivery") return "warning";
  if (status === "in_transit" || status === "booked") return "info";
  return "success";
}

function badgeToneForExceptionStatus(status: ExceptionStatus): BadgeTone {
  if (status === "open") return "danger";
  if (status === "investigating") return "warning";
  return "success";
}

function humanize(value: string) {
  return value.replaceAll("_", " ");
}

export function StatusBadge({
  label,
  tone,
}: {
  label: string;
  tone: BadgeTone;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full border px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.18em]",
        toneClassNames[tone],
      )}
    >
      {label}
    </span>
  );
}

export function ShipmentStatusBadge({ status }: { status: ShipmentStatus }) {
  return <StatusBadge label={humanize(status)} tone={badgeToneForStatus(status)} />;
}

export function RiskBadge({ risk }: { risk: RiskLevel }) {
  return <StatusBadge label={humanize(risk)} tone={badgeToneForRisk(risk)} />;
}

export function ExceptionStatusBadge({ status }: { status: ExceptionStatus }) {
  return <StatusBadge label={humanize(status)} tone={badgeToneForExceptionStatus(status)} />;
}

export function RoleBadge({ role }: { role: UserRole }) {
  const tone: BadgeTone = role === "customer_user" ? "info" : role === "org_admin" ? "success" : "neutral";
  return <StatusBadge label={humanize(role)} tone={tone} />;
}

export function ExceptionTypeBadge({ type }: { type: ExceptionType }) {
  return <StatusBadge label={humanize(type)} tone="warning" />;
}
