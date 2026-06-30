import { DashboardOverview } from "@/components/dashboard/dashboard-overview";

export const metadata = {
  title: "Dashboard | QuickGates",
  description: "Your personal dashboard",
};

export default async function DashboardPage() {
  return <DashboardOverview />;
}
