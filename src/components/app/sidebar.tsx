"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { SupplyPilotLogo } from "@/components/brand/supplypilot-logo";
import { appNavigation } from "@/lib/navigation";
import { cx } from "@/lib/utils";

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
                  "inline-flex h-8 w-8 items-center justify-center rounded-xl border font-mono text-[11px] uppercase tracking-[0.18em]",
                  isActive
                    ? "border-[color:color-mix(in_srgb,var(--background)_20%,transparent)] bg-[color:color-mix(in_srgb,var(--background)_10%,transparent)] text-[color:var(--background)]"
                    : "border-current/10 bg-current/5",
                )}
              >
                {item.shortLabel}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface-strong)] p-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--muted)]">Portal</p>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          Customer-safe tracking pages are available under the external portal.
        </p>
        <Link
          href="/portal"
          className="mt-4 inline-flex h-10 items-center justify-center rounded-2xl border border-[var(--border)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--background)]"
        >
          Open portal
        </Link>
      </div>
    </aside>
  );
}
