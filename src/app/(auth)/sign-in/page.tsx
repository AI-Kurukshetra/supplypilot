import Link from "next/link";

import { signInAction } from "@/app/(auth)/actions";

type SearchProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SignInPage({ searchParams }: SearchProps) {
  const params = await searchParams;
  const error = typeof params.error === "string" ? params.error : null;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-6 py-10 sm:px-8">
      <div className="grid w-full gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-[36px] border border-[var(--border)] bg-[var(--surface)] p-8 sm:p-10">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[var(--muted)]">SupplyPilot</p>
          <h1 className="mt-4 max-w-2xl text-5xl font-semibold tracking-[-0.06em] text-[var(--foreground)]">
            Enterprise visibility for shipments, delays, and customer commitments.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--muted)]">
            The authenticated product experience is the primary surface. Sign in to the operations
            console to manage shipments, customers, exceptions, documents, and notifications.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              ["50+", "tracked shipments"],
              ["4", "role types"],
              ["1", "customer-safe portal"],
            ].map(([value, label]) => (
              <div
                key={label}
                className="rounded-[24px] border border-[var(--border)] bg-[var(--surface-strong)] p-4"
              >
                <p className="text-2xl font-semibold tracking-[-0.05em] text-[var(--foreground)]">{value}</p>
                <p className="mt-2 text-sm text-[var(--muted)]">{label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[36px] border border-[var(--border)] bg-[var(--surface)] p-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.26em] text-[var(--muted)]">Sign in</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-[var(--foreground)]">
            Access the operations workspace
          </h2>
          <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
            Use your organization credentials to continue.
          </p>

          {error ? (
            <p className="mt-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-700 dark:text-rose-300">
              {error}
            </p>
          ) : null}

          <form
            action={signInAction}
            className="mt-6 space-y-4"
          >
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-[var(--foreground)]">Email</span>
              <input
                name="email"
                type="email"
                className="h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-4 text-sm outline-none transition focus:border-[var(--border-strong)] focus:ring-2 focus:ring-[var(--ring)]/20"
                required
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-[var(--foreground)]">Password</span>
              <input
                name="password"
                type="password"
                className="h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-4 text-sm outline-none transition focus:border-[var(--border-strong)] focus:ring-2 focus:ring-[var(--ring)]/20"
                required
              />
            </label>
            <button
              type="submit"
              className="btn btn-primary btn-full min-h-12"
            >
              Sign in
            </button>
          </form>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm text-[var(--muted)]">
            <Link
              href="/sign-up"
              className="font-medium text-[var(--foreground)]"
            >
              Create account
            </Link>
            <Link
              href="/portal"
              className="font-medium text-[var(--foreground)]"
            >
              Open customer portal
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
