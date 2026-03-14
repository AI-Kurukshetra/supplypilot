import { notFound, redirect } from "next/navigation";

import { updateCustomerAction } from "@/app/(app)/app/customers/actions";
import { CustomerEditorPage } from "@/components/customers/customer-editor-page";
import { requireAppContext } from "@/lib/auth/session";
import { getCrudRecordById } from "@/lib/crud/service";

type EditCustomerPageProps = {
  params: Promise<{ customerId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getSingleValue(value: string | string[] | undefined) {
  return typeof value === "string" ? value : undefined;
}

export default async function EditCustomerPage({ params, searchParams }: EditCustomerPageProps) {
  const context = await requireAppContext();
  if (!["org_admin", "ops_manager"].includes(context.member.role)) {
    redirect("/app/customers");
  }

  const { customerId } = await params;
  const [customerRecord, query] = await Promise.all([
    getCrudRecordById("customers", customerId, context.organization.id),
    searchParams,
  ]);

  if (!customerRecord) {
    notFound();
  }

  const action = updateCustomerAction.bind(null, customerId);

  return (
    <CustomerEditorPage
      title={`Edit ${String(customerRecord.name)}`}
      description="Update customer identity, segment, and primary contact details."
      status={getSingleValue(query.status)}
      message={getSingleValue(query.message)}
      submitLabel="Save customer"
      action={action}
      defaults={customerRecord}
    />
  );
}
