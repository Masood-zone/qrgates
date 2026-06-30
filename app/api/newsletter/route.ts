import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(req: NextRequest) {
  const { email } = await req.json()

  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 })
  }

  try {
    const existing = await prisma.newsletterSubscription.findUnique({
      where: { email },
    })

    if (existing) {
      return NextResponse.json({ message: "Already subscribed" }, { status: 200 })
    }

    await prisma.newsletterSubscription.create({
      data: {
        email,
      },
    })

    return NextResponse.json({ message: "Subscribed successfully" })
  } catch (error) {
    console.error("Newsletter error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
