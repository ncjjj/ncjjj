import nodemailer from "nodemailer";

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

interface SendPasswordResetOtpEmailInput {
  to: string;
  otp: string;
}

type SendPasswordResetOtpEmailResult =
  | { sent: true }
  | { sent: false; reason: string };

export async function sendPasswordResetOtpEmail({
  to,
  otp,
}: SendPasswordResetOtpEmailInput): Promise<SendPasswordResetOtpEmailResult> {
  const gmailUser = process.env.GMAIL_USER;
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;
  const fromEmail = process.env.GMAIL_FROM_EMAIL || gmailUser;
  const fromName = process.env.GMAIL_FROM_NAME || "NCJ Support";

  if (!gmailUser || !gmailAppPassword || !fromEmail || !to) {
    return { sent: false, reason: "Email provider is not configured." };
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: gmailUser,
      pass: gmailAppPassword,
    },
  });

  const subject = "Your password reset OTP";
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#2c2416;">
      <h2>Hello,</h2>
      <p>Your password reset OTP is:</p>
      <div style="font-size:28px;font-weight:700;letter-spacing:6px;margin:16px 0;">${otp}</div>
      <p>This code is valid for 10 minutes and can be used only once.</p>
      <p>If you did not request this reset, you can safely ignore this email.</p>
    </div>
  `;

  await transporter.sendMail({
    from: `${fromName} <${fromEmail}>`,
    to,
    subject,
    html,
  });

  return { sent: true };
}
