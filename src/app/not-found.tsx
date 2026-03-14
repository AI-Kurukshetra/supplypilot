import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl items-center px-6 py-10 sm:px-8">
      <section className="w-full rounded-[36px] border border-[var(--border)] bg-[var(--surface)] p-8 text-center sm:p-10">
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--muted)]">Not found</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-[var(--foreground)]">
          The requested SupplyPilot page does not exist.
        </h1>
        <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
          Return to the authenticated workspace or the customer portal.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/app"
            className="btn btn-primary"
          >
            Go to dashboard
          </Link>
          <Link
            href="/portal"
            className="btn btn-secondary"
          >
            Go to portal
          </Link>
        </div>
      </section>
    </main>
  );
}
