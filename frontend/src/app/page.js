"use client";

import React from "react";
import Link from "next/link";
import Button from "@/components/Button";
import NewsGrid from "@/components/NewsGrid";
import {
  ShieldCheck,
  Search,
  Scan,
  Cpu,
  Layers,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Zap,
  Lock,
  Globe2,
} from "lucide-react";

export default function HomePage() {
  const pipelineSteps = [
    {
      step: "01",
      title: "INPUT",
      desc: "Ingest text claims, web URLs, documents, or camera snapshots.",
      tag: "MULTIMODAL",
    },
    {
      step: "02",
      title: "ANALYZE",
      desc: "Deconstruct syntactic claims, named entities, and source credibility.",
      tag: "NEURAL PARSER",
    },
    {
      step: "03",
      title: "VERIFY",
      desc: "Cross-corroborate with 45,000+ indexed fact registers & peer logs.",
      tag: "CONSENSUS MESH",
    },
    {
      step: "04",
      title: "VERDICT",
      desc: "Deliver clear TRUE / FALSE / MISLEADING verdict with confidence index.",
      tag: "CONFIDENCE SCORE",
    },
  ];

  return (
    <div className="space-y-20 pb-12">
      {/* =================================================== */}
      {/* HERO SECTION                                       */}
      {/* =================================================== */}
      <section className="relative pt-6 sm:pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Pill Sticker Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#B7FF3C] text-[#111111] border-2 border-[#111111] shadow-hard-xs transform -rotate-1 font-mono-tech text-xs font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#111111] animate-ping" />
              <span>AI-POWERED MISINFORMATION DETECTION</span>
            </div>

            {/* Massive Display Heading with Glitch Hover */}
            <h1 className="font-display text-5xl sm:text-7xl xl:text-8xl uppercase tracking-tighter text-[#111111] leading-[0.88] select-none">
              <span className="block glitch-hover">SPOT</span>
              <span className="block text-[#111111] glitch-hover">
                FAKE NEWS<span className="text-[#B7FF3C]">.</span>
              </span>
            </h1>

            {/* Supporting Subtitle */}
            <p className="font-mono-tech text-sm sm:text-base text-[#111111]/85 max-w-xl leading-relaxed">
              Analyze suspicious news, claims and media using AI-powered fact checking. Inspect digital dispatches or point your lens at live print headlines in milliseconds.
            </p>

            {/* Hero CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link href="/detect">
                <Button variant="accent" size="lg" icon={Search}>
                  START DETECTING
                </Button>
              </Link>
              <Link href="/scan">
                <Button variant="outline" size="lg" icon={Scan}>
                  SCAN NEWS
                </Button>
              </Link>
            </div>

            {/* Trust Badges Bar */}
            <div className="pt-4 flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#111111] font-mono-tech text-xs font-bold text-[#111111]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#111111]" />
                <span>AI VERIFIED</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#111111] font-mono-tech text-xs font-bold text-[#111111]">
                <Layers className="w-3.5 h-3.5 text-[#111111]" />
                <span>MULTI-MODE</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#111111] font-mono-tech text-xs font-bold text-[#111111]">
                <Zap className="w-3.5 h-3.5 text-[#111111]" />
                <span>REAL-TIME ANALYSIS</span>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Telemetry / Terminal Mockup (5 cols) */}
          <div className="lg:col-span-5">
            <div className="relative border-3 border-[#111111] bg-[#111111] text-[#F5F1E8] shadow-hard-lg p-6 space-y-5">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b-2 border-white/20">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-[#FF4D4D] border border-white" />
                  <div className="w-3 h-3 bg-[#FFC857] border border-white" />
                  <div className="w-3 h-3 bg-[#B7FF3C] border border-white" />
                </div>
                <span className="font-mono-tech text-xs text-[#B7FF3C] font-bold">
                  VERIFY_ENGINE.SYS
                </span>
              </div>

              {/* Sample Live Telemetry Analysis Card */}
              <div className="space-y-3 font-mono-tech text-xs">
                <div className="p-3 bg-white/5 border border-white/20 space-y-1">
                  <span className="text-[#E8E2D5]/60 text-[10px] uppercase">
                    INPUT INGESTION:
                  </span>
                  <p className="text-white font-bold text-sm">
                    &ldquo;Deepfake audio shut down global banking networks&rdquo;
                  </p>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] text-[#E8E2D5]/80">
                    <span>CROSS-REFERENCING CONSENSUS</span>
                    <span className="text-[#B7FF3C]">94% COMPLETE</span>
                  </div>
                  <div className="h-3 bg-white/10 border border-white/40 p-[1px]">
                    <div className="h-full bg-[#B7FF3C] w-[94%]" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div className="p-2 border border-white/20 bg-white/5">
                    <span className="text-[10px] text-[#E8E2D5]/60 block">VERDICT</span>
                    <span className="font-display text-sm text-[#FF4D4D] font-bold">
                      FALSE (FABRICATED)
                    </span>
                  </div>
                  <div className="p-2 border border-white/20 bg-white/5">
                    <span className="text-[10px] text-[#E8E2D5]/60 block">CERTAINTY</span>
                    <span className="font-display text-sm text-[#B7FF3C] font-bold">
                      94% CONFIDENCE
                    </span>
                  </div>
                </div>
              </div>

              {/* Floating Sticker Stamp */}
              <div className="absolute -bottom-4 -right-4 bg-[#B7FF3C] text-[#111111] border-2 border-[#111111] shadow-hard font-display text-xs uppercase px-3 py-1 font-bold">
                AUDITED BY TRUTHSCAN
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================== */}
      {/* PIPELINE ARCHITECTURE SECTION                      */}
      {/* =================================================== */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-3 border-b-2 border-[#111111]">
          <div>
            <span className="font-mono-tech text-xs uppercase font-bold text-[#111111]/70">
              NEURAL VERIFICATION PIPELINE
            </span>
            <h2 className="font-display text-3xl sm:text-4xl uppercase tracking-tighter text-[#111111]">
              HOW IT OPERATES
            </h2>
          </div>
          <span className="font-mono-tech text-xs bg-white border border-[#111111] px-3 py-1 font-bold">
            ZERO LATENCY AUDIT
          </span>
        </div>

        {/* 4 Step Pipeline Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {pipelineSteps.map((step, idx) => (
            <div
              key={step.title}
              className="border-2 border-[#111111] bg-white shadow-hard p-5 space-y-3 relative group hover:bg-[#F5F1E8] transition-colors"
            >
              <div className="flex items-center justify-between pb-2 border-b border-[#111111]/20">
                <span className="font-display text-2xl text-[#111111] font-bold">
                  {step.step}
                </span>
                <span className="font-mono-tech text-[10px] bg-[#B7FF3C] border border-[#111111] px-1.5 py-0.5 font-bold">
                  {step.tag}
                </span>
              </div>
              <h3 className="font-display text-xl uppercase tracking-tight text-[#111111] flex items-center justify-between">
                <span>{step.title}</span>
                {idx < 3 && (
                  <span className="font-mono-tech text-sm text-[#111111]/40 hidden lg:inline">
                    →
                  </span>
                )}
              </h3>
              <p className="font-mono-tech text-xs text-[#111111]/75 leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* =================================================== */}
      {/* 3 USER EXPERIENCES BENTO CARDS                     */}
      {/* =================================================== */}
      <section className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Detect */}
          <div className="border-2 border-[#111111] bg-white shadow-hard p-6 flex flex-col justify-between space-y-6 group hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-hard-lg transition-all">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-[#B7FF3C] border-2 border-[#111111] shadow-hard-xs flex items-center justify-center">
                <Search className="w-6 h-6 text-[#111111]" />
              </div>
              <div className="space-y-1">
                <span className="font-mono-tech text-[10px] text-[#111111]/60 font-bold uppercase">
                  EXPERIENCE 01
                </span>
                <h3 className="font-display text-2xl uppercase tracking-tight text-[#111111]">
                  DETECT
                </h3>
              </div>
              <p className="font-mono-tech text-xs text-[#111111]/80 leading-relaxed">
                Analyze text excerpts, news URLs, and PDF or image files with comprehensive signal decomposition and certainty scoring.
              </p>
            </div>
            <Link href="/detect">
              <Button variant="primary" size="md" className="w-full" icon={ArrowRight}>
                OPEN DETECT
              </Button>
            </Link>
          </div>

          {/* Card 2: Scan */}
          <div className="border-2 border-[#111111] bg-white shadow-hard p-6 flex flex-col justify-between space-y-6 group hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-hard-lg transition-all">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-[#111111] text-[#B7FF3C] border-2 border-[#111111] shadow-hard-xs flex items-center justify-center">
                <Scan className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="font-mono-tech text-[10px] text-[#111111]/60 font-bold uppercase">
                  EXPERIENCE 02
                </span>
                <h3 className="font-display text-2xl uppercase tracking-tight text-[#111111]">
                  SCAN
                </h3>
              </div>
              <p className="font-mono-tech text-xs text-[#111111]/80 leading-relaxed">
                Activate your camera viewfinder to inspect physical newspapers, magazine articles, signs, or screens directly through automated OCR.
              </p>
            </div>
            <Link href="/scan">
              <Button variant="accent" size="md" className="w-full" icon={ArrowRight}>
                LAUNCH SCANNER
              </Button>
            </Link>
          </div>

          {/* Card 3: News Wire */}
          <div className="border-2 border-[#111111] bg-white shadow-hard p-6 flex flex-col justify-between space-y-6 group hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-hard-lg transition-all">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-[#E8E2D5] border-2 border-[#111111] shadow-hard-xs flex items-center justify-center">
                <Globe2 className="w-6 h-6 text-[#111111]" />
              </div>
              <div className="space-y-1">
                <span className="font-mono-tech text-[10px] text-[#111111]/60 font-bold uppercase">
                  EXPERIENCE 03
                </span>
                <h3 className="font-display text-2xl uppercase tracking-tight text-[#111111]">
                  LATEST NEWS
                </h3>
              </div>
              <p className="font-mono-tech text-xs text-[#111111]/80 leading-relaxed">
                Monitor live categorized headlines from global sources with one-click fact check audits and real-time evidence evaluation.
              </p>
            </div>
            <Link href="/news">
              <Button variant="outline" size="md" className="w-full" icon={ArrowRight}>
                EXPLORE WIRE
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* =================================================== */}
      {/* LANDING PAGE — LATEST NEWS SECTION                 */}
      {/* =================================================== */}
      <section className="pt-4">
        <NewsGrid showTitle={true} limit={6} />
      </section>

      {/* =================================================== */}
      {/* BOTTOM CALL TO ACTION                              */}
      {/* =================================================== */}
      <section className="border-3 border-[#111111] bg-[#B7FF3C] p-8 sm:p-12 shadow-hard-lg text-center space-y-6">
        <div className="max-w-2xl mx-auto space-y-3">
          <span className="font-mono-tech text-xs uppercase font-bold tracking-widest text-[#111111]">
            STOP SPREADING UNVERIFIED CLAIMS
          </span>
          <h2 className="font-display text-4xl sm:text-5xl uppercase tracking-tighter text-[#111111] leading-none">
            ARM YOURSELF WITH REAL-TIME TRUTH.
          </h2>
          <p className="font-mono-tech text-xs sm:text-sm text-[#111111]/80">
            Join thousands of journalists, researchers, and conscious readers checking claims daily.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link href="/detect">
            <Button variant="primary" size="lg" icon={Search}>
              START DETECTING NOW
            </Button>
          </Link>
          <Link href="/plans">
            <Button variant="outline" size="lg">
              VIEW PRICING PLANS
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
