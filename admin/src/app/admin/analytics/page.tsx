"use client";

import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { OrganizerService } from "@/services/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { BarChart3, TrendingUp, Users, ArrowUpRight, Compass } from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell 
} from "recharts";


const growthData = [
  { name: "Jan", trekkers: 80, organizers: 5 },
  { name: "Feb", trekkers: 120, organizers: 6 },
  { name: "Mar", trekkers: 190, organizers: 8 },
  { name: "Apr", trekkers: 280, organizers: 10 },
  { name: "May", trekkers: 390, organizers: 12 },
  { name: "Jun", trekkers: 510, organizers: 15 }
];


const destinationShare = [
  { name: "Himalayas", value: 45 },
  { name: "Rocky Mountains", value: 25 },
  { name: "Grand Canyon", value: 20 },
  { name: "Kenai Fjords", value: 10 }
];

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#06b6d4"];

export default function DeepAnalytics() {
  const [mounted, setMounted] = useState(false);

  
  const { data: orgsResponse, isLoading } = useQuery({
    queryKey: ["organizers"],
    queryFn: OrganizerService.getAllOrganizers
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const organizers: any[] = orgsResponse?.data || [];
  
  const topOrganizers = [...organizers]
    .sort((a: any, b: any) => b.earnings - a.earnings)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">System Performance & Analytics</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Deep-dive charts summarizing customer acquisition growth, regional popularities, and organizer revenues.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>User & Partner Acquisition</CardTitle>
            <CardDescription>Monthly registration volume of active hikers vs approved organizers.</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={growthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Line type="monotone" dataKey="trekkers" stroke="#6366f1" strokeWidth={3} activeDot={{ r: 8 }} name="Hikers" />
                  <Line type="monotone" dataKey="organizers" stroke="#10b981" strokeWidth={3} name="Organizers" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full bg-slate-800/20 animate-pulse rounded-lg flex items-center justify-center">Loading Growth...</div>
            )}
          </CardContent>
        </Card>

        {}
        <Card>
          <CardHeader>
            <CardTitle>Spotlight Popularity</CardTitle>
            <CardDescription>Share of bookings processed by regional zones.</CardDescription>
          </CardHeader>
          <CardContent className="h-80 flex flex-col justify-between">
            {mounted ? (
              <>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={destinationShare}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {destinationShare.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {destinationShare.map((item: any, idx: number) => (
                    <div key={item.name} className="flex items-center gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[idx] }} />
                      <span className="text-muted-foreground truncate">{item.name} ({item.value}%)</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-full w-full bg-slate-800/20 animate-pulse rounded-lg flex items-center justify-center">Loading Share...</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Partner Leaderboard</CardTitle>
            <CardDescription>Rankings based on total booking revenues processed through platform checkout.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center py-6 text-xs text-muted-foreground">Loading leaderboard...</p>
            ) : topOrganizers.length === 0 ? (
              <p className="text-center py-6 text-xs text-muted-foreground">No approved partners found.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Organization Name</TableHead>
                    <TableHead>Hikes Published</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Gross Volume</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topOrganizers.map((org: any) => (
                    <TableRow key={org._id} className="hover:bg-slate-500/5">
                      <TableCell className="font-bold text-xs">{org.organization_name}</TableCell>
                      <TableCell>{org.total_treks || 0} hikes</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-xs text-amber-500 font-semibold">
                          <Compass className="h-3.5 w-3.5 fill-current" />
                          <span>{org.rating?.toFixed(1) || "0.0"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-extrabold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(org.earnings)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {}
        <Card>
          <CardHeader>
            <CardTitle>Ecosystem Health Indicators</CardTitle>
            <CardDescription>Core vitals tracker.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 border-b border-border/40 pb-3">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Hiker Net Promoter Score</span>
              <div className="flex items-center justify-between">
                <span className="text-base font-extrabold">9.4 / 10.0</span>
                <Badge variant="success">Excellent</Badge>
              </div>
            </div>
            <div className="space-y-2 border-b border-border/40 pb-3">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Booking Retention</span>
              <div className="flex items-center justify-between">
                <span className="text-base font-extrabold">42.5 %</span>
                <span className="text-xs text-emerald-500 font-semibold">+1.8% vs last month</span>
              </div>
            </div>
            <div className="space-y-2">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Average Trip Fill Rate</span>
              <div className="flex items-center justify-between">
                <span className="text-base font-extrabold">84.2 %</span>
                <span className="text-xs text-indigo-500 font-semibold">Goal: 85.0%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
