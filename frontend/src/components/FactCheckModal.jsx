"use client";

import React, { useState, useEffect } from "react";
import { X, ShieldAlert, Cpu } from "lucide-react";
import { factCheckArticle } from "@/lib/api";
import FactCheckResult from "./FactCheckResult";
import ErrorState from "./ErrorState";

export default function FactCheckModal({ isOpen, onClose, article }) {
  const [loading, setLoading] = useState(true);
  const [pipelineStep, setPipelineStep] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const steps = [
    "PARSING HEADLINE & CLAIMS...",
    "CROSS-REFERENCING VERIFIED DATABASES...",
    "EVALUATING SYNTACTIC INTEGRITY & BIAS...",
    "FINALIZING NEURAL VERDICT...",
  ];

  useEffect(() => {
    if (!isOpen || !article) {
      setResult(null);
      setError(null);
      setLoading(true);
      setPipelineStep(0);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);
    setPipelineStep(0);

    // Progressive step indicator
    const stepInterval = setInterval(() => {
      setPipelineStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 380);

    // Call API factCheckArticle
    factCheckArticle(article)
      .then((res) => {
        if (isMounted) {
          setResult(res);
          setLoading(false);
          clearInterval(stepInterval);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || "Failed to complete fact check.");
          setLoading(false);
          clearInterval(stepInterval);
        }
      });

    return () => {
      isMounted = false;
      clearInterval(stepInterval);
    };
  }, [isOpen, article]);

  if (!isOpen || !article) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col border-3 border-[#111111] bg-[#F5F1E8] shadow-hard-lg overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#111111] text-[#F5F1E8] border-b-2 border-[#111111]">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#B7FF3C]" />
            <span className="font-display text-sm tracking-widest uppercase">
              FACT CHECK TERMINAL
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 border border-white/40 hover:bg-[#FF4D4D] hover:border-white transition-colors cursor-pointer text-white"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto p-5 sm:p-6">
          {loading ? (
            <div className="py-12 px-4 flex flex-col items-center justify-center text-center space-y-6">
              {/* Animated Radar Scanning Element */}
              <div className="relative w-20 h-20 border-2 border-[#111111] bg-[#B7FF3C] shadow-hard flex items-center justify-center">
                <div className="absolute inset-0 bg-[#111111]/10 animate-pulse" />
                <span className="font-mono-tech text-xs font-bold text-[#111111]">
                  AI SCAN
                </span>
                {/* Horizontal scanline */}
                <div className="animate-scanline" />
              </div>

              <div className="space-y-2">
                <h3 className="font-display text-xl uppercase tracking-tight text-[#111111]">
                  FACT CHECKING IN PROGRESS...
                </h3>
                <p className="font-mono-tech text-xs text-[#111111]/70 max-w-sm mx-auto">
                  Cross-referencing live claims against verified knowledge databases and cryptographic source signatures.
                </p>
              </div>

              {/* Multi-step progress bars */}
              <div className="w-full max-w-md space-y-2 pt-2 text-left">
                {steps.map((stepName, index) => {
                  const isDone = index < pipelineStep;
                  const isCurrent = index === pipelineStep;
                  return (
                    <div
                      key={stepName}
                      className={`flex items-center justify-between p-2 text-xs font-mono-tech border-2 border-[#111111] transition-all ${
                        isCurrent
                          ? "bg-[#B7FF3C] shadow-hard-xs font-bold text-[#111111]"
                          : isDone
                          ? "bg-white text-[#111111]/60 font-medium"
                          : "bg-[#E8E2D5]/50 text-[#111111]/40 border-dashed"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>[{index + 1}/4]</span>
                        <span>{stepName}</span>
                      </span>
                      <span>{isDone ? "DONE" : isCurrent ? "RUNNING..." : "QUEUED"}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : error ? (
            <ErrorState
              title="VERIFICATION HALTED"
              message={error}
              onRetry={() => {
                setLoading(true);
                factCheckArticle(article).then(setResult).catch((e) => setError(e.message)).finally(() => setLoading(false));
              }}
            />
          ) : (
            <FactCheckResult result={result} onReset={onClose} />
          )}
        </div>
      </div>
    </div>
  );
}
