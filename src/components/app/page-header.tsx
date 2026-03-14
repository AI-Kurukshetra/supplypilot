export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--muted)]">{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-[var(--foreground)]">{title}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--muted)]">{description}</p>
      </div>
      {actions ? <div className="flex items-center gap-3">{actions}</div> : null}
    </div>
  );
}
