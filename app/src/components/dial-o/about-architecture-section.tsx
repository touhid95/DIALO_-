"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, ArrowRight, ShieldCheck, Cpu, PhoneCall, Sparkles, Database, Lock, LogIn } from "lucide-react";
import { DialOLogo } from "./dial-o-logo";

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
    <section id="about" className="relative w-full bg-black text-white font-sf">
      {/* ══════════════════════════════════════════════════════════
          PAGE 1 TOP NAVIGATION BAR (SF Pro 100/300/700)
          ══════════════════════════════════════════════════════════ */}
      <header className="w-full bg-[#111111]/95 border-b border-white/10 px-6 sm:px-12 py-4 flex items-center justify-between z-30 sticky top-0 backdrop-blur-md font-sf">
        <div className="flex items-center gap-4">
          <a href="#about" className="hover:opacity-90 transition-opacity">
            <DialOLogo size="md" variant="hero" />
          </a>
          <span className="hidden md:inline-block px-2.5 py-0.5 rounded-full text-[11px] font-sf-thin hover:font-sf-light text-neutral-400 border border-neutral-800 uppercase tracking-wider transition-all">
            Architecture & Intelligence
          </span>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="#about"
            className="hidden sm:inline-block text-xs font-sf-light hover:font-sf-bold text-neutral-300 hover:text-white transition-all uppercase tracking-wider"
          >
            System Pipeline
          </a>
          <button
            id="btn-nav-login"
            onClick={handleScrollToLogin}
            className="px-4 py-2 rounded-full bg-[#FF751F] hover:bg-[#ff893b] text-black font-sf-bold text-xs transition-all flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5 text-black" />
            <span>Sign In to Console</span>
          </button>
        </div>
      </header>

      {/* 2-Column Split matching PDF Page 4 */}
      <div className="grid grid-cols-1 lg:grid-cols-2">

        {/* ══════════════════════════════════════════════════════════
            LEFT COLUMN: ABOUT SECTION (Tan / Sand #F7EAD8)
            ══════════════════════════════════════════════════════════ */}
        <div
          className="bg-[#F7EAD8] text-black flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-black font-sf"
          style={{ padding: "64px" }}
        >
          <div>
            {/* Header — ABOUT @ 144px */}
            <h2
              className="font-sf font-sf-bold uppercase text-[#FF751F]"
              style={{
                fontSize: "clamp(72px, 9vw, 144px)",
                letterSpacing: "0.08em",
                lineHeight: 0.9,
                marginBottom: "40px",
              }}
            >
              ABOUT
            </h2>

            {/* Core Mission — 60px */}
            <div
              className="font-sf font-sf-bold uppercase tracking-[0.04em] leading-tight text-black"
              style={{
                fontSize: "clamp(32px, 3.5vw, 60px)",
                marginBottom: "40px",
                maxWidth: "100%",
              }}
            >
              DIAL O SPECIALIZES IN LEAD INTELLIGENCE AND AUTOMATED OUTREACH.
            </div>

            {/* Credibility Items — 48px */}
            <div style={{ marginBottom: "32px" }}>
              {[
                "IDENTIFIES CREDIBLE PROSPECTS",
                "UNDERSTANDS WHY THEY MATTER",
                "LETS CONVERSATIONS VERIFY THE REST",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-4 font-sf font-sf-bold uppercase text-neutral-800 bg-white/70 border-l-4 border-[#FF751F] shadow-sm"
                  style={{
                    fontSize: "clamp(22px, 2vw, 48px)",
                    letterSpacing: "0.04em",
                    padding: "16px 20px",
                    marginBottom: "12px",
                  }}
                >
                  <CheckCircle2 style={{ width: "28px", height: "28px", color: "#FF751F", flexShrink: 0 }} />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <p
              className="font-sf font-sf-light tracking-wide text-neutral-700 leading-relaxed"
              style={{ fontSize: "clamp(18px, 1.4vw, 28px)", maxWidth: "100%" }}
            >
              Evidence before outreach. Reasoning before action. Verification after contact. Dial O decides which calls deserve to happen in the first place.
            </p>
          </div>

          {/* Bottom Black Box: WHO ARE WE */}
          <div style={{ marginTop: "48px" }}>
            <div
              className="bg-black text-white flex items-center justify-between border-2 border-black font-sf"
              style={{
                padding: "28px 36px",
                boxShadow: "0 10px 0 rgba(0,0,0,0.15)",
              }}
            >
              <span
                className="font-sf font-sf-bold uppercase tracking-[0.16em]"
                style={{ fontSize: "clamp(24px, 2vw, 48px)" }}
              >
                WHO ARE WE
              </span>
              <span
                className="font-sf font-sf-light tracking-widest text-[#00FFFF] uppercase"
                style={{ fontSize: "clamp(12px, 1vw, 20px)" }}
              >
                INTELLIGENCE LABS
              </span>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
            RIGHT COLUMN: ARCHITECTURE SECTION (Orange #FF751F)
            ══════════════════════════════════════════════════════════ */}
        <div
          id="architecture"
          className="bg-[#FF751F] text-black flex flex-col justify-between dial-grid-orange font-sf"
          style={{ padding: "64px 28px 64px 28px" }}
        >
          <div>
            {/* Header — ARCHITECTURE on ONE line */}
            <h2
              className="font-sf font-sf-bold uppercase text-black"
              style={{
                fontSize: "clamp(34px, 5.1vw, 130px)",
                letterSpacing: "0.02em",
                lineHeight: 0.9,
                marginBottom: "32px",
                whiteSpace: "nowrap",
              }}
            >
              ARCHITECTURE
            </h2>

            {/* Top Black Box: HOW ARE WE */}
            <div
              className="bg-black text-white border-2 border-black"
              style={{ padding: "24px 32px", marginBottom: "32px" }}
            >
              <div
                className="font-sf font-sf-bold uppercase tracking-[0.16em] text-[#EFCD5E]"
                style={{ fontSize: "clamp(24px, 2vw, 48px)" }}
              >
                HOW ARE WE
              </div>
            </div>

            {/* Editorial Matrix matching PDF */}
            <div className="grid grid-cols-12 gap-2 select-none" style={{ marginBottom: "24px" }}>
              {/* Left 5 cols */}
              <div className="col-span-5 flex flex-col gap-2">
                <div
                  className="bg-black text-[#00FFFF] font-sf font-sf-bold uppercase tracking-[0.12em] text-center border border-black shadow-sm"
                  style={{ fontSize: "clamp(14px, 1.2vw, 24px)", padding: "12px 8px" }}
                >
                  EVIDENCE
                </div>
                <div
                  className="bg-black text-white font-sf font-sf-bold uppercase tracking-[0.12em] text-center border border-black shadow-sm"
                  style={{ fontSize: "clamp(14px, 1.2vw, 24px)", padding: "12px 8px" }}
                >
                  REASONING
                </div>
              </div>

              {/* Middle 5 cols */}
              <div className="col-span-5 flex flex-col gap-2">
                <div
                  className="bg-black text-[#EFCD5E] font-sf font-sf-bold uppercase tracking-[0.12em] text-center border border-black shadow-sm"
                  style={{ fontSize: "clamp(14px, 1.2vw, 24px)", padding: "12px 8px" }}
                >
                  ACTION
                </div>
                <div
                  className="bg-black text-white font-sf font-sf-bold uppercase tracking-[0.12em] text-center border border-black shadow-sm"
                  style={{ fontSize: "clamp(14px, 1.2vw, 24px)", padding: "12px 8px" }}
                >
                  VERIFICATION
                </div>
              </div>

              {/* Right 2 cols: Vertical RESULTS Banner */}
              <div
                className="col-span-2 bg-black text-[#FF751F] font-sf font-sf-bold uppercase tracking-[0.15em] flex items-center justify-center border border-black shadow-sm"
                style={{ padding: "8px" }}
              >
                <span style={{ transform: "rotate(90deg)", whiteSpace: "nowrap", fontSize: "clamp(11px, 0.9vw, 18px)" }}>RESULTS</span>
              </div>
            </div>

            {/* Tan/Cream Flow Container matching PDF */}
            <div
              className="bg-[#F7EAD8] text-black border-2 border-black font-sf font-sf-bold uppercase"
              style={{
                padding: "24px 28px",
                marginBottom: "24px",
                fontSize: "clamp(14px, 1.2vw, 24px)",
                letterSpacing: "0.08em",
                lineHeight: 1.6,
              }}
            >
              <div className="flex items-center gap-3" style={{ marginBottom: "10px" }}>
                <span className="rounded-full bg-[#FF751F]" style={{ width: "10px", height: "10px", flexShrink: 0, display: "inline-block" }} />
                <span>YOUR BUSINESS CONTEXT BECOMES CRITERIA</span>
              </div>
              <div className="flex items-center gap-3" style={{ marginBottom: "10px" }}>
                <span className="rounded-full bg-black" style={{ width: "10px", height: "10px", flexShrink: 0, display: "inline-block" }} />
                <span>CRITERIA BECOME PROSPECTS</span>
              </div>
              <div className="flex items-center gap-3" style={{ marginBottom: "10px" }}>
                <span className="rounded-full bg-[#FF751F]" style={{ width: "10px", height: "10px", flexShrink: 0, display: "inline-block" }} />
                <span>PROSPECTS BECOME CONVERSATIONS</span>
              </div>
              <div className="flex items-center gap-3 font-sf-bold">
                <span className="rounded-full bg-[#00FFFF] border border-black" style={{ width: "10px", height: "10px", flexShrink: 0, display: "inline-block" }} />
                <span>CONVERSATIONS CONVERT INTO VERIFIED OPPORTUNITIES</span>
              </div>
            </div>
          </div>

          {/* Interactive 5-Stage System Pipeline */}
          <div
            className="bg-black/90 text-white border-2 border-black font-sf"
            style={{ marginTop: "16px", padding: "20px 24px" }}
          >
            <div
              className="text-[#EFCD5E] uppercase font-sf font-sf-bold"
              style={{ fontSize: "13px", letterSpacing: "0.16em", marginBottom: "14px" }}
            >
              THE DIAL O PIPELINE · INTERACTIVE WORKFLOW
            </div>

            <div className="grid grid-cols-5 gap-1 text-center">
              {PIPELINE_STAGES.map((stage, idx) => {
                const isActive = activeStage === idx;
                return (
                  <button
                    key={stage.id}
                    onClick={() => setActiveStage(idx)}
                    className={`p-2 transition-all cursor-pointer text-left border ${
                      isActive
                        ? "bg-[#00FFFF] text-black border-[#00FFFF] font-sf font-sf-bold"
                        : "bg-black/60 text-white/70 border-white/10 hover:border-white/40 font-sf font-sf-light"
                    }`}
                  >
                    <div style={{ fontSize: "10px" }} className="font-sf-thin opacity-80">{stage.step}</div>
                    <div
                      className="font-sf font-sf-bold tracking-wider uppercase truncate"
                      style={{ fontSize: "clamp(10px, 0.8vw, 14px)" }}
                    >
                      {stage.title}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Active Stage Details */}
            <div
              className="flex items-center justify-between bg-neutral-900 border border-neutral-800 font-sf"
              style={{ marginTop: "14px", padding: "12px 16px" }}
            >
              <div>
                <span
                  className="text-[#00FFFF] font-sf font-sf-bold tracking-wider uppercase"
                  style={{ fontSize: "14px", marginRight: "8px" }}
                >
                  {PIPELINE_STAGES[activeStage].title}:
                </span>
                <span className="text-neutral-300 font-sf-light" style={{ fontSize: "13px" }}>
                  {PIPELINE_STAGES[activeStage].description}
                </span>
              </div>
              <span
                className="font-sf-thin text-[#EFCD5E] uppercase hidden sm:inline-block"
                style={{ fontSize: "11px", marginLeft: "16px", whiteSpace: "nowrap" }}
              >
                {PIPELINE_STAGES[activeStage].metadata}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          PAGE 4 CLOSING STATEMENT
          "THE BEST CALLS START BEFORE THE PHONE RINGS."
          ══════════════════════════════════════════════════════════════ */}
      <div
        className="w-full bg-black text-white text-center border-t-2 border-b-2 border-black font-sf"
        style={{ padding: "64px 48px" }}
      >
        <h3
          className="font-sf font-sf-bold uppercase tracking-[0.06em] leading-tight text-white select-none"
          style={{ fontSize: "clamp(32px, 4vw, 72px)" }}
        >
          THE BEST CALLS START BEFORE THE PHONE RINGS.
        </h3>
        <p
          className="text-neutral-400 uppercase tracking-[0.2em] font-sf font-sf-thin hover:font-sf-light transition-all"
          style={{ fontSize: "clamp(13px, 1vw, 18px)", marginTop: "16px" }}
        >
          LEAD INTELLIGENCE BEFORE OUTREACH · SYSTEM ARCHITECTURE VERIFIED
        </p>

        {/* Dynamic Scroll Cue to Split Login */}
        <div className="mt-8 flex justify-center">
          <button
            id="btn-scroll-to-auth"
            onClick={handleScrollToLogin}
            className="group px-6 py-3 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-neutral-300 hover:text-white font-sf-light hover:font-sf-bold text-xs transition-all flex items-center gap-2.5 cursor-pointer shadow-lg active:scale-95"
          >
            <span>Proceed to Access & Login</span>
            <ArrowRight className="w-4 h-4 text-[#00FFFF] group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
}
