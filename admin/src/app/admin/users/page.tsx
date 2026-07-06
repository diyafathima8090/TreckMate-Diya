"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserService } from "@/services/api";
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
import { Search, Eye, ShieldAlert, ShieldCheck, Trash2, ArrowUpDown } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function UserManagement() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  
  
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  
  
  const [deleteUserTarget, setDeleteUserTarget] = useState<any | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  
  const { data: usersResponse, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: UserService.getAllUsers
  });

  
  const suspendMutation = useMutation({
    mutationFn: UserService.toggleUserSuspension,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      
      if (selectedUser) {
        const updatedUser = queryClient
          .getQueryData<{ success: boolean; data: any[] }>(["users"])
          ?.data?.find(u => u._id === selectedUser._id);
        if (updatedUser) setSelectedUser(updatedUser);
      }
    }
  });

  
  const deleteMutation = useMutation({
    mutationFn: UserService.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setDeleteModalOpen(false);
      setDeleteUserTarget(null);
    }
  });

  const handleOpenDetail = (user: any) => {
    setSelectedUser(user);
    setDetailModalOpen(true);
  };

  const handleToggleSuspension = (userId: string) => {
    suspendMutation.mutate(userId);
  };

  const handleDeleteConfirm = () => {
    if (deleteUserTarget) {
      deleteMutation.mutate(deleteUserTarget._id);
    }
  };

  const users = usersResponse?.data || [];

  
  const filteredUsers = users.filter((u: any) => {
    const matchesSearch = 
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase());
      
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    const matchesStatus = statusFilter === "all" || u.status === statusFilter;
    
    const excludeAdminsAndOrganizers = u.role !== "admin" && u.role !== "organizer";
    
    return matchesSearch && matchesRole && matchesStatus && excludeAdminsAndOrganizers;
  });

  return (
    <div className="space-y-6">
      {}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">User Management</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Monitor registration levels, verify trekker accounts, or revoke permissions.
        </p>
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
                placeholder="Search name, username, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-semibold uppercase">Role</span>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-secondary hover:bg-secondary/80 text-foreground border border-border rounded-lg focus:outline-none"
                >
                  <option value="all">All Trekkers</option>
                  <option value="trekker">Trekkers Only</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-semibold uppercase">Status</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-secondary hover:bg-secondary/80 text-foreground border border-border rounded-lg focus:outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active Only</option>
                  <option value="suspended">Suspended Only</option>
                </select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Registered Accounts ({filteredUsers.length})</CardTitle>
          <CardDescription>
            Admin roles are filtered out of this listing for security constraints.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <div className="h-10 bg-muted/40 animate-pulse rounded-lg w-full"></div>
              <div className="h-10 bg-muted/40 animate-pulse rounded-lg w-full"></div>
              <div className="h-10 bg-muted/40 animate-pulse rounded-lg w-full"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-sm">
              No matching client accounts found.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User Detail</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user: any) => (
                  <TableRow key={user._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={user.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
                          alt={user.name}
                          className="h-9 w-9 rounded-full bg-slate-800 object-cover border border-border"
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold truncate text-sm">{user.name}</span>
                          <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">@{user.username}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize text-[10px]">
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.status === "active" ? "success" : "destructive"}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">{formatDate(user.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleOpenDetail(user)}
                          title="View Profile Detail"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleSuspension(user._id)}
                          className={user.status === "active" ? "text-amber-500" : "text-emerald-500"}
                          title={user.status === "active" ? "Suspend Account" : "Activate Account"}
                        >
                          {user.status === "active" ? (
                            <ShieldAlert className="h-4 w-4" />
                          ) : (
                            <ShieldCheck className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setDeleteUserTarget(user);
                            setDeleteModalOpen(true);
                          }}
                          className="text-rose-500 hover:text-rose-600"
                          title="Delete User Account"
                        >
                          <Trash2 className="h-4 w-4" />
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

      {}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        {selectedUser && (
          <DialogContent onClose={() => setDetailModalOpen(false)} className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Account Profile Details</DialogTitle>
              <DialogDescription>
                Detailed overview of user role scopes and authentication logs.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 mt-4">
              {}
              <div className="flex gap-4 items-center">
                <img
                  src={selectedUser.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${selectedUser.name}`}
                  alt={selectedUser.name}
                  className="h-16 w-16 rounded-full object-cover border border-primary/20 ring-4 ring-primary/10"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold">{selectedUser.name}</h3>
                  <p className="text-xs text-muted-foreground">@{selectedUser.username}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="capitalize text-[10px]">
                      {selectedUser.role}
                    </Badge>
                    <Badge variant={selectedUser.status === "active" ? "success" : "destructive"}>
                      {selectedUser.status}
                    </Badge>
                  </div>
                </div>
              </div>

              {}
              <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-xl border border-border/40 text-xs">
                <div>
                  <span className="text-slate-500 block mb-0.5">Email Address</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedUser.email}</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-0.5">Phone Number</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedUser.phone || "Not provided"}</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-0.5">Member Since</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{formatDate(selectedUser.createdAt)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-0.5">MFA Verification</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {selectedUser.is_verified ? "Verified Identity" : "Unverified"}
                  </span>
                </div>
              </div>

              {}
              <div className="space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Bio</h4>
                <p className="text-xs text-slate-700 dark:text-slate-300 italic leading-relaxed">
                  "{selectedUser.bio || "This user has not written a bio yet."}"
                </p>
              </div>

              {}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Activity History Log</h4>
                <div className="max-h-40 overflow-y-auto space-y-2 pr-1 border border-border/40 rounded-xl p-3 bg-muted/10">
                  {selectedUser.activities?.map((act: any) => (
                    <div key={act.id} className="flex justify-between items-start gap-3 text-xs border-b border-border/30 last:border-0 pb-1.5 last:pb-0">
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{act.action}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">IP: {act.ip}</p>
                      </div>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">{formatDate(act.time)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant={selectedUser.status === "active" ? "destructive" : "default"}
                onClick={() => handleToggleSuspension(selectedUser._id)}
                className="w-full sm:w-auto"
              >
                {selectedUser.status === "active" ? "Suspend Account" : "Activate Account"}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        {deleteUserTarget && (
          <DialogContent onClose={() => setDeleteModalOpen(false)}>
            <DialogHeader>
              <DialogTitle className="text-rose-500 flex items-center gap-2">
                <ShieldAlert className="h-5 w-5" />
                Permanent Deletion Guard
              </DialogTitle>
              <DialogDescription>
                This operation CANNOT be undone. You are about to permanently delete the profile of{" "}
                <span className="font-extrabold text-slate-800 dark:text-slate-200">
                  {deleteUserTarget.name}
                </span>.
              </DialogDescription>
            </DialogHeader>

            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              This action will scrub this user account, profiles, bookings associated, and history traces from database nodes.
            </p>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteConfirm}>
                Permanently Destroy Account
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
