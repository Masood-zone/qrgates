import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function requireAdmin() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      user: null,
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true, status: true },
  });

  if (!user || user.role !== "ADMIN" || user.status === "SUSPENDED") {
    return {
      error: NextResponse.json({ error: "Admin access required" }, { status: 403 }),
      user: null,
    };
  }

  return { error: null, user };
}
