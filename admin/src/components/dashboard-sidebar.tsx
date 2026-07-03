"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { toggleSidebar } from "../store/themeSlice";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Users, 
  ShieldCheck, 
  Map, 
  CalendarDays, 
  CreditCard, 
  MessageSquareWarning, 
  BellRing, 
  FolderEdit, 
  BarChart3, 
  Settings, 
  Compass,
  ChevronLeft,
  ChevronRight,
  LogOut
} from "lucide-react";
import { logout } from "../store/authSlice";
import { useRouter } from "next/navigation";

const sidebarLinks = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/organizers", label: "Organizers", icon: ShieldCheck },
  { href: "/admin/trips", label: "Trips", icon: Map },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarDays },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/reports", label: "Reports & Reviews", icon: MessageSquareWarning },
  { href: "/admin/notifications", label: "Notifications", icon: BellRing },
  { href: "/admin/content", label: "Content Manager", icon: FolderEdit },
  { href: "/admin/analytics", label: "Deep Analytics", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const router = useRouter();
  const sidebarOpen = useSelector((state: RootState) => state.theme.sidebarOpen);
  const user = useSelector((state: RootState) => state.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    router.push("/login");
  };

  return (
    <aside
      className={cn(
        "h-screen sticky top-0 bg-slate-900 text-slate-100 border-r border-slate-800 flex flex-col transition-all duration-300 z-40 select-none shadow-xl",
        sidebarOpen ? "w-64" : "w-20"
      )}
    >
      {/* Sidebar Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800 relative">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <div className="p-2 bg-primary rounded-lg text-primary-foreground shadow-md shadow-primary/30">
            <Compass className="h-6 w-6 animate-pulse" />
          </div>
          {sidebarOpen && (
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-primary to-indigo-400 bg-clip-text text-transparent">
              TrekMate
            </span>
          )}
        </Link>
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="absolute -right-3 top-1/2 -translate-y-1/2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:text-white rounded-full p-1 cursor-pointer transition-all hover:scale-105"
        >
          {sidebarOpen ? <ChevronLeft className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        </button>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
        {sidebarLinks.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
          const Icon = link.icon;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
              )}
            >
              <Icon className={cn("h-5 w-5 shrink-0 transition-transform", !isActive && "group-hover:scale-110")} />
              {sidebarOpen ? (
                <span>{link.label}</span>
              ) : (
                <span className="absolute left-16 bg-slate-950 text-slate-100 text-xs px-2.5 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-md z-50">
                  {link.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Sidebar Footer User Info */}
      <div className="p-4 border-t border-slate-800 flex flex-col gap-3">
        {user && (
          <div className="flex items-center gap-3">
            <img
              src={user.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
              alt={user.name}
              className="h-10 w-10 rounded-full bg-slate-800 object-cover ring-2 ring-primary/40 shrink-0"
            />
            {sidebarOpen && (
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-slate-200 truncate">{user.name}</span>
                <span className="text-xs text-slate-400 truncate">{user.email}</span>
              </div>
            )}
          </div>
        )}
        <button
          onClick={handleLogout}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer w-full text-left",
            !sidebarOpen && "justify-center"
          )}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {sidebarOpen && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
