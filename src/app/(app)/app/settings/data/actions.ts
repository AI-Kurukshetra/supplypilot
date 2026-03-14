"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { CrudEntityName } from "@/lib/crud/config";
import { createCrudRecord, deleteCrudRecord, updateCrudRecord } from "@/lib/crud/service";

function buildRedirectUrl(entityName: CrudEntityName, status: "success" | "error", message: string) {
  const params = new URLSearchParams({
    entity: entityName,
    status,
    message,
  });

  return `/app/settings/data?${params.toString()}`;
}

export async function createCrudRecordAction(entityName: CrudEntityName, formData: FormData) {
  try {
    await createCrudRecord(entityName, formData);
    revalidatePath("/app/settings/data");
    redirect(buildRedirectUrl(entityName, "success", "Record created."));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create record.";
    redirect(buildRedirectUrl(entityName, "error", message));
  }
}

export async function updateCrudRecordAction(
  entityName: CrudEntityName,
  recordId: string,
  formData: FormData,
) {
  try {
    await updateCrudRecord(entityName, recordId, formData);
    revalidatePath("/app/settings/data");
    redirect(buildRedirectUrl(entityName, "success", "Record updated."));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update record.";
    redirect(buildRedirectUrl(entityName, "error", message));
  }
}

export async function deleteCrudRecordAction(entityName: CrudEntityName, recordId: string) {
  try {
    await deleteCrudRecord(entityName, recordId);
    revalidatePath("/app/settings/data");
    redirect(buildRedirectUrl(entityName, "success", "Record deleted."));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to delete record.";
    redirect(buildRedirectUrl(entityName, "error", message));
  }
}
