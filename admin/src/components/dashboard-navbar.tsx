"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { toggleTheme } from "../store/themeSlice";
import { Bell, Sun, Moon, Search, AlertTriangle, Check, ShieldAlert } from "lucide-react";
import { NotificationService } from "../services/api";
import { formatDistanceToNow } from "date-fns";

export default function DashboardNavbar() {
  const dispatch = useDispatch();
  const theme = useSelector((state: RootState) => state.theme.theme);
  const user = useSelector((state: RootState) => state.auth.user);
  
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(2);

  useEffect(() => {
    // Standard mock alerts for admin console
    setNotifications([
      {
        id: "nt1",
        title: "New Application",
        message: "Himalayan Sherpa Guides submitted an organizer request.",
        type: "application",
        time: new Date(Date.now() - 1000 * 60 * 30), // 30m ago
        read: false
      },
      {
        id: "nt2",
        title: "SOS Alert Active",
        message: "SOS triggered on 'Glacier Trekking Pro' trek.",
        type: "sos",
        time: new Date(Date.now() - 1000 * 60 * 120), // 2h ago
        read: false
      },
      {
        id: "nt3",
        title: "Refund Request",
        message: "Booking #b3 requested a refund of $380.",
        type: "refund",
        time: new Date(Date.now() - 1000 * 60 * 1440), // 1d ago
        read: true
      }
    ]);
  }, []);

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const handleToggleTheme = () => {
    dispatch(toggleTheme());
  };

  return (
    <header className="h-16 sticky top-0 bg-background/80 backdrop-blur-md border-b border-border/80 flex items-center justify-between px-8 z-30 shadow-xs">
      {/* Search Bar */}
      <div className="relative w-72 max-w-lg hidden sm:block">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
          <Search className="h-4 w-4" />
        </span>
        <input
          type="text"
          placeholder="Global search console..."
          className="w-full pl-9 pr-4 py-2 border border-border/70 rounded-full bg-muted/40 placeholder-muted-foreground text-xs focus-visible:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all duration-300"
        />
      </div>
      <div className="sm:hidden font-bold text-lg text-primary tracking-tight">TrekMate</div>

      {/* Action Buttons */}
      <div className="flex items-center gap-4">
        {/* Dark Mode Switcher */}
        <button
          onClick={handleToggleTheme}
          className="p-2 border border-border/40 hover:bg-muted/70 rounded-full text-slate-600 dark:text-slate-300 transition-all cursor-pointer hover:scale-105 active:scale-95"
          title="Toggle Light/Dark Theme"
        >
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="p-2 border border-border/40 hover:bg-muted/70 rounded-full text-slate-600 dark:text-slate-300 transition-all cursor-pointer relative hover:scale-105 active:scale-95"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <>
              {/* Overlay backdrop to close */}
              <div className="fixed inset-0 z-40 cursor-default" onClick={() => setNotifOpen(false)} />
              
              <div className="absolute right-0 mt-3 w-80 max-w-xs sm:w-96 rounded-xl border border-border bg-card p-4 shadow-xl z-50 animate-in fade-in-50 duration-200">
                <div className="flex items-center justify-between border-b border-border pb-2 mb-3">
                  <h4 className="font-semibold text-sm">Notifications</h4>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-xs text-primary hover:underline font-medium cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`flex gap-3 p-2.5 rounded-lg text-xs transition-colors ${
                        n.read ? "bg-background" : "bg-muted/40 hover:bg-muted"
                      }`}
                    >
                      <div className="shrink-0 mt-0.5">
                        {n.type === "sos" ? (
                          <div className="p-1.5 bg-rose-500/10 text-rose-500 rounded-full">
                            <ShieldAlert className="h-4 w-4" />
                          </div>
                        ) : n.type === "application" ? (
                          <div className="p-1.5 bg-indigo-500/10 text-indigo-500 rounded-full">
                            <Check className="h-4 w-4" />
                          </div>
                        ) : (
                          <div className="p-1.5 bg-amber-500/10 text-amber-500 rounded-full">
                            <AlertTriangle className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-1">
                          <span className="font-bold text-slate-800 dark:text-slate-200 truncate">{n.title}</span>
                          <span className="text-[10px] text-muted-foreground shrink-0">
                            {formatDistanceToNow(new Date(n.time), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-muted-foreground text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                          {n.message}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Info Capsule */}
        {user && (
          <div className="flex items-center gap-2 border border-border/40 pl-2 pr-3 py-1 rounded-full bg-muted/20">
            <img
              src={user.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
              alt={user.name}
              className="h-7 w-7 rounded-full bg-slate-800 object-cover ring-1 ring-primary/20"
            />
            <span className="text-xs font-semibold hidden md:inline-block max-w-[120px] truncate">
              {user.name}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
