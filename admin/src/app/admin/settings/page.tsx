"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SettingsService } from "@/services/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Settings, ShieldCheck, Mail, CreditCard, Save } from "lucide-react";
import Swal from 'sweetalert2';

export default function PlatformSettings() {
  const queryClient = useQueryClient();

  // Settings State Form
  const [platformName, setPlatformName] = useState("");
  const [commissionPercentage, setCommissionPercentage] = useState(10);
  const [contactEmail, setContactEmail] = useState("");
  const [smtpServer, setSmtpServer] = useState("");
  const [smtpPort, setSmtpPort] = useState(587);
  const [paymentGateway, setPaymentGateway] = useState("stripe");
  
  const [allowRegistration, setAllowRegistration] = useState(true);
  const [requireOrganizerVerification, setRequireOrganizerVerification] = useState(true);

  // 1. Fetch current settings
  const { data: settingsResponse, isSuccess } = useQuery({
    queryKey: ["settings"],
    queryFn: SettingsService.getSettings
  });

  useEffect(() => {
    if (isSuccess && settingsResponse?.data) {
      const data = settingsResponse.data;
      setPlatformName(data.platformName);
      setCommissionPercentage(data.commissionPercentage);
      setContactEmail(data.contactEmail);
      setSmtpServer(data.smtpServer);
      setSmtpPort(data.smtpPort);
      setPaymentGateway(data.paymentGateway);
      setAllowRegistration(data.allowRegistration);
      setRequireOrganizerVerification(data.requireOrganizerVerification);
    }
  }, [isSuccess, settingsResponse]);

  // 2. Save Mutation
  const saveMutation = useMutation({
    mutationFn: SettingsService.saveSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      queryClient.invalidateQueries({ queryKey: ["payments"] }); // recalculates payouts
      Swal.fire(
        'Success!',
        'Platform configurations updated successfully!',
        'success'
      );
    }
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate({
      platformName,
      commissionPercentage: Number(commissionPercentage),
      contactEmail,
      smtpServer,
      smtpPort: Number(smtpPort),
      paymentGateway,
      allowRegistration,
      requireOrganizerVerification
    });
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Platform Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Adjust platform parameters, modify SMTP email dispatchers, and configure commissions.
        </p>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Platform General Config */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                General Configuration
              </CardTitle>
              <CardDescription>Configure Platform parameters and client settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500">Platform Brand Name</label>
                  <Input type="text" value={platformName} onChange={(e) => setPlatformName(e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500">Support / Contact Email</label>
                  <Input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} required />
                </div>
              </div>

              {/* Commission input */}
              <div className="space-y-1.5 max-w-xs">
                <label className="text-xs font-semibold text-slate-500">Global Payout Commission Fee (%)</label>
                <div className="relative">
                  <Input 
                    type="number" 
                    min={0} 
                    max={100} 
                    value={commissionPercentage} 
                    onChange={(e) => setCommissionPercentage(Number(e.target.value))} 
                    required 
                  />
                  <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 font-bold text-xs pointer-events-none">%</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">Calculated automatically on confirmed booking volumes.</p>
              </div>
            </CardContent>
          </Card>

          {/* Email configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-slate-400" />
                SMTP Email Gateway Settings
              </CardTitle>
              <CardDescription>Adjust outbound email engines triggering transaction vouchers.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500">SMTP Server Host</label>
                  <Input type="text" value={smtpServer} onChange={(e) => setSmtpServer(e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500">SMTP Port</label>
                  <Input type="number" value={smtpPort} onChange={(e) => setSmtpPort(Number(e.target.value))} required />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Gateways config */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-emerald-500" />
                Payment Gateway Configurations
              </CardTitle>
              <CardDescription>Configure primary financial checkouts on TrekMate.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 block uppercase">Gateway Provider</label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setPaymentGateway("stripe")}
                    className={`flex-1 p-4 border rounded-xl flex items-center gap-3 transition-all cursor-pointer ${
                      paymentGateway === "stripe"
                        ? "border-primary bg-primary/5 text-primary shadow-sm"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    <div className={`h-4 w-4 rounded-full border-4 flex items-center justify-center ${paymentGateway === "stripe" ? "border-primary" : "border-slate-300"}`} />
                    <div className="text-left">
                      <span className="font-bold text-xs block">Stripe Gateway</span>
                      <span className="text-[10px] text-muted-foreground">Global debit/credit card engine</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentGateway("razorpay")}
                    className={`flex-1 p-4 border rounded-xl flex items-center gap-3 transition-all cursor-pointer ${
                      paymentGateway === "razorpay"
                        ? "border-primary bg-primary/5 text-primary shadow-sm"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    <div className={`h-4 w-4 rounded-full border-4 flex items-center justify-center ${paymentGateway === "razorpay" ? "border-primary" : "border-slate-300"}`} />
                    <div className="text-left">
                      <span className="font-bold text-xs block">Razorpay Gateway</span>
                      <span className="text-[10px] text-muted-foreground">Supports UPI, NetBanking, and Local Wallets</span>
                    </div>
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Security / System policies */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-rose-500" />
                Platform Safety Policies
              </CardTitle>
              <CardDescription>Adjust authorization profiles and verification flows.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              {/* Allow signup toggling */}
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div>
                  <span className="font-bold block text-slate-800 dark:text-slate-200">Public Registration</span>
                  <span className="text-muted-foreground text-[10px]">Allow new trekkers to sign up.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAllowRegistration(!allowRegistration)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    allowRegistration ? "bg-primary" : "bg-slate-300"
                  }`}
                >
                  <span className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${
                    allowRegistration ? "left-6" : "left-1"
                  }`} />
                </button>
              </div>

              {/* Require license approval toggling */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold block text-slate-800 dark:text-slate-200">Organizer Verification</span>
                  <span className="text-muted-foreground text-[10px]">Require manual document approval before publishing.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setRequireOrganizerVerification(!requireOrganizerVerification)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    requireOrganizerVerification ? "bg-primary" : "bg-slate-300"
                  }`}
                >
                  <span className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${
                    requireOrganizerVerification ? "left-6" : "left-1"
                  }`} />
                </button>
              </div>
            </CardContent>
            <CardFooter className="pt-2 bg-muted/20 border-t border-border/40">
              <Button type="submit" className="w-full bg-primary hover:bg-primary/95 text-white font-semibold">
                <Save className="h-4 w-4 mr-2" /> Save Settings
              </Button>
            </CardFooter>
          </Card>
        </div>
      </form>
    </div>
  );
}
