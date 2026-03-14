import { buildShipmentDocumentPdf } from "@/lib/documents/pdf";
import { buildDocumentPdfModel, getInternalDocumentPdfPayload } from "@/lib/documents/service";

export const dynamic = "force-dynamic";

type RouteProps = {
  params: Promise<{ documentId: string }>;
};

export async function GET(_request: Request, { params }: RouteProps) {
  const { documentId } = await params;
  const result = await getInternalDocumentPdfPayload(documentId);

  if (result.kind === "unauthorized") {
    return new Response("Unauthorized", { status: 401 });
  }

  if (result.kind === "not_found") {
    return new Response("Document not found", { status: 404 });
  }

  const pdfBytes = buildShipmentDocumentPdf(buildDocumentPdfModel(result.payload));

  return new Response(pdfBytes, {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `inline; filename="${result.payload.document.fileName}"`,
      "cache-control": "no-store",
    },
  });
}
