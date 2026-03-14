import { redirect } from "next/navigation";

import { createShipmentAction } from "@/app/(app)/app/shipments/actions";
import { ShipmentEditorPage } from "@/components/shipments/shipment-editor-page";
import { requireAppContext } from "@/lib/auth/session";
import { getCrudOptionSets } from "@/lib/crud/service";

type SearchProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getSingleValue(value: string | string[] | undefined) {
  return typeof value === "string" ? value : undefined;
}

export default async function NewShipmentPage({ searchParams }: SearchProps) {
  const context = await requireAppContext();
  if (context.member.role !== "org_admin") {
    redirect("/app/shipments");
  }

  const optionSets = await getCrudOptionSets(context.organization.id);
  const params = await searchParams;

  return (
    <ShipmentEditorPage
      title="Create shipment"
      description="Add a shipment record tied to the current organization and route plan."
      status={getSingleValue(params.status)}
      message={getSingleValue(params.message)}
      submitLabel="Create shipment"
      action={createShipmentAction}
      optionSets={optionSets}
      backHref="/app/shipments"
    />
  );
}
