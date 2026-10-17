"use client";

import React, { useState } from "react";
import Badge from "./Badge";
import Button from "./Button";
import {
  Check,
  Copy,
  ExternalLink,
  ShieldCheck,
  Layers,
  FileCheck,
  AlertTriangle,
  Clock,
  Info,
  XCircle,
  Sparkles,
  Radio,
  FileText,
  Globe,
  Newspaper,
  Search,
} from "lucide-react";

export default function FactCheckResult({ result, onReset }) {
  const [copied, setCopied] = useState(false);

  if (!result) return null;

  const {
    verdict = "UNCERTAIN",
    confidence = 0,
    claimAnalyzed,
    source,
    explanation,
    timelineAndContext,
    debunkingEvidence = [],
    keySignals = [],
    tactics = [],
    sourcesChecked = [],
    sources = [],
    researchMetadata = null,
    advisory,
    timestamp,
    inputType,
  } = result;

  const handleCopy = () => {
    const textToCopy = `TRUTHSCAN AI — FORENSIC FACT CHECK DOSSIER
==================================================
VERDICT: ${verdict} (Confidence: ${confidence}%)
CLAIM: "${claimAnalyzed}"
SOURCE: ${source || "User Submission"} [${inputType || "RAW TEXT"}]
TIMESTAMP: ${timestamp || new Date().toISOString()}

AI INVESTIGATION & SYNTHESIS:
${explanation}

${timelineAndContext ? `CHRONOLOGY & CONTEXT:\n${timelineAndContext}\n` : ""}
${debunkingEvidence.length > 0 ? `DEBUNKING EVIDENCE & CONTRADICTIONS:\n${debunkingEvidence.map((e) => `• ${e}`).join("\n")}\n` : ""}
${tactics.length > 0 ? `IDENTIFIED MANIPULATION TACTICS: ${tactics.join(", ")}\n` : ""}
${advisory ? `READER ADVISORY:\n${advisory}\n` : ""}
${sources.length > 0 ? `LIVE RETRIEVED SOURCES & CITATIONS:\n${sources.map((s) => `• [${s.sourceType ? s.sourceType.toUpperCase() : "SOURCE"}] ${s.title} (${s.publisher || "Publisher"}): ${s.url}`).join("\n")}\n` : ""}
${sourcesChecked.length > 0 ? `REGISTRIES CORROBORATED:\n${sourcesChecked.map((s) => `• ${s}`).join("\n")}\n` : ""}
==================================================
Verified by TruthScan AI Neural Intelligence Core`;

    navigator.clipboard?.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const isConfidenceCalibrated =
    confidence !== null && confidence !== undefined && confidence > 0 && confidence <= 100;

  const getVerdictTheme = (v) => {
    const val = String(v).toUpperCase();
    if (val === "TRUE") {
      return {
        bg: "bg-[#75D66A]/20",
        border: "border-[#75D66A]",
        text: "text-[#111111]",
        accentBg: "bg-[#75D66A]",
        threatLevel: "VERIFIED ACCURATE",
      };
    }
    if (val === "FALSE") {
      return {
        bg: "bg-[#FF4D4D]/15",
        border: "border-[#FF4D4D]",
        text: "text-[#111111]",
        accentBg: "bg-[#FF4D4D]",
        threatLevel: "DEMONSTRABLY FALSE / DEBUNKED",
      };
    }
    if (val === "MIXED" || val === "MISLEADING") {
      return {
        bg: "bg-[#FFC857]/20",
        border: "border-[#FFC857]",
        text: "text-[#111111]",
        accentBg: "bg-[#FFC857]",
        threatLevel: "MIXED / CONTEXT OMISSION",
      };
    }
    if (val === "VERIFICATION_UNAVAILABLE") {
      return {
        bg: "bg-[#FF4D4D]/15",
        border: "border-[#FF4D4D]",
        text: "text-[#111111]",
        accentBg: "bg-[#FF4D4D]",
        threatLevel: "RESEARCH SERVICE TEMPORARILY UNAVAILABLE",
      };
    }
    return {
      bg: "bg-[#E8E2D5]/40",
      border: "border-[#111111]",
      text: "text-[#111111]",
      accentBg: "bg-[#E8E2D5]",
      threatLevel: "INSUFFICIENT EVIDENCE / UNVERIFIED",
    };
  };

  const theme = getVerdictTheme(verdict);

  const renderResearchTelemetry = () => {
    if (!researchMetadata) return null;

    const searchSucceeded =
      researchMetadata.searchSucceeded ?? researchMetadata.webSearchSucceeded ?? false;
    const resultsCount =
      researchMetadata.resultsCount ?? researchMetadata.webResultsCount ?? (sources ? sources.length : 0);
    const searchError = researchMetadata.searchError;

    if (searchSucceeded && resultsCount > 0) {
      return (
        <div className="flex flex-wrap items-center gap-2 p-3.5 bg-[#75D66A]/20 border-2 border-[#111111] shadow-hard-xs font-mono-tech text-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-[#75D66A] border border-[#111111] animate-pulse" />
          <span className="font-bold uppercase tracking-wider text-[#111111]">
            LIVE WEB RESEARCH EVIDENCE RETRIEVED:
          </span>
          <span className="text-[#111111]">
            Live Web Research ({resultsCount} relevant {resultsCount === 1 ? "source" : "sources"} retrieved)
          </span>
        </div>
      );
    }

    if (searchSucceeded && resultsCount === 0) {
      return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 bg-[#FFC857]/30 border-2 border-[#111111] shadow-hard-xs font-mono-tech text-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#111111] shrink-0" />
            <span className="font-bold uppercase tracking-wider text-[#111111]">
              RESEARCH INCONCLUSIVE: ZERO CORROBORATING SOURCES
            </span>
          </div>
          <span className="text-[#111111]/80">
            Live web search completed but returned no corroborating public records.
          </span>
        </div>
      );
    }

    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 bg-[#FF4D4D]/15 border-2 border-[#111111] shadow-hard-xs font-mono-tech text-xs">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-[#FF4D4D] shrink-0" />
          <span className="font-bold uppercase tracking-wider text-[#111111]">
            RESEARCH SERVICE TEMPORARILY UNAVAILABLE
          </span>
        </div>
        <span className="text-[#111111]/80">
          {searchError
            ? "Research Service Temporarily Unavailable: Unable to retrieve live evidence at this time."
            : "Live research tools were temporarily unavailable. Technical failure prevented real-time verification."}
        </span>
      </div>
    );
  };

  const isVerdictUncertain =
    String(verdict).toUpperCase() === "UNCERTAIN" ||
    String(verdict).toUpperCase() === "INCONCLUSIVE";

  return (
    <div className="space-y-6 text-left animate-in fade-in-50 duration-200">
      {/* =================================================== */}
      {/* 1. TOP SYSTEM VERDICT BANNER                        */}
      {/* =================================================== */}
      <div className={`border-3 border-[#111111] p-5 sm:p-7 shadow-hard-lg ${theme.bg}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b-2 border-[#111111]">
          {/* Verdict Identification */}
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono-tech text-[10px] uppercase tracking-widest text-[#111111]/70 font-bold">
                VERDICT CLASSIFICATION:
              </span>
              <span className="px-2.5 py-0.5 bg-[#111111] text-[#B7FF3C] font-mono-tech text-[10px] font-bold uppercase tracking-wider">
                {theme.threatLevel}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Badge
                verdict={isVerdictUncertain ? "INVESTIGATION INCONCLUSIVE" : verdict}
                size="lg"
                showIcon
              />
            </div>
          </div>

          {/* Confidence Score Panel */}
          <div className="w-full sm:w-60 bg-white border-2 border-[#111111] p-3 shadow-hard-xs space-y-1.5">
            <div className="flex items-center justify-between font-mono-tech text-xs font-bold text-[#111111]">
              <span>Confidence Assessment:</span>
              <span className="text-sm font-black">
                {isConfidenceCalibrated ? `${confidence}%` : "Not Calibrated"}
              </span>
            </div>
            {isConfidenceCalibrated ? (
              <>
                <div className="h-3.5 bg-[#E8E2D5] border-2 border-[#111111] overflow-hidden p-[2px]">
                  <div
                    className={`h-full ${theme.accentBg} transition-all duration-700`}
                    style={{ width: `${Math.min(confidence, 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between font-mono-tech text-[9px] text-[#111111]/60">
                  <span>Low Certainty</span>
                  <span>High Certainty</span>
                </div>
              </>
            ) : (
              <p className="font-mono-tech text-[10px] text-[#111111]/70 italic bg-[#F5F1E8] p-1.5 border border-[#111111]/20">
                Confidence not calibrated
              </p>
            )}
          </div>
        </div>

        {/* Claim Analyzed Quote Box */}
        <div className="pt-5 space-y-2">
          <span className="font-mono-tech text-[10px] uppercase font-bold text-[#111111]/70 tracking-wider flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" />
            <span>SUBMITTED CLAIM SPECIFICATION</span>
          </span>
          <blockquote className="font-display text-base sm:text-xl text-[#111111] font-bold border-l-4 border-[#111111] pl-4 py-2 bg-white/85 shadow-hard-xs italic leading-snug">
            &ldquo;{claimAnalyzed}&rdquo;
          </blockquote>
        </div>
      </div>

      {/* Live Research Telemetry Banner */}
      {renderResearchTelemetry()}

      {/* =================================================== */}
      {/* 2. DEEP AI INVESTIGATION & SYNTHESIS                */}
      {/* =================================================== */}
      <div className="border-3 border-[#111111] bg-white p-6 sm:p-8 shadow-hard space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b-2 border-[#111111] gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#111111]" />
            <h4 className="font-display text-sm sm:text-base uppercase tracking-wider text-[#111111]">
              AI INVESTIGATION & FORENSIC SYNTHESIS
            </h4>
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#B7FF3C] border border-[#111111] font-mono-tech text-[10px] font-bold uppercase tracking-wider">
            <Radio className="w-3 h-3 text-[#111111] animate-pulse" />
            <span>TRUTHSCAN AI • LIVE EVIDENCE INVESTIGATION</span>
          </div>
        </div>

        <div className="prose max-w-none text-[#111111] font-mono-tech text-xs sm:text-sm leading-relaxed whitespace-pre-line space-y-3">
          {explanation}
        </div>
      </div>

      {/* =================================================== */}
      {/* 3. LIVE RETRIEVED SOURCES & CITATIONS               */}
      {/* =================================================== */}
      {sources && sources.length > 0 && (
        <div className="border-3 border-[#111111] bg-white p-6 sm:p-8 shadow-hard space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b-2 border-[#111111] gap-2">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-[#111111]" />
              <h4 className="font-display text-sm sm:text-base uppercase tracking-wider text-[#111111]">
                LIVE RETRIEVED EVIDENCE & CITATIONS ({sources.length})
              </h4>
            </div>
            <span className="font-mono-tech text-[10px] text-[#111111]/70 font-bold uppercase tracking-wider bg-[#F5F1E8] border border-[#111111] px-2 py-0.5">
              GROUNDED CITATIONS
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3.5">
            {sources.map((src, idx) => (
              <div
                key={idx}
                className="border-2 border-[#111111] bg-[#F5F1E8] p-4 shadow-hard-xs space-y-2 hover:bg-[#F5F1E8]/80 transition-colors"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 border border-[#111111] font-mono-tech text-[9px] font-bold uppercase tracking-wider bg-[#B7FF3C]">
                      LIVE WEB EVIDENCE
                    </span>
                    <span className="font-mono-tech text-xs font-bold text-[#111111]">
                      Source: {src.publisher || "Direct Source"}
                    </span>
                  </div>
                  {src.publishedAt && (
                    <span className="font-mono-tech text-[10px] text-[#111111]/60 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(src.publishedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-display text-sm text-[#111111] font-bold hover:underline flex items-start gap-1.5 group"
                  >
                    <span className="font-mono-tech text-[10px] text-[#111111]/70 font-bold uppercase tracking-wider mr-1">
                      Title:
                    </span>
                    <span className="group-hover:text-blue-700">{src.title}</span>
                    <ExternalLink className="w-3.5 h-3.5 shrink-0 mt-0.5 opacity-70 group-hover:opacity-100" />
                  </a>
                </div>

                {src.snippet && (
                  <p className="font-mono-tech text-xs text-[#111111]/80 leading-relaxed bg-white/70 p-2.5 border border-[#111111]/20">
                    &ldquo;{src.snippet}&rdquo;
                  </p>
                )}

                <div className="flex flex-wrap items-center justify-between text-[10px] font-mono-tech text-[#111111]/60 pt-1 border-t border-[#111111]/10">
                  <span>{src.relevance || "Retrieved Evidence"}</span>
                  {src.retrievedAt && (
                    <span>Retrieved: {new Date(src.retrievedAt).toLocaleTimeString()}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =================================================== */}
      {/* 4. CONTRADICTIONS & DEBUNKING EVIDENCE              */}
      {/* =================================================== */}
      {debunkingEvidence && debunkingEvidence.length > 0 && (
        <div className="border-3 border-[#111111] bg-[#F5F1E8] p-6 shadow-hard space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b-2 border-[#111111]">
            <XCircle className="w-5 h-5 text-[#FF4D4D]" />
            <h4 className="font-display text-sm uppercase tracking-wider text-[#111111]">
              KEY CONTRADICTIONS & VERIFIED COUNTER-EVIDENCE
            </h4>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {debunkingEvidence.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-white border-2 border-[#111111] shadow-hard-xs flex items-start gap-3"
              >
                <div className="w-5 h-5 bg-[#111111] text-[#B7FF3C] border border-[#111111] flex items-center justify-center shrink-0 font-mono-tech text-xs font-bold mt-0.5">
                  {idx + 1}
                </div>
                <p className="font-mono-tech text-xs sm:text-sm text-[#111111] leading-relaxed">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =================================================== */}
      {/* 5. CHRONOLOGY & CONTEXT                             */}
      {/* =================================================== */}
      {timelineAndContext && timelineAndContext.trim().length > 0 && (
        <div className="border-2 border-[#111111] bg-white p-5 shadow-hard space-y-2.5">
          <div className="flex items-center gap-2 pb-2 border-b border-[#111111]/20">
            <Clock className="w-4 h-4 text-[#111111]" />
            <h5 className="font-display text-xs uppercase tracking-wider text-[#111111]">
              CHRONOLOGY & CONTEXTUAL RECONSTRUCTION
            </h5>
          </div>
          <p className="font-mono-tech text-xs sm:text-sm text-[#111111] leading-relaxed">
            {timelineAndContext}
          </p>
        </div>
      )}

      {/* =================================================== */}
      {/* 6. MANIPULATION TACTICS                             */}
      {/* =================================================== */}
      {tactics && tactics.length > 0 && (
        <div className="border-2 border-[#111111] bg-white p-5 shadow-hard space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-[#111111]/20">
            <Sparkles className="w-4 h-4 text-[#111111]" />
            <h5 className="font-display text-xs uppercase tracking-wider text-[#111111]">
              IDENTIFIED DISINFORMATION PATTERNS
            </h5>
          </div>
          <div className="flex flex-wrap gap-2">
            {tactics.map((tac, i) => (
              <span
                key={i}
                className="px-3 py-1 bg-[#F5F1E8] border border-[#111111] font-mono-tech text-xs font-bold text-[#111111] shadow-hard-xs"
              >
                {tac}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Two-Column Grid: Forensic Signals + Registries Checked (Only rendered if items exist) */}
      {((keySignals && keySignals.length > 0) || (sourcesChecked && sourcesChecked.length > 0)) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Key Signals */}
          {keySignals && keySignals.length > 0 && (
            <div className="border-2 border-[#111111] bg-white p-5 shadow-hard space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-[#111111]/20">
                <Layers className="w-4 h-4 text-[#111111]" />
                <h5 className="font-display text-xs uppercase tracking-wider text-[#111111]">
                  DETECTED FORENSIC SIGNALS
                </h5>
              </div>
              <ul className="space-y-2 font-mono-tech text-xs text-[#111111]">
                {keySignals.map((sig, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#111111] mt-1.5 shrink-0" />
                    <span className="leading-relaxed">{sig}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Sources Checked */}
          {sourcesChecked && sourcesChecked.length > 0 && (
            <div className="border-2 border-[#111111] bg-white p-5 shadow-hard space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-[#111111]/20">
                <FileCheck className="w-4 h-4 text-[#111111]" />
                <h5 className="font-display text-xs uppercase tracking-wider text-[#111111]">
                  REGISTRIES & ARCHIVES CORROBORATED
                </h5>
              </div>
              <ul className="space-y-2 font-mono-tech text-xs text-[#111111]">
                {sourcesChecked.map((src, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <ExternalLink className="w-3.5 h-3.5 text-[#111111] shrink-0 mt-0.5" />
                    <span className="leading-relaxed font-bold">{src}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* =================================================== */}
      {/* 7. ACTIONABLE CONSUMER / RESEARCHER ADVISORY        */}
      {/* =================================================== */}
      {advisory && advisory.trim().length > 0 && (
        <div className="border-2 border-[#111111] bg-[#FFC857]/30 p-5 shadow-hard flex items-start gap-3.5">
          <AlertTriangle className="w-5 h-5 text-[#111111] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-display text-xs uppercase tracking-wider text-[#111111] block font-bold">
              VERIFICATION ADVISORY FOR INVESTIGATORS
            </span>
            <p className="font-mono-tech text-xs text-[#111111] leading-relaxed">
              {advisory}
            </p>
          </div>
        </div>
      )}

      {/* =================================================== */}
      {/* 8. META FOOTER & ACTION BUTTONS                     */}
      {/* =================================================== */}
      <div className="border-2 border-[#111111] bg-[#E8E2D5] p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono-tech shadow-hard-xs">
        <div className="text-[#111111]/80 text-center sm:text-left space-y-0.5">
          <div>
            <span>SOURCE: </span>
            <strong className="text-[#111111]">{source || "User Submission"}</strong>
            {inputType && <span className="ml-1.5 font-bold">[{inputType}]</span>}
          </div>
          <div className="text-[10px] text-[#111111]/60">
            AUDITED AT: {timestamp ? new Date(timestamp).toLocaleString() : new Date().toLocaleString()}
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            icon={copied ? Check : Copy}
            className="flex-1 sm:flex-initial"
          >
            {copied ? "COPIED FULL REPORT" : "SHARE FULL DOSSIER"}
          </Button>
          {onReset && (
            <Button
              variant="accent"
              size="sm"
              onClick={onReset}
              className="flex-1 sm:flex-initial"
            >
              CHECK ANOTHER
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
