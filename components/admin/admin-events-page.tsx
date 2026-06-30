"use client";

import type React from "react";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BadgeCent, Calendar, Edit, Eye, Filter, MapPin, MoreHorizontal, Plus, Search, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/date-utils";

type Organizer = { id: string; name: string | null; email: string };
type EventItem = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  location: string;
  startDate: string;
  endDate: string;
  mainImage?: string | null;
  status: "UPCOMING" | "ONGOING" | "COMPLETED" | "CANCELLED";
  soldTickets: number;
  totalTickets: number;
  price: number;
  organizer: Organizer;
  ticketTypes: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    description?: string | null;
  }>;
  _count?: { tickets: number; orders: number; verificationLogs: number };
};

const emptyForm = {
  id: "",
  title: "",
  description: "",
  category: "conference",
  location: "",
  mainImage: "",
  organizerId: "",
  startDate: "",
  endDate: "",
  status: "UPCOMING",
  ticketName: "Standard",
  ticketPrice: "0",
  ticketQuantity: "100",
  ticketDescription: "Standard admission",
};

const statusOptions = ["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"];
const categoryOptions = [
  "conference",
  "workshop",
  "seminar",
  "networking",
  "concert",
  "festival",
  "exhibition",
  "sports",
  "charity",
  "other",
];

export function AdminEventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [filters, setFilters] = useState({
    search: "",
    organizerId: "ALL",
    status: "ALL",
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const isEditing = Boolean(form.id);

  const loadData = async () => {
    const eventParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== "ALL") eventParams.set(key, value);
    });
    const [eventsRes, organizersRes] = await Promise.all([
      fetch(`/api/admin/events?${eventParams.toString()}`),
      fetch("/api/admin/organizers"),
    ]);
    const eventsData = await eventsRes.json();
    const organizersData = await organizersRes.json();
    setEvents(eventsData.events || []);
    setOrganizers(organizersData.organizers || []);
  };

  useEffect(() => {
    loadData();
  }, []);

  const normalizedStart = useMemo(() => form.startDate, [form.startDate]);
  const normalizedEnd = useMemo(() => form.endDate, [form.endDate]);

  const openCreateDialog = () => {
    setForm({
      ...emptyForm,
      organizerId: organizers[0]?.id || "",
    });
    setDialogOpen(true);
  };

  const openEditDialog = (event: EventItem) => {
    const ticket = event.ticketTypes[0];
    setForm({
      id: event.id,
      title: event.title,
      description: event.description || "",
      category: event.category,
      location: event.location,
      mainImage: event.mainImage || "",
      organizerId: event.organizer.id,
      startDate: new Date(event.startDate).toISOString().slice(0, 16),
      endDate: new Date(event.endDate).toISOString().slice(0, 16),
      status: event.status,
      ticketName: ticket?.name || "Standard",
      ticketPrice: String(ticket?.price || event.price || 0),
      ticketQuantity: String(ticket?.quantity || event.totalTickets || 100),
      ticketDescription: ticket?.description || "Standard admission",
    });
    setDialogOpen(true);
  };

  const submitEvent = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    const payload = {
      title: form.title,
      description: form.description,
      category: form.category,
      location: form.location,
      mainImage: form.mainImage || undefined,
      organizerId: form.organizerId,
      startDate: normalizedStart,
      endDate: normalizedEnd,
      status: form.status,
      ticketTypes: [
        {
          name: form.ticketName,
          price: Number(form.ticketPrice),
          quantity: Number(form.ticketQuantity),
          description: form.ticketDescription,
        },
      ],
    };

    try {
      const res = await fetch(isEditing ? `/api/admin/events/${form.id}` : "/api/admin/events", {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save event");

      toast.success(isEditing ? "Event updated" : "Event created");
      setDialogOpen(false);
      setForm(emptyForm);
      loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save event");
    } finally {
      setLoading(false);
    }
  };

  const changeStatus = async (event: EventItem, status: string) => {
    await fetch(`/api/admin/events/${event.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    toast.success("Event status updated");
    loadData();
  };

  const deleteEvent = async (event: EventItem) => {
    if (!confirm(`Delete or cancel ${event.title}?`)) return;
    await fetch(`/api/admin/events/${event.id}`, { method: "DELETE" });
    toast.success("Event deleted or cancelled");
    loadData();
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "UPCOMING":
        return "default";
      case "ONGOING":
        return "secondary";
      case "COMPLETED":
        return "outline";
      case "CANCELLED":
        return "destructive";
      default:
        return "default";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Manage Events</h1>
          <p className="text-muted-foreground">
            Create, review, edit, cancel, and monitor organizer-created events.
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add Event
        </Button>
      </div>

      <Card>
        <CardContent className="p-5">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search events"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-10"
              />
            </div>
            <Select
              value={filters.organizerId}
              onValueChange={(value) => setFilters({ ...filters, organizerId: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All organizers</SelectItem>
                {organizers.map((org) => (
                  <SelectItem key={org.id} value={org.id}>
                    {org.name || org.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filters.status}
              onValueChange={(value) => setFilters({ ...filters, status: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All statuses</SelectItem>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={loadData}>
              <Filter className="mr-2 h-4 w-4" />
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {events.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="text-lg font-semibold">No events found</h3>
            <p className="mt-2 text-muted-foreground">
              Add the first event or adjust your filters.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {events.map((event) => (
            <Card key={event.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col gap-6 lg:flex-row">
                  <div className="relative h-36 w-full overflow-hidden rounded-lg bg-muted lg:h-28 lg:w-52">
                    <Image
                      src={event.mainImage || "/booking.jpg"}
                      alt={event.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="line-clamp-1 text-xl font-semibold">
                          {event.title}
                        </h3>
                        <p className="line-clamp-2 text-muted-foreground">
                          {event.description || "No description provided."}
                        </p>
                      </div>
                      <Badge variant={getStatusBadgeVariant(event.status)}>
                        {event.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm lg:grid-cols-5">
                      <div className="flex items-center text-muted-foreground">
                        <Calendar className="mr-2 h-4 w-4" />
                        {formatDate(event.startDate)}
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <MapPin className="mr-2 h-4 w-4" />
                        {event.location}
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <Users className="mr-2 h-4 w-4" />
                        {event.soldTickets}/{event.totalTickets} sold
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <BadgeCent className="mr-2 h-4 w-4" />
                        Ghc{(event.soldTickets * event.price).toFixed(2)}
                      </div>
                      <div className="text-muted-foreground">
                        {event.organizer.name || event.organizer.email}
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/events/${event.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Event
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openEditDialog(event)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Event
                      </DropdownMenuItem>
                      {statusOptions.map((status) => (
                        <DropdownMenuItem key={status} onClick={() => changeStatus(event, status)}>
                          Set {status}
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuItem onClick={() => deleteEvent(event)} className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete or Cancel
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Event" : "Create New Event"}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update the event details and ticket setup."
                : "Fill in the details to create an event for a selected organizer."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={submitEvent} className="space-y-8">
            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label>Event Title</Label>
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea className="min-h-32" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Organizer</Label>
                    <Select value={form.organizerId} onValueChange={(value) => setForm({ ...form, organizerId: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select organizer" />
                      </SelectTrigger>
                      <SelectContent>
                        {organizers.map((org) => (
                          <SelectItem key={org.id} value={org.id}>
                            {org.name || org.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={form.status} onValueChange={(value) => setForm({ ...form, status: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={form.category} onValueChange={(value) => setForm({ ...form, category: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categoryOptions.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Starts</Label>
                    <Input type="datetime-local" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Ends</Label>
                    <Input type="datetime-local" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} required />
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <Label>Main Event Image URL</Label>
                  <Input value={form.mainImage} onChange={(e) => setForm({ ...form, mainImage: e.target.value })} placeholder="https://..." />
                </div>
                <div className="rounded-lg border-2 border-dashed border-border p-4">
                  <div className="relative aspect-video overflow-hidden rounded-md bg-muted">
                    {form.mainImage ? (
                      <Image src={form.mainImage} alt="Event preview" fill className="object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                        Add an image URL to preview the event cover.
                      </div>
                    )}
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    This mirrors the organizer event creation layout while keeping admin creation lightweight.
                  </p>
                </div>
              </div>
            </div>

            <Card>
              <CardContent className="p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Ticket Type</h3>
                  <Badge variant="secondary">Primary ticket</Badge>
                </div>
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="space-y-2">
                    <Label>Ticket Name</Label>
                    <Input value={form.ticketName} onChange={(e) => setForm({ ...form, ticketName: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Price</Label>
                    <Input type="number" min="0" step="0.01" value={form.ticketPrice} onChange={(e) => setForm({ ...form, ticketPrice: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Quantity</Label>
                    <Input type="number" min="1" value={form.ticketQuantity} onChange={(e) => setForm({ ...form, ticketQuantity: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input value={form.ticketDescription} onChange={(e) => setForm({ ...form, ticketDescription: e.target.value })} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button disabled={loading}>{loading ? "Saving..." : isEditing ? "Save Changes" : "Create Event"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
