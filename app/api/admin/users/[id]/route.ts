import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { notifyAccountSuspended } from "@/lib/email/notifications";
import prisma from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await context.params;
  const { status } = await request.json();

  if (status !== "ACTIVE" && status !== "SUSPENDED") {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const current = await prisma.user.findUnique({
    where: { id },
    select: { status: true },
  });

  const user = await prisma.user.update({
    where: { id, role: "USER" },
    data: { status },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      role: true,
      status: true,
      _count: { select: { orders: true, tickets: true } },
    },
  });

  if (current?.status !== "SUSPENDED" && user.status === "SUSPENDED") {
    await notifyAccountSuspended({
      email: user.email,
      name: user.name,
      role: "user",
    });
  }

  return NextResponse.json({ user });
}
