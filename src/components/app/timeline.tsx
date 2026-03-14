import { formatDateTime } from "@/lib/utils";
import { cx } from "@/lib/utils";
import type { ShipmentEvent, ShipmentMilestone } from "@/lib/domain/types";

export function MilestoneTimeline({ milestones }: { milestones: ShipmentMilestone[] }) {
  return (
    <ol className="space-y-4">
      {milestones.map((milestone) => (
        <li
          key={milestone.id}
          className="flex gap-4 rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-4"
        >
          <div className="flex flex-col items-center">
            <span
              className={cx(
                "mt-1 h-3 w-3 rounded-full",
                milestone.status === "completed"
                  ? "bg-emerald-500"
                  : milestone.status === "late"
                    ? "bg-rose-500"
                    : "bg-[var(--border-strong)]",
              )}
            />
            <span className="mt-2 h-full w-px bg-[var(--border)]" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-[var(--foreground)]">{milestone.label}</h3>
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">
                Planned {formatDateTime(milestone.plannedAt)}
              </span>
            </div>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              {milestone.actualAt
                ? `Completed ${formatDateTime(milestone.actualAt)}`
                : milestone.status === "late"
                  ? "Missed threshold and requires operations follow-up."
                  : "Awaiting milestone completion."}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function EventFeed({ events }: { events: ShipmentEvent[] }) {
  return (
    <div className="space-y-3">
      {events.map((event) => (
        <article
          key={event.id}
          className="rounded-[22px] border border-[var(--border)] bg-[var(--surface)] p-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-[var(--foreground)]">{event.title}</h3>
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">
              {formatDateTime(event.occurredAt)}
            </span>
          </div>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{event.description}</p>
          <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">
            {event.source}
          </p>
        </article>
      ))}
    </div>
  );
}
