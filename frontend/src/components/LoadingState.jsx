import React from "react";
import { Loader2 } from "lucide-react";

export function LoadingSpinner({ text = "ANALYZING...", size = "md" }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 gap-3">
      <div className="relative w-12 h-12 flex items-center justify-center border-2 border-[#111111] bg-[#B7FF3C] shadow-hard animate-bounce">
        <Loader2 className="w-6 h-6 text-[#111111] animate-spin" />
      </div>
      <p className="font-mono-tech text-xs tracking-widest uppercase font-bold text-[#111111]">
        {text}
      </p>
    </div>
  );
}

export function NewsSkeletonGrid({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="border-2 border-[#111111] bg-[#E8E2D5]/50 shadow-hard p-4 flex flex-col justify-between animate-pulse"
        >
          <div>
            <div className="h-44 bg-[#ded6c7] border-2 border-[#111111] mb-4" />
            <div className="flex justify-between items-center mb-3">
              <div className="h-4 w-20 bg-[#ded6c7]" />
              <div className="h-4 w-16 bg-[#ded6c7]" />
            </div>
            <div className="h-6 w-full bg-[#ded6c7] mb-2" />
            <div className="h-6 w-3/4 bg-[#ded6c7] mb-3" />
            <div className="h-4 w-full bg-[#ded6c7] mb-1" />
            <div className="h-4 w-4/5 bg-[#ded6c7]" />
          </div>
          <div className="pt-5 mt-4 border-t-2 border-[#111111]/20 flex justify-between items-center">
            <div className="h-4 w-24 bg-[#ded6c7]" />
            <div className="h-9 w-28 bg-[#ded6c7] border-2 border-[#111111]" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function LoadingState({ message = "VERIFYING EVIDENCE..." }) {
  return <LoadingSpinner text={message} />;
}
