"use client";

import React from "react";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import { FileText, Download, TrendingUp, AlertTriangle, ShieldCheck } from "lucide-react";

export default function ReportsPage() {
  const reports = [
    {
      id: "REP-2026-09",
      title: "State of Synthetic Media & Autonomous Disinformation Networks: Q3 2026",
      summary:
        "Analysis of automated voice-cloning bot clusters targeting regional retail banking depositors and coordinated deepfake emergency broadcasts.",
      date: "21 Sep 2026",
      classification: "UNCLASSIFIED",
      threatLevel: "ELEVATED",
      pages: "34 Pages",
      downloads: "1,840",
    },
    {
      id: "REP-2026-08",
      title: "Generative Text Watermarking Evasion Techniques & Detection Forensics",
      summary:
        "Technical breakdown of how adversarial prompt wrappers bypass statistical perplexity classifiers and linguistic fingerprinting algorithms.",
      date: "14 Sep 2026",
      classification: "PUBLIC ACCESS",
      threatLevel: "CRITICAL",
      pages: "28 Pages",
      downloads: "3,110",
    },
    {
      id: "REP-2026-07",
      title: "Health & Epidemic Misinformation Propagation on Encrypted Messaging Channels",
      summary:
        "Case study tracking forward velocity and synthetic document distribution across closed communication channels prior to official public health updates.",
      date: "02 Sep 2026",
      classification: "INVESTIGATOR CLEARANCE",
      threatLevel: "MODERATE",
      pages: "42 Pages",
      downloads: "940",
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="border-b-2 border-[#111111] pb-6 space-y-2">
        <div className="inline-flex items-center gap-2 font-mono-tech text-xs uppercase font-bold text-[#111111]">
          <FileText className="w-4 h-4 text-[#111111]" />
          <span>INTELLIGENCE & THREAT ARCHIVE</span>
        </div>
        <h1 className="font-display text-4xl sm:text-6xl uppercase tracking-tighter text-[#111111]">
          DISINFO REPORTS
        </h1>
        <p className="font-mono-tech text-xs sm:text-sm text-[#111111]/80 max-w-xl">
          Deep forensic dossiers analyzing emerging disinformation vectors, synthetic audio surges, and narrative manipulation operations.
        </p>
      </div>

      {/* Reports Grid */}
      <div className="space-y-6">
        {reports.map((report) => (
          <div
            key={report.id}
            className="border-2 border-[#111111] bg-white shadow-hard p-6 sm:p-8 space-y-4 hover:shadow-hard-lg transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-[#111111]">
              <div className="flex items-center gap-3">
                <span className="font-mono-tech text-xs bg-[#111111] text-[#B7FF3C] px-2 py-0.5 font-bold">
                  {report.id}
                </span>
                <span className="font-mono-tech text-xs text-[#111111]/70">
                  {report.date}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono-tech text-[10px] bg-[#FF4D4D]/20 border border-[#FF4D4D] text-[#111111] font-bold px-2 py-0.5">
                  THREAT: {report.threatLevel}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-display text-xl sm:text-2xl uppercase tracking-tight text-[#111111]">
                {report.title}
              </h3>
              <p className="font-mono-tech text-xs sm:text-sm text-[#111111]/80 leading-relaxed">
                {report.summary}
              </p>
            </div>

            <div className="pt-3 border-t-2 border-[#111111] flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono-tech text-xs">
              <div className="flex items-center gap-4 text-[#111111]/70">
                <span>FORMAT: PDF ({report.pages})</span>
                <span>DOWNLOADS: {report.downloads}</span>
              </div>
              <Button
                variant="accent"
                size="sm"
                icon={Download}
                onClick={() => alert(`Downloading dossier ${report.id}...`)}
              >
                DOWNLOAD DOSSIER
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
