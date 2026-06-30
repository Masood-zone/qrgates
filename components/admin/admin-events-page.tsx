"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

type Organizer = { id: string; name: string | null; email: string };
type EventItem = {
  id: string;
  title: string;
  category: string;
  location: string;
  startDate: string;
  endDate: string;
  status: "UPCOMING" | "ONGOING" | "COMPLETED" | "CANCELLED";
  soldTickets: number;
  totalTickets: number;
  organizer: Organizer;
  ticketTypes: Array<{ id: string; name: string; price: number; quantity: number; description?: string | null }>;
  _count?: { tickets: number; orders: number; verificationLogs: number };
};

const emptyForm = {
  id: "",
  title: "",
  description: "",
  category: "conference",
  location: "",
  organizerId: "",
  startDate: "",
  endDate: "",
  status: "UPCOMING",
  ticketName: "Standard",
  ticketPrice: "0",
  ticketQuantity: "100",
  ticketDescription: "Standard admission",
};

export function AdminEventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [filters, setFilters] = useState({ search: "", organizerId: "ALL", status: "ALL" });

  const isEditing = Boolean(form.id);

  const loadData = async () => {
    const eventParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => value && value !== "ALL" && eventParams.set(key, value));
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

  const submitEvent = async (event: React.FormEvent) => {
    event.preventDefault();
    const payload = {
      title: form.title,
      description: form.description,
      category: form.category,
      location: form.location,
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

    await fetch(isEditing ? `/api/admin/events/${form.id}` : "/api/admin/events", {
      method: isEditing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setForm(emptyForm);
    loadData();
  };

  const editEvent = (event: EventItem) => {
    const ticket = event.ticketTypes[0];
    setForm({
      id: event.id,
      title: event.title,
      description: "",
      category: event.category,
      location: event.location,
      organizerId: event.organizer.id,
      startDate: new Date(event.startDate).toISOString().slice(0, 16),
      endDate: new Date(event.endDate).toISOString().slice(0, 16),
      status: event.status,
      ticketName: ticket?.name || "Standard",
      ticketPrice: String(ticket?.price || 0),
      ticketQuantity: String(ticket?.quantity || event.totalTickets || 100),
      ticketDescription: ticket?.description || "Standard admission",
    });
  };

  const changeStatus = async (event: EventItem, status: string) => {
    await fetch(`/api/admin/events/${event.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    loadData();
  };

  const deleteEvent = async (event: EventItem) => {
    if (!confirm(`Delete or cancel ${event.title}?`)) return;
    await fetch(`/api/admin/events/${event.id}`, { method: "DELETE" });
    loadData();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Events</h1>
        <p className="text-muted-foreground">Create, edit, cancel, and safely delete organizer-created events.</p>
      </div>

      <Card>
        <CardHeader><CardTitle>{isEditing ? "Edit Event" : "Create Event"}</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={submitEvent} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2 md:col-span-2"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
            <div className="space-y-2"><Label>Organizer</Label><Select value={form.organizerId} onValueChange={(value) => setForm({ ...form, organizerId: value })}><SelectTrigger><SelectValue placeholder="Select organizer" /></SelectTrigger><SelectContent>{organizers.map((org) => <SelectItem key={org.id} value={org.id}>{org.name || org.email}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label>Status</Label><Select value={form.status} onValueChange={(value) => setForm({ ...form, status: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="UPCOMING">Upcoming</SelectItem><SelectItem value="ONGOING">Ongoing</SelectItem><SelectItem value="COMPLETED">Completed</SelectItem><SelectItem value="CANCELLED">Cancelled</SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><Label>Category</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required /></div>
            <div className="space-y-2"><Label>Location</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required /></div>
            <div className="space-y-2"><Label>Starts</Label><Input type="datetime-local" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required /></div>
            <div className="space-y-2"><Label>Ends</Label><Input type="datetime-local" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} required /></div>
            <div className="space-y-2"><Label>Ticket Name</Label><Input value={form.ticketName} onChange={(e) => setForm({ ...form, ticketName: e.target.value })} /></div>
            <div className="space-y-2"><Label>Ticket Price</Label><Input type="number" value={form.ticketPrice} onChange={(e) => setForm({ ...form, ticketPrice: e.target.value })} /></div>
            <div className="space-y-2"><Label>Ticket Quantity</Label><Input type="number" value={form.ticketQuantity} onChange={(e) => setForm({ ...form, ticketQuantity: e.target.value })} /></div>
            <div className="space-y-2"><Label>Ticket Description</Label><Input value={form.ticketDescription} onChange={(e) => setForm({ ...form, ticketDescription: e.target.value })} /></div>
            <div className="space-y-2 md:col-span-4"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="flex gap-2 md:col-span-4">
              <Button>{isEditing ? "Save Changes" : "Create Event"}</Button>
              {isEditing && <Button type="button" variant="outline" onClick={() => setForm(emptyForm)}>Cancel Edit</Button>}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="gap-4">
          <CardTitle>All Events</CardTitle>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <Input placeholder="Search events" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
            <Select value={filters.organizerId} onValueChange={(value) => setFilters({ ...filters, organizerId: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ALL">All organizers</SelectItem>{organizers.map((org) => <SelectItem key={org.id} value={org.id}>{org.name || org.email}</SelectItem>)}</SelectContent></Select>
            <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ALL">All statuses</SelectItem><SelectItem value="UPCOMING">Upcoming</SelectItem><SelectItem value="ONGOING">Ongoing</SelectItem><SelectItem value="COMPLETED">Completed</SelectItem><SelectItem value="CANCELLED">Cancelled</SelectItem></SelectContent></Select>
            <Button variant="outline" onClick={loadData}>Apply Filters</Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Event</TableHead><TableHead>Organizer</TableHead><TableHead>Status</TableHead><TableHead>Tickets</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell><div className="font-medium">{event.title}</div><div className="text-sm text-muted-foreground">{event.location}</div></TableCell>
                  <TableCell>{event.organizer.name || event.organizer.email}</TableCell>
                  <TableCell><Badge variant={event.status === "CANCELLED" ? "destructive" : "default"}>{event.status}</Badge></TableCell>
                  <TableCell>{event.soldTickets}/{event.totalTickets}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => editEvent(event)}>Edit</Button>
                      <Select value={event.status} onValueChange={(value) => changeStatus(event, value)}>
                        <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="UPCOMING">Upcoming</SelectItem><SelectItem value="ONGOING">Ongoing</SelectItem><SelectItem value="COMPLETED">Completed</SelectItem><SelectItem value="CANCELLED">Cancelled</SelectItem></SelectContent>
                      </Select>
                      <Button size="sm" variant="destructive" onClick={() => deleteEvent(event)}>Delete</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
