"use client";

import React, { useState } from "react";
import Button from "./Button";
import { Sparkles, CornerDownLeft } from "lucide-react";

export default function DetectInput({ onSubmit, loading }) {
  const [text, setText] = useState("");

  const presets = [
    "NASA discovers extraterrestrial fossils on Martian core samples retrieved by Perseverance.",
    "Global renewable energy generation exceeded 30% of total electrical power output in 2025.",
    "Viral audio reveals deepfake voice synthesis caused automated bank run and ATM shutdown.",
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      onSubmit(text);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="border-2 border-[#111111] bg-white shadow-hard p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#111111]/20">
          <label
            htmlFor="claim-text"
            className="font-mono-tech text-xs uppercase font-bold text-[#111111] flex items-center gap-1.5"
          >
            <span>RAW TEXT OR SOCIAL CLAIM</span>
          </label>
          <span className="font-mono-tech text-[10px] text-[#111111]/60">
            {text.length} CHARS
          </span>
        </div>

        <textarea
          id="claim-text"
          rows={5}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste the news, quote, tweet, or claim you want to verify..."
          className="w-full p-3 font-mono-tech text-sm text-[#111111] bg-[#F5F1E8]/50 border-2 border-[#111111] focus:outline-none focus:bg-white focus:border-[#111111] resize-none"
          disabled={loading}
          required
        />

        {/* Preset Prompt Suggestions */}
        <div className="space-y-1.5 pt-1">
          <span className="font-mono-tech text-[10px] font-bold text-[#111111]/60 uppercase">
            OR TEST WITH A SAMPLE CLAIM:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {presets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setText(preset)}
                className="px-2.5 py-1 text-left bg-[#E8E2D5] hover:bg-[#B7FF3C] border border-[#111111] font-mono-tech text-[11px] text-[#111111] truncate max-w-full transition-colors cursor-pointer"
              >
                &ldquo;{preset.substring(0, 48)}...&rdquo;
              </button>
            ))}
          </div>
        </div>

        <div className="pt-3 border-t-2 border-[#111111] flex items-center justify-end">
          <Button
            type="submit"
            variant="accent"
            size="md"
            loading={loading}
            disabled={!text.trim()}
            icon={Sparkles}
          >
            CHECK NOW
          </Button>
        </div>
      </div>
    </form>
  );
}
