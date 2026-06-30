"use client";

import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DashboardLoadingPage } from "@/components/ui/loading";

type Organizer = { id: string; name: string | null; email: string };
type AnalyticsData = {
  summary: { totalUsers: number; totalOrganizers: number; totalEvents: number; totalTickets: number; completedOrders: number; totalRevenue: number };
  organizers: Organizer[];
  salesTrend: Array<{ date: string; revenue: number; tickets: number }>;
  topEvents: Array<{ id: string; title: string; organizer: string; soldTickets: number; totalTickets: number; revenue: number }>;
};

export function AdminAnalyticsPage() {
  const [organizerId, setOrganizerId] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("organizerId", organizerId);
    params.set("status", status);
    setIsLoading(true);
    fetch(`/api/admin/analytics?${params.toString()}`)
      .then((res) => res.json())
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setIsLoading(false));
  }, [organizerId, status]);

  if (isLoading && !data) {
    return <DashboardLoadingPage />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Global performance with organizer drilldown.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full md:w-auto">
          <Select value={organizerId} onValueChange={setOrganizerId}>
            <SelectTrigger className="md:w-56"><SelectValue placeholder="Organizer" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All organizers</SelectItem>
              {(data?.organizers || []).map((organizer) => (
                <SelectItem key={organizer.id} value={organizer.id}>{organizer.name || organizer.email}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="md:w-44"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              <SelectItem value="UPCOMING">Upcoming</SelectItem>
              <SelectItem value="ONGOING">Ongoing</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardHeader><CardTitle className="text-sm">Revenue</CardTitle></CardHeader><CardContent className="text-2xl font-bold">Ghc{(data?.summary.totalRevenue || 0).toLocaleString()}</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Events</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{data?.summary.totalEvents || 0}</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Tickets Sold</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{data?.summary.totalTickets || 0}</CardContent></Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Revenue Trend</CardTitle></CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.salesTrend || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Top Events By Revenue</CardTitle></CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.topEvents || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="title" hide />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
