"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { SupplyPilotLogo } from "@/components/brand/supplypilot-logo";
import { appNavigation } from "@/lib/navigation";
import { cx } from "@/lib/utils";

function NavigationIcon({ href }: { href: string }) {
  const className = "h-4 w-4";

  switch (href) {
    case "/app":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M3 13.5 12 5l9 8.5" />
          <path d="M5.5 11.5V20h13V11.5" />
        </svg>
      );
    case "/app/shipments":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M3.5 7.5h11v9h-11z" />
          <path d="M14.5 10.5h3l2 2v4h-5z" />
          <circle cx="8" cy="18" r="1.5" />
          <circle cx="17" cy="18" r="1.5" />
        </svg>
      );
    case "/app/exceptions":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 4 21 20H3Z" />
          <path d="M12 9v4.5" />
          <path d="M12 17h.01" />
        </svg>
      );
    case "/app/customers":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M16 20v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1" />
          <circle cx="9.5" cy="7.5" r="3.5" />
          <path d="M17 8.5a3 3 0 0 1 0 6" />
          <path d="M20 20v-1a3.5 3.5 0 0 0-2.5-3.35" />
        </svg>
      );
    case "/app/carriers":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 7h10v7H4z" />
          <path d="M14 10h3l3 3v1h-6z" />
          <circle cx="8" cy="18" r="1.5" />
          <circle cx="18" cy="18" r="1.5" />
        </svg>
      );
    case "/app/reports":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 19.5h16" />
          <path d="M7 16V9" />
          <path d="M12 16V5" />
          <path d="M17 16v-3.5" />
        </svg>
      );
    case "/app/documents":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M7 3.5h7l4 4V20a.5.5 0 0 1-.5.5h-10A.5.5 0 0 1 7 20z" />
          <path d="M14 3.5V8h4" />
          <path d="M9.5 12.5h5" />
          <path d="M9.5 16h5" />
        </svg>
      );
    case "/app/settings":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V20a2 2 0 1 1-4 0v-.2a1 1 0 0 0-.6-.9 1 1 0 0 0-1.1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H4a2 2 0 1 1 0-4h.2a1 1 0 0 0 .9-.6 1 1 0 0 0-.2-1.1l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1 1 0 0 0 1.1.2 1 1 0 0 0 .6-.9V4a2 2 0 1 1 4 0v.2a1 1 0 0 0 .6.9 1 1 0 0 0 1.1-.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1 1 0 0 0-.2 1.1 1 1 0 0 0 .9.6h.2a2 2 0 1 1 0 4h-.2a1 1 0 0 0-.9.6" />
        </svg>
      );
    default:
      return null;
  }
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-[272px] flex-col border-r border-[var(--border)] bg-[var(--surface)] px-5 py-6 lg:flex">
      <div className="rounded-[26px] border border-[var(--border)] bg-[var(--surface-strong)] p-5">
        <SupplyPilotLogo />
      </div>

      <nav className="mt-6 flex flex-1 flex-col gap-2">
        {appNavigation.map((item) => {
          const isRootItem = item.href === "/app";
          const isActive = isRootItem
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              style={isActive ? { color: "var(--background)" } : undefined}
              className={cx(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                isActive
                  ? "bg-[var(--foreground)] text-[color:var(--background)] shadow-[0_14px_34px_-20px_rgba(0,0,0,0.55)]"
                  : "text-[var(--muted)] hover:bg-[var(--surface-strong)] hover:text-[var(--foreground)]",
              )}
            >
              <span
                className={cx(
                  "inline-flex h-8 w-8 items-center justify-center rounded-xl border",
                  isActive
                    ? "border-[color:color-mix(in_srgb,var(--background)_20%,transparent)] bg-[color:color-mix(in_srgb,var(--background)_10%,transparent)] text-[color:var(--background)]"
                    : "border-current/10 bg-current/5",
                )}
              >
                <NavigationIcon href={item.href} />
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface-strong)] p-4">
        <Link
          href="/portal"
          className="btn btn-secondary btn-sm"
        >
          Open portal
        </Link>
      </div>
    </aside>
  );
}
