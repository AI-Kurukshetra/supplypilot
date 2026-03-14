export function KpiCard({
  label,
  value,
  delta,
  hint,
}: {
  label: string;
  value: string;
  delta: string;
  hint: string;
}) {
  return (
    <article className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_18px_60px_-42px_var(--shadow-color)]">
      <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--muted)]">{label}</p>
      <div className="mt-3 flex items-end justify-between gap-4">
        <p className="text-3xl font-semibold tracking-[-0.05em] text-[var(--foreground)]">{value}</p>
        <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
          {delta}
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{hint}</p>
    </article>
  );
}
