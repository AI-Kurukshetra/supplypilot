import type { ExceptionType, RiskLevel, Shipment, ShipmentMilestone, ShipmentStatus } from "@/lib/domain/types";

function hoursBetween(later: string, earlier: string) {
  return (new Date(later).getTime() - new Date(earlier).getTime()) / 3600000;
}

export function deriveShipmentStatus(shipment: Shipment): ShipmentStatus {
  if (shipment.actualDeliveryAt) {
    return "delivered";
  }

  if (new Date(shipment.eta) > new Date(shipment.promisedDeliveryAt)) {
    return "delayed";
  }

  return shipment.status;
}

export function deriveRiskLevel(
  shipment: Shipment,
  milestones: ShipmentMilestone[],
  referenceDate = new Date(),
): RiskLevel {
  if (shipment.actualDeliveryAt) {
    return "low";
  }

  const now = referenceDate.toISOString();
  const hoursSinceLastUpdate = hoursBetween(now, shipment.lastUpdateAt);
  const etaMissHours = hoursBetween(shipment.eta, shipment.promisedDeliveryAt);
  const missedMilestone = milestones.some(
    (milestone) =>
      !milestone.actualAt &&
      hoursBetween(now, milestone.plannedAt) > 4 &&
      milestone.sequence <= 3,
  );

  if (missedMilestone || hoursSinceLastUpdate > 18 || etaMissHours > 10) {
    return "critical";
  }

  if (hoursSinceLastUpdate > 10 || etaMissHours > 4) {
    return "high";
  }

  if (hoursSinceLastUpdate > 6 || etaMissHours > 1) {
    return "medium";
  }

  return "low";
}

export function deriveExceptionType(
  shipment: Shipment,
  milestones: ShipmentMilestone[],
  riskLevel: RiskLevel,
): ExceptionType | null {
  if (riskLevel === "low") {
    return null;
  }

  if (new Date(shipment.eta) > new Date(shipment.promisedDeliveryAt)) {
    return "eta_breach";
  }

  const missingCriticalMilestone = milestones.some(
    (milestone) =>
      !milestone.actualAt &&
      new Date(milestone.plannedAt).getTime() < Date.now() &&
      milestone.sequence <= 3,
  );

  if (missingCriticalMilestone) {
    return "missed_milestone";
  }

  return "stale_tracking";
}
