"use client";

import React, { useEffect, useState } from "react";
import { 
  Users, 
  ShieldCheck, 
  Map, 
  CalendarDays, 
  DollarSign, 
  Activity, 
  TrendingUp, 
  ArrowUpRight 
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { MockDB } from "@/services/mock-data";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";

// Mock chart data
const revenueData = [
  { name: "Jan", revenue: 4000, bookings: 12 },
  { name: "Feb", revenue: 5500, bookings: 16 },
  { name: "Mar", revenue: 7200, bookings: 22 },
  { name: "Apr", revenue: 8100, bookings: 28 },
  { name: "May", revenue: 11200, bookings: 35 },
  { name: "Jun", revenue: 15400, bookings: 46 }
];

export default function DashboardOverview() {
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState({
    usersCount: 0,
    organizersCount: 0,
    tripsCount: 0,
    activeTripsCount: 0,
    bookingsCount: 0,
    revenue: 0
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
    
    // Load dynamic figures from MockDB
    const users: any[] = MockDB.getUsers();
    const organizers: any[] = MockDB.getOrganizers();
    const trips: any[] = MockDB.getTrips();
    const bookings: any[] = MockDB.getBookings();
    
    const usersCount = users.filter((u: any) => u.role !== "admin").length;
    const organizersCount = organizers.filter((o: any) => o.status === "approved").length;
    const tripsCount = trips.length;
    const activeTripsCount = trips.filter((t: any) => t.status === "approved").length;
    const bookingsCount = bookings.length;
    
    const revenue = bookings
      .filter((b: any) => b.booking_status === "confirmed")
      .reduce((sum: number, b: any) => sum + b.amount, 0);
      
    setStats({
      usersCount,
      organizersCount,
      tripsCount,
      activeTripsCount,
      bookingsCount,
      revenue
    });

    // Compile recent activities from logs
    const activitiesList: any[] = [];
    users.forEach((u: any) => {
      u.activities.forEach((act: any) => {
        activitiesList.push({
          id: act.id,
          user: u.name,
          role: u.role,
          action: act.action,
          time: new Date(act.time),
          avatar: u.profileImage
        });
      });
    });
    // Sort activities descending
    activitiesList.sort((a: any, b: any) => b.time.getTime() - a.time.getTime());
    setRecentActivities(activitiesList.slice(0, 5));

    // Get latest bookings
    const bookingsCopy = [...bookings];
    bookingsCopy.sort((a: any, b: any) => new Date(b.booking_date).getTime() - new Date(a.booking_date).getTime());
    setRecentBookings(bookingsCopy.slice(0, 4));
  }, []);

  return (
    <div className="space-y-8">
      {/* Welcome Heading */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Platform Command Center</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Real-time analytics and quality oversight for TrekMate.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 bg-primary/10 border border-primary/20 text-primary rounded-full">
          <TrendingUp className="h-4 w-4" />
          <span>System Status: 100% Operational</span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Total Users */}
        <Card className="hover:scale-[1.02] cursor-default transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Users</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold">{stats.usersCount}</div>
            <p className="text-[10px] text-muted-foreground mt-1">+4 registered this week</p>
          </CardContent>
        </Card>

        {/* Total Organizers */}
        <Card className="hover:scale-[1.02] cursor-default transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Organizers</CardTitle>
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold">{stats.organizersCount}</div>
            <p className="text-[10px] text-muted-foreground mt-1">1 application pending</p>
          </CardContent>
        </Card>

        {/* Total Trips */}
        <Card className="hover:scale-[1.02] cursor-default transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Trips</CardTitle>
            <Map className="h-4 w-4 text-sky-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold">{stats.tripsCount}</div>
            <p className="text-[10px] text-muted-foreground mt-1">2 hikes pending review</p>
          </CardContent>
        </Card>

        {/* Active Trips */}
        <Card className="hover:scale-[1.02] cursor-default transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Active Trips</CardTitle>
            <Activity className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold">{stats.activeTripsCount}</div>
            <p className="text-[10px] text-muted-foreground mt-1">Running smoothly</p>
          </CardContent>
        </Card>

        {/* Total Bookings */}
        <Card className="hover:scale-[1.02] cursor-default transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Bookings</CardTitle>
            <CalendarDays className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold">{stats.bookingsCount}</div>
            <p className="text-[10px] text-muted-foreground mt-1">75% confirmation rate</p>
          </CardContent>
        </Card>

        {/* Total Revenue */}
        <Card className="hover:scale-[1.02] cursor-default transition-all duration-300 bg-primary/5 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-primary dark:text-primary-foreground">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-primary dark:text-slate-100">{formatCurrency(stats.revenue)}</div>
            <p className="text-[10px] text-primary/70 dark:text-slate-400 mt-1">Stripe + Local Ledger</p>
          </CardContent>
        </Card>
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Monthly Revenue Area Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Monthly Revenue Growth</CardTitle>
            <CardDescription>Visual tracker representing transaction volume of confirmed bookings.</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" fontSize={11} stroke="#64748b" />
                  <YAxis fontSize={11} stroke="#64748b" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "rgba(15, 23, 42, 0.95)", 
                      borderColor: "rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      color: "#f8fafc"
                    }} 
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" name="Revenue ($)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full bg-slate-800/20 animate-pulse rounded-lg flex items-center justify-center">Loading Chart...</div>
            )}
          </CardContent>
        </Card>

        {/* Booking Statistics Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Booking Trends</CardTitle>
            <CardDescription>Number of transactions booked monthly.</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" fontSize={11} stroke="#64748b" />
                  <YAxis fontSize={11} stroke="#64748b" />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: "rgba(15, 23, 42, 0.95)", 
                      borderColor: "rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      color: "#f8fafc"
                    }}
                  />
                  <Bar dataKey="bookings" fill="#6366f1" radius={[4, 4, 0, 0]} name="Bookings" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full bg-slate-800/20 animate-pulse rounded-lg flex items-center justify-center">Loading Chart...</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Ticker and Booking Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Transactions Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Recent Bookings</CardTitle>
              <CardDescription>Latest client bookings logged on the platform.</CardDescription>
            </div>
            <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Trekker</TableHead>
                  <TableHead>Trip</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentBookings.map((b) => (
                  <TableRow key={b._id} className="hover:bg-slate-500/5">
                    <TableCell className="font-semibold">{b.user_name}</TableCell>
                    <TableCell className="max-w-[120px] truncate">{b.trip_name}</TableCell>
                    <TableCell>{formatCurrency(b.amount)}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          b.booking_status === "confirmed" ? "success" : 
                          b.booking_status === "pending" ? "warning" : "destructive"
                        }
                      >
                        {b.booking_status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Live Activity Ticker */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity History</CardTitle>
            <CardDescription>Audit log of system occurrences.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivities.map((act) => (
              <div key={act.id} className="flex gap-4 items-start pb-3 border-b border-border/40 last:border-0 last:pb-0">
                <img 
                  src={act.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${act.user}`} 
                  alt="user" 
                  className="h-9 w-9 rounded-full bg-slate-800 border border-primary/20 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {act.user} <span className="font-normal text-muted-foreground text-xs">({act.role})</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{act.action}</p>
                </div>
                <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                  {formatDate(act.time)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
