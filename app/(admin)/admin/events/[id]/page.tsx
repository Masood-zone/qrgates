import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BadgeCent,
  Calendar,
  Eye,
  MapPin,
  Shield,
  Ticket,
  Users,
} from "lucide-react";
import prisma from "@/lib/prisma";
import { formatDateTime } from "@/lib/date-utils";
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

interface AdminEventDetailsPageProps {
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

export default async function AdminEventDetailsPage({
  params,
}: AdminEventDetailsPageProps) {
  const { id } = await params;

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      organizer: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      images: true,
      ticketTypes: true,
      securityOfficers: {
        include: {
          _count: { select: { verificationLogs: true } },
        },
        orderBy: { createdAt: "desc" },
      },
      verificationLogs: {
        take: 8,
        orderBy: { timestamp: "desc" },
        include: {
          ticket: {
            select: {
              id: true,
              type: true,
              user: { select: { name: true, email: true } },
            },
          },
          securityOfficer: {
            select: { name: true, email: true },
          },
        },
      },
      _count: {
        select: {
          orders: true,
          tickets: true,
          verificationLogs: true,
          securityOfficers: true,
        },
      },
    },
  });

  if (!event) notFound();

  const revenue = event.soldTickets * event.price;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/admin/organizers/${event.organizer.id}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Organizer
            </Link>
          </Button>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold">{event.title}</h1>
              <Badge variant={getStatusVariant(event.status)}>
                {event.status}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Organized by {event.organizer.name || event.organizer.email}
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/events/${event.id}`}>
            <Eye className="mr-2 h-4 w-4" />
            Public View
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="relative h-56 overflow-hidden rounded-lg bg-muted lg:h-full">
          <Image
            src={event.mainImage || "/booking.jpg"}
            alt={event.title}
            fill
            className="object-cover"
          />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Event Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="text-muted-foreground">
              {event.description || "No description provided."}
            </p>
            <div className="grid gap-4 text-sm md:grid-cols-2">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {formatDateTime(event.startDate)}
              </span>
              <span className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Ends {formatDateTime(event.endDate)}
              </span>
              <span className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {event.location}
              </span>
              <span className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4" />
                {event.organizer.email}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <Ticket className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Tickets Sold</p>
              <p className="text-2xl font-semibold">
                {event.soldTickets}/{event.totalTickets}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <BadgeCent className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Revenue</p>
              <p className="text-2xl font-semibold">
                Ghc{revenue.toFixed(2)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Security</p>
              <p className="text-2xl font-semibold">
                {event._count.securityOfficers}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <Users className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Check-ins</p>
              <p className="text-2xl font-semibold">
                {event._count.verificationLogs}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ticket Types</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Sold</TableHead>
                  <TableHead>Quantity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {event.ticketTypes.map((type) => (
                  <TableRow key={type.id}>
                    <TableCell className="font-medium">{type.name}</TableCell>
                    <TableCell>Ghc{type.price.toFixed(2)}</TableCell>
                    <TableCell>{type.soldCount}</TableCell>
                    <TableCell>{type.quantity}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security Officers</CardTitle>
          </CardHeader>
          <CardContent>
            {event.securityOfficers.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                No security officers assigned.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Scans</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {event.securityOfficers.map((officer) => (
                    <TableRow key={officer.id}>
                      <TableCell>
                        <p className="font-medium">{officer.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {officer.email}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge variant={officer.active ? "default" : "outline"}>
                          {officer.active ? "ACTIVE" : "INACTIVE"}
                        </Badge>
                      </TableCell>
                      <TableCell>{officer._count.verificationLogs}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Check-ins</CardTitle>
        </CardHeader>
        <CardContent>
          {event.verificationLogs.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No check-ins recorded yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Attendee</TableHead>
                  <TableHead>Ticket</TableHead>
                  <TableHead>Security Officer</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {event.verificationLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <p className="font-medium">
                        {log.ticket.user.name || "Unnamed attendee"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {log.ticket.user.email}
                      </p>
                    </TableCell>
                    <TableCell>{log.ticket.type}</TableCell>
                    <TableCell>
                      {log.securityOfficer.name || log.securityOfficer.email}
                    </TableCell>
                    <TableCell>{formatDateTime(log.timestamp)}</TableCell>
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
