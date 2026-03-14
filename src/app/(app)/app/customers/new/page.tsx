import { redirect } from "next/navigation";

import { createCustomerAction } from "@/app/(app)/app/customers/actions";
import { CustomerEditorPage } from "@/components/customers/customer-editor-page";
import { requireAppContext } from "@/lib/auth/session";
import { getFlashState } from "@/lib/search-params";

type SearchProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function NewCustomerPage({ searchParams }: SearchProps) {
  const context = await requireAppContext();
  if (!["org_admin", "ops_manager"].includes(context.member.role)) {
    redirect("/app/customers");
  }

  const params = await searchParams;
  const flash = getFlashState(params);

  return (
    <CustomerEditorPage
      title="Create customer"
      description="Add a customer account for operational visibility and shipment assignment."
      status={flash.status}
      message={flash.message}
      submitLabel="Create customer"
      action={createCustomerAction}
    />
  );
}
