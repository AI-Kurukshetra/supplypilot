import Link from "next/link";

import { KpiCard } from "@/components/app/kpi-card";
import { NotificationCenter } from "@/components/app/notification-center";
import { PageHeader } from "@/components/app/page-header";
import { RiskBadge, ShipmentStatusBadge } from "@/components/app/status-badge";
import { getDashboardData, getRiskSummary } from "@/lib/domain/queries";
import { formatDateTime, formatPercent, formatNumber, relativeTimeFromNow } from "@/lib/utils";
import { requireAppContext } from "@/lib/auth/session";

export default async function DashboardPage() {
  const [context, dashboardData, riskSummary] = await Promise.all([
    requireAppContext(),
    getDashboardData(),
    getRiskSummary(),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Dashboard"
        title="Supply chain control tower"
        description="Monitor active shipment risk, exception volume, ETA changes, and carrier performance from a single operations dashboard."
        actions={
          <Link
            href="/app/shipments"
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-[var(--foreground)] px-4 text-sm font-semibold text-[var(--background)] transition hover:opacity-90"
          >
            View shipments
          </Link>
        }
      />

      <section className="grid gap-4 xl:grid-cols-4">
        <KpiCard
          label="Total shipments"
          value={formatNumber(dashboardData.metrics.totalShipments)}
          delta="+8.2%"
          hint="Across active, delayed, and delivered loads in the current demo window."
        />
        <KpiCard
          label="On-time delivery"
          value={formatPercent(dashboardData.metrics.onTimeRate)}
          delta="+1.6 pts"
          hint="Measured against promised delivery date for completed shipments."
        />
        <KpiCard
          label="Delayed shipments"
          value={formatNumber(dashboardData.metrics.delayedShipments)}
          delta="-3 today"
          hint="Delayed loads should be reviewed against customer impact and escalation urgency."
        />
        <KpiCard
          label="Open exceptions"
          value={formatNumber(dashboardData.metrics.openExceptions)}
          delta="+4 auto-created"
          hint="Automated triggers create exceptions for stale tracking, missed milestones, and ETA breaches."
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <div className="space-y-6">
          <section className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.26em] text-[var(--muted)]">At-risk shipments</p>
                <h2 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-[var(--foreground)]">
                  Priority list for the next operational cycle
                </h2>
              </div>
              <Link
                href="/app/shipments"
                className="text-sm font-semibold text-[var(--foreground)]"
              >
                Open list
              </Link>
            </div>

            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[820px] text-left">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[11px] uppercase tracking-[0.22em] text-[var(--muted)]">
                    <th className="pb-3 font-mono">Shipment</th>
                    <th className="pb-3 font-mono">Customer</th>
                    <th className="pb-3 font-mono">ETA</th>
                    <th className="pb-3 font-mono">Status</th>
                    <th className="pb-3 font-mono">Risk</th>
                    <th className="pb-3 font-mono">Update age</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.atRiskShipments.map((shipment) => (
                    <tr
                      key={shipment.id}
                      className="border-b border-[var(--border)]/70 last:border-0"
                    >
                      <td className="py-4">
                        <Link
                          href={`/app/shipments/${shipment.id}`}
                          className="font-semibold text-[var(--foreground)]"
                        >
                          {shipment.shipmentReference}
                        </Link>
                        <p className="mt-1 text-xs text-[var(--muted)]">{shipment.originName} to {shipment.destinationName}</p>
                      </td>
                      <td className="py-4 text-sm text-[var(--foreground)]">{shipment.customer.name}</td>
                      <td className="py-4 text-sm text-[var(--foreground)]">{formatDateTime(shipment.eta)}</td>
                      <td className="py-4"><ShipmentStatusBadge status={shipment.status} /></td>
                      <td className="py-4"><RiskBadge risk={shipment.riskLevel} /></td>
                      <td className="py-4 text-sm text-[var(--muted)]">{relativeTimeFromNow(shipment.lastUpdateAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <div className="grid gap-6 xl:grid-cols-2">
            <section className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.26em] text-[var(--muted)]">Recent ETA changes</p>
              <div className="mt-4 space-y-3">
                {dashboardData.etaChangeFeed.map((event) => (
                  <article
                    key={event.id}
                    className="rounded-[22px] border border-[var(--border)] bg-[var(--surface-strong)] p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-semibold text-[var(--foreground)]">
                          {event.shipment.shipmentReference}
                        </h3>
                        <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{event.description}</p>
                      </div>
                      <span className="text-xs text-[var(--muted)]">{formatDateTime(event.occurredAt)}</span>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.26em] text-[var(--muted)]">Open exceptions snapshot</p>
              <div className="mt-4 space-y-3">
                {dashboardData.openExceptions.map((exceptionRecord) => (
                  <article
                    key={exceptionRecord.id}
                    className="rounded-[22px] border border-[var(--border)] bg-[var(--surface-strong)] p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-[var(--foreground)]">{exceptionRecord.title}</p>
                        <p className="mt-1 text-sm text-[var(--muted)]">
                          {exceptionRecord.customer.name} on {exceptionRecord.shipment.shipmentReference}
                        </p>
                      </div>
                      <RiskBadge risk={exceptionRecord.riskLevel} />
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </div>

        <div className="space-y-6">
          <NotificationCenter
            unreadCount={context.notifications.unreadCount}
            items={context.notifications.items}
          />

          <section className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.26em] text-[var(--muted)]">Carrier performance</p>
            <div className="mt-4 space-y-3">
              {dashboardData.carrierPerformance.map((carrier) => (
                <article
                  key={carrier.id}
                  className="rounded-[22px] border border-[var(--border)] bg-[var(--surface-strong)] p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[var(--foreground)]">{carrier.name}</p>
                      <p className="mt-1 text-xs text-[var(--muted)]">{carrier.mode} carrier</p>
                    </div>
                    <p className="text-lg font-semibold tracking-[-0.04em] text-[var(--foreground)]">
                      {formatPercent(carrier.onTimeRate)}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.26em] text-[var(--muted)]">Risk distribution</p>
            <div className="mt-4 space-y-3">
              {riskSummary.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-[20px] border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-3"
                >
                  <span className="text-sm font-medium text-[var(--foreground)]">{item.label}</span>
                  <span className="text-sm text-[var(--muted)]">{item.value} shipments</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>
    </>
  );
}
