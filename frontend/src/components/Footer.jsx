"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShieldCheck, ArrowRight, Check } from "lucide-react";
import Button from "./Button";

export default function Footer() {
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 4000);
      setEmail("");
    }
  };

  return (
    <footer className="w-full bg-[#111111] text-[#F5F1E8] border-t-4 border-[#111111] mt-24">
      {/* Live Continuous Ticker Bar */}
      <div className="border-b-2 border-white/20 bg-[#B7FF3C] text-[#111111] py-2 overflow-hidden select-none">
        <div className="animate-marquee whitespace-nowrap font-mono-tech text-xs font-bold uppercase tracking-wider flex items-center">
          <span className="mx-6">⚡ TRUTHSCAN NEURAL CORE V3.4 ONLINE</span>
          <span className="mx-6">★ 45,000+ DISINFORMATION SIGNALS INDEXED</span>
          <span className="mx-6">⚡ REAL-TIME MULTIMODAL VERIFICATION</span>
          <span className="mx-6">★ ZERO LATENCY CAMERA OCR ACTIVE</span>
          <span className="mx-6">⚡ CREDIBILITY INDEX: 99.4% RELIABILITY</span>
          <span className="mx-6">★ SYSTEM OPERATING AT NOMINAL CAPACITY</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#B7FF3C] overflow-hidden flex items-center justify-center border-2 border-white shadow-[2px_2px_0px_0px_#FFFFFF] p-0.5 shrink-0">
                <img src="/image.png" alt="TruthScan AI Logo" className="w-full h-full object-cover rounded-none" />
              </div>
              <span className="font-display text-2xl uppercase tracking-tighter text-[#F5F1E8]">
                TRUTHSCAN<span className="text-[#B7FF3C] font-mono-tech ml-1">AI</span>
              </span>
            </div>
            <p className="font-mono-tech text-xs text-[#E8E2D5]/70 leading-relaxed max-w-sm">
              The high-velocity fact verification infrastructure. Detecting synthetic narratives, deepfakes, and manipulated claims before they distort reality.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/20 font-mono-tech text-[10px] text-[#B7FF3C]">
              <span className="w-2 h-2 rounded-full bg-[#B7FF3C] animate-pulse" />
              INDEPENDENT MISINFORMATION SURVEILLANCE
            </div>
          </div>

          {/* Quick Links Column 1: Verification Engine */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="font-mono-tech text-xs uppercase tracking-widest text-[#B7FF3C] font-bold">
              VERIFY ENGINE
            </h4>
            <ul className="space-y-2 font-display text-xs tracking-wider">
              <li>
                <Link href="/detect" className="hover:text-[#B7FF3C] transition-colors">
                  TEXT ANALYSIS
                </Link>
              </li>
              <li>
                <Link href="/detect" className="hover:text-[#B7FF3C] transition-colors">
                  URL SCANNER
                </Link>
              </li>
              <li>
                <Link href="/detect" className="hover:text-[#B7FF3C] transition-colors">
                  DOCUMENT OCR
                </Link>
              </li>
              <li>
                <Link href="/scan" className="hover:text-[#B7FF3C] transition-colors">
                  LIVE CAMERA SCAN
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links Column 2: Platform */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="font-mono-tech text-xs uppercase tracking-widest text-[#B7FF3C] font-bold">
              INTEL WIRE
            </h4>
            <ul className="space-y-2 font-display text-xs tracking-wider">
              <li>
                <Link href="/news" className="hover:text-[#B7FF3C] transition-colors">
                  LATEST DISPATCH
                </Link>
              </li>
              <li>
                <Link href="/reports" className="hover:text-[#B7FF3C] transition-colors">
                  DISINFO REPORTS
                </Link>
              </li>
              <li>
                <Link href="/plans" className="hover:text-[#B7FF3C] transition-colors">
                  PRICING & TIERS
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-[#B7FF3C] transition-colors">
                  MY TELEMETRY
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Signup */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-mono-tech text-xs uppercase tracking-widest text-[#B7FF3C] font-bold">
              THREAT INTEL BRIEFING
            </h4>
            <p className="font-mono-tech text-xs text-[#E8E2D5]/70">
              Weekly teardown of active viral disinformation campaigns.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="flex">
                <input
                  type="email"
                  required
                  placeholder="analyst@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-black border-2 border-[#F5F1E8] text-[#F5F1E8] font-mono-tech text-xs focus:outline-none focus:border-[#B7FF3C]"
                />
                <button
                  type="submit"
                  className="px-3.5 bg-[#B7FF3C] text-[#111111] font-display font-bold border-2 border-[#F5F1E8] border-l-0 hover:bg-[#a5ec26] cursor-pointer"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              {subscribed && (
                <div className="flex items-center gap-1 font-mono-tech text-[10px] text-[#B7FF3C]">
                  <Check className="w-3.5 h-3.5" />
                  <span>SUBSCRIBED TO DAILY INTEL FEED</span>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-mono-tech text-[#E8E2D5]/60">
          <div>© {new Date().getFullYear()} TRUTHSCAN AI. ALL SIGNALS VERIFIED.</div>
          <div className="flex items-center gap-6">
            <span>NO BACKEND DEPENDENCY EMBEDDED</span>
            <span>REST API SPEC COMPLIANT</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
