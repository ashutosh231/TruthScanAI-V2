"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/Button";
import ErrorState from "@/components/ErrorState";
import { ShieldCheck, User, Mail, Lock, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { register, loading } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passcodes do not match. Please re-enter.");
      return;
    }

    if (password.length < 6) {
      setError("Passcode must contain at least 6 characters.");
      return;
    }

    try {
      await register({ name, email, password });
      router.push("/verify-otp");
    } catch (err) {
      setError(err.message || "Failed to create account profile.");
    }
  };

  return (
    <div className="max-w-md mx-auto my-8 sm:my-16 space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 bg-[#B7FF3C] border-2 border-[#111111] shadow-hard-xs mx-auto overflow-hidden flex items-center justify-center p-0.5">
          <img src="/image.png" alt="TruthScan AI Logo" className="w-full h-full object-cover" />
        </div>
        <h1 className="font-display text-3xl sm:text-4xl uppercase tracking-tight text-[#111111]">
          REGISTER PROFILE
        </h1>
        <p className="font-mono-tech text-xs text-[#111111]/70">
          Obtain clearance to analyze confidential claims, logs and media.
        </p>
      </div>

      {error && (
        <ErrorState
          title="REGISTRATION ERROR"
          message={error}
          onRetry={() => setError(null)}
        />
      )}

      {/* Main Register Card */}
      <div className="border-3 border-[#111111] bg-white shadow-hard-lg p-6 sm:p-8 space-y-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="font-mono-tech text-xs font-bold uppercase text-[#111111] flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              <span>INVESTIGATOR NAME</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alex Vance"
              className="w-full p-2.5 font-mono-tech text-sm bg-[#F5F1E8]/50 border-2 border-[#111111] focus:outline-none focus:bg-white"
              disabled={loading}
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="font-mono-tech text-xs font-bold uppercase text-[#111111] flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" />
              <span>TERMINAL EMAIL</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@domain.com"
              className="w-full p-2.5 font-mono-tech text-sm bg-[#F5F1E8]/50 border-2 border-[#111111] focus:outline-none focus:bg-white"
              disabled={loading}
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="font-mono-tech text-xs font-bold uppercase text-[#111111] flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              <span>ACCESS PASSCODE</span>
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full p-2.5 font-mono-tech text-sm bg-[#F5F1E8]/50 border-2 border-[#111111] focus:outline-none focus:bg-white"
              disabled={loading}
            />
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="font-mono-tech text-xs font-bold uppercase text-[#111111] flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              <span>CONFIRM PASSCODE</span>
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full p-2.5 font-mono-tech text-sm bg-[#F5F1E8]/50 border-2 border-[#111111] focus:outline-none focus:bg-white"
              disabled={loading}
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="accent"
              size="md"
              loading={loading}
              className="w-full"
              icon={ArrowRight}
            >
              CREATE ACCOUNT
            </Button>
          </div>
        </form>
      </div>

      {/* Switch to Login */}
      <div className="text-center font-mono-tech text-xs text-[#111111]/80">
        Already have clearance?{" "}
        <Link href="/login" className="font-bold text-[#111111] underline">
          LOGIN HERE
        </Link>
      </div>
    </div>
  );
}
