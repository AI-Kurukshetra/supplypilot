import { PageHeader } from "@/components/app/page-header";
import { getReportsData } from "@/lib/domain/queries";
import { formatPercent } from "@/lib/utils";

export default async function ReportsPage() {
  const data = await getReportsData();

  return (
    <>
      <PageHeader
        eyebrow="Reports"
        title="Operational reporting"
        description="Track KPI trends, average delay duration, and carrier reliability in a single reporting surface."
      />

      <section className="grid gap-4 xl:grid-cols-3">
        {[
          ["Total shipments", String(data.metrics.totalShipments)],
          ["On-time delivery", formatPercent(data.metrics.onTimeRate)],
          ["Delayed shipments", String(data.metrics.delayedShipments)],
          ["Open exceptions", String(data.metrics.openExceptions)],
          ["Carrier performance", formatPercent(data.metrics.carrierPerformance)],
          ["Average delay", `${data.metrics.averageDelayDuration.toFixed(1)}h`],
        ].map(([label, value]) => (
          <article
            key={label}
            className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-5"
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--muted)]">{label}</p>
            <p className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[var(--foreground)]">{value}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <article className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.26em] text-[var(--muted)]">Shipment volume trend</p>
          <div className="mt-5 flex items-end gap-3">
            {data.shipmentVolumeTrend.map((point) => (
              <div
                key={point.label}
                className="flex flex-1 flex-col items-center gap-2"
              >
                <div
                  className="w-full rounded-t-2xl bg-[var(--foreground)]/85"
                  style={{ height: `${point.value * 4}px` }}
                />
                <span className="text-xs text-[var(--muted)]">{point.label}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.26em] text-[var(--muted)]">Exception trend</p>
          <div className="mt-5 flex items-end gap-3">
            {data.exceptionTrend.map((point) => (
              <div
                key={point.label}
                className="flex flex-1 flex-col items-center gap-2"
              >
                <div
                  className="w-full rounded-t-2xl bg-amber-500/80"
                  style={{ height: `${point.value * 18}px` }}
                />
                <span className="text-xs text-[var(--muted)]">{point.label}</span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </>
  );
}
