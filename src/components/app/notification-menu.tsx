"use client";

import { useEffect, useRef, useState } from "react";

import { NotificationFeed } from "@/components/app/notification-feed";
import type { NotificationRecord } from "@/lib/domain/types";

export function NotificationMenu({
  unreadNotifications,
  items,
}: {
  unreadNotifications: number;
  items: NotificationRecord[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative shrink-0"
    >
      <button
        type="button"
        aria-label={`Notifications: ${unreadNotifications} unread`}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
        className="btn btn-secondary px-3.5 font-medium"
      >
        <span
          aria-hidden="true"
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-strong)]"
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
            <path d="M15 17h5l-1.4-1.4a2 2 0 0 1-.6-1.42V11a6 6 0 1 0-12 0v3.18a2 2 0 0 1-.6 1.42L4 17h5" />
            <path d="M9.73 21a2.75 2.75 0 0 0 4.54 0" />
          </svg>
        </span>
        <span className="hidden 2xl:inline">Notifications</span>
        <span className="rounded-full bg-[var(--foreground)] px-2 py-0.5 text-xs font-semibold text-[var(--background)]">
          {unreadNotifications}
        </span>
      </button>

      {isOpen ? (
        <div className="absolute right-0 z-30 mt-3 w-[24rem] max-w-[calc(100vw-2rem)] rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[0_24px_80px_-32px_var(--shadow-color)] backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--muted)]">Notifications</p>
              <p className="mt-2 text-sm text-[var(--muted)]">{unreadNotifications} unread</p>
            </div>
          </div>

          <div className="mt-4 max-h-[24rem] space-y-3 overflow-y-auto pr-1">
            <NotificationFeed
              items={items}
              compact
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
