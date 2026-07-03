"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import { loginStart, loginSuccess, loginFailure, clearError } from "../../store/authSlice";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "../../components/ui/card";
import { Compass, ShieldAlert, Lock, Mail } from "lucide-react";
import axios from "axios";

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isLoading, error, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/admin/dashboard");
    }
    dispatch(clearError());
  }, [isAuthenticated, router, dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    if (!email || !password) {
      setValidationError("Please fill out both administrative credentials.");
      return;
    }

    dispatch(loginStart());

    try {
      // 1. Try to connect to backend
      const response = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });

      const data = response.data;
      if (data.success && data.data.role === "admin") {
        dispatch(
          loginSuccess({
            user: {
              _id: data.data._id,
              name: data.data.name,
              email: data.data.email,
              role: data.data.role,
              profileImage: data.data.profileImage,
            },
            token: data.token,
          })
        );
        router.push("/admin/dashboard");
      } else {
        dispatch(loginFailure("Access Denied: Only platform administrators can log in here."));
      }
    } catch (err: any) {
      console.warn("Backend login failed or unavailable. Testing local admin credential fallback.");

      // 2. Fallback to offline credentials for demonstration purposes
      if (email === "admin@trekmate.com" && password === "admin123") {
        // Successful mock login
        setTimeout(() => {
          dispatch(
            loginSuccess({
              user: {
                _id: "u7",
                name: "Diya Fathima",
                email: "admin@trekmate.com",
                role: "admin",
                profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=diya",
              },
              token: "mock-jwt-token-diya-fathima",
            })
          );
          router.push("/admin/dashboard");
        }, 1200);
      } else {
        dispatch(loginFailure("Invalid administrator credentials. Try admin@trekmate.com / admin123"));
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/15 rounded-full blur-[120px]"></div>

      <Card className="w-full max-w-md bg-slate-900/60 border-slate-800 text-slate-100 backdrop-blur-md relative z-10 shadow-2xl">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto p-3 bg-primary/10 text-primary rounded-2xl w-fit mb-4 border border-primary/20">
            <Compass className="h-8 w-8 animate-spin-slow" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">TrekMate Administrator</CardTitle>
          <CardDescription className="text-slate-400 text-xs">
            Sign in below to manage trekkers, bookings, content sliders, and system controls.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Input field: Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Admin Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <Mail className="h-4 w-4" />
                </span>
                <Input
                  type="email"
                  placeholder="admin@trekmate.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 bg-slate-950/40 border-slate-800 text-slate-100 placeholder-slate-600 focus:border-primary focus:ring-primary"
                />
              </div>
            </div>

            {/* Input field: Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <Lock className="h-4 w-4" />
                </span>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 bg-slate-950/40 border-slate-800 text-slate-100 placeholder-slate-600 focus:border-primary focus:ring-primary"
                />
              </div>
            </div>

            {/* Validation & Auth Errors */}
            {(validationError || error) && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/25 rounded-lg flex items-start gap-2.5 text-xs text-rose-400">
                <ShieldAlert className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                <span>{validationError || error}</span>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/95 text-slate-100 mt-2 font-semibold shadow-lg shadow-primary/20"
              isLoading={isLoading}
            >
              Authorize Secure Connection
            </Button>
          </form>

          {/* Quick Sandbox Help Info */}
          <div className="mt-6 border-t border-slate-800 pt-4 text-[10px] text-slate-500 leading-relaxed text-center">
            Default sandbox credentials: <br />
            <span className="text-primary/70 font-mono">admin@trekmate.com</span> / <span className="text-primary/70 font-mono">admin123</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
