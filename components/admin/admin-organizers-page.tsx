"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Organizer = {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  address: string | null;
  status: "ACTIVE" | "SUSPENDED";
  _count?: { events: number; orders: number; tickets: number };
};

const emptyForm = { name: "", email: "", phone: "", address: "", password: "" };

export function AdminOrganizersPage() {
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const loadOrganizers = async () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    const res = await fetch(`/api/admin/organizers?${params.toString()}`);
    const data = await res.json();
    setOrganizers(data.organizers || []);
  };

  useEffect(() => {
    loadOrganizers();
  }, []);

  const createOrganizer = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    await fetch("/api/admin/organizers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm(emptyForm);
    setLoading(false);
    loadOrganizers();
  };

  const updateStatus = async (organizer: Organizer, status: "ACTIVE" | "SUSPENDED") => {
    await fetch(`/api/admin/organizers/${organizer.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    loadOrganizers();
  };

  const deleteOrganizer = async (organizer: Organizer) => {
    if (!confirm(`Delete or suspend ${organizer.name || organizer.email}?`)) return;
    await fetch(`/api/admin/organizers/${organizer.id}`, { method: "DELETE" });
    loadOrganizers();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Organizers</h1>
        <p className="text-muted-foreground">Create, suspend, and monitor event organizer accounts.</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Create Organizer</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={createOrganizer} className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-2"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
            <div className="space-y-2"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
            <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div className="space-y-2"><Label>Password</Label><Input type="password" placeholder="organizer123" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
            <div className="flex items-end"><Button className="w-full" disabled={loading}>{loading ? "Creating..." : "Create"}</Button></div>
            <div className="space-y-2 md:col-span-5"><Label>Address</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="gap-4 md:flex-row md:items-center md:justify-between">
          <CardTitle>Organizer Accounts</CardTitle>
          <div className="flex gap-2">
            <Input placeholder="Search organizers" value={search} onChange={(e) => setSearch(e.target.value)} />
            <Button type="button" variant="outline" onClick={loadOrganizers}>Search</Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Events</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {organizers.map((organizer) => (
                <TableRow key={organizer.id}>
                  <TableCell className="font-medium">{organizer.name || "Unnamed"}</TableCell>
                  <TableCell><div>{organizer.email}</div><div className="text-sm text-muted-foreground">{organizer.phone}</div></TableCell>
                  <TableCell><Badge variant={organizer.status === "ACTIVE" ? "default" : "destructive"}>{organizer.status}</Badge></TableCell>
                  <TableCell>{organizer._count?.events || 0}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Select value={organizer.status} onValueChange={(value) => updateStatus(organizer, value as any)}>
                        <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ACTIVE">Active</SelectItem>
                          <SelectItem value="SUSPENDED">Suspended</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="destructive" size="sm" onClick={() => deleteOrganizer(organizer)}>Delete</Button>
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
