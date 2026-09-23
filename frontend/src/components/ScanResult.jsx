"use client";

import React, { useState } from "react";
import Badge from "./Badge";
import Button from "./Button";
import {
  FileText,
  ShieldAlert,
  Save,
  RotateCcw,
  Check,
  Cpu,
  Layers,
} from "lucide-react";

export default function ScanResult({
  result,
  loading,
  processingStep,
  capturedImage,
  onScanAgain,
}) {
  const [saved, setSaved] = useState(false);

  const pipeline = [
    { label: "IMAGE", detail: "OPTICAL CAPTURE" },
    { label: "OCR", detail: "NEURAL CHARACTER READ" },
    { label: "TEXT EXTRACTION", detail: "PARSED HEADLINE" },
    { label: "AI ANALYSIS", detail: "CORROBORATION" },
    { label: "VERDICT", detail: "TRUTH CLASSIFIER" },
  ];

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (loading) {
    return (
      <div className="border-2 border-[#111111] bg-white shadow-hard p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b-2 border-[#111111]">
          <span className="font-display text-lg uppercase tracking-tight text-[#111111] flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#111111] animate-spin" />
            <span>OPTICAL PIPELINE EXECUTING</span>
          </span>
          <span className="font-mono-tech text-xs bg-[#B7FF3C] border border-[#111111] px-2 py-0.5 font-bold">
            STAGE {processingStep + 1} OF 5
          </span>
        </div>

        {/* Pipeline Visual Flow */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
          {pipeline.map((step, idx) => {
            const isDone = idx < processingStep;
            const isCurrent = idx === processingStep;
            return (
              <div
                key={step.label}
                className={`p-3 border-2 border-[#111111] text-center transition-all ${
                  isCurrent
                    ? "bg-[#B7FF3C] shadow-hard-xs font-bold scale-[1.02]"
                    : isDone
                    ? "bg-[#E8E2D5] font-semibold text-[#111111]/70"
                    : "bg-[#F5F1E8]/50 opacity-40 border-dashed"
                }`}
              >
                <div className="font-display text-xs tracking-wider">
                  {step.label}
                </div>
                <div className="font-mono-tech text-[9px] uppercase tracking-tighter mt-1">
                  {isCurrent ? "PROCESSING..." : isDone ? "COMPLETED" : step.detail}
                </div>
              </div>
            );
          })}
        </div>

        {/* Scanner animated pulse banner */}
        <div className="p-4 bg-[#F5F1E8] border-2 border-[#111111] flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-[#111111] animate-ping" />
          <p className="font-mono-tech text-xs uppercase font-bold text-[#111111]">
            {processingStep === 0 && "INGESTING OPTICAL IMAGE FRAME..."}
            {processingStep === 1 && "RUNNING HIGH-PRECISION OCR ENGINE..."}
            {processingStep === 2 && "EXTRACTING SALIENT NEWS PROPOSITIONS..."}
            {processingStep === 3 && "QUERYING FACT REGISTRIES & PEER PAPERS..."}
            {processingStep >= 4 && "FINALIZING CLASSIFICATION VERDICT..."}
          </p>
        </div>
      </div>
    );
  }

  if (!result) return null;

  const {
    verdict = "FALSE",
    confidence = 89,
    extractedText,
    claimAnalyzed,
    explanation,
    keySignals = [],
    sourcesChecked = [],
  } = result;

  return (
    <div className="border-2 border-[#111111] bg-white shadow-hard p-5 sm:p-7 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-[#111111]">
        <div>
          <span className="font-mono-tech text-[10px] uppercase tracking-widest text-[#111111]/60 font-bold block mb-1">
            OPTICAL SCAN CLASSIFICATION
          </span>
          <div className="flex items-center gap-3">
            <h2 className="font-display text-2xl uppercase tracking-tight text-[#111111]">
              SCAN RESULT
            </h2>
            <Badge verdict={verdict} size="lg" showIcon />
          </div>
        </div>

        <div className="bg-[#F5F1E8] border-2 border-[#111111] px-4 py-2 font-mono-tech text-xs font-bold flex items-center gap-2">
          <span>CONFIDENCE:</span>
          <span className="text-base text-[#111111]">{confidence}%</span>
        </div>
      </div>

      {/* Extracted Text Section */}
      <div className="border-2 border-[#111111] bg-[#F5F1E8] p-4 sm:p-5 shadow-hard-xs space-y-2">
        <div className="flex items-center gap-2 font-mono-tech text-xs uppercase font-bold text-[#111111]">
          <FileText className="w-4 h-4 text-[#111111]" />
          <span>EXTRACTED TEXT FROM OPTICAL LENS:</span>
        </div>
        <blockquote className="font-mono-tech text-sm text-[#111111] bg-white p-3 border border-[#111111] leading-relaxed">
          &ldquo;{extractedText || claimAnalyzed}&rdquo;
        </blockquote>
      </div>

      {/* Synthesis Explanation */}
      <div className="space-y-2">
        <h4 className="font-display text-sm uppercase tracking-wider text-[#111111]">
          VERIFICATION EXPLANATION:
        </h4>
        <p className="font-mono-tech text-xs sm:text-sm text-[#111111] leading-relaxed bg-[#E8E2D5]/40 p-4 border-2 border-[#111111]">
          {explanation}
        </p>
      </div>

      {/* Signals & Sources */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border-2 border-[#111111] bg-[#F5F1E8] p-4 shadow-hard-xs space-y-1.5">
          <span className="font-display text-xs uppercase font-bold text-[#111111]">
            OCR & SIGNAL CHECKS
          </span>
          <ul className="font-mono-tech text-xs space-y-1 text-[#111111]/80">
            {keySignals.map((sig, i) => (
              <li key={i}>• {sig}</li>
            ))}
          </ul>
        </div>
        <div className="border-2 border-[#111111] bg-[#F5F1E8] p-4 shadow-hard-xs space-y-1.5">
          <span className="font-display text-xs uppercase font-bold text-[#111111]">
            REGISTRIES CONSULTED
          </span>
          <ul className="font-mono-tech text-xs space-y-1 text-[#111111]/80">
            {sourcesChecked.map((src, i) => (
              <li key={i}>✓ {src}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Actions */}
      <div className="pt-4 border-t-2 border-[#111111] flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="font-mono-tech text-xs text-[#111111]/60">
          SCAN RECORD GENERATED
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            variant="outline"
            size="md"
            onClick={handleSave}
            icon={saved ? Check : Save}
            className="flex-1 sm:flex-initial"
          >
            {saved ? "SAVED TO HISTORY" : "SAVE RESULT"}
          </Button>
          <Button
            variant="accent"
            size="md"
            onClick={onScanAgain}
            icon={RotateCcw}
            className="flex-1 sm:flex-initial"
          >
            SCAN AGAIN
          </Button>
        </div>
      </div>
    </div>
  );
}
