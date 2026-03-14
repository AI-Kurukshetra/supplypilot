import { deleteCrudRecordAction, updateCrudRecordAction } from "@/app/(app)/app/settings/data/actions";
import { CrudRecordMeta } from "@/components/crud/crud-entity-insights";
import { CrudForm } from "@/components/crud/crud-form";
import type { CrudEntityConfig } from "@/lib/crud/config";
import {
  formatCrudValue,
  getCrudRecordTitle,
  type CrudOptionSet,
  type CrudRecord,
} from "@/lib/crud/service";

export function CrudRecordList({
  entity,
  records,
  optionSets,
}: {
  entity: CrudEntityConfig;
  records: CrudRecord[];
  optionSets: Record<string, CrudOptionSet[]>;
}) {
  if (!records.length) {
    return (
      <div className="rounded-[28px] border border-dashed border-[var(--border-strong)] bg-[var(--surface)] p-8 text-sm text-[var(--muted)]">
        No records found for this entity yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {records.map((record) => {
        const updateAction = updateCrudRecordAction.bind(null, entity.name, record.id);
        const deleteAction = deleteCrudRecordAction.bind(null, entity.name, record.id);

        return (
          <details
            key={record.id}
            className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-5"
          >
            <summary className="cursor-pointer list-none">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div>
                  <p className="text-lg font-semibold tracking-[-0.04em] text-[var(--foreground)]">
                    {getCrudRecordTitle(record, entity.name, optionSets)}
                  </p>
                  <CrudRecordMeta
                    entityName={entity.name}
                    record={record}
                    optionSets={optionSets}
                  />
                  <div className="mt-2 flex flex-wrap gap-2">
                    {entity.summaryFields.map((fieldKey) => (
                      <span
                        key={fieldKey}
                        className="rounded-full border border-[var(--border)] bg-[var(--surface-strong)] px-3 py-1 text-xs text-[var(--muted)]"
                      >
                        {fieldKey.replaceAll("_", " ")}: {formatCrudValue(record[fieldKey], optionSets)}
                      </span>
                    ))}
                  </div>
                </div>
                <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--muted)]">
                  {record.id}
                </span>
              </div>
            </summary>

            <div className="mt-5 border-t border-[var(--border)] pt-5">
              <CrudForm
                entity={entity}
                optionSets={optionSets}
                action={updateAction}
                submitLabel="Save changes"
                defaults={record}
              />

              <form
                action={deleteAction}
                className="mt-4"
              >
                <button
                  type="submit"
                  className="btn btn-danger btn-sm"
                >
                  Delete record
                </button>
              </form>
            </div>
          </details>
        );
      })}
    </div>
  );
}
