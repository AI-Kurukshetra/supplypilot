import Link from "next/link";
import { notFound } from "next/navigation";

import { EventFeed, MilestoneTimeline } from "@/components/app/timeline";
import { RiskBadge, ShipmentStatusBadge } from "@/components/app/status-badge";
import { getPortalShipment } from "@/lib/domain/queries";
import { formatDateTime } from "@/lib/utils";

type PortalShipmentProps = {
  params: Promise<{ reference: string }>;
};

export default async function PortalShipmentPage({ params }: PortalShipmentProps) {
  const { reference } = await params;
  const detail = await getPortalShipment(reference);

  if (!detail) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[36px] border border-[var(--border)] bg-[var(--surface)] p-8 sm:p-10">
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--muted)]">Tracking detail</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-[var(--foreground)]">
          {detail.shipment.shipmentReference}
        </h1>
        <div className="mt-5 flex flex-wrap gap-2">
          <ShipmentStatusBadge status={detail.shipment.status} />
          <RiskBadge risk={detail.shipment.riskLevel} />
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface-strong)] p-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--muted)]">Customer</p>
            <p className="mt-2 text-sm font-semibold text-[var(--foreground)]">{detail.customer.name}</p>
          </div>
          <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface-strong)] p-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--muted)]">ETA</p>
            <p className="mt-2 text-sm font-semibold text-[var(--foreground)]">{formatDateTime(detail.shipment.eta)}</p>
          </div>
          <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface-strong)] p-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--muted)]">Route</p>
            <p className="mt-2 text-sm font-semibold text-[var(--foreground)]">
              {detail.shipment.originName} to {detail.shipment.destinationName}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <section className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.26em] text-[var(--muted)]">Milestones</p>
          <div className="mt-5">
            <MilestoneTimeline milestones={detail.milestones} />
          </div>
        </section>

        <section className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.26em] text-[var(--muted)]">Recent updates</p>
          <div className="mt-5">
            <EventFeed events={detail.events} />
          </div>
        </section>
      </section>

      <section className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-5">
        <p className="font-mono text-[11px] uppercase tracking-[0.26em] text-[var(--muted)]">Permitted documents</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {detail.documents.map((document) => (
            <article
              key={document.id}
              className="rounded-[22px] border border-[var(--border)] bg-[var(--surface-strong)] p-4"
            >
              <p className="text-sm font-semibold text-[var(--foreground)]">{document.fileName}</p>
              <p className="mt-2 text-xs uppercase text-[var(--muted)]">{document.type}</p>
              <Link
                href={`/api/portal-documents/${document.id}`}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex h-10 items-center justify-center rounded-2xl border border-[var(--border-strong)] bg-[var(--surface)] px-3 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--background)]"
              >
                View PDF
              </Link>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
