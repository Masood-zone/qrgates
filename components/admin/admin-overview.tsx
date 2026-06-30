"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BarChart3, Calendar, ShoppingBag, Ticket, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DashboardLoadingPage } from "@/components/ui/loading";

type AnalyticsData = {
  summary: {
    totalUsers: number;
    totalOrganizers: number;
    totalEvents: number;
    totalTickets: number;
    completedOrders: number;
    totalRevenue: number;
  };
  topEvents: Array<{ id: string; title: string; organizer: string; soldTickets: number; totalTickets: number; revenue: number }>;
  recentOrders: Array<{ id: string; eventTitle: string; customer: string; total: number; tickets: number }>;
};

export function AdminOverview() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetch("/api/admin/analytics")
      .then((res) => res.json())
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <DashboardLoadingPage />;
  }

  const summary = data?.summary;
  const stats = [
    { title: "Buyers", value: summary?.totalUsers || 0, icon: Users },
    { title: "Organizers", value: summary?.totalOrganizers || 0, icon: Users },
    { title: "Events", value: summary?.totalEvents || 0, icon: Calendar },
    { title: "Tickets Sold", value: summary?.totalTickets || 0, icon: Ticket },
    { title: "Orders", value: summary?.completedOrders || 0, icon: ShoppingBag },
    { title: "Revenue", value: `Ghc${(summary?.totalRevenue || 0).toLocaleString()}`, icon: BarChart3 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Overview</h1>
          <p className="text-muted-foreground">Monitor platform activity and jump into management tasks.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline"><Link href="/admin/events">Manage Events</Link></Button>
          <Button asChild><Link href="/admin/organizers">Manage Organizers</Link></Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Top Events</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {(data?.topEvents || []).slice(0, 5).map((event) => (
              <div key={event.id} className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium truncate">{event.title}</p>
                  <p className="text-sm text-muted-foreground truncate">{event.organizer}</p>
                </div>
                <div className="text-right text-sm">
                  <p className="font-medium">Ghc{event.revenue.toLocaleString()}</p>
                  <p className="text-muted-foreground">{event.soldTickets}/{event.totalTickets} sold</p>
                </div>
              </div>
            ))}
            {(data?.topEvents || []).length === 0 && (
              <p className="text-sm text-muted-foreground">No completed event sales yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Recent Orders</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {(data?.recentOrders || []).slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium truncate">{order.eventTitle}</p>
                  <p className="text-sm text-muted-foreground truncate">{order.customer}</p>
                </div>
                <div className="text-right text-sm">
                  <p className="font-medium">Ghc{order.total.toLocaleString()}</p>
                  <p className="text-muted-foreground">{order.tickets} tickets</p>
                </div>
              </div>
            ))}
            {(data?.recentOrders || []).length === 0 && (
              <p className="text-sm text-muted-foreground">No completed orders yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
