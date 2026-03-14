import { formatDateTime } from "@/lib/utils";
import type { NotificationRecord } from "@/lib/domain/types";

function formatChannelLabel(channel: NotificationRecord["channel"]) {
  return channel === "in_app" ? "In-app" : "Email";
}

export function NotificationFeed({
  items,
  emptyMessage = "No notifications available right now.",
  compact = false,
}: {
  items: NotificationRecord[];
  emptyMessage?: string;
  compact?: boolean;
}) {
  if (!items.length) {
    return (
      <div className="rounded-[22px] border border-dashed border-[var(--border-strong)] bg-[var(--surface-strong)] p-5 text-sm text-[var(--muted)]">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <article
          key={item.id}
          className="rounded-[22px] border border-[var(--border)] bg-[var(--surface-strong)] p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[var(--foreground)]">{item.title}</p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{item.body}</p>
            </div>
            {!item.readAt ? (
              compact ? (
                <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--accent-strong)]" />
              ) : (
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">Unread</span>
              )
            ) : null}
          </div>
          <div className="mt-3 flex items-center justify-between gap-3 text-xs text-[var(--muted)]">
            <span>{formatChannelLabel(item.channel)}</span>
            <span>{formatDateTime(item.createdAt)}</span>
          </div>
        </article>
      ))}
    </div>
  );
}
