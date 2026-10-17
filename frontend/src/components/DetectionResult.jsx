"use client";

import React from "react";
import FactCheckResult from "./FactCheckResult";
import { AlertCircle, CheckCircle2, RotateCcw } from "lucide-react";
import Button from "./Button";

export default function DetectionResult({ result, onReset }) {
  if (!result) return null;

  const isUnavailable =
    result.verdict === "VERIFICATION_UNAVAILABLE" ||
    (result.researchMetadata &&
      result.researchMetadata.searchSucceeded === false &&
      result.researchMetadata.webSearchSucceeded === false);

  const isInconclusive =
    !isUnavailable &&
    (result.verdict === "UNVERIFIED" ||
      result.verdict === "UNCERTAIN" ||
      (result.sources && result.sources.length === 0));

  const bannerTitle = isUnavailable
    ? "VERIFICATION UNAVAILABLE"
    : isInconclusive
    ? "INVESTIGATION INCONCLUSIVE"
    : "ANALYSIS COMPLETE";

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b-2 border-[#111111] gap-3">
        <div className="flex items-center gap-2">
          {isUnavailable ? (
            <span className="w-3 h-3 rounded-full bg-[#FF4D4D] border border-[#111111]" />
          ) : isInconclusive ? (
            <span className="w-3 h-3 rounded-full bg-[#FFC857] border border-[#111111]" />
          ) : (
            <span className="w-3 h-3 rounded-full bg-[#B7FF3C] border border-[#111111] animate-ping" />
          )}
          <h2 className="font-display text-xl sm:text-2xl uppercase tracking-tight text-[#111111]">
            {bannerTitle}
          </h2>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          icon={RotateCcw}
        >
          CHECK ANOTHER
        </Button>
      </div>

      <FactCheckResult result={result} onReset={onReset} />
    </div>
  );
}
