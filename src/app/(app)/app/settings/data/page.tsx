import Link from "next/link";

import { createCrudRecordAction } from "@/app/(app)/app/settings/data/actions";
import { PageHeader } from "@/components/app/page-header";
import { CrudEntityInsights } from "@/components/crud/crud-entity-insights";
import { CrudEntityNav } from "@/components/crud/crud-entity-nav";
import { CrudForm } from "@/components/crud/crud-form";
import { CrudRecordList } from "@/components/crud/crud-record-list";
import { getDefaultCrudEntity, getCrudWorkspaceData } from "@/lib/crud/service";

type SearchProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getSingleValue(value: string | string[] | undefined) {
  return typeof value === "string" ? value : undefined;
}

function getSingularLabel(label: string) {
  if (label.endsWith("ies")) {
    return `${label.slice(0, -3)}y`;
  }

  if (label.endsWith("s")) {
    return label.slice(0, -1);
  }

  return label;
}

export default async function CrudWorkspacePage({ searchParams }: SearchProps) {
  const params = await searchParams;
  const entityName = getDefaultCrudEntity(getSingleValue(params.entity));
  const status = getSingleValue(params.status);
  const message = getSingleValue(params.message);
  const result = await loadCrudWorkspace(entityName);

  if ("error" in result) {
    return (
      <>
        <PageHeader
          eyebrow="Settings"
          title="Data workspace"
          description="Create, update, and delete core SupplyPilot records directly in the current organization."
        />
        <section className="rounded-[32px] border border-[color:rgba(194,74,47,0.25)] bg-[color:rgba(194,74,47,0.08)] p-6 text-sm text-[color:#c24a2f]">
          {result.error}
        </section>
      </>
    );
  }

  const { entity, records, optionSets } = result;
  const createAction = createCrudRecordAction.bind(null, entity.name);

  return (
    <>
      <PageHeader
        eyebrow="Settings"
        title="Data workspace"
        description="Create, update, and delete core SupplyPilot records directly in the current organization."
        actions={
          <Link
            href="/app/settings"
            className="btn btn-secondary"
          >
            Back to settings
          </Link>
        }
      />

      <section className="space-y-4 rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--muted)]">Entity</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[var(--foreground)]">
              {entity.label}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">{entity.description}</p>
          </div>

          {message ? (
            <div
              className={
                status === "error"
                  ? "rounded-[22px] border border-[color:rgba(194,74,47,0.25)] bg-[color:rgba(194,74,47,0.08)] px-4 py-3 text-sm text-[color:#c24a2f]"
                  : "rounded-[22px] border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-3 text-sm text-[var(--foreground)]"
              }
            >
              {message}
            </div>
          ) : null}
        </div>

        <CrudEntityNav activeEntity={entity.name} />
        <CrudEntityInsights
          entityName={entity.name}
          records={records}
          optionSets={optionSets}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <article className="rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--muted)]">Create record</p>
          <h3 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-[var(--foreground)]">
            New {getSingularLabel(entity.label)}
          </h3>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Insert a new record into the current organization dataset.
          </p>

          <div className="mt-5">
            <CrudForm
              entity={entity}
              optionSets={optionSets}
              action={createAction}
              submitLabel={`Create ${getSingularLabel(entity.label)}`}
            />
          </div>
        </article>

        <article className="rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--muted)]">Records</p>
              <h3 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-[var(--foreground)]">
                {records.length} loaded
              </h3>
            </div>
            <p className="text-sm text-[var(--muted)]">Expand a row to edit or delete it.</p>
          </div>

          <div className="mt-5">
            <CrudRecordList
              entity={entity}
              records={records}
              optionSets={optionSets}
            />
          </div>
        </article>
      </section>
    </>
  );
}

async function loadCrudWorkspace(entityName: ReturnType<typeof getDefaultCrudEntity>) {
  try {
    return await getCrudWorkspaceData(entityName);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to load the CRUD workspace.",
    };
  }
}
