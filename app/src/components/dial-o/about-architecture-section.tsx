"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, ArrowRight, ShieldCheck, Cpu, PhoneCall, Sparkles, Database, Layers } from "lucide-react";

interface PipelineStage {
  id: string;
  step: string;
  title: string;
  description: string;
  metadata: string;
  icon: React.ElementType;
}

interface AboutArchitectureSectionProps {
  onScrollToLogin?: () => void;
}

const PIPELINE_STAGES: PipelineStage[] = [
  {
    id: "context",
    step: "01",
    title: "CONTEXT",
    description: "Your business documents, offering deck, objectives, and ICP traits are ingested.",
    metadata: "DOCX / PDF / TXT / MD Parsing",
    icon: Database,
  },
  {
    id: "intelligence",
    step: "02",
    title: "INTELLIGENCE",
    description: "AI extracts qualification criteria, scours web signals, and compiles verifiable evidence.",
    metadata: "Signal Scoring · 100-Point Model",
    icon: Cpu,
  },
  {
    id: "action",
    step: "03",
    title: "ACTION",
    description: "Curated leads with strong hypotheses are prepped with tailored call briefs for CALL-E.",
    metadata: "Autonomous Voice Preparation",
    icon: PhoneCall,
  },
  {
    id: "verification",
    step: "04",
    title: "VERIFICATION",
    description: "Live telephone conversation reaches decision maker and tests the hypothesis directly.",
    metadata: "Real-Time Speech Verification",
    icon: ShieldCheck,
  },
  {
    id: "outcome",
    step: "05",
    title: "OUTCOME",
    description: "Conversation converts into verified business intelligence and pipeline opportunities.",
    metadata: "Structured JSON Opportunity",
    icon: Sparkles,
  },
];

export function AboutArchitectureSection({ onScrollToLogin }: AboutArchitectureSectionProps = {}) {
  const [activeStage, setActiveStage] = useState<number>(0);

  // Auto-progress stages slowly if user doesn't click
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStage((prev) => (prev + 1) % PIPELINE_STAGES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const handleScrollToLogin = () => {
    if (onScrollToLogin) {
      onScrollToLogin();
    } else {
      document.getElementById("auth-section")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="about" className="relative w-full bg-[#FAF6EE] text-black py-20 lg:py-32 px-6 sm:px-10 lg:px-16 overflow-hidden">
      {/* Ambient Luxury Background Accents */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#FF751F]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-[#EFCD5E]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Editorial Section Label */}
        <div className="flex items-center justify-between mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-black/5 border border-black/10 text-xs font-sf font-sf-bold text-neutral-800 tracking-widest uppercase">
            <Layers className="w-3.5 h-3.5 text-[#FF751F]" />
            <span>Core Intelligence Architecture</span>
          </div>
          <span className="hidden sm:inline-block font-sf font-sf-thin text-neutral-500 text-xs tracking-widest uppercase">
            Source of Truth · Dial-O Engine
          </span>
        </div>

        {/* ══════════════════════════════════════════════════════════
            2-COLUMN FLOATING ISLAND CANVAS (Rounded Edges & Whitespace)
            ══════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">

          {/* ──────────────────────────────────────────────────────────
              LEFT COLUMN: ABOUT SECTION (Warm Sand #F7EAD8)
              ────────────────────────────────────────────────────────── */}
          <div
            className="rounded-[2.5rem] bg-[#F7EAD8] text-black p-8 sm:p-12 lg:p-16 flex flex-col justify-between editorial-island-shadow border border-black/10 relative overflow-hidden transition-all duration-300 hover:shadow-2xl"
          >
            <div>
              {/* Header — ABOUT in Vibrant Burnt Orange */}
              <h2
                className="font-sf font-sf-bold uppercase text-[#FF751F] tracking-tight leading-none mb-8 select-none"
                style={{ fontSize: "clamp(56px, 7vw, 110px)" }}
              >
                ABOUT
              </h2>

              {/* Core Mission */}
              <div
                className="font-sf font-sf-bold uppercase tracking-[0.02em] leading-snug text-black mb-10"
                style={{ fontSize: "clamp(26px, 2.8vw, 44px)" }}
              >
                DIAL O SPECIALIZES IN LEAD INTELLIGENCE AND AUTOMATED OUTREACH.
              </div>

              {/* Credibility Items in Rounded-2xl Cards */}
              <div className="space-y-4 mb-8">
                {[
                  "IDENTIFIES CREDIBLE PROSPECTS",
                  "UNDERSTANDS WHY THEY MATTER",
                  "LETS CONVERSATIONS VERIFY THE REST",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-4 font-sf font-sf-bold uppercase text-neutral-900 bg-white/85 rounded-2xl border border-black/5 shadow-sm p-4 sm:p-5 transition-all duration-200 hover:bg-white hover:scale-[1.01]"
                    style={{ fontSize: "clamp(16px, 1.4vw, 22px)", letterSpacing: "0.03em" }}
                  >
                    <CheckCircle2 className="w-6 h-6 text-[#FF751F] flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              {/* Editorial Paragraph with Breathable Typography */}
              <p className="font-sf font-sf-light text-neutral-700 leading-relaxed text-base sm:text-lg lg:text-xl">
                Evidence before outreach. Reasoning before action. Verification after contact. Dial O decides which calls deserve to happen in the first place.
              </p>
            </div>

            {/* Bottom Black Box: WHO ARE WE in Rounded-2xl */}
            <div className="mt-10 sm:mt-14">
              <div className="rounded-2xl bg-black text-white p-6 sm:p-7 flex items-center justify-between border border-white/10 shadow-lg">
                <span className="font-sf font-sf-bold uppercase tracking-[0.14em] text-lg sm:text-2xl text-white">
                  WHO ARE WE
                </span>
                <span className="font-sf font-sf-light tracking-widest text-[#00FFFF] uppercase text-xs sm:text-sm px-3 py-1 rounded-full bg-white/10 border border-white/10">
                  INTELLIGENCE LABS
                </span>
              </div>
            </div>
          </div>

          {/* ──────────────────────────────────────────────────────────
              RIGHT COLUMN: ARCHITECTURE SECTION (Burnt Orange #FF751F)
              ────────────────────────────────────────────────────────── */}
          <div
            id="architecture"
            className="rounded-[2.5rem] bg-[#FF751F] text-black p-8 sm:p-12 lg:p-16 flex flex-col justify-between editorial-island-shadow border border-black/10 relative overflow-hidden transition-all duration-300 hover:shadow-2xl"
          >
            <div>
              {/* Header — ARCHITECTURE in Pitch Black */}
              <h2
                className="font-sf font-sf-bold uppercase text-black tracking-tight leading-none mb-8 select-none truncate"
                style={{ fontSize: "clamp(42px, 5.2vw, 86px)" }}
              >
                ARCHITECTURE
              </h2>

              {/* Top Black Box: HOW ARE WE in Rounded-2xl */}
              <div className="rounded-2xl bg-black text-white p-5 sm:p-6 mb-6 shadow-md border border-black">
                <div className="font-sf font-sf-bold uppercase tracking-[0.14em] text-[#EFCD5E] text-lg sm:text-2xl">
                  HOW ARE WE
                </div>
              </div>

              {/* Editorial Matrix in Rounded Cards */}
              <div className="grid grid-cols-12 gap-3 mb-6 select-none">
                {/* Left 5 cols */}
                <div className="col-span-5 flex flex-col gap-3">
                  <div className="rounded-xl bg-black text-[#00FFFF] font-sf font-sf-bold uppercase tracking-[0.12em] text-center p-3 sm:p-4 text-xs sm:text-base border border-black shadow-sm transition-transform hover:scale-[1.02]">
                    EVIDENCE
                  </div>
                  <div className="rounded-xl bg-black text-white font-sf font-sf-bold uppercase tracking-[0.12em] text-center p-3 sm:p-4 text-xs sm:text-base border border-black shadow-sm transition-transform hover:scale-[1.02]">
                    REASONING
                  </div>
                </div>

                {/* Middle 5 cols */}
                <div className="col-span-5 flex flex-col gap-3">
                  <div className="rounded-xl bg-black text-[#EFCD5E] font-sf font-sf-bold uppercase tracking-[0.12em] text-center p-3 sm:p-4 text-xs sm:text-base border border-black shadow-sm transition-transform hover:scale-[1.02]">
                    ACTION
                  </div>
                  <div className="rounded-xl bg-black text-white font-sf font-sf-bold uppercase tracking-[0.12em] text-center p-3 sm:p-4 text-xs sm:text-base border border-black shadow-sm transition-transform hover:scale-[1.02]">
                    VERIFICATION
                  </div>
                </div>

                {/* Right 2 cols: Vertical RESULTS Banner */}
                <div className="col-span-2 rounded-xl bg-black text-[#FF751F] font-sf font-sf-bold uppercase tracking-[0.15em] flex items-center justify-center border border-black shadow-sm p-2 transition-transform hover:scale-[1.02]">
                  <span className="rotate-90 whitespace-nowrap text-xs sm:text-sm font-sf-bold">
                    RESULTS
                  </span>
                </div>
              </div>

              {/* Flow Container in Rounded-2xl Warm Sand */}
              <div className="rounded-2xl bg-[#F7EAD8] text-black border border-black/10 p-6 sm:p-7 mb-6 font-sf font-sf-bold uppercase tracking-wider text-xs sm:text-sm lg:text-base space-y-3 shadow-inner">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF751F] flex-shrink-0" />
                  <span>YOUR BUSINESS CONTEXT BECOMES CRITERIA</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-black flex-shrink-0" />
                  <span>CRITERIA BECOME PROSPECTS</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF751F] flex-shrink-0" />
                  <span>PROSPECTS BECOME CONVERSATIONS</span>
                </div>
                <div className="flex items-center gap-3 text-neutral-900">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#00FFFF] border border-black flex-shrink-0" />
                  <span>CONVERSATIONS CONVERT INTO VERIFIED OPPORTUNITIES</span>
                </div>
              </div>
            </div>

            {/* Interactive 5-Stage System Pipeline in Rounded-2xl */}
            <div className="rounded-2xl bg-black/95 text-white p-5 sm:p-6 border border-white/15 shadow-xl mt-4">
              <div className="flex items-center justify-between text-[#EFCD5E] uppercase font-sf font-sf-bold text-xs tracking-widest mb-4">
                <span>THE DIAL O PIPELINE · WORKFLOW</span>
                <span className="text-white/40 text-[10px] font-sf-thin">INTERACTIVE</span>
              </div>

              {/* Pipeline Stage Buttons */}
              <div className="grid grid-cols-5 gap-2 mb-4">
                {PIPELINE_STAGES.map((stage, idx) => {
                  const isActive = activeStage === idx;
                  return (
                    <button
                      key={stage.id}
                      onClick={() => setActiveStage(idx)}
                      className={`p-2 sm:p-2.5 rounded-xl transition-all cursor-pointer text-left border ${
                        isActive
                          ? "bg-[#00FFFF] text-black border-[#00FFFF] font-sf font-sf-bold shadow-md scale-[1.02]"
                          : "bg-white/5 text-white/70 border-white/10 hover:border-white/30 font-sf font-sf-light hover:text-white"
                      }`}
                    >
                      <div className="text-[10px] font-sf-thin opacity-75">{stage.step}</div>
                      <div className="font-sf font-sf-bold tracking-wider uppercase text-[11px] sm:text-xs truncate">
                        {stage.title}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Active Stage Details */}
              <div className="rounded-xl bg-neutral-900/90 border border-neutral-800 p-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-[#00FFFF] font-sf font-sf-bold text-xs tracking-wider uppercase">
                    {PIPELINE_STAGES[activeStage].title}:
                  </span>
                  <span className="text-neutral-300 font-sf-light text-xs">
                    {PIPELINE_STAGES[activeStage].description}
                  </span>
                </div>
                <span className="font-sf-thin text-[#EFCD5E] uppercase text-[10px] whitespace-nowrap bg-white/5 px-2 py-0.5 rounded border border-white/10 self-start sm:self-auto">
                  {PIPELINE_STAGES[activeStage].metadata}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            CLOSING STATEMENT FLOATING CARD
            "THE BEST CALLS START BEFORE THE PHONE RINGS."
            ══════════════════════════════════════════════════════════════ */}
        <div className="mt-12 sm:mt-16 rounded-[2.5rem] bg-black text-white text-center p-10 sm:p-16 lg:p-20 editorial-island-dark border border-white/10 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-[#FF751F]/10 rounded-full blur-3xl pointer-events-none" />

          <h3
            className="font-sf font-sf-bold uppercase tracking-tight leading-tight text-white select-none mb-4 relative z-10"
            style={{ fontSize: "clamp(28px, 3.8vw, 56px)" }}
          >
            THE BEST CALLS START BEFORE THE PHONE RINGS.
          </h3>
          <p className="text-neutral-400 uppercase tracking-[0.16em] font-sf font-sf-thin hover:font-sf-light transition-all text-xs sm:text-sm mb-8 relative z-10">
            LEAD INTELLIGENCE BEFORE OUTREACH · SYSTEM ARCHITECTURE VERIFIED
          </p>

          <div className="flex justify-center relative z-10">
            <button
              id="btn-scroll-to-auth"
              onClick={handleScrollToLogin}
              className="group px-8 py-3.5 rounded-full bg-[#FF751F] hover:bg-[#ff893b] text-black font-sf font-sf-bold text-xs sm:text-sm transition-all flex items-center gap-2.5 cursor-pointer shadow-lg active:scale-95"
            >
              <span>Access Intelligence Console</span>
              <ArrowRight className="w-4 h-4 text-black group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
