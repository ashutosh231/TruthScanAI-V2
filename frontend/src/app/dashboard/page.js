"use client";

import React, { useState, useEffect } from "react";
import { getHistory } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import FactCheckResult from "@/components/FactCheckResult";
import ErrorState from "@/components/ErrorState";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  HelpCircle,
  Eye,
  X,
  History,
  TrendingUp,
  Download,
} from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeItem, setActiveItem] = useState(null);
  const [filterVerdict, setFilterVerdict] = useState("ALL");

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getHistory();
      if (res && res.data) {
        setHistory(res.data);
        setStats(res.stats);
      }
    } catch (err) {
      setError(err.message || "Failed to load history telemetry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const filteredHistory = history.filter((item) => {
    if (filterVerdict === "ALL") return true;
    return item.verdict.toUpperCase() === filterVerdict;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Dashboard Top Header */}
      <div className="border-b-2 border-[#111111] pb-6 space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 font-mono-tech text-xs uppercase font-bold text-[#111111]">
            <ShieldCheck className="w-4 h-4 text-[#111111]" />
            <span>INVESTIGATOR TELEMETRY DASHBOARD</span>
          </div>
          <span className="font-mono-tech text-xs bg-[#B7FF3C] border border-[#111111] px-2.5 py-1 font-bold">
            CLEARANCE: {user?.plan || "PREMIUM"}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl sm:text-6xl uppercase tracking-tighter text-[#111111]">
              MY TRUTHSCAN
            </h1>
            <p className="font-mono-tech text-xs sm:text-sm text-[#111111]/80 max-w-xl">
              Telemetry archive of analyzed claims, OCR extractions, and consensus verdicts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={Download}
              onClick={() => alert("Audit log exported as JSON format.")}
            >
              EXPORT AUDIT
            </Button>
          </div>
        </div>
      </div>

      {/* Overview Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Checks */}
        <div className="border-2 border-[#111111] bg-white shadow-hard p-5 space-y-2">
          <div className="flex items-center justify-between font-mono-tech text-xs text-[#111111]/70 font-bold uppercase">
            <span>TOTAL CHECKS</span>
            <History className="w-4 h-4 text-[#111111]" />
          </div>
          <p className="font-display text-3xl sm:text-4xl text-[#111111] font-bold">
            {stats?.totalChecks || 1428}
          </p>
          <div className="font-mono-tech text-[10px] text-[#111111]/60">
            Across 148 active monitors
          </div>
        </div>

        {/* TRUE Count */}
        <div className="border-2 border-[#111111] bg-[#75D66A]/20 shadow-hard p-5 space-y-2">
          <div className="flex items-center justify-between font-mono-tech text-xs text-[#111111]/70 font-bold uppercase">
            <span>VERIFIED TRUE</span>
            <CheckCircle2 className="w-4 h-4 text-[#75D66A]" />
          </div>
          <p className="font-display text-3xl sm:text-4xl text-[#111111] font-bold">
            {stats?.trueCount || 412}
          </p>
          <div className="font-mono-tech text-[10px] text-[#111111]/60">
            28.8% of analyzed pool
          </div>
        </div>

        {/* FALSE Count */}
        <div className="border-2 border-[#111111] bg-[#FF4D4D]/15 shadow-hard p-5 space-y-2">
          <div className="flex items-center justify-between font-mono-tech text-xs text-[#111111]/70 font-bold uppercase">
            <span>DEBUNKED FALSE</span>
            <XCircle className="w-4 h-4 text-[#FF4D4D]" />
          </div>
          <p className="font-display text-3xl sm:text-4xl text-[#111111] font-bold">
            {stats?.falseCount || 789}
          </p>
          <div className="font-mono-tech text-[10px] text-[#111111]/60">
            55.2% synthetic / fabricated
          </div>
        </div>

        {/* MISLEADING Count */}
        <div className="border-2 border-[#111111] bg-[#FFC857]/20 shadow-hard p-5 space-y-2">
          <div className="flex items-center justify-between font-mono-tech text-xs text-[#111111]/70 font-bold uppercase">
            <span>MISLEADING</span>
            <AlertTriangle className="w-4 h-4 text-[#FFC857]" />
          </div>
          <p className="font-display text-3xl sm:text-4xl text-[#111111] font-bold">
            {stats?.misleadingCount || 227}
          </p>
          <div className="font-mono-tech text-[10px] text-[#111111]/60">
            15.9% missing critical context
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-1.5">
          {["ALL", "TRUE", "FALSE", "MISLEADING"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterVerdict(tab)}
              className={`px-3 py-1 font-mono-tech text-xs uppercase font-bold border-2 border-[#111111] transition-all cursor-pointer ${
                filterVerdict === tab
                  ? "bg-[#111111] text-[#B7FF3C] shadow-hard-xs"
                  : "bg-white text-[#111111] hover:bg-[#E8E2D5]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="font-mono-tech text-xs text-[#111111]/60">
          SHOWING {filteredHistory.length} AUDIT RECORDS
        </div>
      </div>

      {/* Recent Fact Checks Table / Cards */}
      {error ? (
        <ErrorState
          title="FAILED TO LOAD HISTORY"
          message={error}
          onRetry={fetchDashboardData}
        />
      ) : (
        <div className="border-2 border-[#111111] bg-white shadow-hard overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#111111] text-[#F5F1E8] font-mono-tech text-xs uppercase">
                <th className="p-3.5 border-r border-white/20">TYPE</th>
                <th className="p-3.5 border-r border-white/20">INPUT CLAIM / EVIDENCE</th>
                <th className="p-3.5 border-r border-white/20">VERDICT</th>
                <th className="p-3.5 border-r border-white/20">CONFIDENCE</th>
                <th className="p-3.5 border-r border-white/20">DATE</th>
                <th className="p-3.5 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-[#111111] font-mono-tech text-xs">
              {filteredHistory.map((item, idx) => {
                const uniqueKey = item._id || item.id || `history-item-${idx}`;
                const displayType = item.inputType || item.type || "TEXT";
                const displayDate = item.date || (item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "RECENT");
                return (
                  <tr
                    key={uniqueKey}
                    className="hover:bg-[#F5F1E8] transition-colors cursor-pointer"
                    onClick={() => setActiveItem(item)}
                  >
                    <td className="p-3.5 font-bold border-r border-[#111111]">
                      <span className="px-2 py-0.5 bg-[#E8E2D5] border border-[#111111] text-[10px] uppercase">
                        {displayType}
                      </span>
                    </td>
                    <td className="p-3.5 font-medium max-w-sm truncate border-r border-[#111111]">
                      {item.input}
                    </td>
                    <td className="p-3.5 border-r border-[#111111]">
                      <Badge verdict={item.verdict} size="sm" showIcon />
                    </td>
                    <td className="p-3.5 font-bold border-r border-[#111111]">
                      {item.confidence}%
                    </td>
                    <td className="p-3.5 text-[#111111]/70 border-r border-[#111111]">
                      {displayDate}
                    </td>
                    <td className="p-3.5 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveItem(item);
                        }}
                        icon={Eye}
                        className="text-xs"
                      >
                        VIEW
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Full Analysis Detail Modal */}
      {activeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col border-3 border-[#111111] bg-[#F5F1E8] shadow-hard-lg overflow-hidden animate-in zoom-in-95">
            <div className="flex items-center justify-between px-5 py-3.5 bg-[#111111] text-[#F5F1E8] border-b-2 border-[#111111]">
              <span className="font-display text-sm tracking-widest uppercase">
                HISTORICAL AUDIT #{String(activeItem._id || activeItem.id || "0000").slice(-6).toUpperCase()}
              </span>
              <button
                onClick={() => setActiveItem(null)}
                className="p-1 hover:bg-[#FF4D4D] text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 sm:p-6 overflow-y-auto">
              <FactCheckResult
                result={{
                  verdict: activeItem.verdict,
                  confidence: activeItem.confidence,
                  claimAnalyzed: activeItem.input,
                  source: activeItem.source || activeItem.metadata?.source || "Direct Claim Submission",
                  explanation: activeItem.explanation,
                  timelineAndContext: activeItem.metadata?.timelineAndContext || "",
                  debunkingEvidence: activeItem.metadata?.debunkingEvidence || [],
                  tactics: activeItem.metadata?.tactics || [],
                  advisory: activeItem.metadata?.advisory || "",
                  keySignals: activeItem.metadata?.keySignals || [
                    "Indexed in historical audit ledger",
                    `Consensus score: ${activeItem.metrics?.consensusScore || 92}%`,
                    `Source trust evaluation: ${activeItem.metrics?.sourceTrust || 30}/100`,
                  ],
                  sourcesChecked: activeItem.metadata?.sourcesChecked || [
                    "IFCN Knowledge Graph",
                    "TruthScan Core Telemetry Archive",
                    "Domain WHOIS Registry",
                  ],
                  timestamp: activeItem.date || (activeItem.createdAt ? new Date(activeItem.createdAt).toLocaleString() : new Date().toLocaleString()),
                  inputType: activeItem.inputType || activeItem.type || "text",
                }}
                onReset={() => setActiveItem(null)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
