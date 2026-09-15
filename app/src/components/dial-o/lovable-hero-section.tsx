"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Paperclip,
  ArrowUp,
  Mic,
  Search,
  FileText,
  PhoneCall,
  Activity,
  CheckCircle2,
  LogIn,
  ArrowRight,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { DialOLogo } from "./dial-o-logo";

interface LovableHeroSectionProps {
  onOpenAuth: (mode?: "login" | "signup") => void;
  onPromptSubmit: (prompt: string, file?: File | null) => void;
  isAuthenticated?: boolean;
}

const PROMPT_SUGGESTIONS = [
  {
    icon: Search,
    text: "Find commercial dental clinics in Austin with 10+ staff",
    tag: "Lead Discovery",
  },
  {
    icon: FileText,
    text: "Ingest offer deck & synthesize B2B ICP qualification rules",
    tag: "Document Extraction",
  },
  {
    icon: PhoneCall,
    text: "Prepare CALL-E voice copilot dispatch briefs for Austin leads",
    tag: "Voice Telephony",
  },
  {
    icon: Activity,
    text: "Run 5-axis radar qualification matrix on tech companies",
    tag: "Radar Scoring",
  },
];

const ROTATING_PLACEHOLDERS = [
  "Ask DIAL-O to find B2B dental clinics in Austin with 10+ employees...",
  "Upload your pitch deck or company document to extract ICP rules...",
  "Describe your ideal customer and launch CALL-E voice verification...",
  "Prompt DIAL-O: 'Scrape commercial law firms in Texas and score fit'...",
];

export function LovableHeroSection({
  onOpenAuth,
  onPromptSubmit,
  isAuthenticated = false,
}: LovableHeroSectionProps) {
  const [prompt, setPrompt] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedMode, setSelectedMode] = useState<"discovery" | "telephony">("discovery");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Rotate placeholders every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % ROTATING_PLACEHOLDERS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPrompt = prompt.trim() || ROTATING_PLACEHOLDERS[placeholderIndex];
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onPromptSubmit(cleanPrompt, selectedFile);
    }, 350);
  };

  const handleChipClick = (suggestionText: string) => {
    setPrompt(suggestionText);
  };

  return (
    <section className="relative w-full min-h-screen bg-[#07090E] text-white flex flex-col justify-between overflow-hidden font-app selection:bg-[#00FFFF] selection:text-black">
      
      {/* ══════════════════════════════════════════════════════════
          LOVABLE-STYLE AMBIENT MESH GRADIENT AURA (DIAL-O PALETTE)
          ══════════════════════════════════════════════════════════ */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-[#FF751F]/15 via-[#00FFFF]/10 to-transparent blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute top-1/3 left-1/4 w-[420px] h-[420px] bg-gradient-to-br from-[#EFCD5E]/10 via-transparent to-transparent blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute top-1/2 right-1/4 w-[460px] h-[460px] bg-gradient-to-bl from-[#00FFFF]/10 via-transparent to-transparent blur-[130px] pointer-events-none rounded-full" />

      {/* ══════════════════════════════════════════════════════════
          TOP NAVIGATION (Lovable Minimalist Header)
          ══════════════════════════════════════════════════════════ */}
      <header className="relative z-30 w-full max-w-7xl mx-auto px-6 sm:px-10 py-5 flex items-center justify-between">
        {/* Left: Brand Logo & Tag */}
        <div className="flex items-center gap-3">
          <DialOLogo size="md" variant="hero" />
          <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[11px] font-sf-thin text-neutral-400 border border-white/10 hover:border-white/20 uppercase tracking-widest transition-all">
            Autonomous Voice AI
          </span>
        </div>

        {/* Center: Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-sf-light text-neutral-300">
          <a
            href="#about"
            className="hover:text-white hover:font-sf-bold transition-all uppercase tracking-wider"
          >
            Architecture
          </a>
          <a
            href="#architecture"
            className="hover:text-white hover:font-sf-bold transition-all uppercase tracking-wider"
          >
            System Pipeline
          </a>
          <a
            href="#auth-section"
            className="hover:text-[#00FFFF] hover:font-sf-bold transition-all uppercase tracking-wider flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#00FFFF]" />
            <span>CALL-E Voice</span>
          </a>
        </nav>

        {/* Right: Actions (Log in / Get started pills) */}
        <div className="flex items-center gap-3">
          <button
            id="btn-header-login"
            onClick={() => onOpenAuth("login")}
            className="px-4 py-2 rounded-full text-xs font-sf-light hover:font-sf-bold text-neutral-300 hover:text-white border border-white/15 hover:border-white/30 transition-all cursor-pointer"
          >
            Log in
          </button>
          <button
            id="btn-header-signup"
            onClick={() => onOpenAuth("signup")}
            className="px-4 py-2 rounded-full text-xs font-sf-bold text-black bg-white hover:bg-neutral-200 transition-all flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
          >
            <span>Get started</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════
          HERO CORE: HEADLINE & LOVABLE PROMPT/CHAT CAPSULE
          ══════════════════════════════════════════════════════════ */}
      <div className="relative z-20 w-full max-w-4xl mx-auto px-6 pt-12 pb-16 text-center flex flex-col items-center">
        
        {/* Eyebrow Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-white/10 text-xs font-sf-light text-neutral-300 mb-6 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-[#FF751F] animate-pulse" />
          <span>Autonomous Lead Intelligence & Live CALL-E Telephony</span>
        </div>

        {/* Main Headline (Lovable style: clean, confident, impactful) */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-sf-bold tracking-tight text-white leading-[1.12] mb-5 max-w-3xl">
          Build verified pipeline{" "}
          <span className="bg-gradient-to-r from-[#EFCD5E] via-[#FF751F] to-[#00FFFF] bg-clip-text text-transparent">
            before the phone rings
          </span>
          .
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-neutral-400 font-sf-light max-w-2xl leading-relaxed mb-10">
          DIAL-O autonomously discovers decision-makers, extracts ICP qualification criteria from your business documents, and conducts real-time telephone verification with CALL-E.
        </p>

        {/* ══════════════════════════════════════════════════════════
            LOVABLE CENTRAL PROMPT & CHAT INPUT BOX
            ══════════════════════════════════════════════════════════ */}
        <div className="w-full max-w-2xl relative">
          <form
            onSubmit={handleSubmit}
            className="w-full bg-neutral-900/80 backdrop-blur-2xl border-2 border-white/15 hover:border-white/25 focus-within:border-[#FF751F]/80 rounded-3xl p-3 sm:p-4 shadow-2xl transition-all duration-300 text-left"
          >
            {/* Upper text input area */}
            <div className="flex items-start gap-2.5">
              <textarea
                id="hero-prompt-input"
                rows={2}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={ROTATING_PLACEHOLDERS[placeholderIndex]}
                className="w-full bg-transparent text-white placeholder:text-neutral-500 font-sf-light text-sm sm:text-base focus:outline-none resize-none leading-relaxed"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
            </div>

            {/* Attached file chip */}
            {selectedFile && (
              <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-lg w-fit text-xs text-neutral-200 mt-2 font-sf-light">
                <FileText className="w-3.5 h-3.5 text-[#00FFFF]" />
                <span className="truncate max-w-[200px]">{selectedFile.name}</span>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="text-neutral-400 hover:text-white cursor-pointer ml-1"
                >
                  ×
                </button>
              </div>
            )}

            {/* Bottom Controls Bar (Lovable format: Attachment + Mode Picker + Submit Arrow) */}
            <div className="flex items-center justify-between pt-3 border-t border-white/10 mt-2">
              {/* Left actions: File upload + Mode Toggle */}
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".docx,.pdf,.txt,.md"
                  className="hidden"
                />
                <button
                  type="button"
                  id="btn-hero-attach"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/10 border border-white/10 text-neutral-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 text-xs font-sf-light"
                  title="Attach Business Document or Deck"
                >
                  <Paperclip className="w-3.5 h-3.5 text-[#EFCD5E]" />
                  <span className="hidden sm:inline-block">Attach Deck</span>
                </button>

                {/* Mode Selector Pill */}
                <button
                  type="button"
                  onClick={() =>
                    setSelectedMode((prev) =>
                      prev === "discovery" ? "telephony" : "discovery"
                    )
                  }
                  className="px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/10 border border-white/10 text-xs font-sf-light text-neutral-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      selectedMode === "discovery" ? "bg-[#00FFFF]" : "bg-[#FF751F]"
                    }`}
                  />
                  <span>
                    {selectedMode === "discovery"
                      ? "Lead Discovery"
                      : "CALL-E Telephony"}
                  </span>
                  <span className="text-[10px] text-neutral-500">▾</span>
                </button>
              </div>

              {/* Right actions: Mic Audio indicator + Submit Button */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => alert("Voice input listening... Speak your lead criteria.")}
                  className="p-2 rounded-xl text-neutral-400 hover:text-[#00FFFF] hover:bg-white/5 transition-all cursor-pointer"
                  title="Voice Copilot Input"
                >
                  <Mic className="w-4 h-4" />
                </button>

                <button
                  type="submit"
                  id="btn-hero-submit"
                  disabled={isSubmitting}
                  className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#FF751F] via-[#EFCD5E] to-[#00FFFF] text-black font-sf-bold flex items-center justify-center shadow-lg active:scale-90 transition-transform cursor-pointer disabled:opacity-50"
                  aria-label="Submit Prompt to DIAL-O"
                >
                  {isSubmitting ? (
                    <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <ArrowUp className="w-5 h-5 text-black stroke-[2.5]" />
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Quick Prompt Suggestion Chips (Lovable-style interactive pills) */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
            {PROMPT_SUGGESTIONS.map((sug, idx) => {
              const Icon = sug.icon;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleChipClick(sug.text)}
                  className="group px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.09] border border-white/10 hover:border-white/20 text-xs text-neutral-400 hover:text-white font-sf-light hover:font-sf-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Icon className="w-3 h-3 text-[#FF751F] group-hover:scale-110 transition-transform" />
                  <span className="truncate max-w-[280px] sm:max-w-none">{sug.text}</span>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* ══════════════════════════════════════════════════════════
          BOTTOM TRUST & METRICS STRIP (Lovable Proof Bar)
          ══════════════════════════════════════════════════════════ */}
      <div className="relative z-20 w-full border-t border-white/10 bg-black/40 backdrop-blur-md py-4 px-6">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs text-neutral-400 font-sf-light">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-white font-sf-bold">66 Discovered Leads</span>
            <span className="text-neutral-500">· Ready in Austin Metro</span>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#00FFFF]" />
              <span>TCPA Compliant</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-[#EFCD5E]" />
              <span>5-Axis Radar Scoring</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-[#FF751F]" />
              <span>Zero-Latency Audio</span>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}
