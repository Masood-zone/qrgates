import { type NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { requireAdmin } from "@/lib/admin-auth";
import { organizerOnboardingEmail } from "@/lib/email/email-templates";
import { sendSafeMail } from "@/lib/email/mailer";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status");

  const organizers = await prisma.user.findMany({
    where: {
      role: "ORGANIZER",
      ...(status && status !== "ALL" ? { status: status as any } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
              { phone: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
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
      _count: { select: { events: true, orders: true, tickets: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ organizers });
}

export async function POST(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await request.json();
  const { name, email, phone, address, profileImage, password } = body;

  if (!email || !name) {
    return NextResponse.json(
      { error: "Name and email are required" },
      { status: 400 },
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "Email already exists" },
      { status: 409 },
    );
  }

  const plainPassword = password || "organizer123";
  const hashedPassword = await bcrypt.hash(plainPassword, 12);

  const organizer = await prisma.user.create({
    data: {
      name,
      email,
      phone,
      address,
      profileImage,
      password: hashedPassword,
      role: "ORGANIZER",
      isOrganizer: true,
      status: "ACTIVE",
      emailVerified: new Date(),
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

  let emailSent = false;
  emailSent = await sendSafeMail({
    to: organizer.email,
    subject: "Your QuickGates organizer account is ready",
    html: organizerOnboardingEmail({
      name: organizer.name || organizer.email,
      email: organizer.email,
      password: plainPassword,
      loginUrl: `${process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin}/auth/signin`,
    }),
  });
  // let smsSent = false;
  // if (organizer.phone) {
  //   try {
  //     const smsResponse = await fetch(
  //       `${process.env.NEXT_PUBLIC_APP_URL}/api/sms/send`,
  //       {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify({
  //           to: organizer.phone,
  //           message: `Your QuickGates organizer account is ready. Email: ${organizer.email}, Password: ${plainPassword}. Login at ${process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin}/auth/signin`,
  //         }),
  //       },
  //     );
  //     smsSent = smsResponse.ok;
  //   } catch (error) {
  //     console.error("Error sending SMS:", error);
  //   }
  // }

  return NextResponse.json({ organizer, emailSent }, { status: 201 });
}
