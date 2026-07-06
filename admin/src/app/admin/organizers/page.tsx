"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { OrganizerService, TripService } from "@/services/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Eye, Check, X, Ban, Award, Star, DollarSign, FileText } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function OrganizerManagement() {
  const queryClient = useQueryClient();
  const [selectedOrg, setSelectedOrg] = useState<any | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [adminNotesInput, setAdminNotesInput] = useState("");
  const [rejectionReasonInput, setRejectionReasonInput] = useState("");

  
  const { data: orgsResponse, isLoading } = useQuery({
    queryKey: ["organizers"],
    queryFn: OrganizerService.getAllOrganizers
  });

  
  const { data: tripsResponse } = useQuery({
    queryKey: ["trips"],
    queryFn: TripService.getAllTrips
  });

  
  const statusMutation = useMutation({
    mutationFn: ({
      id,
      status,
      admin_notes,
      rejection_reason
    }: {
      id: string;
      status: "approved" | "rejected" | "suspended";
      admin_notes?: string;
      rejection_reason?: string;
    }) =>
      OrganizerService.updateOrganizerStatus(id, status, admin_notes, rejection_reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizers"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      
      if (selectedOrg) {
        const updated = queryClient
          .getQueryData<{ success: boolean; data: any[] }>(["organizers"])
          ?.data?.find(o => o._id === selectedOrg._id);
        if (updated) setSelectedOrg(updated);
      }
      setDetailModalOpen(false);
    }
  });

  const handleOpenDetail = (org: any) => {
    setSelectedOrg(org);
    setAdminNotesInput(org.admin_notes || "");
    setRejectionReasonInput(org.rejection_reason || "");
    setDetailModalOpen(true);
  };

  const handleUpdateStatus = (orgId: string, status: "approved" | "rejected" | "suspended") => {
    statusMutation.mutate({
      id: orgId,
      status,
      admin_notes: adminNotesInput,
      rejection_reason: rejectionReasonInput
    });
  };

  const organizers: any[] = orgsResponse?.data || [];
  const trips: any[] = tripsResponse?.data || [];

  
  const pendingOrgs = organizers.filter((org: any) => org.status === "pending");
  const approvedOrgs = organizers.filter((org: any) => org.status === "approved");
  const inactiveOrgs = organizers.filter((org: any) => org.status === "rejected" || org.status === "suspended");

  
  const orgTrips = selectedOrg 
    ? trips.filter((t: any) => t.organizer_id === selectedOrg.user_id || t.organizer_name === selectedOrg.organization_name)
    : [];

  return (
    <div className="space-y-6">
      {}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Organizer Management</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Review business applications, verify licenses, and monitor partner ratings.
        </p>
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Verifications</CardTitle>
            <div className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingOrgs.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Applications awaiting review</p>
          </CardContent>
        </Card>

        {}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Organizers</CardTitle>
            <Check className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedOrgs.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Verified active partners</p>
          </CardContent>
        </Card>

        {}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected/Suspended</CardTitle>
            <X className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inactiveOrgs.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Declined or deactivated partners</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending">

        <TabsList className="mb-4">
          <TabsTrigger value="pending" className="relative">
            Pending Reviews
            {pendingOrgs.length > 0 && (
              <span className="ml-2 bg-primary text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center">
                {pendingOrgs.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">Approved Partners</TabsTrigger>
          <TabsTrigger value="suspended">Suspended / Rejected</TabsTrigger>
        </TabsList>

        {}
        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Organizer Applications ({pendingOrgs.length})</CardTitle>
              <CardDescription>
                Profiles requesting verification to publish treks on the platform.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2 animate-pulse">
                  <div className="h-10 bg-muted rounded"></div>
                  <div className="h-10 bg-muted rounded"></div>
                </div>
              ) : pendingOrgs.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground text-sm">
                  No pending organizer applications found.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Organization</TableHead>
                      <TableHead>Experience</TableHead>
                      <TableHead>License Number</TableHead>
                      <TableHead>Applied On</TableHead>
                      <TableHead className="text-right">Verification</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingOrgs.map((org: any) => (
                      <TableRow key={org._id}>
                        <TableCell className="font-semibold">{org.organization_name}</TableCell>
                        <TableCell>{org.experience} Years</TableCell>
                        <TableCell className="font-mono text-xs">{org.license_number || "None"}</TableCell>
                        <TableCell className="text-xs">{formatDate(org.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleOpenDetail(org)}>
                              <Eye className="h-4 w-4 mr-1.5" /> Review Details
                            </Button>
                            <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white" onClick={() => handleUpdateStatus(org._id, "approved")}>
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleUpdateStatus(org._id, "rejected")}>
                              <X className="h-4 w-4" />
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
        <TabsContent value="approved">
          <Card>
            <CardHeader>
              <CardTitle>Active Partners ({approvedOrgs.length})</CardTitle>
              <CardDescription>
                Verified organizations authorized to publish treks.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  <div className="h-10 bg-muted rounded"></div>
                </div>
              ) : approvedOrgs.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground text-sm">
                  No active partner accounts found.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Organization</TableHead>
                      <TableHead>License</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Total Treks</TableHead>
                      <TableHead>Earnings</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {approvedOrgs.map((org: any) => (
                      <TableRow key={org._id}>
                        <TableCell className="font-semibold">{org.organization_name}</TableCell>
                        <TableCell className="font-mono text-xs">{org.license_number}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-amber-500 text-xs">
                            <Star className="h-3.5 w-3.5 fill-current" />
                            <span>{org.rating?.toFixed(1) || "0.0"}</span>
                          </div>
                        </TableCell>
                        <TableCell>{org.total_treks} treks</TableCell>
                        <TableCell className="font-semibold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(org.earnings)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleOpenDetail(org)}>
                              <Eye className="h-4 w-4 mr-1.5" /> View Profile
                            </Button>
                            <Button size="sm" variant="ghost" className="text-rose-500 hover:text-rose-600" onClick={() => handleUpdateStatus(org._id, "suspended")} title="Suspend Partner">
                              <Ban className="h-4 w-4" />
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
        <TabsContent value="suspended">
          <Card>
            <CardHeader>
              <CardTitle>Suspended & Rejected Partners ({inactiveOrgs.length})</CardTitle>
              <CardDescription>
                Partners whose publishing privileges are suspended or revoked.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  <div className="h-10 bg-muted rounded"></div>
                </div>
              ) : inactiveOrgs.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground text-sm">
                  No suspended or rejected partner accounts.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Organization</TableHead>
                      <TableHead>License</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Updated On</TableHead>
                      <TableHead className="text-right">Verification</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inactiveOrgs.map((org: any) => (
                      <TableRow key={org._id}>
                        <TableCell className="font-semibold text-slate-500">{org.organization_name}</TableCell>
                        <TableCell className="font-mono text-xs">{org.license_number}</TableCell>
                        <TableCell>
                          <Badge variant={org.status === "suspended" ? "destructive" : "secondary"}>
                            {org.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs">{formatDate(org.updatedAt)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleOpenDetail(org)}>
                              <Eye className="h-4 w-4 mr-1.5" /> View Application
                            </Button>
                            <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white" onClick={() => handleUpdateStatus(org._id, "approved")}>
                              Re-Approve Partner
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
      </Tabs>

      {}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        {selectedOrg && (
          <DialogContent onClose={() => setDetailModalOpen(false)} className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Partner Application Portfolio</DialogTitle>
              <DialogDescription>
                Detailed verification records, business experience, and financial summaries.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 mt-4">
              {}
              <div className="flex gap-4 items-center">
                <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20 text-primary">
                  <Award className="h-10 w-10" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold">{selectedOrg.organization_name}</h3>
                  <p className="text-xs text-muted-foreground">License: {selectedOrg.license_number || "None"}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={
                      selectedOrg.status === "approved" ? "success" : 
                      selectedOrg.status === "pending" ? "warning" : "destructive"
                    }>
                      {selectedOrg.status}
                    </Badge>
                    <span className="text-xs text-slate-500 font-semibold">{selectedOrg.experience} Years Experience</span>
                  </div>
                </div>
              </div>

              {}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-muted/30 border border-border/40 p-3 rounded-xl">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Rating</span>
                  <div className="flex items-center justify-center gap-1 text-sm font-extrabold text-amber-500 mt-1">
                    <Star className="h-4 w-4 fill-current" />
                    <span>{selectedOrg.rating?.toFixed(1) || "0.0"}</span>
                  </div>
                </div>
                <div className="bg-muted/30 border border-border/40 p-3 rounded-xl">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Total Treks</span>
                  <span className="text-sm font-extrabold mt-1 block">{selectedOrg.total_treks || 0} Trips</span>
                </div>
                <div className="bg-muted/30 border border-border/40 p-3 rounded-xl bg-emerald-500/5">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Total Earnings</span>
                  <div className="flex items-center justify-center gap-0.5 text-sm font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                    <DollarSign className="h-4 w-4" />
                    <span>{selectedOrg.earnings?.toLocaleString() || 0}</span>
                  </div>
                </div>
              </div>

              {}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-muted/10 border border-border/40 p-3.5 rounded-xl">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider mb-1">Business Address</span>
                  <p className="font-semibold text-slate-700 dark:text-slate-300">{selectedOrg.address || "No address provided"}</p>
                </div>
                <div className="bg-muted/10 border border-border/40 p-3.5 rounded-xl">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider mb-1">Applicant Submission Notes</span>
                  <p className="font-light text-slate-600 dark:text-slate-400 italic">"{selectedOrg.additional_notes || "No notes submitted"}"</p>
                </div>
              </div>

              {}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Business Licenses & Verification Dossier</h4>
                {selectedOrg.submitted_documents && selectedOrg.submitted_documents.length > 0 ? (
                  selectedOrg.submitted_documents.map((doc: any, idx: number) => {
                    const downloadUrl = doc.url.startsWith('/') 
                      ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${doc.url}` 
                      : doc.url;
                    return (
                      <div key={idx} className="flex items-center justify-between p-3 bg-muted/20 border border-border rounded-xl text-xs">
                        <div className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-semibold">{doc.document_type || "Verification Document"}</p>
                            <p className="text-[10px] text-muted-foreground">Submitted: {new Date(doc.submitted_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <a href={downloadUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline font-semibold flex items-center">
                          Download File
                        </a>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex items-center justify-between p-3 bg-muted/20 border border-border rounded-xl text-xs">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      <span className="font-semibold">Verification_License_File.pdf</span>
                    </div>
                    <a href={selectedOrg.documents?.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${selectedOrg.documents}` : selectedOrg.documents} target="_blank" rel="noreferrer" className="text-primary hover:underline font-semibold flex items-center">
                      Download File
                    </a>
                  </div>
                )}
              </div>

              {}
              <div className="space-y-4 border-t border-border/60 pt-4 text-xs">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Administrator Review Notes</h4>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-slate-500 font-semibold">Review Notes (Internal/Shared)</label>
                  <textarea
                    value={adminNotesInput}
                    onChange={(e) => setAdminNotesInput(e.target.value)}
                    placeholder="Add notes explaining the verification review findings..."
                    rows={2}
                    className="w-full bg-background border border-input rounded-md px-3 py-2 text-xs focus:ring-2 focus:ring-primary outline-none resize-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-rose-500 font-semibold">Rejection Reason (Visible to Organizer)</label>
                  <textarea
                    value={rejectionReasonInput}
                    onChange={(e) => setRejectionReasonInput(e.target.value)}
                    placeholder="Specify the exact reason for rejecting this application (e.g. Document image blur, Expired license)..."
                    rows={2}
                    className="w-full bg-background border border-input rounded-md px-3 py-2 text-xs focus:ring-2 focus:ring-primary outline-none resize-none"
                  />
                </div>
              </div>


              {}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Created Hikes & Expeditions ({orgTrips.length})</h4>
                <div className="max-h-40 overflow-y-auto space-y-2 pr-1 border border-border/40 rounded-xl p-3 bg-muted/10">
                  {orgTrips.length === 0 ? (
                    <p className="text-center py-4 text-xs text-muted-foreground">No treks published by this partner yet.</p>
                  ) : (
                    orgTrips.map((trek: any) => (
                      <div key={trek._id} className="flex justify-between items-center text-xs border-b border-border/30 last:border-0 pb-2 last:pb-0">
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{trek.title}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{trek.location} • {trek.duration}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{formatCurrency(trek.price)}</span>
                          <Badge variant={trek.status === "approved" ? "success" : "warning"}>
                            {trek.status}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <DialogFooter>
              {selectedOrg.status === "pending" ? (
                <>
                  <Button variant="outline" onClick={() => handleUpdateStatus(selectedOrg._id, "rejected")}>
                    Reject Application
                  </Button>
                  <Button className="bg-emerald-500 hover:bg-emerald-600 text-white" onClick={() => handleUpdateStatus(selectedOrg._id, "approved")}>
                    Approve & Issue License
                  </Button>
                </>
              ) : selectedOrg.status === "approved" ? (
                <Button variant="destructive" onClick={() => handleUpdateStatus(selectedOrg._id, "suspended")}>
                  Suspend Partner Publishing Rights
                </Button>
              ) : (
                <Button className="bg-emerald-500 hover:bg-emerald-600 text-white" onClick={() => handleUpdateStatus(selectedOrg._id, "approved")}>
                  Re-Activate Partner
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
