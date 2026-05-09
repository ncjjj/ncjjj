interface SendStatusEmailInput {
  to: string;
  name?: string;
  serviceName: string;
  status: string;
  remarks?: string | null;
}

type SendStatusEmailResult =
  | { sent: true }
  | { sent: false; reason: string };

export async function sendServiceRequestStatusEmail({
  to,
  name,
  serviceName,
  status,
  remarks,
}: SendStatusEmailInput): Promise<SendStatusEmailResult> {
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;

  if (!resendApiKey || !fromEmail || !to) {
    return { sent: false, reason: "Email provider is not configured." };
  }

  const subject = `Service Request Update: ${serviceName}`;
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#2c2416;">
      <h2>Hello ${name || "User"},</h2>
      <p>Your request for <strong>${serviceName}</strong> has been updated.</p>
      <p><strong>Status:</strong> ${status}</p>
      <p><strong>Remarks:</strong> ${remarks || "No remarks provided"}</p>
      <p>You can check the latest details on your dashboard.</p>
    </div>
  `;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [to],
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Unable to send status email: ${errorText}`);
  }

  return { sent: true };
}
