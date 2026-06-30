import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { passwordResetSuccessEmail } from "@/lib/email/auth-emails";
import { sendSafeMail } from "@/lib/email/mailer";

export async function POST(req: Request) {
  const { token, newPassword } = await req.json();

  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpiry: { gte: new Date() },
    },
  });

  if (!user) {
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 400 }
    );
  }

  const hashed = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashed,
      resetToken: null,
      resetTokenExpiry: null,
    },
  });

  // Send password reset success email
  await sendSafeMail({
    to: user.email,
    subject: "Your QuickGates Password Was Reset",
    html: passwordResetSuccessEmail(),
  });

  return NextResponse.json({ message: "Password updated" });
}
