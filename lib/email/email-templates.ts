// General HTML email template for QuickGates
export function QrGateEmailTemplate({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  // Use a public CDN fallback for logo
  const logoUrl = `${
    process.env.NEXT_PUBLIC_APP_LOGO
      ? "https://res.cloudinary.com/farzel-photos/image/upload/v1751317948/muzica_ry4x7o.png"
      : "https://res.cloudinary.com/farzel-photos/image/upload/v1751317948/muzica_ry4x7o.png"
  }/logo.png`;
  return `
    <div style="background:hsl(0,0%,100%);padding:32px 0;font-family:Inter,Arial,Helvetica,sans-serif;min-height:100vh;">
      <div style="max-width:480px;margin:0 auto;background:hsl(0,0%,100%);border-radius:12px;box-shadow:0 2px 16px rgba(0,0,0,0.04);overflow:hidden;">
        <div style="padding:32px 32px 16px 32px;text-align:center;">
          <img src='${logoUrl}' alt="QuickGates Logo" style="width:64px;height:64px;border-radius:50%;margin-bottom:16px;object-fit:cover;background:#f1f5f9;display:inline-block;" onerror="this.onerror=null;this.src='https://res.cloudinary.com/farzel-photos/image/upload/v1751317948/muzica_ry4x7o.png'" />
          <h1 style="font-size:1.5rem;font-weight:700;color:hsl(240,10%,3.9%);margin-bottom:8px;">${title}</h1>
        </div>
        <div style="padding:0 32px 32px 32px;font-size:1rem;color:hsl(240,10%,3.9%);">
          ${body}
        </div>
        <div style="background:hsl(240,4.8%,95.9%);padding:16px 32px;text-align:center;font-size:0.9rem;color:hsl(240,3.8%,46.1%);">
          &copy; ${new Date().getFullYear()} QuickGates. All rights reserved.
        </div>
      </div>
    </div>
  `;
}

// 1. Registration Confirmation Email
export function registrationConfirmationEmail({ name }: { name: string }) {
  return QrGateEmailTemplate({
    title: "Welcome to QuickGates!",
    body: `
      <p style=\"margin-bottom:24px;\">Hi <strong>${name}</strong>,</p>
      <p style=\"margin-bottom:24px;\">Your account has been successfully created. You can now browse and purchase tickets for upcoming events, manage your profile, and enjoy seamless event access with QuickGates.</p>
      <p style=\"margin-bottom:24px;\">If you have any questions or need help, just reply to this email or visit our Help Center.</p>
      <p style=\"color:hsl(240,3.8%,46.1%);font-size:0.95rem;\">Thank you for joining QuickGates!</p>
    `,
  });
}

export function organizerOnboardingEmail({
  name,
  email,
  password,
  loginUrl,
}: {
  name: string;
  email: string;
  password: string;
  loginUrl: string;
}) {
  return QrGateEmailTemplate({
    title: "Your QuickGates Organizer Account Is Ready",
    body: `
      <p style="margin-bottom:24px;">Hi <strong>${name}</strong>,</p>
      <p style="margin-bottom:24px;">An administrator has created your organizer account on QuickGates. You can now sign in, create events, manage ticket types, and monitor attendees from your organizer dashboard.</p>
      <div style="background:#f8f9fb;border:1px solid #e1e2e4;border-radius:10px;padding:18px;margin-bottom:24px;">
        <p style="margin:0 0 8px 0;"><strong>Email:</strong> ${email}</p>
        <p style="margin:0;"><strong>Temporary password:</strong> ${password}</p>
      </div>
      <p style="text-align:center;margin-bottom:24px;">
        <a href="${loginUrl}" style="display:inline-block;padding:12px 28px;background:#ba0033;color:#ffffff;font-weight:700;border-radius:8px;text-decoration:none;font-size:1rem;">Sign in to QuickGates</a>
      </p>
      <p style="margin-bottom:24px;">For security, please change this password from your account settings after your first login.</p>
      <p style="color:#5b6278;font-size:0.95rem;">Thank you for organizing with QuickGates.</p>
    `,
  });
}

// 2. Purchase Confirmation Email (Success)
export function purchaseConfirmationEmail({
  name,
  eventTitle,
  eventDate,
  eventLocation,
  ticketType,
  ticketNumber,
  qrCodeUrl,
}: {
  name: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  ticketType: string;
  ticketNumber: string | number;
  qrCodeUrl?: string;
}) {
  return QrGateEmailTemplate({
    title: "Your Ticket Purchase is Confirmed!",
    body: `
      <p style=\"margin-bottom:24px;\">Hi <strong>${name}</strong>,</p>
      <p style=\"margin-bottom:24px;\">Thank you for your purchase! Your ticket for <strong>${eventTitle}</strong> is confirmed.</p>
      <ul style=\"margin-bottom:24px;padding-left:20px;\">
        <li><strong>Event:</strong> ${eventTitle}</li>
        <li><strong>Date & Time:</strong> ${eventDate}</li>
        <li><strong>Location:</strong> ${eventLocation}</li>
        <li><strong>Ticket Type:</strong> ${ticketType}</li>
        <li><strong>Ticket Number:</strong> ${ticketNumber}</li>
      </ul>
      ${
        qrCodeUrl
          ? `<div style=\"text-align:center;margin-bottom:24px;\"><img src=\"${qrCodeUrl}\" alt=\"QR Code\" style=\"width:120px;height:120px;object-fit:contain;border-radius:8px;background:#f1f5f9;\" /></div>`
          : ""
      }
      <p style=\"margin-bottom:24px;\">You can view your ticket(s) in your dashboard. Please present this email or your QR code at the event entrance for scanning.</p>
      <p style=\"color:hsl(240,3.8%,46.1%);font-size:0.95rem;\">Enjoy the event!</p>
    `,
  });
}

// 2b. Purchase Failure Email
export function purchaseFailureEmail({
  name,
  eventTitle,
  supportEmail,
}: {
  name: string;
  eventTitle: string;
  supportEmail?: string;
}) {
  return QrGateEmailTemplate({
    title: "Ticket Purchase Failed",
    body: `
      <p style=\"margin-bottom:24px;\">Hi <strong>${name}</strong>,</p>
      <p style=\"margin-bottom:24px;\">Unfortunately, your payment for <strong>${eventTitle}</strong> was not successful.</p>
      <p style=\"margin-bottom:24px;\">Please try again from your dashboard. If you continue to experience issues, contact our support team${
        supportEmail
          ? ` at <a href=\"mailto:${supportEmail}\">${supportEmail}</a>`
          : ""
      }.</p>
      <p style=\"color:hsl(240,3.8%,46.1%);font-size:0.95rem;\">We’re here to help!</p>
    `,
  });
}

// 3. Ticket Scan Notification Email
export function ticketScanNotificationEmail({
  name,
  eventTitle,
  scanTime,
  eventWindowStart,
  eventWindowEnd,
  eventLocation,
}: {
  name: string;
  eventTitle: string;
  scanTime: string;
  eventWindowStart: string;
  eventWindowEnd: string;
  eventLocation: string;
}) {
  return QrGateEmailTemplate({
    title: "Your Ticket Was Scanned",
    body: `
      <p style=\"margin-bottom:24px;\">Hi <strong>${name}</strong>,</p>
      <p style=\"margin-bottom:24px;\">Your ticket for <strong>${eventTitle}</strong> was scanned on <strong>${scanTime}</strong>.</p>
      <ul style=\"margin-bottom:24px;padding-left:20px;\">
        <li><strong>Event:</strong> ${eventTitle}</li>
        <li><strong>Location:</strong> ${eventLocation}</li>
        <li><strong>Entry Window:</strong> ${eventWindowStart} – ${eventWindowEnd}</li>
      </ul>
      <p style=\"margin-bottom:24px;\">If this was not you, please contact event staff or support immediately.</p>
      <p style=\"color:hsl(240,3.8%,46.1%);font-size:0.95rem;\">Thank you for using QuickGates.</p>
    `,
  });
}

export function accountSuspendedEmail({
  name,
  role,
}: {
  name: string;
  role: "user" | "organizer";
}) {
  return QrGateEmailTemplate({
    title: "Your QuickGates Account Has Been Suspended",
    body: `
      <p style="margin-bottom:24px;">Hi <strong>${name}</strong>,</p>
      <p style="margin-bottom:24px;">Your QuickGates ${role} account has been suspended by an administrator. You will not be able to access protected areas until your account is reactivated.</p>
      <p style="margin-bottom:24px;">If you believe this was a mistake, please contact QuickGates support.</p>
      <p style="color:#5b6278;font-size:0.95rem;">QuickGates Support</p>
    `,
  });
}

export function organizerOrderMilestoneEmail({
  name,
  eventTitle,
  completedOrders,
}: {
  name: string;
  eventTitle: string;
  completedOrders: number;
}) {
  return QrGateEmailTemplate({
    title: `${completedOrders} Orders Reached`,
    body: `
      <p style="margin-bottom:24px;">Hi <strong>${name}</strong>,</p>
      <p style="margin-bottom:24px;">Great news: <strong>${eventTitle}</strong> has reached <strong>${completedOrders}</strong> completed orders on QuickGates.</p>
      <p style="margin-bottom:24px;">You can review sales and attendee activity from your organizer dashboard.</p>
      <p style="color:#5b6278;font-size:0.95rem;">Keep the momentum going.</p>
    `,
  });
}

export function newEventAnnouncementEmail({
  eventTitle,
  eventDate,
  eventLocation,
  eventUrl,
  organizerName,
}: {
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  eventUrl: string;
  organizerName: string;
}) {
  return QrGateEmailTemplate({
    title: "New Event on QuickGates",
    body: `
      <p style="margin-bottom:24px;">A new event from <strong>${organizerName}</strong> is now available on QuickGates.</p>
      <ul style="margin-bottom:24px;padding-left:20px;">
        <li><strong>Event:</strong> ${eventTitle}</li>
        <li><strong>Date:</strong> ${eventDate}</li>
        <li><strong>Location:</strong> ${eventLocation}</li>
      </ul>
      <p style="text-align:center;margin-bottom:24px;">
        <a href="${eventUrl}" style="display:inline-block;padding:12px 28px;background:#ba0033;color:#ffffff;font-weight:700;border-radius:8px;text-decoration:none;font-size:1rem;">View Event</a>
      </p>
    `,
  });
}

export function securityOfficerAssignmentEmail({
  name,
  eventTitle,
  eventStart,
  eventEnd,
  eventLocation,
  organizerName,
  securityPortalUrl,
}: {
  name: string;
  eventTitle: string;
  eventStart: string;
  eventEnd: string;
  eventLocation: string;
  organizerName: string;
  securityPortalUrl: string;
}) {
  return QrGateEmailTemplate({
    title: "Security Assignment on QuickGates",
    body: `
      <p style="margin-bottom:24px;">Hi <strong>${name}</strong>,</p>
      <p style="margin-bottom:24px;">You have been assigned as a security officer for <strong>${eventTitle}</strong>.</p>
      <ul style="margin-bottom:24px;padding-left:20px;">
        <li><strong>Event:</strong> ${eventTitle}</li>
        <li><strong>Starts:</strong> ${eventStart}</li>
        <li><strong>Ends:</strong> ${eventEnd}</li>
        <li><strong>Location:</strong> ${eventLocation}</li>
        <li><strong>Organizer:</strong> ${organizerName}</li>
      </ul>
      <p style="margin-bottom:24px;">Your role is to scan attendee tickets at the event entrance and verify that each ticket is legitimate, accurate, and valid for this event before allowing entry.</p>
      <p style="margin-bottom:24px;">Please coordinate arrival time, access instructions, and compensation directly with the event organizer.</p>
      <p style="text-align:center;margin-bottom:24px;">
        <a href="${securityPortalUrl}" style="display:inline-block;padding:12px 28px;background:#ba0033;color:#ffffff;font-weight:700;border-radius:8px;text-decoration:none;font-size:1rem;">Open Security Portal</a>
      </p>
      <p style="color:#5b6278;font-size:0.95rem;">Thank you for helping keep event entry smooth and accurate.</p>
    `,
  });
}
