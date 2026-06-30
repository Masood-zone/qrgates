import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import prisma from "@/lib/prisma";
import {
  getCategoryFilterValues,
  normalizeEventCategory,
} from "@/lib/event-categories";
import { validateEventDateRange } from "@/lib/event-date-validation";
import { notifyNewUpcomingEvent } from "@/lib/email/notifications";

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const organizerId = searchParams.get("organizerId");
  const category = searchParams.get("category");
  const status = searchParams.get("status");
  const categoryValues = category ? getCategoryFilterValues(category) : [];

  const events = await prisma.event.findMany({
    where: {
      ...(organizerId && organizerId !== "ALL" ? { organizerId } : {}),
      ...(category && category !== "ALL"
        ? {
            category:
              categoryValues.length > 0
                ? { in: categoryValues }
                : "__invalid_category__",
          }
        : {}),
      ...(status && status !== "ALL" ? { status: status as any } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" } },
              { location: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      organizer: { select: { id: true, name: true, email: true } },
      ticketTypes: true,
      images: true,
      _count: { select: { tickets: true, orders: true, verificationLogs: true } },
    },
    orderBy: { startDate: "desc" },
  });

  return NextResponse.json({ events });
}

export async function POST(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await request.json();
  const {
    title,
    description,
    category,
    location,
    startDate,
    endDate,
    mainImage,
    images = [],
    organizerId,
    ticketTypes = [],
    status = "UPCOMING",
  } = body;

  if (!title || !category || !location || !startDate || !endDate || !organizerId) {
    return NextResponse.json({ error: "Missing required event fields" }, { status: 400 });
  }

  const normalizedCategory = normalizeEventCategory(category);
  if (!normalizedCategory) {
    return NextResponse.json({ error: "Invalid event category" }, { status: 400 });
  }

  const dateValidation = validateEventDateRange(startDate, endDate);
  if (!dateValidation.ok) {
    return NextResponse.json({ error: dateValidation.message }, { status: 400 });
  }

  const organizer = await prisma.user.findFirst({
    where: { id: organizerId, role: "ORGANIZER", status: "ACTIVE" },
  });
  if (!organizer) {
    return NextResponse.json({ error: "Active organizer not found" }, { status: 404 });
  }

  const normalizedTicketTypes =
    Array.isArray(ticketTypes) && ticketTypes.length > 0
      ? ticketTypes
      : [{ name: "Standard", price: body.price || 0, quantity: body.totalTickets || 100, description: "Standard admission" }];

  const totalTickets = normalizedTicketTypes.reduce(
    (sum: number, type: any) => sum + Number(type.quantity || 0),
    0
  );
  const price = Number(normalizedTicketTypes[0]?.price || 0);

  const event = await prisma.event.create({
    data: {
      title,
      description,
      category: normalizedCategory,
      location,
      startDate: dateValidation.startDate,
      endDate: dateValidation.endDate,
      mainImage,
      price,
      totalTickets,
      organizerId,
      status,
      images:
        Array.isArray(images) && images.length > 0
          ? {
              create: images.map((url: string) => ({ url })),
            }
          : undefined,
      ticketTypes: {
        create: normalizedTicketTypes.map((type: any) => ({
          name: type.name,
          price: Number(type.price || 0),
          quantity: Number(type.quantity || 0),
          description: type.description,
        })),
      },
    },
    include: {
      organizer: { select: { id: true, name: true, email: true } },
      ticketTypes: true,
      images: true,
    },
  });

  await notifyNewUpcomingEvent(event.id);

  return NextResponse.json({ event }, { status: 201 });
}
