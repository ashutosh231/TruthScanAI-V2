"use client";

import React, { useState } from "react";
import Button from "./Button";
import { Globe, ArrowRight, ExternalLink } from "lucide-react";

export default function UrlInput({ onSubmit, loading }) {
  const [url, setUrl] = useState("");

  const sampleUrls = [
    "https://reuters.com/science/jwst-detects-water-vapor-exoplanet",
    "https://viral-breaking-leaks.org/secret-central-bank-shutdown",
    "https://who.int/news/mrna-vaccine-candidate-phase3-validation",
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (url.trim()) {
      onSubmit(url.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="border-2 border-[#111111] bg-white shadow-hard p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#111111]/20">
          <label
            htmlFor="article-url"
            className="font-mono-tech text-xs uppercase font-bold text-[#111111] flex items-center gap-1.5"
          >
            <Globe className="w-3.5 h-3.5 text-[#111111]" />
            <span>ARTICLE OR DOMAIN WEB ADDRESS</span>
          </label>
          <span className="font-mono-tech text-[10px] text-[#111111]/60">
            HTTP / HTTPS
          </span>
        </div>

        <div className="relative">
          <input
            id="article-url"
            type="url"
            required
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/breaking-news-investigation"
            className="w-full p-3 font-mono-tech text-sm text-[#111111] bg-[#F5F1E8]/50 border-2 border-[#111111] focus:outline-none focus:bg-white focus:border-[#111111]"
            disabled={loading}
          />
        </div>

        {/* Sample URL presets */}
        <div className="space-y-1.5 pt-1">
          <span className="font-mono-tech text-[10px] font-bold text-[#111111]/60 uppercase">
            OR TEST WITH A SAMPLE LINK:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {sampleUrls.map((sUrl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setUrl(sUrl)}
                className="px-2.5 py-1 text-left bg-[#E8E2D5] hover:bg-[#B7FF3C] border border-[#111111] font-mono-tech text-[11px] text-[#111111] truncate max-w-full transition-colors cursor-pointer"
              >
                {sUrl.replace("https://", "")}
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
            disabled={!url.trim()}
            icon={ArrowRight}
          >
            ANALYZE URL
          </Button>
        </div>
      </div>
    </form>
  );
}
