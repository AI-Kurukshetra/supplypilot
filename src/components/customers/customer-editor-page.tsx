import Link from "next/link";

import { PageHeader } from "@/components/app/page-header";
import { CrudForm } from "@/components/crud/crud-form";
import { getCrudEntityConfig } from "@/lib/crud/config";
import type { CrudOptionSet, CrudRecord } from "@/lib/crud/service";

export function CustomerEditorPage({
  title,
  description,
  status,
  message,
  submitLabel,
  action,
  defaults,
}: {
  title: string;
  description: string;
  status?: string;
  message?: string;
  submitLabel: string;
  action: (formData: FormData) => void | Promise<void>;
  defaults?: CrudRecord;
}) {
  const entity = getCrudEntityConfig("customers");
  const optionSets: Record<string, CrudOptionSet[]> = {};

  return (
    <>
      <PageHeader
        eyebrow="Customers"
        title={title}
        description={description}
        actions={
          <Link
            href="/app/customers"
            className="inline-flex h-11 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--surface-strong)]"
          >
            Back
          </Link>
        }
      />

      {message ? (
        <section
          className={
            status === "error"
              ? "rounded-[28px] border border-[color:rgba(194,74,47,0.25)] bg-[color:rgba(194,74,47,0.08)] p-5 text-sm text-[color:#c24a2f]"
              : "rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-5 text-sm text-[var(--foreground)]"
          }
        >
          {message}
        </section>
      ) : null}

      <section className="rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-5">
        <CrudForm
          entity={entity}
          optionSets={optionSets}
          action={action}
          submitLabel={submitLabel}
          defaults={defaults}
        />
      </section>
    </>
  );
}
