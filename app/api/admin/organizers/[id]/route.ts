import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { notifyAccountSuspended } from "@/lib/email/notifications";
import prisma from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await context.params;
  const body = await request.json();
  const { name, phone, address, profileImage, status } = body;

  const current = await prisma.user.findUnique({
    where: { id },
    select: { status: true },
  });

  const organizer = await prisma.user.update({
    where: { id, role: "ORGANIZER" },
    data: {
      ...(name !== undefined ? { name } : {}),
      ...(phone !== undefined ? { phone } : {}),
      ...(address !== undefined ? { address } : {}),
      ...(profileImage !== undefined ? { profileImage } : {}),
      ...(status === "ACTIVE" || status === "SUSPENDED" ? { status } : {}),
      role: "ORGANIZER",
      isOrganizer: true,
    },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      address: true,
      profileImage: true,
      role: true,
      status: true,
      isOrganizer: true,
      createdAt: true,
    },
  });

  if (current?.status !== "SUSPENDED" && organizer.status === "SUSPENDED") {
    await notifyAccountSuspended({
      email: organizer.email,
      name: organizer.name,
      role: "organizer",
    });
  }

  return NextResponse.json({ organizer });
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await context.params;
  const organizer = await prisma.user.findUnique({
    where: { id },
    include: {
      _count: { select: { events: true, orders: true, tickets: true, securityOfficers: true } },
    },
  });

  if (!organizer || organizer.role !== "ORGANIZER") {
    return NextResponse.json({ error: "Organizer not found" }, { status: 404 });
  }

  const hasDependencies =
    organizer._count.events > 0 ||
    organizer._count.orders > 0 ||
    organizer._count.tickets > 0 ||
    organizer._count.securityOfficers > 0;

  if (hasDependencies) {
    const suspended = await prisma.user.update({
      where: { id },
      data: { status: "SUSPENDED" },
      select: { id: true, email: true, name: true, status: true },
    });
    if (organizer.status !== "SUSPENDED") {
      await notifyAccountSuspended({
        email: suspended.email,
        name: suspended.name,
        role: "organizer",
      });
    }
    return NextResponse.json({
      message: "Organizer has dependent records and was suspended instead",
      organizer: suspended,
    });
  }

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ message: "Organizer deleted successfully" });
}
