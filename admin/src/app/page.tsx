"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "../store";

export default function Home() {
  const router = useRouter();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/admin/dashboard");
    } else {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-slate-950 text-white">
      <div className="flex flex-col items-center gap-4">
        {/* Loading Spinner */}
        <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 text-sm font-semibold tracking-wider">Verifying Session Security...</p>
      </div>
    </div>
  );
}
