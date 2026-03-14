type FilterOption = {
  label: string;
  value: string;
};

type FilterConfig = {
  name: string;
  label: string;
  options: FilterOption[];
};

export function FilterBar({
  searchDefaultValue,
  filters,
}: {
  searchDefaultValue?: string;
  filters: FilterConfig[];
}) {
  return (
    <form className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="grid gap-3 xl:grid-cols-[1.6fr_repeat(4,minmax(0,1fr))_auto]">
        <label className="flex flex-col gap-2">
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--muted)]">Search</span>
          <input
            type="search"
            name="query"
            defaultValue={searchDefaultValue}
            placeholder="Shipment ID or reference"
            className="h-11 rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-4 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--border-strong)] focus:ring-2 focus:ring-[var(--ring)]/20"
          />
        </label>

        {filters.map((filter) => (
          <label
            key={filter.name}
            className="flex flex-col gap-2"
          >
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--muted)]">
              {filter.label}
            </span>
            <select
              name={filter.name}
              className="h-11 rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-4 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--border-strong)] focus:ring-2 focus:ring-[var(--ring)]/20"
            >
              {filter.options.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        ))}

        <button
          type="submit"
          className="mt-auto inline-flex h-11 items-center justify-center rounded-2xl bg-[var(--foreground)] px-4 text-sm font-semibold text-[var(--background)] transition hover:opacity-90"
        >
          Apply filters
        </button>
      </div>
    </form>
  );
}
