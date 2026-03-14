import { PageHeader } from "@/components/app/page-header";
import { getDocumentsData } from "@/lib/domain/queries";
import { formatDateTime, formatNumber } from "@/lib/utils";

export default async function DocumentsPage() {
  const documents = await getDocumentsData();

  return (
    <>
      <PageHeader
        eyebrow="Documents"
        title="Shipment documents"
        description="BOLs, invoices, manifests, customs packets, and proof-of-delivery metadata are organized by shipment and customer."
      />
      <section className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-5">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left">
            <thead>
              <tr className="border-b border-[var(--border)] text-[11px] uppercase tracking-[0.22em] text-[var(--muted)]">
                <th className="pb-3 font-mono">File</th>
                <th className="pb-3 font-mono">Shipment</th>
                <th className="pb-3 font-mono">Customer</th>
                <th className="pb-3 font-mono">Type</th>
                <th className="pb-3 font-mono">Visibility</th>
                <th className="pb-3 font-mono">Size</th>
                <th className="pb-3 font-mono">Uploaded</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((document) => (
                <tr
                  key={document.id}
                  className="border-b border-[var(--border)]/70 last:border-0"
                >
                  <td className="py-4 font-semibold text-[var(--foreground)]">{document.fileName}</td>
                  <td className="py-4 text-sm text-[var(--foreground)]">{document.shipment.shipmentReference}</td>
                  <td className="py-4 text-sm text-[var(--foreground)]">{document.customer.name}</td>
                  <td className="py-4 text-sm uppercase text-[var(--muted)]">{document.type}</td>
                  <td className="py-4 text-sm text-[var(--muted)]">
                    {document.isCustomerVisible ? "Customer safe" : "Internal only"}
                  </td>
                  <td className="py-4 text-sm text-[var(--muted)]">{formatNumber(document.fileSizeBytes)} B</td>
                  <td className="py-4 text-sm text-[var(--muted)]">{formatDateTime(document.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
