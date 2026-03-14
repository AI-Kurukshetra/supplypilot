import { NotificationFeed } from "@/components/app/notification-feed";
import type { NotificationRecord } from "@/lib/domain/types";

export function NotificationCenter({
  unreadCount,
  items,
}: {
  unreadCount: number;
  items: NotificationRecord[];
}) {
  return (
    <section className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.26em] text-[var(--muted)]">
            Notification center
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-[var(--foreground)]">
            {unreadCount} unread notifications
          </h2>
        </div>
        <span className="rounded-full border border-[var(--border)] bg-[var(--surface-strong)] px-3 py-1 font-mono text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
          In-app + email
        </span>
      </div>
      <div className="mt-4 space-y-3">
        <NotificationFeed items={items.slice(0, 5)} />
      </div>
    </section>
  );
}
