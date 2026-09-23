"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DetectInput from "@/components/DetectInput";
import UrlInput from "@/components/UrlInput";
import FileUpload from "@/components/FileUpload";
import DetectionResult from "@/components/DetectionResult";
import ErrorState from "@/components/ErrorState";
import Button from "@/components/Button";
import { useAuth } from "@/context/AuthContext";
import { factCheckText, factCheckUrl, factCheckFile } from "@/lib/api";
import {
  FileText,
  Globe,
  UploadCloud,
  Search,
  ShieldCheck,
  Lock,
  Sparkles,
  AlertTriangle,
  Zap,
} from "lucide-react";

export default function DetectPage() {
  const router = useRouter();
  const {
    isAuthenticated,
    isPremium,
    trialsUsed,
    trialsRemaining,
    isTrialExhausted,
    recordTrialUsed,
  } = useAuth();

  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("TEXT"); // TEXT | URL | FILE
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const tabs = [
    { id: "TEXT", label: "TEXT CLAIM", icon: FileText },
    { id: "URL", label: "ARTICLE URL", icon: Globe },
    { id: "FILE", label: "FILE EVIDENCE", icon: UploadCloud },
  ];

  const checkTrialOrRedirect = () => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/detect");
      return false;
    }
    if (isTrialExhausted) {
      router.push("/plans?trialEnded=true");
      return false;
    }
    return true;
  };

  const handleTextSubmit = async (text) => {
    if (!checkTrialOrRedirect()) return;

    setLoading(true);
    setError(null);
    try {
      const res = await factCheckText(text);
      setResult(res);
      recordTrialUsed();
    } catch (err) {
      if (err.message && (err.message.includes("Trial limit reached") || err.message.includes("402"))) {
        router.push("/plans?trialEnded=true");
        return;
      }
      setError(err.message || "Failed to analyze text claim.");
    } finally {
      setLoading(false);
    }
  };

  const handleUrlSubmit = async (url) => {
    if (!checkTrialOrRedirect()) return;

    setLoading(true);
    setError(null);
    try {
      const res = await factCheckUrl(url);
      setResult(res);
      recordTrialUsed();
    } catch (err) {
      if (err.message && (err.message.includes("Trial limit reached") || err.message.includes("402"))) {
        router.push("/plans?trialEnded=true");
        return;
      }
      setError(err.message || "Failed to analyze URL.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileSubmit = async (file) => {
    if (!checkTrialOrRedirect()) return;

    setLoading(true);
    setError(null);
    try {
      const res = await factCheckFile(file);
      setResult(res);
      recordTrialUsed();
    } catch (err) {
      if (err.message && (err.message.includes("Trial limit reached") || err.message.includes("402"))) {
        router.push("/plans?trialEnded=true");
        return;
      }
      setError(err.message || "Failed to analyze file evidence.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="border-b-2 border-[#111111] pb-6 space-y-2">
        <div className="inline-flex items-center gap-2 font-mono-tech text-xs uppercase font-bold text-[#111111]">
          <ShieldCheck className="w-4 h-4 text-[#111111]" />
          <span>REAL-TIME MULTIMODAL DETECTION ENGINE</span>
        </div>
        <h1 className="font-display text-4xl sm:text-6xl uppercase tracking-tighter text-[#111111]">
          DETECT
        </h1>
        <p className="font-mono-tech text-xs sm:text-sm text-[#111111]/80 max-w-xl">
          Analyze suspicious information before you share it. Ingest claims via plain text, live web links, or digital file uploads.
        </p>
      </div>

      {/* Trial Status Meter */}
      {mounted && isAuthenticated && (
        <div className="border-2 border-[#111111] bg-white p-3 sm:p-4 shadow-hard-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full border border-black ${
                isPremium
                  ? "bg-[#B7FF3C]"
                  : isTrialExhausted
                  ? "bg-[#FF4D4D]"
                  : "bg-[#FFC857]"
              }`}
            />
            <span className="font-mono-tech text-xs font-bold uppercase text-[#111111]">
              {isPremium
                ? "PREMIUM CLEARANCE ACTIVE • UNLIMITED INVESTIGATIONS"
                : isTrialExhausted
                ? "TRIAL LIMIT REACHED • 2 OF 2 FREE SCANS COMPLETED"
                : `FREE TRIAL ALLOCATION • ${trialsRemaining} OF 2 FREE CHECKS REMAINING`}
            </span>
          </div>
          {!isPremium && (
            <Link href="/plans?trialEnded=true">
              <span className="font-mono-tech text-xs font-bold text-[#111111] underline hover:text-[#111111]/70 cursor-pointer">
                {isTrialExhausted ? "UNLOCK UNLIMITED CLEARANCE →" : "UPGRADE TO PREMIUM (₹200/MO) →"}
              </span>
            </Link>
          )}
        </div>
      )}

      {/* If Result exists, show DetectionResult view */}
      {result ? (
        <DetectionResult result={result} onReset={handleReset} />
      ) : (mounted && isTrialExhausted) ? (
        <div className="border-3 border-[#111111] bg-white p-8 sm:p-12 shadow-hard-lg space-y-6 text-center animate-in fade-in duration-200">
          <div className="w-16 h-16 bg-[#FF4D4D] text-white border-2 border-[#111111] shadow-hard-xs mx-auto flex items-center justify-center">
            <Lock className="w-8 h-8 stroke-[2.5]" />
          </div>

          <div className="space-y-3 max-w-lg mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FF4D4D]/20 border border-[#FF4D4D] font-mono-tech text-xs font-bold text-[#111111] uppercase">
              <AlertTriangle className="w-3.5 h-3.5 text-[#FF4D4D]" />
              <span>FREE TRIAL LIMIT EXHAUSTED</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl uppercase tracking-tight text-[#111111]">
              SUBSCRIBE TO CONTINUE DETECTING
            </h2>
            <p className="font-mono-tech text-xs sm:text-sm text-[#111111]/80 leading-relaxed">
              You have completed your 2 complimentary free trial detections. Upgrade to the Premium Investigator plan for ₹200/month to unlock unlimited multimodal AI analysis, deep document OCR, and priority queue processing.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={() => router.push("/plans?trialEnded=true")}
              icon={Sparkles}
            >
              UPGRADE NOW — ₹200/MO
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-3 gap-2">
            {tabs.map((tab) => {
              const active = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setError(null);
                  }}
                  className={`p-3 sm:p-4 flex items-center justify-center gap-2 font-display text-xs sm:text-sm font-bold uppercase tracking-wider border-2 border-[#111111] transition-all cursor-pointer ${
                    active
                      ? "bg-[#B7FF3C] text-[#111111] shadow-hard translate-x-[-2px] translate-y-[-2px]"
                      : "bg-white text-[#111111] hover:bg-[#E8E2D5]"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Error Banner */}
          {error && (
            <ErrorState
              title="DETECTION FAILED"
              message={error}
              onRetry={() => setError(null)}
            />
          )}

          {/* Active Input Mode Form */}
          <div>
            {activeTab === "TEXT" && (
              <DetectInput onSubmit={handleTextSubmit} loading={loading} />
            )}
            {activeTab === "URL" && (
              <UrlInput onSubmit={handleUrlSubmit} loading={loading} />
            )}
            {activeTab === "FILE" && (
              <FileUpload onSubmit={handleFileSubmit} loading={loading} />
            )}
          </div>

          {/* Technical Specs Footer */}
          <div className="p-4 border-2 border-[#111111] bg-[#E8E2D5]/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono-tech text-[#111111]/70">
            <div>INTEGRITY: 256-BIT CRYPTOGRAPHIC CONSENSUS</div>
            <div>COMPLIANT WITH IFCN CODE OF PRINCIPLES</div>
          </div>
        </div>
      )}
    </div>
  );
}
