"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import DashboardSidebar from "../../components/dashboard-sidebar";
import DashboardNavbar from "../../components/dashboard-navbar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      if (!isAuthenticated) {
        router.replace("/login");
      } else if (user && user.role !== "admin") {
        
        console.error("Access denied: role is not admin");
        router.replace("/login");
      }
    }
  }, [isClient, isAuthenticated, user, router]);

  if (!isClient || !isAuthenticated || (user && user.role !== "admin")) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm font-semibold">Authorizing Platform Administrator...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background text-foreground transition-colors duration-300">
      {}
      <DashboardSidebar />

      {}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-hidden">
        {}
        <DashboardNavbar />

        {}
        <main className="flex-1 overflow-y-auto p-8 bg-slate-50/50 dark:bg-slate-950/20">
          <div className="max-w-7xl mx-auto animate-in fade-in-30 slide-in-from-bottom-2 duration-300">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
