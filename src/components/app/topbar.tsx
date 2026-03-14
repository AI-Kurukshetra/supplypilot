import Link from "next/link";

import { NotificationMenu } from "@/components/app/notification-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { signOutAction } from "@/app/(auth)/actions";
import type { NotificationRecord } from "@/lib/domain/types";

export function Topbar({
  fullName,
  roleLabel,
  unreadNotifications,
  notificationItems,
}: {
  fullName: string;
  roleLabel: string;
  unreadNotifications: number;
  notificationItems: NotificationRecord[];
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
        <NotificationMenu
          unreadNotifications={unreadNotifications}
          items={notificationItems}
        />
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
