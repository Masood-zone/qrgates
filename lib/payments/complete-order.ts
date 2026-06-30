import prisma from "@/lib/prisma";
import { sendTicketEmail } from "@/lib/email/sendTicketEmail";
import { notifyOrganizerOrderMilestone } from "@/lib/email/notifications";

type CompleteOrderOptions = {
  orderId: string;
  paymentId?: string;
  reference?: string;
  paymentMethod?: string;
};

function buildTicketAttachments(tickets: Array<{ qrCode: string }>) {
  return tickets
    .map((ticket, index) => {
      const base64 = ticket.qrCode.includes(",")
        ? ticket.qrCode.split(",")[1]
        : ticket.qrCode;

      return {
        filename: `ticket-${index + 1}.png`,
        content: base64,
        encoding: "base64",
        cid: `qrcode${index + 1}@tickets.qrgate.app`,
      };
    })
    .filter((attachment) => Boolean(attachment.content));
}

export async function completePaidOrder({
  orderId,
  paymentId,
  reference,
  paymentMethod = "PAYSTACK",
}: CompleteOrderOptions) {
  const existingOrder = await prisma.order.findUnique({
    where: { id: orderId },
    select: { id: true, status: true, eventId: true },
  });

  if (!existingOrder) {
    throw new Error("Order not found");
  }

  const wasAlreadyCompleted = existingOrder.status === "COMPLETED";

  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: {
      status: "COMPLETED",
      paymentMethod,
      ...(paymentId ? { paymentId } : {}),
      ...(reference ? { reference } : {}),
    },
    include: {
      user: { select: { name: true, email: true } },
      event: {
        select: {
          id: true,
          title: true,
          location: true,
          startDate: true,
          endDate: true,
        },
      },
      tickets: {
        include: {
          ticketType: true,
        },
      },
    },
  });

  if (!wasAlreadyCompleted && updatedOrder.user.email && updatedOrder.tickets.length > 0) {
    const attachments = buildTicketAttachments(updatedOrder.tickets);

    try {
      await sendTicketEmail({
        user: {
          name: updatedOrder.user.name,
          email: updatedOrder.user.email,
        },
        tickets: updatedOrder.tickets.map((ticket, index) => ({
          qrCode: `cid:qrcode${index + 1}@tickets.qrgate.app`,
          type: ticket.type,
          price: ticket.price,
        })),
        event: updatedOrder.event,
        attachments,
      });
    } catch (error) {
      console.error("Failed to send ticket email:", error);
    }

    await notifyOrganizerOrderMilestone(updatedOrder.event.id);
  }

  return updatedOrder;
}
