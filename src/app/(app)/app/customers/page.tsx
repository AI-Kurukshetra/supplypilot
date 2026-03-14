import Link from "next/link";

import { deleteCustomerAction } from "@/app/(app)/app/customers/actions";
import { PageHeader } from "@/components/app/page-header";
import { requireAppContext } from "@/lib/auth/session";
import { getCustomersData } from "@/lib/domain/queries";

type SearchProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getSingleValue(value: string | string[] | undefined) {
  return typeof value === "string" ? value : undefined;
}

export default async function CustomersPage({ searchParams }: SearchProps) {
  const params = await searchParams;
  const context = await requireAppContext();
  const customers = await getCustomersData();
  const canManageCustomers = ["org_admin", "ops_manager"].includes(context.member.role);

  return (
    <>
      <PageHeader
        eyebrow="Customers"
        title="Customer accounts"
        description="Review shipment volume, delay exposure, and exception load across customer accounts."
        actions={
          canManageCustomers ? (
            <Link
              href="/app/customers/new"
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-[var(--border-strong)] bg-[var(--surface-strong)] px-4 text-sm font-semibold text-[var(--foreground)] shadow-[0_12px_30px_-18px_var(--shadow-color)] transition hover:-translate-y-0.5 hover:bg-[var(--surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
            >
              Add customer
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

            {canManageCustomers ? (
              <div className="mt-5 flex items-center gap-3">
                <Link
                  href={`/app/customers/${customer.id}/edit`}
                  className="inline-flex h-10 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--background)]"
                >
                  Edit
                </Link>
                <form action={deleteCustomerAction.bind(null, customer.id)}>
                  <button
                    type="submit"
                    className="inline-flex h-10 items-center justify-center rounded-2xl border border-[color:rgba(194,74,47,0.25)] bg-[color:rgba(194,74,47,0.08)] px-4 text-sm font-semibold text-[color:#c24a2f] transition hover:bg-[color:rgba(194,74,47,0.14)]"
                  >
                    Delete
                  </button>
                </form>
              </div>
            ) : null}
          </article>
        ))}
      </section>
    </>
  );
}
