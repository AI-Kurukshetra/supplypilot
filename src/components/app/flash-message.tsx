import { cx } from "@/lib/utils";

export function FlashMessage({
  status,
  message,
  className,
}: {
  status?: string;
  message?: string;
  className?: string;
}) {
  if (!message) {
    return null;
  }

  return (
    <section
      className={cx(
        "rounded-[24px] border px-4 py-3 text-sm",
        status === "error"
          ? "border-[color:rgba(194,74,47,0.25)] bg-[color:rgba(194,74,47,0.08)] text-[color:#c24a2f]"
          : "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)]",
        className,
      )}
    >
      {message}
    </section>
  );
}
