"use client";

import { cx } from "@/lib/utils";

export function SupplyPilotLogo({
  className,
}: {
  className?: string;
}) {
  return (
    <div className={cx("flex items-center gap-4", className)}>
      <span className="relative inline-flex h-16 w-16 items-center justify-center overflow-hidden rounded-[22px] border border-[var(--border)] bg-[linear-gradient(145deg,color-mix(in_srgb,var(--surface)_84%,white),var(--surface-strong))] shadow-[0_18px_40px_-28px_rgba(15,23,42,0.55)]">
        <svg
          viewBox="0 0 72 72"
          aria-hidden="true"
          className="h-11 w-11 text-[var(--foreground)]"
          fill="none"
        >
          <rect x="10" y="12" width="24" height="24" rx="7" stroke="currentColor" strokeWidth="4" opacity="0.95" />
          <rect x="38" y="36" width="24" height="24" rx="7" stroke="currentColor" strokeWidth="4" opacity="0.78" />
          <path
            d="M33 22h7c8.84 0 16 7.16 16 16v2"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="m49 31 7 6-7 6"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <div className="min-w-0">
        <p className="text-[1.75rem] font-semibold tracking-[-0.06em] text-[var(--foreground)]">SupplyPilot</p>
      </div>
    </div>
  );
}
