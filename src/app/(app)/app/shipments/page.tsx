import Link from "next/link";

import { requireAppContext } from "@/lib/auth/session";
import { FilterBar } from "@/components/app/filter-bar";
import { PageHeader } from "@/components/app/page-header";
import { RiskBadge, ShipmentStatusBadge } from "@/components/app/status-badge";
import { demoData } from "@/lib/domain/demo-data";
import { getShipmentList, getShipmentSearchSuggestions } from "@/lib/domain/queries";
import { formatDateTime } from "@/lib/utils";

type SearchProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getSingleValue(value: string | string[] | undefined) {
  return typeof value === "string" ? value : undefined;
}

export default async function ShipmentsPage({ searchParams }: SearchProps) {
  const params = await searchParams;
  const context = await requireAppContext();
  const [list, searchSuggestions] = await Promise.all([
    getShipmentList({
      query: getSingleValue(params.query),
      status: (getSingleValue(params.status) as typeof demoData.shipments[number]["status"] | "all" | undefined) ?? "all",
      risk: (getSingleValue(params.risk) as typeof demoData.shipments[number]["riskLevel"] | "all" | undefined) ?? "all",
      customerId: getSingleValue(params.customerId) ?? "all",
      carrierId: getSingleValue(params.carrierId) ?? "all",
      dateRange: (getSingleValue(params.dateRange) as "today" | "7d" | "30d" | "90d" | "all" | undefined) ?? "all",
      page: Number(getSingleValue(params.page) ?? "1"),
    }),
    getShipmentSearchSuggestions({ limit: 12 }),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Shipments"
        title="Operational shipment list"
        description="Filter by customer, carrier, status, risk, and delivery window. The table is optimized for dense daily operations work."
        actions={
          context.member.role === "org_admin" ? (
            <Link
              href="/app/shipments/new"
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-[var(--border-strong)] bg-[var(--surface-strong)] px-4 text-sm font-semibold text-[var(--foreground)] shadow-[0_12px_30px_-18px_var(--shadow-color)] transition hover:-translate-y-0.5 hover:bg-[var(--surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
            >
              Add shipment
            </Link>
          ) : null
        }
      />

      {getSingleValue(params.message) ? (
        <section
          className={
            getSingleValue(params.status) === "error"
              ? "rounded-[24px] border border-[color:rgba(194,74,47,0.25)] bg-[color:rgba(194,74,47,0.08)] px-4 py-3 text-sm text-[color:#c24a2f]"
              : "rounded-[24px] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)]"
          }
        >
          {getSingleValue(params.message)}
        </section>
      ) : null}

      <FilterBar
        searchDefaultValue={getSingleValue(params.query)}
        searchSuggestions={searchSuggestions}
        filters={[
          {
            name: "status",
            label: "Status",
            selectedValue: getSingleValue(params.status) ?? "all",
            options: [{ label: "All statuses", value: "all" }, ...["planned", "booked", "in_transit", "at_hub", "out_for_delivery", "delayed", "delivered", "exception"].map((value) => ({ label: value.replaceAll("_", " "), value }))],
          },
          {
            name: "risk",
            label: "Risk",
            selectedValue: getSingleValue(params.risk) ?? "all",
            options: [{ label: "All risk", value: "all" }, ...["low", "medium", "high", "critical"].map((value) => ({ label: value, value }))],
          },
          {
            name: "customerId",
            label: "Customer",
            selectedValue: getSingleValue(params.customerId) ?? "all",
            options: [{ label: "All customers", value: "all" }, ...demoData.customers.map((item) => ({ label: item.name, value: item.id }))],
          },
          {
            name: "carrierId",
            label: "Carrier",
            selectedValue: getSingleValue(params.carrierId) ?? "all",
            options: [{ label: "All carriers", value: "all" }, ...demoData.carriers.map((item) => ({ label: item.name, value: item.id }))],
          },
          {
            name: "dateRange",
            label: "Date range",
            selectedValue: getSingleValue(params.dateRange) ?? "all",
            options: [
              { label: "All", value: "all" },
              { label: "Today", value: "today" },
              { label: "Last 7 days", value: "7d" },
              { label: "Last 30 days", value: "30d" },
              { label: "Last 90 days", value: "90d" },
            ],
          },
        ]}
      />

      <section className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.26em] text-[var(--muted)]">Results</p>
            <h2 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-[var(--foreground)]">
              {list.total} shipments found
            </h2>
          </div>
          <p className="text-sm text-[var(--muted)]">Page {list.currentPage} of {list.pageCount}</p>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[1160px] text-left">
            <thead>
              <tr className="border-b border-[var(--border)] text-[11px] uppercase tracking-[0.22em] text-[var(--muted)]">
                <th className="pb-3 font-mono">Reference</th>
                <th className="pb-3 font-mono">Order</th>
                <th className="pb-3 font-mono">Customer</th>
                <th className="pb-3 font-mono">Carrier</th>
                <th className="pb-3 font-mono">Route</th>
                <th className="pb-3 font-mono">ETA</th>
                <th className="pb-3 font-mono">Status</th>
                <th className="pb-3 font-mono">Risk</th>
                <th className="pb-3 font-mono">Last update</th>
              </tr>
            </thead>
            <tbody>
              {list.items.map((shipment) => (
                <tr
                  key={shipment.id}
                  className="border-b border-[var(--border)]/70 align-top last:border-0"
                >
                  <td className="py-4">
                    <Link
                      href={`/app/shipments/${shipment.id}`}
                      className="font-semibold text-[var(--foreground)]"
                    >
                      {shipment.shipmentReference}
                    </Link>
                    <p className="mt-1 text-xs text-[var(--muted)]">{shipment.externalReference}</p>
                  </td>
                  <td className="py-4 text-sm text-[var(--foreground)]">{shipment.orderNumber}</td>
                  <td className="py-4 text-sm text-[var(--foreground)]">{shipment.customer.name}</td>
                  <td className="py-4 text-sm text-[var(--foreground)]">{shipment.carrier.name}</td>
                  <td className="py-4 text-sm text-[var(--muted)]">{shipment.originName} to {shipment.destinationName}</td>
                  <td className="py-4 text-sm text-[var(--foreground)]">{formatDateTime(shipment.eta)}</td>
                  <td className="py-4"><ShipmentStatusBadge status={shipment.status} /></td>
                  <td className="py-4"><RiskBadge risk={shipment.riskLevel} /></td>
                  <td className="py-4 text-sm text-[var(--muted)]">{formatDateTime(shipment.lastUpdateAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
