"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useRef, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type { SearchSuggestion } from "@/lib/domain/types";

export function PortalSearchForm({
  defaultValue,
  searchSuggestions,
}: {
  defaultValue?: string;
  searchSuggestions: SearchSuggestion[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isPending, startTransition] = useTransition();
  const searchListId = "portal-search-suggestions";

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  function navigate(nextQuery: string) {
    const params = new URLSearchParams(searchParams.toString());
    const normalizedQuery = nextQuery.trim();

    if (normalizedQuery) {
      params.set("q", normalizedQuery);
    } else {
      params.delete("q");
    }

    const target = params.toString() ? `${pathname}?${params.toString()}` : pathname;

    startTransition(() => {
      router.replace(target, { scroll: false });
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const query = formData.get("q");
    navigate(typeof query === "string" ? query : "");
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      navigate(event.target.value);
    }, 250);
  }

  return (
    <form
      className="mt-6 flex flex-col gap-3 sm:flex-row"
      onSubmit={handleSubmit}
    >
      <input
        key={defaultValue ?? ""}
        type="search"
        name="q"
        defaultValue={defaultValue}
        onChange={handleChange}
        list={searchListId}
        autoComplete="off"
        placeholder="Enter shipment reference or token"
        className="h-12 flex-1 rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-4 text-sm outline-none transition focus:border-[var(--border-strong)] focus:ring-2 focus:ring-[var(--ring)]/20"
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
      <button
        type="submit"
        disabled={isPending}
        className="btn btn-primary min-h-12 px-5"
      >
        {isPending ? "Searching..." : "Search"}
      </button>
    </form>
  );
}
