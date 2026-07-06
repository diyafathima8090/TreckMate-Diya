"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BookingService } from "@/services/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CalendarRange, X, RefreshCw, BarChart2, DollarSign, Calendar, Search } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import Swal from 'sweetalert2';

export default function BookingManagement() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  
  const { data: bookingsResponse, isLoading } = useQuery({
    queryKey: ["bookings"],
    queryFn: BookingService.getAllBookings
  });

  
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "confirmed" | "cancelled" | "refunded" | "rejected" }) =>
      BookingService.updateBookingStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    }
  });

  const handleUpdateStatus = (bookingId: string, status: "confirmed" | "cancelled" | "refunded" | "rejected") => {
    Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to mark booking #${bookingId} as ${status}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#10b981', 
      cancelButtonColor: '#ef4444', 
      confirmButtonText: 'Yes, update it!'
    }).then((result) => {
      if (result.isConfirmed) {
        statusMutation.mutate({ id: bookingId, status });
        Swal.fire(
          'Updated!',
          `Booking has been marked as ${status}.`,
          'success'
        );
      }
    });
  };

  const bookings: any[] = bookingsResponse?.data || [];

  
  const totalBookings = bookings.length;
  const confirmedCount = bookings.filter((b: any) => b.booking_status === "confirmed").length;
  const cancelledCount = bookings.filter((b: any) => b.booking_status === "cancelled").length;
  const pendingCount = bookings.filter((b: any) => b.booking_status === "pending").length;
  const refundPipelineVal = bookings
    .filter((b: any) => b.booking_status === "cancelled") 
    .reduce((sum: number, b: any) => sum + b.amount, 0);

  
  const filteredBookings = bookings.filter((b: any) => {
    const matchesSearch = 
      b.user_name.toLowerCase().includes(search.toLowerCase()) ||
      b.trip_name.toLowerCase().includes(search.toLowerCase()) ||
      b._id.toLowerCase().includes(search.toLowerCase());
      
    const matchesStatus = statusFilter === "all" || b.booking_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Booking Management</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Monitor transactional bookings, issue refunds, and adjust hiker reservations.
        </p>
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Total Orders</span>
              <div className="text-xl font-extrabold mt-1">{totalBookings}</div>
            </div>
            <CalendarRange className="h-8 w-8 text-primary/45" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Confirmed</span>
              <div className="text-xl font-extrabold text-emerald-600 mt-1">{confirmedCount}</div>
            </div>
            <BarChart2 className="h-8 w-8 text-emerald-500/40" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Refund Requests</span>
              <div className="text-xl font-extrabold text-rose-500 mt-1">{cancelledCount}</div>
            </div>
            <RefreshCw className="h-8 w-8 text-rose-500/40" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Checked In</span>
              <div className="text-xl font-extrabold text-blue-500 mt-1">{bookings.filter((b: any) => b.scanned).length}</div>
            </div>
            <Calendar className="h-8 w-8 text-blue-500/40" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Pending Payouts</span>
              <div className="text-xl font-extrabold text-amber-500 mt-1">{formatCurrency(refundPipelineVal)}</div>
            </div>
            <DollarSign className="h-8 w-8 text-amber-500/40" />
          </CardContent>
        </Card>
      </div>

      {}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {}
            <div className="relative w-full md:max-w-xs">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                <Search className="h-4 w-4" />
              </span>
              <Input
                type="text"
                placeholder="Search Client, Trek Name, ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {}
            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <span className="text-xs text-slate-500 font-semibold uppercase">Status</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 text-xs bg-secondary hover:bg-secondary/80 text-foreground border border-border rounded-lg focus:outline-none"
              >
                <option value="all">All Bookings</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
                <option value="refunded">Refunded</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {}
      <Card>
        <CardHeader>
          <CardTitle>Bookings Directory</CardTitle>
          <CardDescription>Ledger of hiker orders, reservations, and cancellations.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2 animate-pulse">
              <div className="h-10 bg-muted rounded"></div>
              <div className="h-10 bg-muted rounded"></div>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-sm">
              No reservation bookings match your criteria.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking ID</TableHead>
                  <TableHead>Hiker</TableHead>
                  <TableHead>Trek Expedition</TableHead>
                  <TableHead>Pax</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Book Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Attendance</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.map((b) => (
                  <TableRow key={b._id} className="hover:bg-slate-500/5">
                    <TableCell className="font-mono text-xs">#{b._id}</TableCell>
                    <TableCell className="font-semibold">{b.user_name}</TableCell>
                    <TableCell className="max-w-[150px] truncate">{b.trip_name}</TableCell>
                    <TableCell>{b.pax} seats</TableCell>
                    <TableCell className="font-semibold">{formatCurrency(b.amount)}</TableCell>
                    <TableCell className="text-xs">{formatDate(b.booking_date)}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          b.booking_status === "confirmed" ? "success" : 
                          b.booking_status === "pending" ? "warning" : 
                          b.booking_status === "refunded" ? "info" : "destructive"
                        }
                      >
                        {b.booking_status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {b.booking_status === "confirmed" || b.booking_status === "completed" ? (
                        <Badge variant={b.scanned ? "default" : "outline"} className={b.scanned ? "bg-blue-500 hover:bg-blue-600" : "text-slate-500"}>
                          {b.scanned ? "Checked In" : "Pending"}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1.5">
                        {b.booking_status === "pending" && (
                          <Button 
                            size="sm" 
                            className="bg-emerald-500 hover:bg-emerald-600 text-white py-1 px-2.5 h-7"
                            onClick={() => handleUpdateStatus(b._id, "confirmed")}
                          >
                            Approve
                          </Button>
                        )}
                        {b.booking_status === "cancelled" && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-primary hover:bg-primary/10 border-primary/20 py-1 px-2 h-7"
                            onClick={() => handleUpdateStatus(b._id, "refunded")}
                          >
                            <RefreshCw className="h-3.5 w-3.5 mr-1" /> Issue Refund
                          </Button>
                        )}
                        {(b.booking_status === "confirmed" || b.booking_status === "pending") && (
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 py-1 px-2 h-7"
                            onClick={() => handleUpdateStatus(b._id, b.booking_status === "pending" ? "rejected" : "cancelled")}
                            title={b.booking_status === "pending" ? "Reject Booking" : "Cancel Booking"}
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
