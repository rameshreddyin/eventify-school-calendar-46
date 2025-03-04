
import React from "react";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import {
  Calendar,
  Home,
  Users,
  BookOpen,
  ClipboardCheck,
  BarChart2,
  MessageSquare,
  Settings,
  LogOut,
} from "lucide-react";

interface SidebarProps {
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const location = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "Leads & Enrollments", href: "/leads", icon: Users },
    { name: "Students", href: "/students", icon: Users },
    { name: "Staff", href: "/staff", icon: Users },
    { name: "Classes", href: "/classes", icon: BookOpen },
    { name: "Subjects", href: "/subjects", icon: BookOpen },
    { name: "Attendance", href: "/attendance", icon: ClipboardCheck },
    { name: "Finance", href: "/finance", icon: BarChart2 },
    { name: "Events", href: "/events", icon: Calendar },
    { name: "Messages", href: "/messages", icon: MessageSquare },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <div
      className={cn(
        "flex h-screen flex-col bg-sidebar border-r",
        className
      )}
    >
      <div className="flex h-16 items-center border-b border-sidebar-border px-6">
        <h1 className="text-xl font-bold text-sidebar-foreground">EduManager</h1>
      </div>

      <div className="flex items-center border-b border-sidebar-border px-6 py-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sidebar-accent text-sidebar-accent-foreground">
          <span className="text-lg font-medium">S</span>
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-sidebar-foreground">
            Super Admin
          </p>
          <p className="text-xs text-sidebar-foreground/70">
            Super Admin
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-auto py-2">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-xs font-semibold text-sidebar-foreground/60">
            MAIN
          </h2>
          <nav className="space-y-1">
            {navigation.slice(0, 4).map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "group flex items-center rounded-md px-3 py-2 text-sm font-medium",
                  location.pathname === item.href
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon
                  className={cn(
                    "mr-3 h-5 w-5",
                    location.pathname === item.href
                      ? "text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/70 group-hover:text-sidebar-accent-foreground"
                  )}
                />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-xs font-semibold text-sidebar-foreground/60">
            ACADEMIC
          </h2>
          <nav className="space-y-1">
            {navigation.slice(4, 7).map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "group flex items-center rounded-md px-3 py-2 text-sm font-medium",
                  location.pathname === item.href
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon
                  className={cn(
                    "mr-3 h-5 w-5",
                    location.pathname === item.href
                      ? "text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/70 group-hover:text-sidebar-accent-foreground"
                  )}
                />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-xs font-semibold text-sidebar-foreground/60">
            ADMINISTRATION
          </h2>
          <nav className="space-y-1">
            {navigation.slice(7).map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "group flex items-center rounded-md px-3 py-2 text-sm font-medium",
                  location.pathname === item.href
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon
                  className={cn(
                    "mr-3 h-5 w-5",
                    location.pathname === item.href
                      ? "text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/70 group-hover:text-sidebar-accent-foreground"
                  )}
                />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <div className="border-t border-sidebar-border p-4">
        <Link
          to="/logout"
          className="flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
