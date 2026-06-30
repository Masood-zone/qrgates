import type React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/app/api/auth/actions";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { SidebarToggleProvider } from "@/components/sidebar-toggle-context";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user) redirect("/auth/signin");
  if (user.role !== "ADMIN") redirect("/dashboard");

  return (
    <SidebarToggleProvider>
      <div className="flex flex-col min-h-screen bg-background">
        <AdminHeader />
        <div className="flex flex-1 min-h-0">
          <AdminSidebar />
          <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8 bg-background">{children}</main>
        </div>
      </div>
    </SidebarToggleProvider>
  );
}
