import type { PrismaClient } from "@prisma/client";

export const CHECK_IN_ACTION = "SCANNED";

export type TicketCheckInStatus = {
  checkedIn: boolean;
  checkedInAt: Date | null;
};

export async function getTicketCheckInStatus(
  prisma: PrismaClient,
  ticketId: string,
  eventId: string
): Promise<TicketCheckInStatus> {
  const checkIn = await prisma.verificationLog.findFirst({
    where: {
      ticketId,
      eventId,
      action: CHECK_IN_ACTION,
    },
    orderBy: { timestamp: "asc" },
    select: { timestamp: true },
  });

  return {
    checkedIn: Boolean(checkIn),
    checkedInAt: checkIn?.timestamp ?? null,
  };
}

export async function getTicketCheckInStatusMap(
  prisma: PrismaClient,
  ticketIds: string[]
): Promise<Map<string, TicketCheckInStatus>> {
  if (ticketIds.length === 0) return new Map();

  const checkIns = await prisma.verificationLog.groupBy({
    by: ["ticketId"],
    where: {
      ticketId: { in: ticketIds },
      action: CHECK_IN_ACTION,
    },
    _min: { timestamp: true },
  });

  return new Map(
    checkIns.map((checkIn) => [
      checkIn.ticketId,
      {
        checkedIn: true,
        checkedInAt: checkIn._min.timestamp,
      },
    ])
  );
}

export function withTicketCheckInStatus<T extends { id: string }>(
  ticket: T,
  status?: TicketCheckInStatus
) {
  return {
    ...ticket,
    checkedIn: status?.checkedIn ?? false,
    checkedInAt: status?.checkedInAt ?? null,
    scanned: status?.checkedIn ?? false,
  };
}
