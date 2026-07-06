"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ReportService, UserService } from "@/services/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldAlert, CheckCircle, XCircle, UserX, AlertOctagon } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Swal from 'sweetalert2';

export default function ReportsManagement() {
  const queryClient = useQueryClient();

  
  const { data: reportsResponse, isLoading } = useQuery({
    queryKey: ["reports"],
    queryFn: ReportService.getAllReports
  });

  
  const resolveMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "resolved" | "dismissed" }) =>
      ReportService.updateReportStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    }
  });

  
  const suspendUserMutation = useMutation({
    mutationFn: UserService.toggleUserSuspension,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      Swal.fire(
        'Suspended!',
        'Offending user account status has been toggled.',
        'success'
      );
    }
  });

  const handleResolve = (id: string, status: "resolved" | "dismissed") => {
    resolveMutation.mutate({ id, status });
  };

  const handleSuspendOffender = (userId: string) => {
    Swal.fire({
      title: 'Suspend User?',
      text: "Are you sure you want to suspend this reported user?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, suspend them!'
    }).then((result) => {
      if (result.isConfirmed) {
        suspendUserMutation.mutate(userId);
      }
    });
  };

  const reports: any[] = reportsResponse?.data || [];

  const pendingReports = reports.filter((r: any) => r.status === "pending");
  const resolvedReports = reports.filter((r: any) => r.status === "resolved" || r.status === "dismissed");

  return (
    <div className="space-y-6">
      {}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Reviews & Reports</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Moderate flaggings, review community feedback violations, and resolve reported disputes.
        </p>
      </div>

      <Tabs defaultValue="pending">
        <TabsList className="mb-4">
          <TabsTrigger value="pending" className="relative">
            Active Infractions
            {pendingReports.length > 0 && (
              <span className="ml-2 bg-rose-500 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center">
                {pendingReports.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="resolved">Resolved Log</TabsTrigger>
        </TabsList>

        {}
        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Open Incident Tickets ({pendingReports.length})</CardTitle>
              <CardDescription>
                Reviews, comments, or accounts flagged by hikers or organizers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2 animate-pulse">
                  <div className="h-10 bg-muted rounded"></div>
                  <div className="h-10 bg-muted rounded"></div>
                </div>
              ) : pendingReports.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground text-sm">
                  System clean! No reported incidents pending review.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Offender</TableHead>
                      <TableHead>Reported Reason</TableHead>
                      <TableHead>Reporter</TableHead>
                      <TableHead>Filed Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingReports.map((r: any) => (
                      <TableRow key={r._id} className="hover:bg-slate-500/5">
                        <TableCell>
                          <Badge variant="outline" className="uppercase text-[9px] font-mono">
                            {r.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-bold text-xs">{r.offender_name}</span>
                            <span className="text-[10px] text-muted-foreground font-mono">ID: {r.offender_id}</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[200px]">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-semibold text-xs text-rose-500">{r.reason}</span>
                            <span className="text-slate-500 text-[10px] truncate">"{r.reported_name}"</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs">{r.reported_by_name}</TableCell>
                        <TableCell className="text-xs">{formatDate(r.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-emerald-600 hover:bg-emerald-500/10 border-emerald-500/20 py-1 px-2.5 h-8 text-xs font-semibold"
                              onClick={() => handleResolve(r._id, "resolved")}
                            >
                              <CheckCircle className="h-3.5 w-3.5 mr-1" /> Dismiss & Close
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive" 
                              className="py-1 px-2.5 h-8 text-xs font-semibold"
                              onClick={() => {
                                handleResolve(r._id, "resolved");
                                handleSuspendOffender(r.offender_id);
                              }}
                            >
                              <UserX className="h-3.5 w-3.5 mr-1" /> Penalize User
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {}
        <TabsContent value="resolved">
          <Card>
            <CardHeader>
              <CardTitle>Historical Violations ({resolvedReports.length})</CardTitle>
              <CardDescription>Archive log of moderated reports and disputes.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  <div className="h-10 bg-muted rounded"></div>
                </div>
              ) : resolvedReports.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground text-sm">
                  No resolved violation reports found.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Offender</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Filed Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {resolvedReports.map((r: any) => (
                      <TableRow key={r._id} className="hover:bg-slate-500/5">
                        <TableCell>
                          <Badge variant="outline" className="uppercase text-[9px] font-mono">
                            {r.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold text-slate-500">{r.offender_name}</TableCell>
                        <TableCell className="text-xs max-w-[200px] truncate">"{r.reason}"</TableCell>
                        <TableCell>
                          <Badge variant={r.status === "resolved" ? "success" : "secondary"}>
                            {r.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs">{formatDate(r.createdAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
