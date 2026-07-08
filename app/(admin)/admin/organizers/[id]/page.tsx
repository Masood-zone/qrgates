import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Eye,
  Mail,
  MapPin,
  ShieldCheck,
  Ticket,
  Users,
} from "lucide-react";
import prisma from "@/lib/prisma";
import { formatDate } from "@/lib/date-utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface AdminOrganizerDetailsPageProps {
  params: Promise<{ id: string }>;
}

function getStatusVariant(
  status: string
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "CANCELLED":
      return "destructive";
    case "COMPLETED":
      return "outline";
    case "ONGOING":
      return "secondary";
    default:
      return "default";
  }
}

export default async function AdminOrganizerDetailsPage({
  params,
}: AdminOrganizerDetailsPageProps) {
  const { id } = await params;

  const organizer = await prisma.user.findFirst({
    where: { id, role: "ORGANIZER" },
    include: {
      events: {
        include: {
          _count: {
            select: {
              orders: true,
              tickets: true,
              verificationLogs: true,
            },
          },
        },
        orderBy: { startDate: "desc" },
      },
    },
  });

  if (!organizer) notFound();

  const totalOrders = organizer.events.reduce(
    (sum, event) => sum + event._count.orders,
    0
  );
  const totalTickets = organizer.events.reduce(
    (sum, event) => sum + event._count.tickets,
    0
  );
  const totalCheckIns = organizer.events.reduce(
    (sum, event) => sum + event._count.verificationLogs,
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/organizers">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Organizers
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {organizer.name || "Unnamed Organizer"}
            </h1>
            <p className="text-muted-foreground">
              Events and activity managed by this organizer.
            </p>
          </div>
        </div>
        <Badge
          variant={organizer.status === "ACTIVE" ? "default" : "destructive"}
          className="w-fit"
        >
          {organizer.status}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <Users className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Events</p>
              <p className="text-2xl font-semibold">
                {organizer.events.length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <Ticket className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Tickets</p>
              <p className="text-2xl font-semibold">{totalTickets}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Orders</p>
              <p className="text-2xl font-semibold">{totalOrders}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <ShieldCheck className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Check-ins</p>
              <p className="text-2xl font-semibold">{totalCheckIns}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Organizer Profile</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm md:grid-cols-3">
          <span className="flex items-center gap-2 text-muted-foreground">
            <Mail className="h-4 w-4" />
            {organizer.email}
          </span>
          <span className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            {organizer.phone || "No phone"}
          </span>
          <span className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            {organizer.address || "No address"}
          </span>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Events</CardTitle>
        </CardHeader>
        <CardContent>
          {organizer.events.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground">
              This organizer has no events yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Tickets</TableHead>
                  <TableHead>Activity</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {organizer.events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">{event.title}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(event.status)}>
                        {event.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(event.startDate)}</TableCell>
                    <TableCell>{event.location}</TableCell>
                    <TableCell>
                      {event.soldTickets}/{event.totalTickets}
                    </TableCell>
                    <TableCell>
                      {event._count.orders} orders,{" "}
                      {event._count.verificationLogs} check-ins
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/events/${event.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
