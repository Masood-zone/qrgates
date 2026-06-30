"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Buyer = {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  status: "ACTIVE" | "SUSPENDED";
  createdAt: string;
  _count: { orders: number; tickets: number };
};

export function AdminUsersPage() {
  const [users, setUsers] = useState<Buyer[]>([]);
  const [search, setSearch] = useState("");

  const loadUsers = async () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    const res = await fetch(`/api/admin/users?${params.toString()}`);
    const data = await res.json();
    setUsers(data.users || []);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const setStatus = async (user: Buyer, status: "ACTIVE" | "SUSPENDED") => {
    await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    loadUsers();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Buyers</h1>
        <p className="text-muted-foreground">View buyer activity and suspend or reactivate accounts.</p>
      </div>
      <Card>
        <CardHeader className="gap-4 md:flex-row md:items-center md:justify-between">
          <CardTitle>Buyer Accounts</CardTitle>
          <div className="flex gap-2">
            <Input placeholder="Search buyers" value={search} onChange={(e) => setSearch(e.target.value)} />
            <Button variant="outline" onClick={loadUsers}>Search</Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Tickets</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name || "Unnamed"}</TableCell>
                  <TableCell><div>{user.email}</div><div className="text-sm text-muted-foreground">{user.phone}</div></TableCell>
                  <TableCell><Badge variant={user.status === "ACTIVE" ? "default" : "destructive"}>{user.status}</Badge></TableCell>
                  <TableCell>{user._count.orders}</TableCell>
                  <TableCell>{user._count.tickets}</TableCell>
                  <TableCell className="text-right">
                    <Select value={user.status} onValueChange={(value) => setStatus(user, value as any)}>
                      <SelectTrigger className="ml-auto w-32"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="SUSPENDED">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
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
