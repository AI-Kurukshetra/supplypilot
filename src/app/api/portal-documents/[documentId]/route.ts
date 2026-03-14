import { buildShipmentDocumentPdf } from "@/lib/documents/pdf";
import { buildDocumentPdfModel, getPortalDocumentPdfPayload } from "@/lib/documents/service";

export const dynamic = "force-dynamic";

type RouteProps = {
  params: Promise<{ documentId: string }>;
};

export async function GET(_request: Request, { params }: RouteProps) {
  const { documentId } = await params;
  const payload = await getPortalDocumentPdfPayload(documentId);

  if (!payload) {
    return new Response("Document not found", { status: 404 });
  }

  const pdfBytes = buildShipmentDocumentPdf(buildDocumentPdfModel(payload));

  return new Response(pdfBytes, {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `inline; filename="${payload.document.fileName}"`,
      "cache-control": "public, max-age=60",
    },
  });
}
