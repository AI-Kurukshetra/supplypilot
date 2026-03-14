"use client";

import { useEffect } from "react";

type Theme = "light" | "dark";

function getPreferredTheme(): Theme {
  if (typeof window === "undefined") {
    return "light";
  }

  const rootTheme = document.documentElement.dataset.theme;
  if (rootTheme === "light" || rootTheme === "dark") {
    return rootTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
  window.localStorage.setItem("theme", theme);
  document.cookie = `theme=${theme}; path=/; max-age=31536000; samesite=lax`;
}

export function ThemeToggle() {
  useEffect(() => {
    applyTheme(getPreferredTheme());
  }, []);

  function toggleTheme() {
    const updatedTheme = getPreferredTheme() === "light" ? "dark" : "light";
    applyTheme(updatedTheme);
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle light and dark mode"
      className="inline-flex h-11 items-center gap-3 rounded-full border border-[var(--border-strong)] bg-[var(--surface)] px-4 text-sm font-medium text-[var(--foreground)] shadow-[0_12px_30px_-18px_var(--shadow-color)] transition hover:-translate-y-0.5 hover:bg-[var(--surface-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
    >
      <span
        aria-hidden="true"
        className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--surface-strong)] text-[var(--foreground)]"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 3v2.25" />
          <path d="M12 18.75V21" />
          <path d="M5.64 5.64l1.59 1.59" />
          <path d="M16.77 16.77l1.59 1.59" />
          <path d="M3 12h2.25" />
          <path d="M18.75 12H21" />
          <path d="M5.64 18.36l1.59-1.59" />
          <path d="M16.77 7.23l1.59-1.59" />
          <circle cx="12" cy="12" r="3.25" />
        </svg>
      </span>
      <span
        aria-hidden="true"
        className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)]"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 12.8A8.95 8.95 0 0 1 11.2 3a9 9 0 1 0 9.8 9.8Z" />
        </svg>
      </span>
      <span>Theme</span>
    </button>
  );
}
