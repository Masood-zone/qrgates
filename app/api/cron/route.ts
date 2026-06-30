import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

// This endpoint is called by Vercel Cron to update event statuses.
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();

    // Set status to ONGOING for all events where startDate <= now < endDate
    const ongoingEvents = await prisma.event.updateMany({
      where: {
        startDate: { lte: now },
        endDate: { gt: now },
        status: { notIn: ["ONGOING", "CANCELLED"] },
      },
      data: { status: "ONGOING" },
    });

    // Set status to COMPLETED for all events where endDate <= now
    const completedEvents = await prisma.event.updateMany({
      where: {
        endDate: { lte: now },
        status: { notIn: ["COMPLETED", "CANCELLED"] },
      },
      data: { status: "COMPLETED" },
    });

    // Set status to UPCOMING for all events where startDate > now
    const upcomingEvents = await prisma.event.updateMany({
      where: {
        startDate: { gt: now },
        status: { notIn: ["UPCOMING", "CANCELLED"] },
      },
      data: { status: "UPCOMING" },
    });

    return NextResponse.json({
      success: true,
      updatedToOngoing: ongoingEvents.count,
      updatedToCompleted: completedEvents.count,
      updatedToUpcoming: upcomingEvents.count,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error("Error updating event statuses:", error);
    return NextResponse.json(
      { error: "Failed to update event statuses" },
      { status: 500 }
    );
  }
}
