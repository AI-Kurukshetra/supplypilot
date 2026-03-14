import Link from "next/link";

import { PageHeader } from "@/components/app/page-header";
import { CrudForm } from "@/components/crud/crud-form";
import { getCrudEntityConfig } from "@/lib/crud/config";
import type { CrudOptionSet, CrudRecord } from "@/lib/crud/service";

export function ShipmentEditorPage({
  title,
  description,
  status,
  message,
  submitLabel,
  action,
  optionSets,
  defaults,
  backHref,
}: {
  title: string;
  description: string;
  status?: string;
  message?: string;
  submitLabel: string;
  action: (formData: FormData) => void | Promise<void>;
  optionSets: Record<string, CrudOptionSet[]>;
  defaults?: CrudRecord;
  backHref: string;
}) {
  const entity = getCrudEntityConfig("shipments");

  return (
    <>
      <PageHeader
        eyebrow="Shipments"
        title={title}
        description={description}
        actions={
          <Link
            href={backHref}
            className="btn btn-secondary"
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
