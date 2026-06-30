import { transporter } from "@/lib/email/nodemailer";

export const APP_NAME = "QuickGates";

export function getMailFrom() {
  return `"${APP_NAME}" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`;
}

export async function sendSafeMail(
  options: Parameters<typeof transporter.sendMail>[0],
) {
  try {
    await transporter.sendMail({
      from: getMailFrom(),
      ...options,
    });
    return true;
  } catch (error) {
    console.error("Failed to send email notification:", error);
    return false;
  }
}
