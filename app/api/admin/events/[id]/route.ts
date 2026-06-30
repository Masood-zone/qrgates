import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import prisma from "@/lib/prisma";
import { normalizeEventCategory } from "@/lib/event-categories";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await context.params;
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      organizer: { select: { id: true, name: true, email: true } },
      ticketTypes: true,
      images: true,
      _count: { select: { tickets: true, orders: true, verificationLogs: true } },
    },
  });

  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });
  return NextResponse.json({ event });
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await context.params;
  const body = await request.json();
  const existing = await prisma.event.findUnique({
    where: { id },
    include: { ticketTypes: true },
  });

  if (!existing) return NextResponse.json({ error: "Event not found" }, { status: 404 });

  const { ticketTypes, images, ...eventFields } = body;

  if (eventFields.organizerId) {
    const organizer = await prisma.user.findFirst({
      where: { id: eventFields.organizerId, role: "ORGANIZER" },
    });
    if (!organizer) {
      return NextResponse.json({ error: "Organizer not found" }, { status: 404 });
    }
  }

  if (Array.isArray(ticketTypes)) {
    for (const type of ticketTypes) {
      if (type.id) {
        await prisma.ticketType.update({
          where: { id: type.id },
          data: {
            name: type.name,
            price: Number(type.price || 0),
            quantity: Number(type.quantity || 0),
            description: type.description,
          },
        });
      } else {
        await prisma.ticketType.create({
          data: {
            eventId: id,
            name: type.name,
            price: Number(type.price || 0),
            quantity: Number(type.quantity || 0),
            description: type.description,
          },
        });
      }
    }

    const incomingIds = ticketTypes.filter((type: any) => type.id).map((type: any) => type.id);
    await prisma.ticketType.deleteMany({
      where: {
        eventId: id,
        id: { notIn: incomingIds },
        soldCount: 0,
      },
    });
  }

  const updatedTypes = Array.isArray(ticketTypes)
    ? await prisma.ticketType.findMany({ where: { eventId: id } })
    : existing.ticketTypes;

  const totalTickets =
    eventFields.totalTickets !== undefined
      ? Number(eventFields.totalTickets)
      : updatedTypes.reduce((sum, type) => sum + type.quantity, 0);

  if (eventFields.category !== undefined) {
    const normalizedCategory = normalizeEventCategory(eventFields.category);
    if (!normalizedCategory) {
      return NextResponse.json({ error: "Invalid event category" }, { status: 400 });
    }
    eventFields.category = normalizedCategory;
  }

  if (Array.isArray(images)) {
    await prisma.eventImage.deleteMany({ where: { eventId: id } });
    if (images.length > 0) {
      await prisma.eventImage.createMany({
        data: images.map((url: string) => ({ eventId: id, url })),
      });
    }
  }

  const event = await prisma.event.update({
    where: { id },
    data: {
      ...(eventFields.title !== undefined ? { title: eventFields.title } : {}),
      ...(eventFields.description !== undefined ? { description: eventFields.description } : {}),
      ...(eventFields.category !== undefined ? { category: eventFields.category } : {}),
      ...(eventFields.location !== undefined ? { location: eventFields.location } : {}),
      ...(eventFields.startDate !== undefined ? { startDate: new Date(eventFields.startDate) } : {}),
      ...(eventFields.endDate !== undefined ? { endDate: new Date(eventFields.endDate) } : {}),
      ...(eventFields.mainImage !== undefined ? { mainImage: eventFields.mainImage } : {}),
      ...(eventFields.organizerId !== undefined ? { organizerId: eventFields.organizerId } : {}),
      ...(eventFields.status !== undefined ? { status: eventFields.status } : {}),
      totalTickets,
      price: updatedTypes[0]?.price ?? existing.price,
    },
    include: {
      organizer: { select: { id: true, name: true, email: true } },
      ticketTypes: true,
      images: true,
      _count: { select: { tickets: true, orders: true, verificationLogs: true } },
    },
  });

  return NextResponse.json({ event });
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await context.params;
  const event = await prisma.event.findUnique({
    where: { id },
    include: { _count: { select: { tickets: true, orders: true, verificationLogs: true } } },
  });

  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });

  if (event._count.tickets > 0 || event._count.orders > 0 || event._count.verificationLogs > 0) {
    const cancelled = await prisma.event.update({
      where: { id },
      data: { status: "CANCELLED" },
      select: { id: true, status: true },
    });
    return NextResponse.json({
      message: "Event has dependent records and was cancelled instead",
      event: cancelled,
    });
  }

  await prisma.event.delete({ where: { id } });
  return NextResponse.json({ message: "Event deleted successfully" });
}
