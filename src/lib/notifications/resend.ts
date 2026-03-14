import { Resend } from "resend";

import { requireResendEnv, hasResendCredentials } from "@/lib/env";

type SendNotificationInput = {
  to: string;
  subject: string;
  preview: string;
  html: string;
};

export async function sendNotificationEmail(input: SendNotificationInput) {
  if (!hasResendCredentials()) {
    return {
      skipped: true,
      reason: "Missing Resend credentials",
    };
  }

  const { resendApiKey, resendFromEmail } = requireResendEnv();
  const resend = new Resend(resendApiKey);

  return resend.emails.send({
    from: resendFromEmail,
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.preview,
  });
}
