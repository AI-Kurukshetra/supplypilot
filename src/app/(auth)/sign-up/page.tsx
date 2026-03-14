import Link from "next/link";

import { signUpAction } from "@/app/(auth)/actions";

type SearchProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SignUpPage({ searchParams }: SearchProps) {
  const params = await searchParams;
  const error = typeof params.error === "string" ? params.error : null;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center px-6 py-10 sm:px-8">
      <section className="grid w-full gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[36px] border border-[var(--border)] bg-[var(--surface)] p-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--muted)]">New organization</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-[var(--foreground)]">
            Start SupplyPilot with a clean operational foundation.
          </h1>
          <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
            Create your account now. The next step will create the first organization and establish
            the initial admin role for your workspace.
          </p>
          <ul className="mt-6 space-y-3 text-sm text-[var(--muted)]">
            <li className="rounded-[20px] border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-3">
              Multi-tenant schema and RLS-ready data model
            </li>
            <li className="rounded-[20px] border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-3">
              Internal control tower and customer portal experiences
            </li>
            <li className="rounded-[20px] border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-3">
              Notification and exception workflows ready for iteration
            </li>
          </ul>
        </div>

        <div className="rounded-[36px] border border-[var(--border)] bg-[var(--surface)] p-8">
          <h2 className="text-2xl font-semibold tracking-[-0.04em] text-[var(--foreground)]">Create your account</h2>
          {error ? (
            <p className="mt-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-700 dark:text-rose-300">
              {error}
            </p>
          ) : null}

          <form
            action={signUpAction}
            className="mt-6 space-y-4"
          >
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-[var(--foreground)]">Full name</span>
              <input
                name="fullName"
                type="text"
                className="h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-4 text-sm outline-none transition focus:border-[var(--border-strong)] focus:ring-2 focus:ring-[var(--ring)]/20"
                required
              />
            </label>
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
              className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-[var(--foreground)] px-4 text-sm font-semibold text-[var(--background)] transition hover:opacity-90"
            >
              Continue to onboarding
            </button>
          </form>

          <p className="mt-5 text-sm text-[var(--muted)]">
            Already have access?{" "}
            <Link
              href="/sign-in"
              className="font-semibold text-[var(--foreground)]"
            >
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
