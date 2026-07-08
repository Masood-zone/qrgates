import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { transporter } from "@/lib/email/nodemailer";
import { ticketScanNotificationEmail } from "@/lib/email/email-templates";
import { getMailFrom } from "@/lib/email/mailer";
import {
  CHECK_IN_ACTION,
  getTicketCheckInStatus,
  withTicketCheckInStatus,
} from "@/lib/tickets/check-in";

interface QRCodeData {
  eventId: string;
  userId: string;
  orderId: string;
  ticketNumber: number;
  timestamp: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { qrCode, name, phone, email, eventId, securityId } = body;

    if (!eventId) {
      return NextResponse.json(
        { message: "Event ID is required" },
        { status: 400 }
      );
    }

    if (!securityId) {
      return NextResponse.json(
        { valid: false, message: "Security ID is required" },
        { status: 400 }
      );
    }

    const securityOfficer = await prisma.securityOfficer.findFirst({
      where: {
        id: securityId,
        eventId,
        active: true,
      },
      select: { id: true },
    });

    if (!securityOfficer) {
      return NextResponse.json(
        {
          valid: false,
          message: "Security officer not authorized for this event",
        },
        { status: 403 }
      );
    }

    let ticket = null;

    // Search by QR code
    if (qrCode) {
      try {
        // Parse the QR code JSON data
        const qrData: QRCodeData = JSON.parse(qrCode);

        // Validate QR code structure
        if (
          !qrData.eventId ||
          !qrData.userId ||
          !qrData.orderId ||
          !qrData.ticketNumber
        ) {
          return NextResponse.json(
            {
              valid: false,
              message: "Invalid QR code format",
            },
            { status: 400 }
          );
        }

        // Verify the event ID matches
        if (qrData.eventId !== eventId) {
          return NextResponse.json(
            {
              valid: false,
              message: "QR code is not valid for this event",
            },
            { status: 400 }
          );
        }

        // Find ticket using the QR code data
        ticket = await prisma.ticket.findFirst({
          where: {
            eventId: qrData.eventId,
            userId: qrData.userId,
            orderId: qrData.orderId,
            // If you have a ticketNumber field, uncomment this:
            // ticketNumber: qrData.ticketNumber,
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                profileImage: true,
              },
            },
            event: {
              select: {
                id: true,
                title: true,
                startDate: true,
                location: true,
                organizerId: true,
              },
            },
            order: {
              select: {
                id: true,
                createdAt: true,
              },
            },
            ticketType: {
              select: {
                id: true,
                name: true,
                price: true,
              },
            },
          },
        });

        // Additional validation: Check if the QR code timestamp is reasonable
        const qrTimestamp = new Date(qrData.timestamp);
        const now = new Date();
        const timeDifference = Math.abs(now.getTime() - qrTimestamp.getTime());
        const maxAge = 24 * 60 * 60 * 1000 * 365; // 1 year in milliseconds

        if (timeDifference > maxAge) {
          return NextResponse.json(
            {
              valid: false,
              message: "QR code has expired",
            },
            { status: 400 }
          );
        }
      } catch (parseError) {
        console.error("Error parsing QR code:", parseError);
        return NextResponse.json(
          {
            valid: false,
            message: "Invalid QR code format",
          },
          { status: 400 }
        );
      }
    }
    // Search by name
    else if (name) {
      ticket = await prisma.ticket.findFirst({
        where: {
          eventId: eventId,
          user: {
            name: {
              contains: name,
              mode: "insensitive",
            },
          },
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              profileImage: true,
            },
          },
          event: {
            select: {
              id: true,
              title: true,
              startDate: true,
              location: true,
              organizerId: true,
            },
          },
          order: {
            select: {
              id: true,
              createdAt: true,
            },
          },
          ticketType: {
            select: {
              id: true,
              name: true,
              price: true,
            },
          },
        },
      });
    }
    // Search by email
    else if (email) {
      ticket = await prisma.ticket.findFirst({
        where: {
          eventId: eventId,
          user: {
            email: {
              equals: email,
              mode: "insensitive",
            },
          },
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              profileImage: true,
            },
          },
          event: {
            select: {
              id: true,
              title: true,
              startDate: true,
              location: true,
              organizerId: true,
            },
          },
          order: {
            select: {
              id: true,
              createdAt: true,
            },
          },
          ticketType: {
            select: {
              id: true,
              name: true,
              price: true,
            },
          },
        },
      });
    }
    // Search by phone
    else if (phone) {
      ticket = await prisma.ticket.findFirst({
        where: {
          eventId: eventId,
          user: {
            phone: {
              contains: phone,
              mode: "insensitive",
            },
          },
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              profileImage: true,
            },
          },
          event: {
            select: {
              id: true,
              title: true,
              startDate: true,
              location: true,
              organizerId: true,
            },
          },
          order: {
            select: {
              id: true,
              createdAt: true,
            },
          },
          ticketType: {
            select: {
              id: true,
              name: true,
              price: true,
            },
          },
        },
      });
    } else {
      return NextResponse.json(
        { message: "QR code, name, email, or phone number is required" },
        { status: 400 }
      );
    }

    // (Insert after finding ticket)
    if (!ticket) {
      return NextResponse.json(
        {
          valid: false,
          message: "Ticket not found for this event",
        },
        { status: 404 }
      );
    }

    // Fetch event start/end
    const event = await prisma.event.findUnique({
      where: { id: ticket.eventId },
      select: { startDate: true, endDate: true },
    });
    if (!event) {
      return NextResponse.json(
        { valid: false, message: "Event not found" },
        { status: 404 }
      );
    }
    const now = new Date();
    const start = new Date(event.startDate);
    const end = new Date(event.endDate);

    if (now < start) {
      return NextResponse.json(
        {
          valid: false,
          message: `Ticket scanning is not allowed before the event starts. Event starts at ${start.toLocaleString()}`,
        },
        { status: 403 }
      );
    }
    if (now > end) {
      return NextResponse.json(
        {
          valid: false,
          message: `Ticket scanning is not allowed after the event ends. Event ended at ${end.toLocaleString()}`,
        },
        { status: 403 }
      );
    }

    const existingCheckIn = await getTicketCheckInStatus(
      prisma,
      ticket.id,
      ticket.eventId
    );

    if (existingCheckIn.checkedIn) {
      return NextResponse.json(
        {
          valid: false,
          alreadyCheckedIn: true,
          message: "This ticket has already been checked in.",
          ticket: withTicketCheckInStatus(ticket, existingCheckIn),
          scanCount: 1,
          eventWindow: { start, end },
        },
        { status: 409 }
      );
    }

    const checkInLog = await prisma.verificationLog.create({
      data: {
        ticketId: ticket.id,
        eventId: ticket.eventId,
        securityOfficerId: securityOfficer.id,
        action: CHECK_IN_ACTION,
        details: "Ticket checked in for event entry",
        timestamp: now,
      },
      select: { timestamp: true },
    });

    await prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        isUsed: true,
        usedAt: checkInLog.timestamp,
      },
    });

    // Send scan notification email
    await transporter.sendMail({
      from: getMailFrom(),
      to: ticket.user.email,
      subject: "Your Ticket Was Scanned",
      html: ticketScanNotificationEmail({
        name: ticket.user.name ?? "",
        eventTitle: ticket.event.title,
        scanTime: now.toLocaleString(),
        eventWindowStart: start.toLocaleString(),
        eventWindowEnd: end.toLocaleString(),
        eventLocation: ticket.event.location,
      }),
    });

    // Return ticket info and scan count
    return NextResponse.json({
      valid: true,
      message: "Ticket checked in successfully.",
      ticket: withTicketCheckInStatus(ticket, {
        checkedIn: true,
        checkedInAt: checkInLog.timestamp,
      }),
      scanCount: 1,
      eventWindow: { start, end },
    });
  } catch (error) {
    console.error("Error verifying ticket:", error);
    return NextResponse.json(
      {
        valid: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
