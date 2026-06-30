import prisma from "@/lib/prisma";
import {
  accountSuspendedEmail,
  newEventAnnouncementEmail,
  organizerOrderMilestoneEmail,
  securityOfficerAssignmentEmail,
} from "@/lib/email/email-templates";
import { sendSafeMail } from "@/lib/email/mailer";

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || "";
}

function formatEventDate(date: Date) {
  return new Date(date).toLocaleDateString();
}

function formatEventDateTime(date: Date) {
  return new Date(date).toLocaleString();
}

export async function notifyAccountSuspended({
  email,
  name,
  role,
}: {
  email: string;
  name: string | null;
  role: "user" | "organizer";
}) {
  return sendSafeMail({
    to: email,
    subject: "Your QuickGates account has been suspended",
    html: accountSuspendedEmail({
      name: name || email,
      role,
    }),
  });
}

export async function notifyNewUpcomingEvent(eventId: string) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      organizer: { select: { name: true, email: true } },
    },
  });

  if (!event || event.status !== "UPCOMING" || event.startDate <= new Date()) {
    return;
  }

  const users = await prisma.user.findMany({
    where: {
      status: "ACTIVE",
      role: "USER",
      email: { not: "" },
    },
    select: { email: true },
  });

  const recipients = users.map((user) => user.email).filter(Boolean);
  if (recipients.length === 0) return;

  await sendSafeMail({
    bcc: recipients,
    subject: `New event on QuickGates: ${event.title}`,
    html: newEventAnnouncementEmail({
      eventTitle: event.title,
      eventDate: formatEventDate(event.startDate),
      eventLocation: event.location,
      eventUrl: `${appUrl()}/events/${event.id}`,
      organizerName: event.organizer.name || event.organizer.email,
    }),
  });
}

export async function notifyOrganizerOrderMilestone(eventId: string) {
  const completedOrders = await prisma.order.count({
    where: { eventId, status: "COMPLETED" },
  });

  if (completedOrders === 0 || completedOrders % 10 !== 0) return;

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      organizer: { select: { name: true, email: true } },
    },
  });

  if (!event?.organizer.email) return;

  await sendSafeMail({
    to: event.organizer.email,
    subject: `${event.title} reached ${completedOrders} completed orders`,
    html: organizerOrderMilestoneEmail({
      name: event.organizer.name || event.organizer.email,
      eventTitle: event.title,
      completedOrders,
    }),
  });
}

export async function notifySecurityOfficerAssigned(officerId: string) {
  const officer = await prisma.securityOfficer.findUnique({
    where: { id: officerId },
    include: {
      event: {
        include: {
          organizer: { select: { name: true, email: true } },
        },
      },
    },
  });

  if (!officer?.email) return;

  const activeStatuses = new Set(["UPCOMING", "ONGOING", "LIVE"]);
  if (!activeStatuses.has(officer.event.status) || officer.event.endDate < new Date()) {
    return;
  }

  await sendSafeMail({
    to: officer.email,
    subject: `Security assignment: ${officer.event.title}`,
    html: securityOfficerAssignmentEmail({
      name: officer.name || officer.email,
      eventTitle: officer.event.title,
      eventStart: formatEventDateTime(officer.event.startDate),
      eventEnd: formatEventDateTime(officer.event.endDate),
      eventLocation: officer.event.location,
      organizerName: officer.event.organizer.name || officer.event.organizer.email,
      securityPortalUrl: `${appUrl()}/security/${officer.event.id}/${officer.id}`,
    }),
  });
}
