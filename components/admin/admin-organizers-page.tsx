"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { Building2, CalendarDays, Mail, MoreHorizontal, Plus, Search, ShieldCheck, Ticket, Trash2, UserRound } from "lucide-react";
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
  DialogTrigger,
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

type Organizer = {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  address: string | null;
  status: "ACTIVE" | "SUSPENDED";
  createdAt: string;
  _count?: { events: number; orders: number; tickets: number };
};

const emptyForm = { name: "", email: "", phone: "", address: "", password: "" };

export function AdminOrganizersPage() {
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const loadOrganizers = async () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (status !== "ALL") params.set("status", status);
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
    try {
      const res = await fetch("/api/admin/organizers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create organizer");

      toast.success("Organizer created", {
        description: data.emailSent
          ? "An onboarding email was sent to the organizer."
          : "Account created, but the onboarding email could not be sent.",
      });
      setForm(emptyForm);
      setDialogOpen(false);
      loadOrganizers();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create organizer");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (organizer: Organizer, nextStatus: "ACTIVE" | "SUSPENDED") => {
    await fetch(`/api/admin/organizers/${organizer.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    toast.success("Organizer status updated");
    loadOrganizers();
  };

  const deleteOrganizer = async (organizer: Organizer) => {
    if (!confirm(`Delete or suspend ${organizer.name || organizer.email}?`)) return;
    await fetch(`/api/admin/organizers/${organizer.id}`, { method: "DELETE" });
    toast.success("Organizer updated");
    loadOrganizers();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Manage Organizers</h1>
          <p className="text-muted-foreground">
            Add organizer accounts, review activity, and manage account access.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Organizer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Add Organizer</DialogTitle>
              <DialogDescription>
                Create a new organizer account and send their onboarding details by email.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={createOrganizer} className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Temporary Password</Label>
                <Input type="password" placeholder="organizer123" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Address</Label>
                <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </div>
              <div className="flex justify-end gap-2 md:col-span-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button disabled={loading}>{loading ? "Creating..." : "Create Organizer"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-5">
          <div className="grid gap-3 md:grid-cols-[1fr_180px_auto]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search organizers by name, email, or phone"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All statuses</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="SUSPENDED">Suspended</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={loadOrganizers}>
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {organizers.map((organizer) => (
          <Card key={organizer.id} className="overflow-hidden">
            <CardContent className="p-5">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-primary">
                  <Building2 className="h-7 w-7" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate text-xl font-semibold">
                      {organizer.name || "Unnamed Organizer"}
                    </h3>
                    <Badge variant={organizer.status === "ACTIVE" ? "default" : "destructive"}>
                      {organizer.status}
                    </Badge>
                  </div>
                  <div className="mt-2 grid gap-2 text-sm text-muted-foreground md:grid-cols-3">
                    <span className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {organizer.email}
                    </span>
                    <span className="flex items-center gap-2">
                      <UserRound className="h-4 w-4" />
                      {organizer.phone || "No phone"}
                    </span>
                    <span className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4" />
                      Joined {new Date(organizer.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center lg:w-80">
                  <div className="rounded-lg bg-secondary/60 p-3">
                    <p className="text-lg font-bold">{organizer._count?.events || 0}</p>
                    <p className="text-xs text-muted-foreground">Events</p>
                  </div>
                  <div className="rounded-lg bg-secondary/60 p-3">
                    <p className="text-lg font-bold">{organizer._count?.orders || 0}</p>
                    <p className="text-xs text-muted-foreground">Orders</p>
                  </div>
                  <div className="rounded-lg bg-secondary/60 p-3">
                    <p className="text-lg font-bold">{organizer._count?.tickets || 0}</p>
                    <p className="text-xs text-muted-foreground">Tickets</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => updateStatus(organizer, organizer.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE")}>
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      {organizer.status === "ACTIVE" ? "Suspend" : "Activate"}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => deleteOrganizer(organizer)} className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete or Suspend
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {organizers.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Ticket className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="text-lg font-semibold">No organizers found</h3>
            <p className="mt-2 text-muted-foreground">Add an organizer to begin assigning events.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
