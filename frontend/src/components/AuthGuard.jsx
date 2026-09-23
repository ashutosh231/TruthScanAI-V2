"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import Button from "./Button";
import { ShieldAlert, ArrowRight } from "lucide-react";

export default function AuthGuard({ children, fallbackMessage = "Sign in to view your private fact check history and telemetry." }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="p-8 border-2 border-[#111111] bg-white shadow-hard text-center font-mono-tech text-sm uppercase">
          CHECKING INVESTIGATOR PERMISSIONS...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 border-2 border-[#111111] bg-white shadow-hard text-center space-y-6">
        <div className="inline-flex p-4 bg-[#FFC857] border-2 border-[#111111] shadow-hard-xs">
          <ShieldAlert className="w-8 h-8 text-[#111111]" />
        </div>
        <div className="space-y-2">
          <h2 className="font-display text-2xl uppercase tracking-tight text-[#111111]">
            AUTHENTICATION REQUIRED
          </h2>
          <p className="font-mono-tech text-xs text-[#111111]/80 max-w-md mx-auto">
            {fallbackMessage}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link href="/login" className="w-full sm:w-auto">
            <Button variant="accent" size="md" className="w-full">
              LOGIN TO DASHBOARD
            </Button>
          </Link>
          <Link href="/register" className="w-full sm:w-auto">
            <Button variant="outline" size="md" className="w-full" icon={ArrowRight}>
              CREATE FREE ACCOUNT
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return children;
}
