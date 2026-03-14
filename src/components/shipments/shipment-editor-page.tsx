import Link from "next/link";

import { FlashMessage } from "@/components/app/flash-message";
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

      <FlashMessage
        status={status}
        message={message}
        className="rounded-[28px] p-5"
      />

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
