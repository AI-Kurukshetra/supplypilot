import { notFound } from "next/navigation";

import { EventFeed, MilestoneTimeline } from "@/components/app/timeline";
import { ExceptionStatusBadge, ExceptionTypeBadge, RiskBadge, ShipmentStatusBadge } from "@/components/app/status-badge";
import { PageHeader } from "@/components/app/page-header";
import { getShipmentDetail } from "@/lib/domain/queries";
import { formatDateTime } from "@/lib/utils";

type ShipmentDetailProps = {
  params: Promise<{ shipmentId: string }>;
};

export default async function ShipmentDetailPage({ params }: ShipmentDetailProps) {
  const { shipmentId } = await params;
  const detail = await getShipmentDetail(shipmentId);

  if (!detail) {
    notFound();
  }

  return (
    <>
      <PageHeader
        eyebrow="Shipment detail"
        title={detail.shipment.shipmentReference}
        description={detail.shipment.summary}
      />

      <section className="grid gap-4 xl:grid-cols-5">
        <article className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-5 xl:col-span-2">
          <div className="flex flex-wrap items-center gap-2">
            <ShipmentStatusBadge status={detail.shipment.status} />
            <RiskBadge risk={detail.shipment.riskLevel} />
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--muted)]">Customer</p>
              <p className="mt-2 text-sm font-semibold text-[var(--foreground)]">{detail.customer.name}</p>
            </div>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--muted)]">Carrier</p>
              <p className="mt-2 text-sm font-semibold text-[var(--foreground)]">{detail.carrier.name}</p>
            </div>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--muted)]">ETA</p>
              <p className="mt-2 text-sm font-semibold text-[var(--foreground)]">{formatDateTime(detail.shipment.eta)}</p>
            </div>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--muted)]">Promise</p>
              <p className="mt-2 text-sm font-semibold text-[var(--foreground)]">
                {formatDateTime(detail.shipment.promisedDeliveryAt)}
              </p>
            </div>
          </div>
          <div className="mt-5 rounded-[24px] border border-[var(--border)] bg-[var(--surface-strong)] p-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--muted)]">Route</p>
            <p className="mt-2 text-sm leading-7 text-[var(--foreground)]">
              {detail.shipment.originName} to {detail.shipment.destinationName}
            </p>
          </div>
        </article>

        <article className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-5 xl:col-span-3">
          <div className="flex flex-wrap gap-3">
            {["Add event", "Update shipment", "Create exception"].map((actionLabel) => (
              <button
                key={actionLabel}
                type="button"
                className="inline-flex h-11 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-4 text-sm font-medium text-[var(--foreground)] transition hover:bg-[var(--background)]"
              >
                {actionLabel}
              </button>
            ))}
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface-strong)] p-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--muted)]">Documents</p>
              <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[var(--foreground)]">{detail.documents.length}</p>
            </div>
            <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface-strong)] p-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--muted)]">Exceptions</p>
              <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[var(--foreground)]">{detail.exceptions.length}</p>
            </div>
            <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface-strong)] p-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--muted)]">Internal notes</p>
              <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[var(--foreground)]">{detail.internalNotes.length}</p>
            </div>
          </div>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.26em] text-[var(--muted)]">Milestone timeline</p>
          <div className="mt-5">
            <MilestoneTimeline milestones={detail.milestones} />
          </div>
        </section>

        <section className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.26em] text-[var(--muted)]">Exceptions</p>
          <div className="mt-4 space-y-3">
            {detail.exceptions.map((exceptionRecord) => (
              <article
                key={exceptionRecord.id}
                className="rounded-[22px] border border-[var(--border)] bg-[var(--surface-strong)] p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <ExceptionStatusBadge status={exceptionRecord.status} />
                  <ExceptionTypeBadge type={exceptionRecord.type} />
                  <RiskBadge risk={exceptionRecord.riskLevel} />
                </div>
                <h3 className="mt-3 text-sm font-semibold text-[var(--foreground)]">{exceptionRecord.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{exceptionRecord.description}</p>
              </article>
            ))}
          </div>
        </section>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <section className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.26em] text-[var(--muted)]">Event feed</p>
          <div className="mt-5">
            <EventFeed events={detail.events} />
          </div>
        </section>

        <div className="space-y-6">
          <section className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.26em] text-[var(--muted)]">Documents</p>
            <div className="mt-4 space-y-3">
              {detail.documents.map((document) => (
                <article
                  key={document.id}
                  className="rounded-[22px] border border-[var(--border)] bg-[var(--surface-strong)] p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[var(--foreground)]">{document.fileName}</p>
                      <p className="mt-1 text-xs text-[var(--muted)]">{document.type.toUpperCase()}</p>
                    </div>
                    <p className="text-xs text-[var(--muted)]">{formatDateTime(document.createdAt)}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.26em] text-[var(--muted)]">Internal notes</p>
            <div className="mt-4 space-y-3">
              {detail.internalNotes.map((note) => (
                <article
                  key={note.id}
                  className="rounded-[22px] border border-[var(--border)] bg-[var(--surface-strong)] p-4"
                >
                  <p className="text-sm leading-6 text-[var(--foreground)]">{note.description}</p>
                  <p className="mt-3 text-xs text-[var(--muted)]">{formatDateTime(note.occurredAt)}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.26em] text-[var(--muted)]">Audit log</p>
            <div className="mt-4 space-y-3">
              {detail.auditLogs.map((log) => (
                <article
                  key={log.id}
                  className="rounded-[22px] border border-[var(--border)] bg-[var(--surface-strong)] p-4"
                >
                  <p className="text-sm font-semibold text-[var(--foreground)]">{log.action}</p>
                  <p className="mt-2 text-sm text-[var(--muted)]">{log.summary}</p>
                  <p className="mt-3 text-xs text-[var(--muted)]">{formatDateTime(log.createdAt)}</p>
                </article>
              ))}
            </div>
          </section>
        </div>
      </section>
    </>
  );
}
