"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Button from "./Button";
import {
  ShieldCheck,
  Menu,
  X,
  Scan,
  Search,
  Newspaper,
  CreditCard,
  FileText,
  User,
  LogOut,
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navLinks = [
    { name: "DETECT", href: "/detect", icon: Search },
    { name: "SCAN", href: "/scan", icon: Scan },
    { name: "NEWS", href: "/news", icon: Newspaper },
    { name: "REPORTS", href: "/reports", icon: FileText },
    { name: "PLANS", href: "/plans", icon: CreditCard },
  ];

  const isActive = (href) => pathname === href;

  return (
    <header className="sticky top-0 z-40 w-full px-3 sm:px-6 pt-3 pb-2 bg-[#F5F1E8]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto border-2 border-[#111111] bg-[#F5F1E8] shadow-hard px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 bg-[#B7FF3C] border-2 border-[#111111] shadow-hard-xs group-hover:shadow-hard transition-all overflow-hidden flex items-center justify-center p-0.5 shrink-0">
            <img
              src="/image.png"
              alt="TruthScan AI Logo"
              className="w-full h-full object-cover rounded-none"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-lg sm:text-xl uppercase tracking-tighter leading-none text-[#111111] glitch-hover">
              TRUTHSCAN<span className="text-[#111111] font-mono-tech ml-1">AI</span>
            </span>
            <span className="font-mono-tech text-[9px] tracking-widest text-[#111111]/70 uppercase hidden sm:block">
              INTELLIGENCE WIRE
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`px-3 py-1.5 font-display text-xs xl:text-sm font-bold tracking-wider transition-all border-2 ${
                  active
                    ? "bg-[#B7FF3C] text-[#111111] border-[#111111] shadow-hard-xs translate-x-[-1px] translate-y-[-1px]"
                    : "border-transparent text-[#111111] hover:border-[#111111] hover:bg-[#E8E2D5]"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Right CTA / Auth Area */}
        <div className="hidden md:flex items-center gap-3">
          {!mounted ? (
            <div className="w-32 h-8" />
          ) : isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link href="/dashboard">
                <Button
                  variant={isActive("/dashboard") ? "accent" : "outline"}
                  size="sm"
                >
                  DASHBOARD
                </Button>
              </Link>
              <Link
                href="/profile"
                className={`flex items-center gap-2 px-2.5 py-1.5 border-2 border-[#111111] shadow-hard-xs transition-all ${
                  isActive("/profile")
                    ? "bg-[#B7FF3C] text-[#111111]"
                    : "bg-white hover:bg-[#E8E2D5] text-[#111111]"
                }`}
                title="User Profile"
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt="Profile"
                    className="w-5 h-5 rounded-none object-cover border border-[#111111]"
                  />
                ) : (
                  <div className="w-5 h-5 bg-[#111111] text-[#B7FF3C] flex items-center justify-center font-display text-[10px]">
                    {(user?.name || "U")[0]?.toUpperCase()}
                  </div>
                )}
                <span className="font-display text-xs uppercase tracking-tight">
                  PROFILE
                </span>
              </Link>
              <button
                onClick={logout}
                title="Logout"
                className="p-2 border-2 border-[#111111] bg-white hover:bg-[#FF4D4D] shadow-hard-xs transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-[#111111]" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link href="/login">
                <Button variant="outline" size="sm">
                  LOGIN
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="accent" size="sm">
                  GET STARTED
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex items-center gap-2 lg:hidden">
          {mounted && isAuthenticated && (
            <Link href="/profile" className="flex items-center">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt="Profile"
                  className="w-8 h-8 rounded-none object-cover border-2 border-[#111111] shadow-hard-xs"
                />
              ) : (
                <div className="w-8 h-8 bg-[#111111] text-[#B7FF3C] border-2 border-[#111111] flex items-center justify-center font-display text-xs shadow-hard-xs">
                  {(user?.name || "U")[0]?.toUpperCase()}
                </div>
              )}
            </Link>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 border-2 border-[#111111] bg-white shadow-hard-xs hover:bg-[#B7FF3C] transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden max-w-7xl mx-auto mt-2 border-2 border-[#111111] bg-[#F5F1E8] shadow-hard-lg p-5 space-y-4 animate-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between pb-3 border-b-2 border-[#111111]">
            <span className="font-mono-tech text-xs uppercase font-bold text-[#111111]">
              SYSTEM NAVIGATION
            </span>
            <span className="inline-flex items-center gap-1 font-mono-tech text-[10px] bg-[#B7FF3C] border border-[#111111] px-2 py-0.5 font-bold">
              LIVE
            </span>
          </div>

          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between p-3 font-display font-bold text-sm tracking-wider border-2 border-[#111111] ${
                    active ? "bg-[#B7FF3C] shadow-hard-xs" : "bg-white hover:bg-[#E8E2D5]"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-[#111111]" />
                    {link.name}
                  </span>
                  <span className="font-mono-tech text-xs">→</span>
                </Link>
              );
            })}
          </nav>

          <div className="pt-3 border-t-2 border-[#111111] flex flex-col gap-2.5">
            {mounted && isAuthenticated ? (
              <>
                <div className="p-3 border-2 border-[#111111] bg-white flex justify-between items-center text-xs font-mono-tech font-bold">
                  <span>LOGGED IN AS: {user?.name || user?.email}</span>
                </div>
                <div className="flex gap-2">
                  <Link href="/dashboard" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="accent" size="md" className="w-full">
                      DASHBOARD
                    </Button>
                  </Link>
                  <Link href="/profile" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" size="md" className="w-full">
                      PROFILE
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="px-3"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" size="md" className="w-full">
                    LOGIN
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="accent" size="md" className="w-full">
                    REGISTER
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
