import { getAppContext } from "@/lib/auth/session";
import type { Carrier, Customer, DocumentRecord, Order, Shipment } from "@/lib/domain/types";
import { createAdminClient } from "@/lib/supabase/admin";

type DocumentPdfPayload = {
  document: DocumentRecord;
  shipment: Shipment;
  customer: Customer;
  carrier: Carrier | null;
  order: Order | null;
  originLabel: string;
  destinationLabel: string;
};

function formatDocumentType(value: DocumentRecord["type"]) {
  switch (value) {
    case "bol":
      return "Bill of Lading";
    case "pod":
      return "Proof of Delivery";
    case "invoice":
      return "Invoice";
    case "manifest":
      return "Manifest";
    case "customs":
      return "Customs Packet";
    default:
      return String(value).toUpperCase();
  }
}

function buildRouteLabel(city?: string | null, region?: string | null) {
  return [city, region].filter(Boolean).join(", ");
}

function buildPdfPayload(
  document: DocumentRecord,
  shipment: Shipment,
  customer: Customer,
  carrier: Carrier | null,
  order: Order | null,
  originLabel: string,
  destinationLabel: string,
): DocumentPdfPayload {
  return {
    document,
    shipment,
    customer,
    carrier,
    order,
    originLabel,
    destinationLabel,
  };
}

export function buildDocumentPdfModel(payload: DocumentPdfPayload) {
  return {
    title: `SupplyPilot ${formatDocumentType(payload.document.type)}`,
    subtitle: `${payload.document.fileName}  |  Generated for shipment ${payload.shipment.shipmentReference}`,
    lines: [
      `Document type: ${formatDocumentType(payload.document.type)}`,
      `Shipment reference: ${payload.shipment.shipmentReference}`,
      `Tracking token: ${payload.shipment.trackingToken}`,
      `Customer: ${payload.customer.name}`,
      `Customer contact: ${payload.customer.contactName} (${payload.customer.contactEmail})`,
      `Carrier: ${payload.carrier?.name ?? "Unassigned"}`,
      `Mode: ${payload.shipment.mode.toUpperCase()}`,
      `Order number: ${payload.order?.orderNumber ?? "Not linked"}`,
      `Customer reference: ${payload.order?.reference || payload.shipment.externalReference || "Not provided"}`,
      `Route: ${payload.originLabel} -> ${payload.destinationLabel}`,
      `Status / Risk: ${payload.shipment.status} / ${payload.shipment.riskLevel}`,
      `ETA: ${payload.shipment.eta}`,
      `Promised delivery: ${payload.shipment.promisedDeliveryAt}`,
      `Actual delivery: ${payload.shipment.actualDeliveryAt ?? "Pending"}`,
      `Visibility: ${payload.document.isCustomerVisible ? "Customer safe" : "Internal only"}`,
      `Storage path: ${payload.document.filePath}`,
      `Summary: ${payload.shipment.summary || "Shipment record maintained in SupplyPilot control tower."}`,
    ],
  };
}

export async function getInternalDocumentPdfPayload(documentId: string) {
  const context = await getAppContext();

  if (!context) {
    return { kind: "unauthorized" as const };
  }

  const supabase = createAdminClient();
  const { data: documentRow, error: documentError } = await supabase
    .from("documents")
    .select("*")
    .eq("organization_id", context.organization.id)
    .eq("id", documentId)
    .maybeSingle();

  if (documentError) {
    throw documentError;
  }

  if (!documentRow) {
    return { kind: "not_found" as const };
  }

  const document = {
    id: String(documentRow.id),
    organizationId: String(documentRow.organization_id),
    shipmentId: String(documentRow.shipment_id),
    customerId: String(documentRow.customer_id),
    type: String(documentRow.document_type) as DocumentRecord["type"],
    fileName: String(documentRow.file_name),
    filePath: String(documentRow.file_path),
    fileSizeBytes: Number(documentRow.file_size_bytes ?? 0),
    isCustomerVisible: Boolean(documentRow.is_customer_visible),
    createdAt: String(documentRow.created_at),
  };

  const [shipmentResult, customerResult] = await Promise.all([
    supabase
      .from("shipments")
      .select("*")
      .eq("organization_id", context.organization.id)
      .eq("id", document.shipmentId)
      .maybeSingle(),
    supabase
      .from("customers")
      .select("*")
      .eq("organization_id", context.organization.id)
      .eq("id", document.customerId)
      .maybeSingle(),
  ]);

  if (shipmentResult.error) throw shipmentResult.error;
  if (customerResult.error) throw customerResult.error;
  if (!shipmentResult.data || !customerResult.data) {
    return { kind: "not_found" as const };
  }

  const shipment = {
    id: String(shipmentResult.data.id),
    organizationId: String(shipmentResult.data.organization_id),
    orderId: String(shipmentResult.data.order_id),
    customerId: String(shipmentResult.data.customer_id),
    carrierId: String(shipmentResult.data.carrier_id),
    originFacilityId: String(shipmentResult.data.origin_facility_id),
    destinationFacilityId: String(shipmentResult.data.destination_facility_id),
    shipmentReference: String(shipmentResult.data.shipment_reference),
    externalReference: String(shipmentResult.data.external_reference ?? ""),
    trackingToken: String(shipmentResult.data.tracking_token),
    status: String(shipmentResult.data.status) as Shipment["status"],
    riskLevel: String(shipmentResult.data.risk_level) as Shipment["riskLevel"],
    mode: String(shipmentResult.data.mode) as Shipment["mode"],
    promisedDeliveryAt: String(shipmentResult.data.promised_delivery_at),
    eta: String(shipmentResult.data.eta),
    actualDeliveryAt: shipmentResult.data.actual_delivery_at ? String(shipmentResult.data.actual_delivery_at) : null,
    lastEventAt: String(shipmentResult.data.last_event_at ?? shipmentResult.data.updated_at),
    lastUpdateAt: String(shipmentResult.data.last_update_at ?? shipmentResult.data.updated_at),
    createdAt: String(shipmentResult.data.created_at),
    updatedAt: String(shipmentResult.data.updated_at),
    summary: String(shipmentResult.data.summary ?? ""),
  };

  const customer = {
    id: String(customerResult.data.id),
    organizationId: String(customerResult.data.organization_id),
    name: String(customerResult.data.name),
    code: String(customerResult.data.code),
    segment: String(customerResult.data.segment),
    contactName: String(customerResult.data.contact_name ?? ""),
    contactEmail: String(customerResult.data.contact_email ?? ""),
    createdAt: String(customerResult.data.created_at),
  };

  const [carrierResult, orderResult, originResult, destinationResult] = await Promise.all([
    supabase
      .from("carriers")
      .select("*")
      .eq("organization_id", context.organization.id)
      .eq("id", shipment.carrierId)
      .maybeSingle(),
    supabase
      .from("orders")
      .select("*")
      .eq("organization_id", context.organization.id)
      .eq("id", shipment.orderId)
      .maybeSingle(),
    supabase
      .from("facilities")
      .select("*")
      .eq("organization_id", context.organization.id)
      .eq("id", shipment.originFacilityId)
      .maybeSingle(),
    supabase
      .from("facilities")
      .select("*")
      .eq("organization_id", context.organization.id)
      .eq("id", shipment.destinationFacilityId)
      .maybeSingle(),
  ]);

  if (carrierResult.error) throw carrierResult.error;
  if (orderResult.error) throw orderResult.error;
  if (originResult.error) throw originResult.error;
  if (destinationResult.error) throw destinationResult.error;

  const carrier = carrierResult.data
    ? {
        id: String(carrierResult.data.id),
        organizationId: String(carrierResult.data.organization_id),
        name: String(carrierResult.data.name),
        scac: String(carrierResult.data.scac),
        mode: String(carrierResult.data.mode) as Carrier["mode"],
        onTimeRate: Number(carrierResult.data.on_time_rate ?? 0),
        activeExceptions: Number(carrierResult.data.active_exceptions ?? 0),
        createdAt: String(carrierResult.data.created_at),
      }
    : null;

  const order = orderResult.data
    ? {
        id: String(orderResult.data.id),
        organizationId: String(orderResult.data.organization_id),
        customerId: String(orderResult.data.customer_id),
        orderNumber: String(orderResult.data.order_number),
        reference: String(orderResult.data.customer_reference ?? ""),
        promisedDeliveryAt: String(orderResult.data.promised_delivery_at),
        valueUsd: Number(orderResult.data.value_usd ?? 0),
        createdAt: String(orderResult.data.created_at),
      }
    : null;

  return {
    kind: "ok" as const,
    payload: buildPdfPayload(
      document,
      shipment,
      customer,
      carrier,
      order,
      buildRouteLabel(originResult.data?.city, originResult.data?.region),
      buildRouteLabel(destinationResult.data?.city, destinationResult.data?.region),
    ),
  };
}

export async function getPortalDocumentPdfPayload(documentId: string) {
  const supabase = createAdminClient();
  const { data: documentRow, error: documentError } = await supabase
    .from("documents")
    .select("*")
    .eq("id", documentId)
    .eq("is_customer_visible", true)
    .maybeSingle();

  if (documentError) {
    throw documentError;
  }

  if (!documentRow) {
    return null;
  }

  const document = {
    id: String(documentRow.id),
    organizationId: String(documentRow.organization_id),
    shipmentId: String(documentRow.shipment_id),
    customerId: String(documentRow.customer_id),
    type: String(documentRow.document_type) as DocumentRecord["type"],
    fileName: String(documentRow.file_name),
    filePath: String(documentRow.file_path),
    fileSizeBytes: Number(documentRow.file_size_bytes ?? 0),
    isCustomerVisible: Boolean(documentRow.is_customer_visible),
    createdAt: String(documentRow.created_at),
  };

  const [shipmentResult, customerResult] = await Promise.all([
    supabase.from("shipments").select("*").eq("id", document.shipmentId).maybeSingle(),
    supabase.from("customers").select("*").eq("id", document.customerId).maybeSingle(),
  ]);

  if (shipmentResult.error) throw shipmentResult.error;
  if (customerResult.error) throw customerResult.error;
  if (!shipmentResult.data || !customerResult.data) {
    return null;
  }

  const shipment = {
    id: String(shipmentResult.data.id),
    organizationId: String(shipmentResult.data.organization_id),
    orderId: String(shipmentResult.data.order_id),
    customerId: String(shipmentResult.data.customer_id),
    carrierId: String(shipmentResult.data.carrier_id),
    originFacilityId: String(shipmentResult.data.origin_facility_id),
    destinationFacilityId: String(shipmentResult.data.destination_facility_id),
    shipmentReference: String(shipmentResult.data.shipment_reference),
    externalReference: String(shipmentResult.data.external_reference ?? ""),
    trackingToken: String(shipmentResult.data.tracking_token),
    status: String(shipmentResult.data.status) as Shipment["status"],
    riskLevel: String(shipmentResult.data.risk_level) as Shipment["riskLevel"],
    mode: String(shipmentResult.data.mode) as Shipment["mode"],
    promisedDeliveryAt: String(shipmentResult.data.promised_delivery_at),
    eta: String(shipmentResult.data.eta),
    actualDeliveryAt: shipmentResult.data.actual_delivery_at ? String(shipmentResult.data.actual_delivery_at) : null,
    lastEventAt: String(shipmentResult.data.last_event_at ?? shipmentResult.data.updated_at),
    lastUpdateAt: String(shipmentResult.data.last_update_at ?? shipmentResult.data.updated_at),
    createdAt: String(shipmentResult.data.created_at),
    updatedAt: String(shipmentResult.data.updated_at),
    summary: String(shipmentResult.data.summary ?? ""),
  };

  const customer = {
    id: String(customerResult.data.id),
    organizationId: String(customerResult.data.organization_id),
    name: String(customerResult.data.name),
    code: String(customerResult.data.code),
    segment: String(customerResult.data.segment),
    contactName: String(customerResult.data.contact_name ?? ""),
    contactEmail: String(customerResult.data.contact_email ?? ""),
    createdAt: String(customerResult.data.created_at),
  };

  const [carrierResult, orderResult, originResult, destinationResult] = await Promise.all([
    supabase.from("carriers").select("*").eq("id", shipment.carrierId).maybeSingle(),
    supabase.from("orders").select("*").eq("id", shipment.orderId).maybeSingle(),
    supabase.from("facilities").select("*").eq("id", shipment.originFacilityId).maybeSingle(),
    supabase.from("facilities").select("*").eq("id", shipment.destinationFacilityId).maybeSingle(),
  ]);

  if (carrierResult.error) throw carrierResult.error;
  if (orderResult.error) throw orderResult.error;
  if (originResult.error) throw originResult.error;
  if (destinationResult.error) throw destinationResult.error;

  const carrier = carrierResult.data
    ? {
        id: String(carrierResult.data.id),
        organizationId: String(carrierResult.data.organization_id),
        name: String(carrierResult.data.name),
        scac: String(carrierResult.data.scac),
        mode: String(carrierResult.data.mode) as Carrier["mode"],
        onTimeRate: Number(carrierResult.data.on_time_rate ?? 0),
        activeExceptions: Number(carrierResult.data.active_exceptions ?? 0),
        createdAt: String(carrierResult.data.created_at),
      }
    : null;

  const order = orderResult.data
    ? {
        id: String(orderResult.data.id),
        organizationId: String(orderResult.data.organization_id),
        customerId: String(orderResult.data.customer_id),
        orderNumber: String(orderResult.data.order_number),
        reference: String(orderResult.data.customer_reference ?? ""),
        promisedDeliveryAt: String(orderResult.data.promised_delivery_at),
        valueUsd: Number(orderResult.data.value_usd ?? 0),
        createdAt: String(orderResult.data.created_at),
      }
    : null;

  return buildPdfPayload(
    document,
    shipment,
    customer,
    carrier,
    order,
    buildRouteLabel(originResult.data?.city, originResult.data?.region),
    buildRouteLabel(destinationResult.data?.city, destinationResult.data?.region),
  );
}
