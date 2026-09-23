"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import CameraScanner from "@/components/CameraScanner";
import ScanResult from "@/components/ScanResult";
import Button from "@/components/Button";
import ErrorState from "@/components/ErrorState";
import { scanImage } from "@/lib/api";
import {
  Scan,
  Sparkles,
  Lock,
  ShieldAlert,
  ArrowRight,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export default function ScanPage() {
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
  const [capturedImage, setCapturedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCapture = (dataUrl) => {
    setCapturedImage(dataUrl);
    setResult(null);
    setError(null);
  };

  const handleStartScan = async () => {
    if (!capturedImage) return;

    if (!isAuthenticated) {
      router.push("/login?redirect=/scan");
      return;
    }

    if (isTrialExhausted) {
      router.push("/plans?trialEnded=true");
      return;
    }

    setLoading(true);
    setError(null);
    setProcessingStep(0);

    // Simulate multi-stage visual pipeline progression
    const stepInterval = setInterval(() => {
      setProcessingStep((prev) => {
        if (prev < 4) return prev + 1;
        clearInterval(stepInterval);
        return prev;
      });
    }, 450);

    try {
      const res = await scanImage(capturedImage);
      clearInterval(stepInterval);

      if (!res || !res.success) {
        if (res?.requiresUpgrade || res?.error === "TRIAL_LIMIT_REACHED" || (res?.message && res.message.includes("Trial limit"))) {
          router.push("/plans?trialEnded=true");
          return;
        }
        if (res?.error === "NO_READABLE_TEXT" || (res?.message && res.message.includes("No readable text"))) {
          setError(
            "No readable text was detected in the frame. Please hold your camera closer to the headline or document, ensure good lighting, or upload a clear, high-contrast photo."
          );
          return;
        }
        setError(res?.message || "Failed to process camera frame.");
        return;
      }

      setResult(res);
      recordTrialUsed();
    } catch (err) {
      clearInterval(stepInterval);
      if (err.message && (err.message.includes("Trial limit reached") || err.message.includes("402"))) {
        router.push("/plans?trialEnded=true");
        return;
      }
      if (err.message && err.message.includes("No readable text")) {
        setError(
          "No readable text was detected in the frame. Please hold your camera closer to the headline or document, ensure good lighting, or upload a clear, high-contrast photo."
        );
        return;
      }
      setError(err.message || "Failed to process camera frame.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCapturedImage(null);
    setResult(null);
    setError(null);
    setProcessingStep(0);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="border-b-2 border-[#111111] pb-6 space-y-2">
        <div className="inline-flex items-center gap-2 font-mono-tech text-xs uppercase font-bold text-[#111111]">
          <Scan className="w-4 h-4 text-[#111111]" />
          <span>OPTICAL CHARACTER AUDIT & SURVEILLANCE</span>
        </div>
        <h1 className="font-display text-4xl sm:text-6xl uppercase tracking-tighter text-[#111111]">
          SCAN
        </h1>
        <p className="font-mono-tech text-xs sm:text-sm text-[#111111]/80 max-w-xl">
          Point your camera at suspicious news and check its truthfulness. Extract printed text, flyers, billboards or monitor screens in real-time.
        </p>
      </div>

      {!mounted ? (
        <div className="border-2 border-[#111111] bg-white p-12 text-center shadow-hard space-y-3">
          <div className="w-8 h-8 border-2 border-[#111111] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-mono-tech text-xs uppercase font-bold text-[#111111]">
            INITIALIZING OPTICAL SCANNER INTERFACE...
          </p>
        </div>
      ) : !isAuthenticated ? (
        <div className="border-3 border-[#111111] bg-white p-8 sm:p-12 shadow-hard-lg space-y-8 text-center animate-in fade-in duration-200">
          <div className="w-16 h-16 bg-[#FFC857] text-[#111111] border-2 border-[#111111] shadow-hard-xs mx-auto flex items-center justify-center">
            <Lock className="w-8 h-8 stroke-[2.5]" />
          </div>

          <div className="space-y-3 max-w-lg mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FF4D4D]/20 border border-[#FF4D4D] font-mono-tech text-xs font-bold text-[#111111] uppercase">
              <ShieldAlert className="w-3.5 h-3.5 text-[#FF4D4D]" />
              <span>AUTHENTICATION REQUIRED</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl uppercase tracking-tight text-[#111111]">
              CLEARANCE REQUIRED TO SCAN
            </h2>
            <p className="font-mono-tech text-xs sm:text-sm text-[#111111]/80 leading-relaxed">
              Camera access, high-precision OCR character reading, and real-time neural verification require an active investigator profile. Please log in or create an account to unlock the optical scanner.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <Link href="/login" className="w-full sm:w-auto flex-1">
              <Button variant="accent" size="lg" className="w-full" icon={UserCheck}>
                LOGIN TO SCAN
              </Button>
            </Link>
            <Link href="/register" className="w-full sm:w-auto flex-1">
              <Button variant="outline" size="lg" className="w-full" icon={ArrowRight}>
                CREATE FREE ACCOUNT
              </Button>
            </Link>
          </div>

          {/* Features unlocked upon login */}
          <div className="pt-6 border-t-2 border-[#111111]/15 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            <div className="border border-[#111111] bg-[#F5F1E8] p-3 space-y-1">
              <div className="flex items-center gap-1.5 font-display text-xs font-bold uppercase text-[#111111]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#111111]" />
                <span>MOBILE / DESKTOP LENS</span>
              </div>
              <p className="font-mono-tech text-[11px] text-[#111111]/70">
                Direct camera feed with tactical viewfinder reticles.
              </p>
            </div>
            <div className="border border-[#111111] bg-[#F5F1E8] p-3 space-y-1">
              <div className="flex items-center gap-1.5 font-display text-xs font-bold uppercase text-[#111111]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#111111]" />
                <span>ZERO-LATENCY OCR</span>
              </div>
              <p className="font-mono-tech text-[11px] text-[#111111]/70">
                Automatic perspective correction and character extraction.
              </p>
            </div>
            <div className="border border-[#111111] bg-[#F5F1E8] p-3 space-y-1">
              <div className="flex items-center gap-1.5 font-display text-xs font-bold uppercase text-[#111111]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#111111]" />
                <span>SAVED AUDIT DOSSIERS</span>
              </div>
              <p className="font-mono-tech text-[11px] text-[#111111]/70">
                All scans logged to your private investigator history.
              </p>
            </div>
          </div>
        </div>
      ) : isTrialExhausted ? (
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
              SUBSCRIBE TO CONTINUE SCANNING
            </h2>
            <p className="font-mono-tech text-xs sm:text-sm text-[#111111]/80 leading-relaxed">
              You have completed both free optical camera scans. Upgrade to the Premium Investigator plan for ₹200/month to unlock unlimited optical camera surveillance, high-precision document OCR, and priority queue processing.
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
        /* Authenticated View: Active Camera Scanner & Pipeline */
        <>
          {/* Trial Status Meter */}
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
                  ? "PREMIUM CLEARANCE ACTIVE • UNLIMITED OPTICAL SCANS"
                  : `FREE TRIAL ALLOCATION • ${trialsRemaining} OF 2 FREE SCANS REMAINING`}
              </span>
            </div>
            {!isPremium && (
              <Link href="/plans?trialEnded=true">
                <span className="font-mono-tech text-xs font-bold text-[#111111] underline hover:text-[#111111]/70 cursor-pointer">
                  UPGRADE TO UNLIMITED (₹200/MO) →
                </span>
              </Link>
            )}
          </div>
          {error && (
            <ErrorState
              title={error.includes("No readable text") ? "NO READABLE TEXT DETECTED" : "SCAN FAILED"}
              message={error}
              onRetry={error.includes("No readable text") ? handleReset : handleStartScan}
            />
          )}

          {result ? (
            <ScanResult
              result={result}
              loading={loading}
              processingStep={processingStep}
              capturedImage={capturedImage}
              onScanAgain={handleReset}
            />
          ) : loading ? (
            <ScanResult
              loading={true}
              processingStep={processingStep}
              capturedImage={capturedImage}
            />
          ) : (
            <div className="space-y-6">
              <CameraScanner
                onCapture={handleCapture}
                disabled={loading}
              />

              {/* If an image is captured, show the confirmation action */}
              {capturedImage && (
                <div className="border-2 border-[#111111] bg-[#B7FF3C] p-6 shadow-hard flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-bottom-2">
                  <div className="space-y-1 text-center sm:text-left">
                    <h3 className="font-display text-xl uppercase tracking-tight text-[#111111]">
                      IMAGE FRAME LOCKED & READY
                    </h3>
                    <p className="font-mono-tech text-xs text-[#111111]/80">
                      Ready to run neural OCR extraction and deep consensus verification.
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleStartScan}
                    icon={Sparkles}
                    className="w-full sm:w-auto shrink-0"
                  >
                    SCAN THIS NEWS
                  </Button>
                </div>
              )}

              {/* Guidelines */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="border-2 border-[#111111] bg-white p-4 shadow-hard-xs space-y-1">
                  <span className="font-display text-xs uppercase font-bold text-[#111111]">
                    1. HOLD STEADY
                  </span>
                  <p className="font-mono-tech text-xs text-[#111111]/70">
                    Frame the headline or article body clearly inside the reticle guides.
                  </p>
                </div>
                <div className="border-2 border-[#111111] bg-white p-4 shadow-hard-xs space-y-1">
                  <span className="font-display text-xs uppercase font-bold text-[#111111]">
                    2. OPTICAL PARSER
                  </span>
                  <p className="font-mono-tech text-xs text-[#111111]/70">
                    OCR extracts text while filtering perspective distortion and noise.
                  </p>
                </div>
                <div className="border-2 border-[#111111] bg-white p-4 shadow-hard-xs space-y-1">
                  <span className="font-display text-xs uppercase font-bold text-[#111111]">
                    3. VERDICT ENGINE
                  </span>
                  <p className="font-mono-tech text-xs text-[#111111]/70">
                    Instant fact-checking against our 45,000+ consensus knowledge base.
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
