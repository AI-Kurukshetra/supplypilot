import { completeOnboardingAction } from "@/app/(auth)/actions";
import { slugify } from "@/lib/utils";

type SearchProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function OnboardingPage({ searchParams }: SearchProps) {
  const params = await searchParams;
  const error = typeof params.error === "string" ? params.error : null;
  const defaultName = "Northstar Logistics Group";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl items-center px-6 py-10 sm:px-8">
      <section className="w-full rounded-[36px] border border-[var(--border)] bg-[var(--surface)] p-8 sm:p-10">
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--muted)]">Onboarding</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-[var(--foreground)]">
          Create the first SupplyPilot organization
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--muted)]">
          This establishes the tenant boundary for customers, carriers, shipments, documents, and
          notification workflows.
        </p>

        {error ? (
          <p className="mt-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-700 dark:text-rose-300">
            {error}
          </p>
        ) : null}

        <form
          action={completeOnboardingAction}
          className="mt-8 grid gap-4 sm:grid-cols-2"
        >
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-[var(--foreground)]">Organization name</span>
            <input
              name="organizationName"
              type="text"
              defaultValue={defaultName}
              className="h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-4 text-sm outline-none transition focus:border-[var(--border-strong)] focus:ring-2 focus:ring-[var(--ring)]/20"
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-[var(--foreground)]">Organization slug</span>
            <input
              name="organizationSlug"
              type="text"
              defaultValue={slugify(defaultName)}
              className="h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-4 text-sm outline-none transition focus:border-[var(--border-strong)] focus:ring-2 focus:ring-[var(--ring)]/20"
              required
            />
          </label>

          <div className="sm:col-span-2">
            <button
              type="submit"
              className="btn btn-primary min-h-12 px-5"
            >
              Create organization
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
