import { PageHeader } from "@/components/app/page-header";
import { getCarriersData } from "@/lib/domain/queries";
import { formatPercent } from "@/lib/utils";

export default async function CarriersPage() {
  const carriers = await getCarriersData();

  return (
    <>
      <PageHeader
        eyebrow="Carriers"
        title="Carrier performance"
        description="Benchmark service partners by volume, on-time rate, and active exception burden."
      />
      <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {carriers.map((carrier) => (
          <article
            key={carrier.id}
            className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-5"
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--muted)]">{carrier.scac}</p>
            <h2 className="mt-3 text-xl font-semibold tracking-[-0.04em] text-[var(--foreground)]">{carrier.name}</h2>
            <div className="mt-5 grid grid-cols-3 gap-3">
              <div className="rounded-[20px] border border-[var(--border)] bg-[var(--surface-strong)] p-3">
                <p className="text-lg font-semibold text-[var(--foreground)]">{carrier.shipmentCount}</p>
                <p className="mt-1 text-xs text-[var(--muted)]">Volume</p>
              </div>
              <div className="rounded-[20px] border border-[var(--border)] bg-[var(--surface-strong)] p-3">
                <p className="text-lg font-semibold text-[var(--foreground)]">{formatPercent(carrier.onTimeRate)}</p>
                <p className="mt-1 text-xs text-[var(--muted)]">On-time</p>
              </div>
              <div className="rounded-[20px] border border-[var(--border)] bg-[var(--surface-strong)] p-3">
                <p className="text-lg font-semibold text-[var(--foreground)]">{carrier.delayedCount}</p>
                <p className="mt-1 text-xs text-[var(--muted)]">Delayed</p>
              </div>
            </div>
          </article>
        ))}
      </section>
    </>
  );
}
