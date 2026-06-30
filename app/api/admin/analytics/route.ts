import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const organizerId = searchParams.get("organizerId");
  const status = searchParams.get("status");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  const createdAt =
    startDate || endDate
      ? {
          ...(startDate ? { gte: new Date(startDate) } : {}),
          ...(endDate ? { lte: new Date(endDate) } : {}),
        }
      : undefined;

  const eventWhere = {
    ...(organizerId && organizerId !== "ALL" ? { organizerId } : {}),
    ...(status && status !== "ALL" ? { status: status as any } : {}),
  };

  const orderWhere = {
    status: "COMPLETED" as const,
    ...(createdAt ? { createdAt } : {}),
    event: eventWhere,
  };

  const [
    totalUsers,
    totalOrganizers,
    totalEvents,
    totalTickets,
    completedOrders,
    revenueAggregate,
    organizers,
    topEvents,
    recentOrders,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "USER" } }),
    prisma.user.count({ where: { role: "ORGANIZER" } }),
    prisma.event.count({ where: eventWhere }),
    prisma.ticket.count({
      where: {
        event: eventWhere,
        order: { status: "COMPLETED" },
      },
    }),
    prisma.order.count({ where: orderWhere }),
    prisma.order.aggregate({ where: orderWhere, _sum: { total: true } }),
    prisma.user.findMany({
      where: { role: "ORGANIZER" },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    }),
    prisma.event.findMany({
      where: eventWhere,
      select: {
        id: true,
        title: true,
        soldTickets: true,
        totalTickets: true,
        price: true,
        organizer: { select: { name: true, email: true } },
        orders: {
          where: { status: "COMPLETED" },
          select: { total: true, tickets: { select: { id: true } } },
        },
      },
      orderBy: { soldTickets: "desc" },
      take: 8,
    }),
    prisma.order.findMany({
      where: orderWhere,
      include: {
        event: { select: { title: true, organizer: { select: { name: true, email: true } } } },
        user: { select: { name: true, email: true } },
        tickets: { select: { id: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  const salesTrend = [];
  for (let i = 29; i >= 0; i--) {
    const day = new Date();
    day.setDate(day.getDate() - i);
    day.setHours(0, 0, 0, 0);
    const nextDay = new Date(day);
    nextDay.setDate(day.getDate() + 1);

    const dayOrders = await prisma.order.findMany({
      where: {
        ...orderWhere,
        createdAt: { gte: day, lt: nextDay },
      },
      include: { tickets: { select: { id: true } } },
    });

    salesTrend.push({
      date: day.toISOString().split("T")[0],
      revenue: dayOrders.reduce((sum, order) => sum + order.total, 0),
      tickets: dayOrders.reduce((sum, order) => sum + order.tickets.length, 0),
    });
  }

  return NextResponse.json({
    summary: {
      totalUsers,
      totalOrganizers,
      totalEvents,
      totalTickets,
      completedOrders,
      totalRevenue: revenueAggregate._sum.total || 0,
    },
    organizers,
    salesTrend,
    topEvents: topEvents.map((event) => ({
      id: event.id,
      title: event.title,
      organizer: event.organizer.name || event.organizer.email,
      soldTickets: event.orders.reduce(
        (sum, order) => sum + order.tickets.length,
        0
      ),
      totalTickets: event.totalTickets,
      revenue: event.orders.reduce((sum, order) => sum + order.total, 0),
    })),
    recentOrders: recentOrders.map((order) => ({
      id: order.id,
      total: order.total,
      createdAt: order.createdAt,
      eventTitle: order.event.title,
      organizer: order.event.organizer.name || order.event.organizer.email,
      customer: order.user.name || order.user.email,
      tickets: order.tickets.length,
    })),
  });
}
