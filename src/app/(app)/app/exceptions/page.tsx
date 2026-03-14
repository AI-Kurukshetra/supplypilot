import { PageHeader } from "@/components/app/page-header";
import { ExceptionStatusBadge, ExceptionTypeBadge, RiskBadge } from "@/components/app/status-badge";
import { getExceptionsDashboard } from "@/lib/domain/queries";
import { formatDateTime } from "@/lib/utils";

export default async function ExceptionsPage() {
  const data = await getExceptionsDashboard();

  return (
    <>
      <PageHeader
        eyebrow="Exceptions"
        title="Exception management"
        description="Track auto-created and manually managed issues by severity, owner, carrier, and customer."
      />

      <section className="grid gap-4 xl:grid-cols-4">
        {[
          ["Open exceptions", String(data.metrics.openCount)],
          ["Critical", String(data.metrics.criticalCount)],
          ["Investigating", String(data.metrics.investigatingCount)],
          ["Avg resolution", `${data.metrics.averageResolutionHours.toFixed(1)}h`],
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

      <section className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-5">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left">
            <thead>
              <tr className="border-b border-[var(--border)] text-[11px] uppercase tracking-[0.22em] text-[var(--muted)]">
                <th className="pb-3 font-mono">Issue</th>
                <th className="pb-3 font-mono">Shipment</th>
                <th className="pb-3 font-mono">Customer</th>
                <th className="pb-3 font-mono">Carrier</th>
                <th className="pb-3 font-mono">Type</th>
                <th className="pb-3 font-mono">Status</th>
                <th className="pb-3 font-mono">Risk</th>
                <th className="pb-3 font-mono">Owner</th>
                <th className="pb-3 font-mono">Updated</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-[var(--border)]/70 align-top last:border-0"
                >
                  <td className="py-4">
                    <p className="font-semibold text-[var(--foreground)]">{item.title}</p>
                    <p className="mt-1 text-xs text-[var(--muted)]">{item.description}</p>
                  </td>
                  <td className="py-4 text-sm text-[var(--foreground)]">{item.shipment.shipmentReference}</td>
                  <td className="py-4 text-sm text-[var(--foreground)]">{item.customer.name}</td>
                  <td className="py-4 text-sm text-[var(--foreground)]">{item.carrier.name}</td>
                  <td className="py-4"><ExceptionTypeBadge type={item.type} /></td>
                  <td className="py-4"><ExceptionStatusBadge status={item.status} /></td>
                  <td className="py-4"><RiskBadge risk={item.riskLevel} /></td>
                  <td className="py-4 text-sm text-[var(--muted)]">{item.owner?.fullName ?? "Unassigned"}</td>
                  <td className="py-4 text-sm text-[var(--muted)]">{formatDateTime(item.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
