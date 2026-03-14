"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useRef, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type FilterOption = {
  label: string;
  value: string;
};

type FilterConfig = {
  name: string;
  label: string;
  options: FilterOption[];
  selectedValue?: string;
};

type SearchSuggestion = {
  value: string;
  label?: string;
};

export function FilterBar({
  searchDefaultValue,
  filters,
  searchSuggestions = [],
}: {
  searchDefaultValue?: string;
  filters: FilterConfig[];
  searchSuggestions?: SearchSuggestion[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const formRef = useRef<HTMLFormElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isPending, startTransition] = useTransition();
  const searchListId = "shipment-search-suggestions";

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  function buildQueryString(nextQuery?: string) {
    const params = new URLSearchParams(searchParams.toString());
    const form = formRef.current;
    let formQuery: FormDataEntryValue | null = null;

    if (form) {
      const formData = new FormData(form);
      formQuery = formData.get("query");

      for (const filter of filters) {
        const value = formData.get(filter.name);
        if (typeof value !== "string" || value === "" || value === "all") {
          params.delete(filter.name);
          continue;
        }

        params.set(filter.name, value);
      }
    }

    const normalizedQuery =
      typeof nextQuery === "string"
        ? nextQuery.trim()
        : typeof formQuery === "string"
          ? formQuery.trim()
          : "";
    if (normalizedQuery) {
      params.set("query", normalizedQuery);
    } else {
      params.delete("query");
    }

    params.delete("page");

    return params.toString();
  }

  function navigate(nextQuery?: string) {
    const queryString = buildQueryString(nextQuery);
    const target = queryString ? `${pathname}?${queryString}` : pathname;

    startTransition(() => {
      router.replace(target, { scroll: false });
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    navigate();
  }

  function handleSearchChange(event: ChangeEvent<HTMLInputElement>) {
    const nextValue = event.target.value;

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      navigate(nextValue);
    }, 250);
  }

  return (
    <form
      ref={formRef}
      className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-4"
      onSubmit={handleSubmit}
    >
      <div className="grid gap-3 xl:grid-cols-[1.6fr_repeat(4,minmax(0,1fr))_auto]">
        <label className="flex flex-col gap-2">
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--muted)]">Search</span>
          <input
            key={searchDefaultValue ?? ""}
            type="search"
            name="query"
            defaultValue={searchDefaultValue}
            onChange={handleSearchChange}
            list={searchListId}
            autoComplete="off"
            placeholder="Shipment ID or reference"
            className="h-11 rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-4 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--border-strong)] focus:ring-2 focus:ring-[var(--ring)]/20"
          />
          <datalist id={searchListId}>
            {searchSuggestions.map((suggestion) => (
              <option
                key={suggestion.value}
                value={suggestion.value}
                label={suggestion.label}
              />
            ))}
          </datalist>
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
              defaultValue={filter.selectedValue ?? filter.options[0]?.value}
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
          disabled={isPending}
          className="mt-auto inline-flex h-11 items-center justify-center rounded-2xl bg-[var(--foreground)] px-4 text-sm font-semibold text-[var(--background)] transition hover:opacity-90"
        >
          {isPending ? "Updating..." : "Apply filters"}
        </button>
      </div>
    </form>
  );
}
