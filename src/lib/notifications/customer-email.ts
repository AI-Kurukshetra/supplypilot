import { getAppEnv, hasResendCredentials } from "@/lib/env";
import { sendNotificationEmail } from "@/lib/notifications/resend";

export async function sendCustomerCreatedEmail({
  organizationName,
  customerName,
  contactName,
  contactEmail,
}: {
  organizationName: string;
  customerName: string;
  contactName?: string;
  contactEmail?: string;
}) {
  if (!contactEmail) {
    return {
      skipped: true,
      reason: "Missing customer contact email",
    };
  }

  if (!hasResendCredentials()) {
    return {
      skipped: true,
      reason: "Missing Resend credentials",
    };
  }

  const { appUrl } = getAppEnv();
  const recipientName = contactName?.trim() || customerName;
  const subject = `Welcome to SupplyPilot tracking for ${organizationName}`;
  const preview = `Your customer account for ${organizationName} has been added to SupplyPilot.`;
  const html = `
    <div style="font-family: Avenir Next, Segoe UI, Arial, sans-serif; color: #171612; line-height: 1.6;">
      <p>Hello ${recipientName},</p>
      <p>Your customer account for <strong>${organizationName}</strong> has been added to SupplyPilot.</p>
      <p>You will receive shipment visibility updates and can access customer-safe tracking through the SupplyPilot portal.</p>
      <p>Portal: <a href="${appUrl}/portal">${appUrl}/portal</a></p>
      <p>If you were not expecting this message, please contact your operations team.</p>
      <p>SupplyPilot</p>
    </div>
  `;

  return sendNotificationEmail({
    to: contactEmail,
    subject,
    preview,
    html,
  });
}
