import React from "react";
import { AlertOctagon, RotateCcw } from "lucide-react";
import Button from "./Button";

export default function ErrorState({
  title = "ANALYSIS INTERRUPTED",
  message = "Unable to complete fact verification at this time. Please check your connection or retry.",
  onRetry,
}) {
  return (
    <div className="border-2 border-[#111111] bg-[#FF4D4D]/15 p-6 shadow-hard my-6 text-left">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-[#FF4D4D] border-2 border-[#111111] shadow-hard-xs shrink-0">
          <AlertOctagon className="w-6 h-6 text-[#111111]" />
        </div>
        <div className="space-y-2 flex-1">
          <h3 className="font-display text-lg tracking-tight uppercase text-[#111111]">
            {title}
          </h3>
          <p className="font-mono-tech text-xs text-[#111111]/80 leading-relaxed">
            {message}
          </p>
          {onRetry && (
            <div className="pt-2">
              <Button
                variant="primary"
                size="sm"
                onClick={onRetry}
                icon={RotateCcw}
              >
                RETRY VERIFICATION
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
