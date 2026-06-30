"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Calendar, Home, Settings, Shield, Ticket, Users, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebarToggle } from "@/components/sidebar-toggle-context";

const navigation = [
  { name: "Overview", href: "/admin", icon: Home },
  { name: "Organizers", href: "/admin/organizers", icon: Users },
  { name: "Events", href: "/admin/events", icon: Calendar },
  { name: "Security", href: "/admin/security", icon: Shield },
  { name: "Buyers", href: "/admin/users", icon: Ticket },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { open, setOpen } = useSidebarToggle();

  return (
    <>
      <div
        className={cn("fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden", open ? "block" : "hidden")}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />
      <nav
        className={cn(
          "fixed z-40 top-0 left-0 h-full w-64 bg-card border-r border-border shadow-lg md:static md:block md:h-auto md:w-64 transition-transform duration-200",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
        aria-label="Admin sidebar"
      >
        <button
          className="absolute top-4 right-4 md:hidden text-muted-foreground hover:text-foreground"
          onClick={() => setOpen(false)}
          aria-label="Close sidebar"
        >
          <X className="w-6 h-6" />
        </button>
        <div className="flex items-center justify-center h-16 px-4 bg-primary">
          <h1 className="text-xl font-bold text-primary-foreground">Admin Portal</h1>
        </div>
        <div className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
                onClick={() => setOpen(false)}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
