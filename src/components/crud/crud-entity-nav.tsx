import Link from "next/link";

import { crudEntityOrder, getCrudEntityConfig, type CrudEntityName } from "@/lib/crud/config";

export function CrudEntityNav({
  activeEntity,
}: {
  activeEntity: CrudEntityName;
}) {
  return (
    <nav className="flex flex-wrap gap-2">
      {crudEntityOrder.map((entityName) => {
        const entity = getCrudEntityConfig(entityName);
        const isActive = entityName === activeEntity;

        return (
          <Link
            key={entityName}
            href={`/app/settings/data?entity=${entityName}`}
            className={
              isActive
                ? "inline-flex h-10 items-center justify-center rounded-2xl bg-[var(--foreground)] px-4 text-sm font-semibold text-[var(--background)]"
                : "inline-flex h-10 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm font-medium text-[var(--foreground)] transition hover:bg-[var(--surface-strong)]"
            }
          >
            {entity.label}
          </Link>
        );
      })}
    </nav>
  );
}
