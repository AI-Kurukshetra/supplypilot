import { PageHeader } from "@/components/app/page-header";
import { getCustomersData } from "@/lib/domain/queries";

export default async function CustomersPage() {
  const customers = await getCustomersData();

  return (
    <>
      <PageHeader
        eyebrow="Customers"
        title="Customer accounts"
        description="Review shipment volume, delay exposure, and exception load across customer accounts."
      />
      <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {customers.map((customer) => (
          <article
            key={customer.id}
            className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-5"
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--muted)]">{customer.code}</p>
            <h2 className="mt-3 text-xl font-semibold tracking-[-0.04em] text-[var(--foreground)]">{customer.name}</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">{customer.contactName} · {customer.contactEmail}</p>
            <div className="mt-5 grid grid-cols-3 gap-3">
              <div className="rounded-[20px] border border-[var(--border)] bg-[var(--surface-strong)] p-3">
                <p className="text-lg font-semibold text-[var(--foreground)]">{customer.shipmentCount}</p>
                <p className="mt-1 text-xs text-[var(--muted)]">Shipments</p>
              </div>
              <div className="rounded-[20px] border border-[var(--border)] bg-[var(--surface-strong)] p-3">
                <p className="text-lg font-semibold text-[var(--foreground)]">{customer.delayedCount}</p>
                <p className="mt-1 text-xs text-[var(--muted)]">Delayed</p>
              </div>
              <div className="rounded-[20px] border border-[var(--border)] bg-[var(--surface-strong)] p-3">
                <p className="text-lg font-semibold text-[var(--foreground)]">{customer.openExceptions}</p>
                <p className="mt-1 text-xs text-[var(--muted)]">Exceptions</p>
              </div>
            </div>
          </article>
        ))}
      </section>
    </>
  );
}
