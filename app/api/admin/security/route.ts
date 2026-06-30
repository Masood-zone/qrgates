import { type NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { requireAdmin } from "@/lib/admin-auth";
import prisma from "@/lib/prisma";
import { notifySecurityOfficerAssigned } from "@/lib/email/notifications";

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get("eventId");
  const active = searchParams.get("active");

  const officers = await prisma.securityOfficer.findMany({
    where: {
      ...(eventId && eventId !== "ALL" ? { eventId } : {}),
      ...(active === "true" ? { active: true } : {}),
      ...(active === "false" ? { active: false } : {}),
    },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true, status: true } },
      event: {
        select: {
          id: true,
          title: true,
          startDate: true,
          endDate: true,
          organizer: { select: { id: true, name: true, email: true } },
        },
      },
      _count: { select: { verificationLogs: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ officers });
}

export async function POST(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { name, email, phone, eventId, password } = await request.json();
  if (!name || !email || !eventId) {
    return NextResponse.json({ error: "Name, email, and event are required" }, { status: 400 });
  }

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });

  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        role: "SECURITY",
        status: "ACTIVE",
        password: await bcrypt.hash(password || "security123", 12),
        emailVerified: new Date(),
      },
    });
  } else {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { name, phone, role: "SECURITY", status: "ACTIVE" },
    });
  }

  const existing = await prisma.securityOfficer.findFirst({
    where: { userId: user.id, eventId },
  });
  if (existing) {
    return NextResponse.json({ error: "Security officer is already assigned to this event" }, { status: 409 });
  }

  const officer = await prisma.securityOfficer.create({
    data: { name, email, phone, eventId, userId: user.id, active: true },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true, status: true } },
      event: { select: { id: true, title: true } },
    },
  });

  await notifySecurityOfficerAssigned(officer.id);

  return NextResponse.json({ officer }, { status: 201 });
}
