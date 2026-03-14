import Link from "next/link";

import { ThemeToggle } from "@/components/theme-toggle";
import { signOutAction } from "@/app/(auth)/actions";

export function Topbar({
  fullName,
  roleLabel,
  unreadNotifications,
}: {
  fullName: string;
  roleLabel: string;
  unreadNotifications: number;
}) {
  return (
    <header className="flex flex-col gap-4 border-b border-[var(--border)] bg-[var(--background)]/80 px-5 py-4 backdrop-blur lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--muted)]">Operations workspace</p>
        <h2 className="mt-1 text-lg font-semibold tracking-[-0.03em] text-[var(--foreground)]">
          Manage shipments, exceptions, and customer updates from one console.
        </h2>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/portal"
          className="inline-flex h-11 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm font-medium text-[var(--foreground)] transition hover:bg-[var(--surface-strong)]"
        >
          Customer portal
        </Link>
        <div className="inline-flex h-11 items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm">
          <span className="font-medium text-[var(--foreground)]">{fullName}</span>
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">{roleLabel}</span>
        </div>
        <div className="inline-flex h-11 items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm">
          <span className="font-medium text-[var(--foreground)]">Notifications</span>
          <span className="rounded-full bg-[var(--foreground)] px-2 py-0.5 text-xs font-semibold text-[var(--background)]">
            {unreadNotifications}
          </span>
        </div>
        <ThemeToggle />
        <form action={signOutAction}>
          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm font-medium text-[var(--foreground)] transition hover:bg-[var(--surface-strong)]"
          >
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
