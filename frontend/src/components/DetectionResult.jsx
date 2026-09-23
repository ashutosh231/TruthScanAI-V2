"use client";

import React from "react";
import FactCheckResult from "./FactCheckResult";
import { CheckCircle2, RotateCcw } from "lucide-react";
import Button from "./Button";

export default function DetectionResult({ result, onReset }) {
  if (!result) return null;

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* Top Banner */}
      <div className="flex items-center justify-between pb-3 border-b-2 border-[#111111]">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#B7FF3C] border border-[#111111] animate-ping" />
          <h2 className="font-display text-2xl uppercase tracking-tight text-[#111111]">
            ANALYSIS COMPLETE
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
