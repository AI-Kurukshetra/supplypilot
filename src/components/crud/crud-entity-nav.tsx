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
                ? "btn btn-tab btn-tab-active"
                : "btn btn-tab"
            }
          >
            {entity.label}
          </Link>
        );
      })}
    </nav>
  );
}
