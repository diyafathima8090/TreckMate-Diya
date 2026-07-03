"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TripService, BookingService } from "@/services/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Search, Eye, Check, X, Trash2, MapPin, Calendar, Users, DollarSign } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import Swal from 'sweetalert2';

const getImageUrl = (url: string) => {
  if (!url) return "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b";
  if (url.startsWith("http")) return url;
  return `http://localhost:3000${url.startsWith("/") ? "" : "/"}${url}`;
};

export default function TripManagement() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTrek, setSelectedTrek] = useState<any | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // 1. Fetch Hikes
  const { data: tripsResponse, isLoading } = useQuery({
    queryKey: ["trips"],
    queryFn: TripService.getAllTrips
  });

  // 2. Fetch Bookings to compile list of booked clients per trek
  const { data: bookingsResponse } = useQuery({
    queryKey: ["bookings"],
    queryFn: BookingService.getAllBookings
  });

  // 3. Status Action Mutation
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "approved" | "rejected" | "cancelled" }) =>
      TripService.updateTripStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      if (selectedTrek) {
        const updated = queryClient
          .getQueryData<{ success: boolean; data: any[] }>(["trips"])
          ?.data?.find(t => t._id === selectedTrek._id || t.id === selectedTrek.id);
        if (updated) setSelectedTrek(updated);
      }
      setDetailModalOpen(false);
    }
  });

  // 4. Delete Hike Mutation
  const deleteMutation = useMutation({
    mutationFn: TripService.deleteTrip,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      setDetailModalOpen(false);
      setSelectedTrek(null);
    }
  });

  const handleOpenDetail = (trek: any) => {
    setSelectedTrek(trek);
    setDetailModalOpen(true);
  };

  const handleUpdateStatus = (trekId: string, status: "approved" | "rejected" | "cancelled") => {
    statusMutation.mutate({ id: trekId, status });
  };

  const handleDeleteTrek = (trekId: string) => {
    Swal.fire({
      title: 'Delete Expedition?',
      text: "Are you sure you want to permanently delete this trek profile?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMutation.mutate(trekId);
        Swal.fire(
          'Deleted!',
          'The trek profile has been deleted.',
          'success'
        );
      }
    });
  };

  const treks: any[] = tripsResponse?.data || [];
  const bookings: any[] = bookingsResponse?.data || [];

  // Filter hikes
  const filteredTreks = treks.filter((t: any) => {
    const matchesSearch = 
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.location.toLowerCase().includes(search.toLowerCase()) ||
      t.organizer_name.toLowerCase().includes(search.toLowerCase());
      
    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Get bookings for selected hike
  const trekBookings = selectedTrek
    ? bookings.filter((b: any) => b.trip_id === selectedTrek._id || b.trip_name === selectedTrek.title)
    : [];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Trip Management</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Review, approve, or moderate trek routes published by registered organizers.
        </p>
      </div>

      {/* Filter and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative w-full md:max-w-xs">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                <Search className="h-4 w-4" />
              </span>
              <Input
                type="text"
                placeholder="Search trek name, destination, guide..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Filter controls */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <span className="text-xs text-slate-500 font-semibold uppercase">Status</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 text-xs bg-secondary hover:bg-secondary/80 text-foreground border border-border rounded-lg focus:outline-none"
              >
                <option value="all">All Hikes</option>
                <option value="pending">Pending Approval</option>
                <option value="approved">Approved</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trips Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
          <div className="h-64 bg-muted rounded-xl"></div>
          <div className="h-64 bg-muted rounded-xl"></div>
          <div className="h-64 bg-muted rounded-xl"></div>
        </div>
      ) : filteredTreks.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground text-sm bg-card border border-border rounded-xl">
          No matching treks found in directory database.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTreks.map((trek: any) => (
            <Card key={trek._id || trek.id} className="group relative flex flex-col h-full bg-card hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
              {/* Card Image */}
              <div className="relative h-44 w-full overflow-hidden bg-muted">
                <img 
                  src={getImageUrl(trek.banner || trek.image)} 
                  alt={trek.title}
                  className="object-cover h-full w-full group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3">
                  <Badge 
                    variant={
                      trek.status === "approved" ? "success" : 
                      trek.status === "pending" ? "warning" : "destructive"
                    }
                  >
                    {trek.status || "approved"}
                  </Badge>
                </div>
              </div>

              {/* Card Content */}
              <CardContent className="flex-1 p-5 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[10px] text-primary uppercase font-bold tracking-wider">{trek.category || "Mountain"}</span>
                    <span className="text-xs text-muted-foreground font-semibold">{trek.duration}</span>
                  </div>
                  <h3 className="font-extrabold text-base leading-snug group-hover:text-primary transition-colors">{trek.title}</h3>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{trek.location}</span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                    {trek.description}
                  </p>
                </div>

                <div className="border-t border-border/40 pt-4 mt-4 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-slate-400 uppercase font-semibold">Guide Partner</span>
                    <span className="text-xs font-bold truncate max-w-[120px]">{trek.organizer_name || trek.organizer}</span>
                  </div>
                  <span className="font-extrabold text-base text-slate-800 dark:text-slate-100">
                    {formatCurrency(trek.price_num || trek.baseRate || 0)}
                  </span>
                </div>
              </CardContent>

              {/* Hover overlay actions */}
              <div className="p-4 bg-muted/20 border-t border-border/30 flex gap-2 justify-end">
                <Button size="sm" variant="outline" onClick={() => handleOpenDetail(trek)} className="text-xs flex-1">
                  <Eye className="h-3.5 w-3.5 mr-1" /> View Details
                </Button>
                {trek.status === "pending" && (
                  <>
                    <Button size="sm" onClick={() => handleUpdateStatus(trek._id || trek.id, "approved")} className="bg-emerald-500 hover:bg-emerald-600 text-white">
                      <Check className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleUpdateStatus(trek._id || trek.id, "rejected")}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </>
                )}
                {trek.status !== "pending" && (
                  <Button size="sm" variant="ghost" className="text-rose-500 hover:text-rose-600 hover:bg-rose-500/10" onClick={() => handleDeleteTrek(trek._id || trek.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Trek detail modal */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        {selectedTrek && (
          <DialogContent onClose={() => setDetailModalOpen(false)} className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Trek Details & Moderation Panel</DialogTitle>
              <DialogDescription>
                Review routing details, price structures, and active bookings catalog.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 mt-4">
              {/* Title & Banner Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <img 
                  src={getImageUrl(selectedTrek.banner || selectedTrek.image)} 
                  alt={selectedTrek.title} 
                  className="rounded-xl object-cover h-44 w-full border border-border"
                />
                <div className="flex flex-col justify-between py-1">
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-primary uppercase font-bold tracking-wider">{selectedTrek.category}</span>
                    <h3 className="text-lg font-bold leading-tight">{selectedTrek.title}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span>{selectedTrek.location}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 bg-muted/40 p-3 rounded-lg border border-border/40 text-xs">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-primary" />
                      <div>
                        <span className="text-slate-400 block text-[9px]">DURATION</span>
                        <span className="font-bold">{selectedTrek.duration}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <DollarSign className="h-4 w-4 text-emerald-500" />
                      <div>
                        <span className="text-slate-400 block text-[9px]">PRICE PER HEAD</span>
                        <span className="font-bold">{formatCurrency(selectedTrek.price_num || selectedTrek.baseRate || 0)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Route Description</h4>
                <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed">
                  {selectedTrek.description}
                </p>
              </div>

              {/* Booking Ledger */}
              <div className="space-y-2.5">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Bookings ({trekBookings.length})</h4>
                  <Badge variant="outline" className="text-[10px]">Total clients: {trekBookings.reduce((sum: number, b: any) => sum + b.pax, 0)}</Badge>
                </div>
                
                <div className="max-h-40 overflow-y-auto border border-border/40 rounded-xl p-3 bg-muted/10">
                  {trekBookings.length === 0 ? (
                    <p className="text-center py-4 text-xs text-muted-foreground">No bookings recorded for this trip.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="py-1">Trekker</TableHead>
                          <TableHead className="py-1">Pax</TableHead>
                          <TableHead className="py-1">Date</TableHead>
                          <TableHead className="py-1">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {trekBookings.map((b: any) => (
                          <TableRow key={b._id} className="hover:bg-slate-500/5">
                            <TableCell className="py-2.5 font-semibold text-xs">{b.user_name}</TableCell>
                            <TableCell className="py-2.5 text-xs">{b.pax} hikers</TableCell>
                            <TableCell className="py-2.5 text-xs">{formatDate(b.booking_date)}</TableCell>
                            <TableCell className="py-2.5">
                              <Badge variant={b.booking_status === "confirmed" ? "success" : "warning"} className="text-[9px] px-1.5 py-0">
                                {b.booking_status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="ghost" className="text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 mr-auto" onClick={() => handleDeleteTrek(selectedTrek._id || selectedTrek.id)}>
                Delete Trek Profile
              </Button>
              {selectedTrek.status === "pending" ? (
                <>
                  <Button variant="outline" onClick={() => handleUpdateStatus(selectedTrek._id || selectedTrek.id, "rejected")}>
                    Reject Publication
                  </Button>
                  <Button className="bg-emerald-500 hover:bg-emerald-600 text-white" onClick={() => handleUpdateStatus(selectedTrek._id || selectedTrek.id, "approved")}>
                    Approve Trek Publish
                  </Button>
                </>
              ) : selectedTrek.status === "approved" ? (
                <Button variant="destructive" onClick={() => handleUpdateStatus(selectedTrek._id || selectedTrek.id, "cancelled")}>
                  Force Cancel Trek
                </Button>
              ) : (
                <Button className="bg-emerald-500 hover:bg-emerald-600 text-white" onClick={() => handleUpdateStatus(selectedTrek._id || selectedTrek.id, "approved")}>
                  Re-Approve Trek
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
