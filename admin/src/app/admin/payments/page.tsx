"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PaymentService, SettingsService } from "@/services/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Landmark, CreditCard, HeartHandshake, ShieldAlert } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function PaymentManagement() {
  const [search, setSearch] = useState("");

  // 1. Fetch Transactions
  const { data: paymentsResponse, isLoading } = useQuery({
    queryKey: ["payments"],
    queryFn: PaymentService.getAllPayments
  });

  // 2. Fetch Settings for Commission rate
  const { data: settingsResponse } = useQuery({
    queryKey: ["settings"],
    queryFn: SettingsService.getSettings
  });

  const payments: any[] = paymentsResponse?.data || [];
  const settings = settingsResponse?.data || { commissionPercentage: 10 };
  const commissionRate = settings.commissionPercentage / 100;

  // Calculations
  const successfulPayments = payments.filter((p: any) => p.payment_status === "success");
  const grossVolume = successfulPayments.reduce((sum: number, p: any) => sum + p.amount, 0);
  const platformEarnings = grossVolume * commissionRate;
  const organizerPayouts = grossVolume * (1 - commissionRate);
  const refundedVolume = payments
    .filter((p: any) => p.payment_status === "refunded")
    .reduce((sum: number, p: any) => sum + p.amount, 0);

  // Filter
  const filteredPayments = payments.filter((p: any) => {
    return (
      p.user_name.toLowerCase().includes(search.toLowerCase()) ||
      p.trip_name.toLowerCase().includes(search.toLowerCase()) ||
      p.transaction_id.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Payment & Payouts</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Review detailed ledgers, monitor commission fee cuts, and reconcile payouts.
        </p>
      </div>

      {/* Financial Splits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Gross Volume */}
        <Card className="border-l-4 border-l-primary">
          <CardContent className="pt-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Gross Volume Processed</span>
              <div className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 mt-1">{formatCurrency(grossVolume)}</div>
            </div>
            <Landmark className="h-8 w-8 text-primary/40" />
          </CardContent>
        </Card>

        {/* Platform Share */}
        <Card className="border-l-4 border-l-emerald-500 bg-emerald-500/5">
          <CardContent className="pt-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                Platform Earnings ({settings.commissionPercentage}%)
              </span>
              <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{formatCurrency(platformEarnings)}</div>
            </div>
            <DollarSign className="h-8 w-8 text-emerald-500/40" />
          </CardContent>
        </Card>

        {/* Organizer Splits */}
        <Card className="border-l-4 border-l-indigo-500">
          <CardContent className="pt-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Organizer Payout Pool</span>
              <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">{formatCurrency(organizerPayouts)}</div>
            </div>
            <HeartHandshake className="h-8 w-8 text-indigo-500/40" />
          </CardContent>
        </Card>

        {/* Refunded volume */}
        <Card className="border-l-4 border-l-rose-500 bg-rose-500/5">
          <CardContent className="pt-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Refunded Capital</span>
              <div className="text-2xl font-extrabold text-rose-500 mt-1">{formatCurrency(refundedVolume)}</div>
            </div>
            <ShieldAlert className="h-8 w-8 text-rose-500/40" />
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative w-full md:max-w-xs">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
              <CreditCard className="h-4 w-4" />
            </span>
            <input
              type="text"
              placeholder="Filter by transaction ref, user, trip..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-border/80 rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </CardContent>
      </Card>

      {/* Ledger Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction Ledger</CardTitle>
          <CardDescription>Auditable log of booking operations, payment IDs, and gateways.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2 animate-pulse">
              <div className="h-10 bg-muted rounded"></div>
              <div className="h-10 bg-muted rounded"></div>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-sm">
              No transactions logged in payment records.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction Reference</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Trek Expedition</TableHead>
                  <TableHead>Gateway</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((p: any) => (
                  <TableRow key={p._id} className="hover:bg-slate-500/5">
                    <TableCell className="font-mono text-xs">{p.transaction_id || "tx_pending_" + p._id}</TableCell>
                    <TableCell className="font-semibold text-xs">{p.user_name}</TableCell>
                    <TableCell className="max-w-[150px] truncate text-xs">{p.trip_name}</TableCell>
                    <TableCell className="font-mono text-[10px] uppercase">{p.payment_method}</TableCell>
                    <TableCell className="font-semibold">{formatCurrency(p.amount)}</TableCell>
                    <TableCell className="text-xs">{formatDate(p.createdAt)}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          p.payment_status === "success" ? "success" : 
                          p.payment_status === "pending" ? "warning" : "destructive"
                        }
                      >
                        {p.payment_status}
                      </Badge>
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
