"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAppContext } from "@/lib/auth/session";
import { createCrudRecord, deleteCrudRecord, updateCrudRecord } from "@/lib/crud/service";
import { getErrorMessage } from "@/lib/errors";
import { sendCustomerCreatedEmail } from "@/lib/notifications/customer-email";

function redirectToList(status: "success" | "error", message: string) {
  const params = new URLSearchParams({ status, message });
  redirect(`/app/customers?${params.toString()}`);
}

function redirectToEdit(customerId: string, status: "success" | "error", message: string) {
  const params = new URLSearchParams({ status, message });
  redirect(`/app/customers/${customerId}/edit?${params.toString()}`);
}

export async function createCustomerAction(formData: FormData) {
  let successMessage = "Customer added successfully.";

  try {
    const context = await requireAppContext();
    const createdCustomer = await createCrudRecord("customers", formData);
    revalidatePath("/app/customers");
    revalidatePath("/app");

    if (createdCustomer) {
      try {
        const emailResult = await sendCustomerCreatedEmail({
          organizationName: context.organization.name,
          customerName: String(createdCustomer.name ?? ""),
          contactName: String(createdCustomer.contact_name ?? ""),
          contactEmail: String(createdCustomer.contact_email ?? ""),
        });

        if (emailResult && "skipped" in emailResult && emailResult.skipped) {
          successMessage = emailResult.reason === "Missing Resend credentials"
            ? "Customer added successfully. Email was not sent because Resend is not configured."
            : "Customer added successfully. Email was not sent because the customer contact email is missing.";
        } else {
          successMessage = "Customer added successfully. Email sent to the customer contact.";
        }
      } catch {
        successMessage = "Customer added successfully. Email delivery failed.";
      }
    }
  } catch (error) {
    const message = getErrorMessage(error, "Unable to create customer.");
    redirect(`/app/customers/new?status=error&message=${encodeURIComponent(message)}`);
  }

  redirectToList("success", successMessage);
}

export async function updateCustomerAction(customerId: string, formData: FormData) {
  try {
    await updateCrudRecord("customers", customerId, formData);
    revalidatePath("/app/customers");
    revalidatePath("/app");
  } catch (error) {
    const message = getErrorMessage(error, "Unable to update customer.");
    redirectToEdit(customerId, "error", message);
  }

  redirectToList("success", "Customer updated successfully.");
}

export async function deleteCustomerAction(customerId: string) {
  try {
    await deleteCrudRecord("customers", customerId);
    revalidatePath("/app/customers");
    revalidatePath("/app");
  } catch (error) {
    const message = getErrorMessage(error, "Unable to delete customer.");
    redirectToList("error", message);
  }

  redirectToList("success", "Customer deleted successfully.");
}
