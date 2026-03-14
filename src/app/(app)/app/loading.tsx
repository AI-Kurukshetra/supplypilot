export default function AppLoading() {
  return (
    <div className="grid gap-4">
      <div className="h-24 animate-pulse rounded-[28px] border border-[var(--border)] bg-[var(--surface)]" />
      <div className="grid gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-32 animate-pulse rounded-[28px] border border-[var(--border)] bg-[var(--surface)]"
          />
        ))}
      </div>
      <div className="h-[420px] animate-pulse rounded-[28px] border border-[var(--border)] bg-[var(--surface)]" />
    </div>
  );
}
