"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type EventOption = { id: string; title: string; organizer: { name: string | null; email: string } };
type Officer = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  active: boolean;
  event: EventOption;
  user: { status: "ACTIVE" | "SUSPENDED" };
  _count?: { verificationLogs: number };
};

const emptyForm = { id: "", name: "", email: "", phone: "", eventId: "", password: "" };

export function AdminSecurityPage() {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [events, setEvents] = useState<EventOption[]>([]);
  const [form, setForm] = useState(emptyForm);
  const isEditing = Boolean(form.id);

  const loadData = async () => {
    const [securityRes, eventsRes] = await Promise.all([
      fetch("/api/admin/security"),
      fetch("/api/admin/events"),
    ]);
    const securityData = await securityRes.json();
    const eventsData = await eventsRes.json();
    setOfficers(securityData.officers || []);
    setEvents(eventsData.events || []);
  };

  useEffect(() => {
    loadData();
  }, []);

  const submitOfficer = async (event: React.FormEvent) => {
    event.preventDefault();
    await fetch(isEditing ? `/api/admin/security/${form.id}` : "/api/admin/security", {
      method: isEditing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm(emptyForm);
    loadData();
  };

  const editOfficer = (officer: Officer) => {
    setForm({
      id: officer.id,
      name: officer.name,
      email: officer.email,
      phone: officer.phone || "",
      eventId: officer.event.id,
      password: "",
    });
  };

  const setActive = async (officer: Officer, active: boolean) => {
    await fetch(`/api/admin/security/${officer.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active }),
    });
    loadData();
  };

  const deleteOfficer = async (officer: Officer) => {
    if (!confirm(`Delete or deactivate ${officer.name}?`)) return;
    await fetch(`/api/admin/security/${officer.id}`, { method: "DELETE" });
    loadData();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Security Staff</h1>
        <p className="text-muted-foreground">Manage event-based ticket verification assignments.</p>
      </div>

      <Card>
        <CardHeader><CardTitle>{isEditing ? "Edit Assignment" : "Create Assignment"}</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={submitOfficer} className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-2"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
            <div className="space-y-2"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
            <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div className="space-y-2"><Label>Event</Label><Select value={form.eventId} onValueChange={(value) => setForm({ ...form, eventId: value })}><SelectTrigger><SelectValue placeholder="Select event" /></SelectTrigger><SelectContent>{events.map((event) => <SelectItem key={event.id} value={event.id}>{event.title}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label>Password</Label><Input type="password" placeholder="security123" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} disabled={isEditing} /></div>
            <div className="flex gap-2 md:col-span-5">
              <Button>{isEditing ? "Save Assignment" : "Create Assignment"}</Button>
              {isEditing && <Button type="button" variant="outline" onClick={() => setForm(emptyForm)}>Cancel Edit</Button>}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Assignments</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Officer</TableHead><TableHead>Event</TableHead><TableHead>Active</TableHead><TableHead>Logs</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {officers.map((officer) => (
                <TableRow key={officer.id}>
                  <TableCell><div className="font-medium">{officer.name}</div><div className="text-sm text-muted-foreground">{officer.email}</div></TableCell>
                  <TableCell><div>{officer.event.title}</div><div className="text-sm text-muted-foreground">{officer.event.organizer.name || officer.event.organizer.email}</div></TableCell>
                  <TableCell><div className="flex items-center gap-2"><Switch checked={officer.active} onCheckedChange={(checked) => setActive(officer, checked)} /><Badge variant={officer.active ? "default" : "secondary"}>{officer.active ? "Active" : "Inactive"}</Badge></div></TableCell>
                  <TableCell>{officer._count?.verificationLogs || 0}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => editOfficer(officer)}>Edit</Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteOfficer(officer)}>Delete</Button>
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
