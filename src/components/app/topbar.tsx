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
    <header className="flex flex-col gap-4 border-b border-[var(--border)] bg-[var(--background)]/80 px-5 py-4 backdrop-blur xl:flex-row xl:items-center xl:justify-between">
      <div className="min-w-0 flex-1">
        <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--muted)]">Operations workspace</p>
      </div>

      <div className="flex flex-nowrap items-center gap-3 overflow-x-auto pb-1 xl:shrink-0 xl:overflow-visible">
        <Link
          href="/portal"
          className="btn btn-secondary shrink-0 font-medium"
        >
          Customer portal
        </Link>
        <div className="inline-flex h-11 shrink-0 items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm">
          <span className="max-w-[11rem] truncate font-medium text-[var(--foreground)]">{fullName}</span>
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">{roleLabel}</span>
        </div>
        <button
          type="button"
          aria-label={`Notifications: ${unreadNotifications} unread`}
          className="btn btn-secondary shrink-0 px-3.5 font-medium"
        >
          <span
            aria-hidden="true"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-strong)]"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 17h5l-1.4-1.4a2 2 0 0 1-.6-1.42V11a6 6 0 1 0-12 0v3.18a2 2 0 0 1-.6 1.42L4 17h5" />
              <path d="M9.73 21a2.75 2.75 0 0 0 4.54 0" />
            </svg>
          </span>
          <span className="hidden 2xl:inline">Notifications</span>
          <span className="rounded-full bg-[var(--foreground)] px-2 py-0.5 text-xs font-semibold text-[var(--background)]">
            {unreadNotifications}
          </span>
        </button>
        <ThemeToggle />
        <form action={signOutAction}>
          <button
            type="submit"
            className="btn btn-secondary shrink-0 font-medium"
          >
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
