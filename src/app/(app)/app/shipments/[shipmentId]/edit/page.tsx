import { notFound, redirect } from "next/navigation";

import { updateShipmentAction } from "@/app/(app)/app/shipments/actions";
import { ShipmentEditorPage } from "@/components/shipments/shipment-editor-page";
import { requireAppContext } from "@/lib/auth/session";
import { getCrudOptionSets, getCrudRecordById } from "@/lib/crud/service";
import { getFlashState } from "@/lib/search-params";

type EditShipmentPageProps = {
  params: Promise<{ shipmentId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function EditShipmentPage({ params, searchParams }: EditShipmentPageProps) {
  const context = await requireAppContext();
  if (context.member.role !== "org_admin") {
    redirect("/app/shipments");
  }

  const { shipmentId } = await params;
  const [optionSets, shipmentRecord, query] = await Promise.all([
    getCrudOptionSets(context.organization.id),
    getCrudRecordById("shipments", shipmentId, context.organization.id),
    searchParams,
  ]);
  const flash = getFlashState(query);

  if (!shipmentRecord) {
    notFound();
  }

  const action = updateShipmentAction.bind(null, shipmentId);

  return (
    <ShipmentEditorPage
      title={`Edit ${String(shipmentRecord.shipment_reference)}`}
      description="Update shipment planning, route, and timing fields."
      status={flash.status}
      message={flash.message}
      submitLabel="Save shipment"
      action={action}
      optionSets={optionSets}
      defaults={shipmentRecord}
      backHref={`/app/shipments/${shipmentId}`}
    />
  );
}
