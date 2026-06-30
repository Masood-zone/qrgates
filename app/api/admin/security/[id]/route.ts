import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import prisma from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await context.params;
  const { name, email, phone, eventId, active } = await request.json();

  if (eventId) {
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const officer = await prisma.securityOfficer.update({
    where: { id },
    data: {
      ...(name !== undefined ? { name } : {}),
      ...(email !== undefined ? { email } : {}),
      ...(phone !== undefined ? { phone } : {}),
      ...(eventId !== undefined ? { eventId } : {}),
      ...(active !== undefined ? { active: Boolean(active) } : {}),
    },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true, status: true } },
      event: { select: { id: true, title: true } },
      _count: { select: { verificationLogs: true } },
    },
  });

  await prisma.user.update({
    where: { id: officer.userId },
    data: {
      ...(name !== undefined ? { name } : {}),
      ...(email !== undefined ? { email } : {}),
      ...(phone !== undefined ? { phone } : {}),
      role: "SECURITY",
    },
  });

  return NextResponse.json({ officer });
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await context.params;
  const officer = await prisma.securityOfficer.findUnique({
    where: { id },
    include: { _count: { select: { verificationLogs: true } } },
  });

  if (!officer) return NextResponse.json({ error: "Security officer not found" }, { status: 404 });

  if (officer._count.verificationLogs > 0) {
    const deactivated = await prisma.securityOfficer.update({
      where: { id },
      data: { active: false },
      select: { id: true, active: true },
    });
    return NextResponse.json({
      message: "Officer has verification logs and was deactivated instead",
      officer: deactivated,
    });
  }

  await prisma.securityOfficer.delete({ where: { id } });
  return NextResponse.json({ message: "Security officer assignment deleted" });
}
