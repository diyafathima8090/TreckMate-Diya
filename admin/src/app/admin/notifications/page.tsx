"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { NotificationService } from "@/services/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Users, Megaphone, BellRing, History } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Swal from 'sweetalert2';

export default function NotificationsCenter() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [target, setTarget] = useState<"all" | "organizers" | "trekkers">("all");

  
  const { data: noticesResponse, isLoading } = useQuery({
    queryKey: ["announcements"],
    queryFn: NotificationService.getSentAnnouncements
  });

  
  const sendMutation = useMutation({
    mutationFn: (args: { title: string; message: string; target: "all" | "organizers" | "trekkers" }) =>
      NotificationService.sendAnnouncement(args.title, args.message, args.target),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      
      setTitle("");
      setMessage("");
      setTarget("all");
      Swal.fire(
        'Sent!',
        'System-wide announcement dispatched successfully!',
        'success'
      );
    }
  });

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Please specify a notification title and body message.'
      });
      return;
    }
    sendMutation.mutate({ title, message, target });
  };

  const notices: any[] = noticesResponse?.data || [];

  return (
    <div className="space-y-6">
      {}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Notifications Center</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Broadcast alerts, platform announcements, and targeted reminders to the ecosystem.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {}
        <Card className="lg:col-span-2 h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-primary" />
              Compose Broadcast
            </CardTitle>
            <CardDescription>
              Write announcements. Notifications will appear instantly in matched users' headers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleBroadcast} className="space-y-4">
              {}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 block uppercase">Target Audience</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setTarget("all")}
                    className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                      target === "all"
                        ? "bg-primary border-primary text-slate-100 shadow-md shadow-primary/10"
                        : "bg-secondary border-border text-foreground hover:bg-secondary/80"
                    }`}
                  >
                    All Users
                  </button>
                  <button
                    type="button"
                    onClick={() => setTarget("organizers")}
                    className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                      target === "organizers"
                        ? "bg-primary border-primary text-slate-100 shadow-md shadow-primary/10"
                        : "bg-secondary border-border text-foreground hover:bg-secondary/80"
                    }`}
                  >
                    Organizers
                  </button>
                  <button
                    type="button"
                    onClick={() => setTarget("trekkers")}
                    className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                      target === "trekkers"
                        ? "bg-primary border-primary text-slate-100 shadow-md shadow-primary/10"
                        : "bg-secondary border-border text-foreground hover:bg-secondary/80"
                    }`}
                  >
                    Trekkers Only
                  </button>
                </div>
              </div>

              {}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 block uppercase">Alert Heading</label>
                <Input
                  type="text"
                  placeholder="e.g. Server Maintenance Notice"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              {}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 block uppercase">Message Description</label>
                <textarea
                  rows={4}
                  placeholder="Write clear notification instructions here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 transition-all focus-visible:ring-offset-0"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/95 text-white font-semibold"
                isLoading={sendMutation.isPending}
              >
                <Send className="h-4 w-4 mr-2" /> Dispatch Announcement
              </Button>
            </form>
          </CardContent>
        </Card>

        {}
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5 text-slate-400" />
                Broadcast Log Archive
              </CardTitle>
              <CardDescription>Archive ledger of past alerts sent on TrekMate.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2 animate-pulse">
                <div className="h-10 bg-muted rounded"></div>
                <div className="h-10 bg-muted rounded"></div>
              </div>
            ) : notices.length === 0 ? (
              <p className="text-center py-10 text-xs text-muted-foreground">No broadcasts logged.</p>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                {notices.map((n: any) => (
                  <div key={n._id} className="p-4 bg-muted/20 border border-border/70 rounded-xl space-y-2 flex flex-col justify-between hover:bg-muted/40 transition-colors">
                    <div className="flex justify-between items-start gap-2">
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-muted-foreground font-semibold">TARGET AUDIENCE</span>
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">{n.title}</h4>
                          <Badge variant={n.target === "all" ? "default" : n.target === "organizers" ? "warning" : "info"} className="text-[9px] uppercase font-mono px-1.5 py-0.25">
                            {n.target}
                          </Badge>
                        </div>
                      </div>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">{formatDate(n.createdAt)}</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed">
                      {n.message}
                    </p>
                    <div className="border-t border-border/30 pt-2 flex items-center justify-between text-[10px] text-slate-400 font-semibold">
                      <span>Sender: {n.sentBy}</span>
                      <span>Push Channel: Web Alert</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
