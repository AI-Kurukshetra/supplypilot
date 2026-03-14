import { redirect } from "next/navigation";

import { createCustomerAction } from "@/app/(app)/app/customers/actions";
import { CustomerEditorPage } from "@/components/customers/customer-editor-page";
import { requireAppContext } from "@/lib/auth/session";

type SearchProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getSingleValue(value: string | string[] | undefined) {
  return typeof value === "string" ? value : undefined;
}

export default async function NewCustomerPage({ searchParams }: SearchProps) {
  const context = await requireAppContext();
  if (!["org_admin", "ops_manager"].includes(context.member.role)) {
    redirect("/app/customers");
  }

  const params = await searchParams;

  return (
    <CustomerEditorPage
      title="Create customer"
      description="Add a customer account for operational visibility and shipment assignment."
      status={getSingleValue(params.status)}
      message={getSingleValue(params.message)}
      submitLabel="Create customer"
      action={createCustomerAction}
    />
  );
}
