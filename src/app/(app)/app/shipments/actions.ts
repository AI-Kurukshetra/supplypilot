"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createCrudRecord, deleteCrudRecord, updateCrudRecord } from "@/lib/crud/service";

function redirectToList(status: "success" | "error", message: string) {
  const params = new URLSearchParams({ status, message });
  redirect(`/app/shipments?${params.toString()}`);
}

function redirectToDetail(shipmentId: string, status: "success" | "error", message: string) {
  const params = new URLSearchParams({ status, message });
  redirect(`/app/shipments/${shipmentId}?${params.toString()}`);
}

export async function createShipmentAction(formData: FormData) {
  try {
    await createCrudRecord("shipments", formData);
    revalidatePath("/app/shipments");
    revalidatePath("/app");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create shipment.";
    redirect(`/app/shipments/new?status=error&message=${encodeURIComponent(message)}`);
  }

  redirectToList("success", "Shipment added successfully.");
}

export async function updateShipmentAction(shipmentId: string, formData: FormData) {
  try {
    await updateCrudRecord("shipments", shipmentId, formData);
    revalidatePath("/app/shipments");
    revalidatePath(`/app/shipments/${shipmentId}`);
    revalidatePath("/app");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update shipment.";
    redirect(`/app/shipments/${shipmentId}/edit?status=error&message=${encodeURIComponent(message)}`);
  }

  redirectToDetail(shipmentId, "success", "Shipment updated successfully.");
}

export async function deleteShipmentAction(shipmentId: string) {
  try {
    await deleteCrudRecord("shipments", shipmentId);
    revalidatePath("/app/shipments");
    revalidatePath("/app");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to delete shipment.";
    redirectToDetail(shipmentId, "error", message);
  }

  redirectToList("success", "Shipment deleted successfully.");
}
