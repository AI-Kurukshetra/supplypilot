import { formatDateTime } from "@/lib/utils";
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
        {items.slice(0, 5).map((item) => (
          <article
            key={item.id}
            className="rounded-[22px] border border-[var(--border)] bg-[var(--surface-strong)] p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-[var(--foreground)]">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{item.body}</p>
              </div>
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">
                {item.readAt ? "Read" : "Unread"}
              </span>
            </div>
            <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">
              {formatDateTime(item.createdAt)}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
