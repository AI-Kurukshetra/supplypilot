import Link from "next/link";

import { EmptyState } from "@/components/app/empty-state";
import { PortalSearchForm } from "@/components/portal/portal-search-form";
import { demoData } from "@/lib/domain/demo-data";
import { getPortalShipment, getShipmentSearchSuggestions } from "@/lib/domain/queries";

type SearchProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PortalHomePage({ searchParams }: SearchProps) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q : "";
  const [match, searchSuggestions] = await Promise.all([
    query ? getPortalShipment(query) : Promise.resolve(null),
    getShipmentSearchSuggestions({ limit: 12, includeTrackingTokens: true }),
  ]);

  return (
    <div className="space-y-6">
      <section className="rounded-[36px] border border-[var(--border)] bg-[var(--surface)] p-8 sm:p-10">
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--muted)]">SupplyPilot portal</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-[var(--foreground)]">
          Customer-safe shipment tracking
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--muted)]">
          Search by shipment reference or tracking token. Only customer-visible milestones, updates,
          and permitted documents appear here.
        </p>

        <PortalSearchForm
          defaultValue={query}
          searchSuggestions={searchSuggestions}
        />
      </section>

      {query ? (
        match ? (
          <section className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--muted)]">Search result</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-[var(--foreground)]">
              {match.shipment.shipmentReference}
            </h2>
            <p className="mt-3 text-sm text-[var(--muted)]">{match.customer.name}</p>
            <Link
              href={`/portal/${match.shipment.shipmentReference}`}
              className="mt-5 inline-flex h-11 items-center justify-center rounded-2xl bg-[var(--foreground)] px-4 text-sm font-semibold text-[var(--background)] transition hover:opacity-90"
            >
              Open tracking page
            </Link>
          </section>
        ) : (
          <EmptyState
            title="No shipment matched that reference"
            description="Check the shipment reference or token and try again. The portal only returns customer-visible shipment records."
          />
        )
      ) : (
        <section className="grid gap-4 md:grid-cols-3">
          {demoData.shipments.slice(0, 3).map((shipment) => (
            <article
              key={shipment.id}
              className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-5"
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--muted)]">Sample reference</p>
              <h2 className="mt-3 text-xl font-semibold tracking-[-0.04em] text-[var(--foreground)]">
                {shipment.shipmentReference}
              </h2>
              <p className="mt-2 text-sm text-[var(--muted)]">{shipment.trackingToken}</p>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
