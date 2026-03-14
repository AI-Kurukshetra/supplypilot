export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Enums: {
      document_type: "bol" | "pod" | "invoice" | "manifest" | "customs";
      exception_status: "open" | "investigating" | "resolved";
      exception_type:
        | "eta_breach"
        | "stale_tracking"
        | "missed_milestone"
        | "carrier_delay"
        | "customs_hold"
        | "documentation_issue";
      risk_level: "low" | "medium" | "high" | "critical";
      shipment_status:
        | "planned"
        | "booked"
        | "in_transit"
        | "at_hub"
        | "out_for_delivery"
        | "delayed"
        | "delivered"
        | "exception";
      user_role: "org_admin" | "ops_manager" | "ops_agent" | "customer_user";
    };
  };
};
