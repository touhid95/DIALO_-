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
    <section className="relative w-full min-h-screen bg-[#FAF6EE] text-black flex flex-col justify-between overflow-hidden font-app selection:bg-[#FF751F] selection:text-white">
      
      {/* ══════════════════════════════════════════════════════════
          WARM LUXURY AMBIENT GLOW (DIAL-O SAND & ORANGE)
          ══════════════════════════════════════════════════════════ */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[550px] bg-gradient-to-b from-[#FF751F]/15 via-[#EFCD5E]/10 to-transparent blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-[#F7EAD8]/80 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute top-1/2 right-1/4 w-[480px] h-[480px] bg-[#FF751F]/5 blur-[130px] pointer-events-none rounded-full" />

      {/* ══════════════════════════════════════════════════════════
          TOP NAVIGATION (Floating Header with Rounded-Full Pills)
          ══════════════════════════════════════════════════════════ */}
      <header className="relative z-30 w-full max-w-7xl mx-auto px-6 sm:px-10 py-6 flex items-center justify-between">
        {/* Left: Brand Logo & Tag */}
        <div className="flex items-center gap-3">
          <DialOLogo size="md" variant="hero" />
          <span className="hidden sm:inline-block px-3 py-1 rounded-full text-xs font-sf font-sf-thin text-neutral-600 bg-black/5 border border-black/10 uppercase tracking-widest transition-all">
            Autonomous Voice AI
          </span>
        </div>

        {/* Center: Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-sf font-sf-light text-neutral-700">
          <a
            href="#about"
            className="hover:text-black hover:font-sf-bold transition-all uppercase tracking-wider"
          >
            Architecture
          </a>
          <a
            href="#architecture"
            className="hover:text-black hover:font-sf-bold transition-all uppercase tracking-wider"
          >
            System Pipeline
          </a>
          <a
            href="#auth-section"
            className="hover:text-[#FF751F] hover:font-sf-bold transition-all uppercase tracking-wider flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#FF751F]" />
            <span>CALL-E Voice</span>
          </a>
        </nav>

        {/* Right: Actions (Log in / Get started pills) */}
        <div className="flex items-center gap-3">
          <button
            id="btn-header-login"
            onClick={() => onOpenAuth("login")}
            className="px-5 py-2.5 rounded-full text-xs font-sf font-sf-light hover:font-sf-bold text-neutral-800 hover:text-black border border-black/15 hover:border-black/30 hover:bg-black/5 transition-all cursor-pointer shadow-sm"
          >
            Log in
          </button>
          <button
            id="btn-header-signup"
            onClick={() => onOpenAuth("signup")}
            className="px-5 py-2.5 rounded-full text-xs font-sf font-sf-bold text-white bg-black hover:bg-neutral-800 transition-all flex items-center gap-2 shadow-md active:scale-95 cursor-pointer"
          >
            <span>Get started</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════
          HERO CORE: HEADLINE & FLOATING PROMPT CAPSULE
          ══════════════════════════════════════════════════════════ */}
      <div className="relative z-20 w-full max-w-4xl mx-auto px-6 pt-14 pb-20 text-center flex flex-col items-center">
        
        {/* Eyebrow Pill */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-black/5 border border-black/10 text-xs font-sf font-sf-bold text-neutral-800 mb-8 backdrop-blur-md">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF751F] breathing-glow-orange" />
          <span>Autonomous Lead Intelligence & Live CALL-E Telephony</span>
        </div>

        {/* Main Headline (Clean, monumental, editorial impact) */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-sf font-sf-bold tracking-tight text-black leading-[1.08] mb-6 max-w-3xl select-none">
          Build verified pipeline{" "}
          <span className="bg-gradient-to-r from-[#FF751F] via-[#E85D04] to-black bg-clip-text text-transparent">
            before the phone rings
          </span>
          .
        </h1>

        {/* Subtitle with Generous Whitespace */}
        <p className="text-base sm:text-xl text-neutral-600 font-sf font-sf-light max-w-2xl leading-relaxed mb-12">
          DIAL-O autonomously discovers decision-makers, extracts ICP qualification criteria from your business documents, and conducts real-time telephone verification with CALL-E.
        </p>

        {/* ══════════════════════════════════════════════════════════
            FLOATING PROMPT & CHAT INPUT BOX (Rounded-[2rem] Obsidian)
            ══════════════════════════════════════════════════════════ */}
        <div className="w-full max-w-2xl relative">
          <form
            onSubmit={handleSubmit}
            className="w-full bg-[#0A0D14] text-white rounded-[2rem] p-4 sm:p-5 shadow-2xl border-2 border-black/20 focus-within:border-[#FF751F] transition-all duration-300 editorial-island-dark text-left"
          >
            {/* Upper text input area */}
            <div className="flex items-start gap-2.5">
              <textarea
                id="hero-prompt-input"
                rows={2}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={ROTATING_PLACEHOLDERS[placeholderIndex]}
                className="w-full bg-transparent text-white placeholder:text-neutral-500 font-sf font-sf-light text-sm sm:text-base focus:outline-none resize-none leading-relaxed p-1"
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
              <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-xl w-fit text-xs text-neutral-200 mt-2 font-sf font-sf-light">
                <FileText className="w-3.5 h-3.5 text-[#00FFFF]" />
                <span className="truncate max-w-[200px]">{selectedFile.name}</span>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="text-neutral-400 hover:text-white cursor-pointer ml-1 font-bold"
                >
                  ×
                </button>
              </div>
            )}

            {/* Bottom Controls Bar */}
            <div className="flex items-center justify-between pt-3 border-t border-white/10 mt-3">
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
                  className="px-3.5 py-1.5 rounded-full bg-white/[0.08] hover:bg-white/[0.15] border border-white/10 text-neutral-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 text-xs font-sf font-sf-light"
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
                  className="px-3.5 py-1.5 rounded-full bg-white/[0.08] hover:bg-white/[0.15] border border-white/10 text-xs font-sf font-sf-light text-neutral-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
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
                  className="p-2 rounded-full text-neutral-400 hover:text-[#FF751F] hover:bg-white/10 transition-all cursor-pointer"
                  title="Voice Copilot Input"
                >
                  <Mic className="w-4 h-4" />
                </button>

                <button
                  type="submit"
                  id="btn-hero-submit"
                  disabled={isSubmitting}
                  className="w-10 h-10 rounded-full bg-[#FF751F] hover:bg-[#ff893b] text-black font-sf font-sf-bold flex items-center justify-center shadow-lg active:scale-90 transition-transform cursor-pointer disabled:opacity-50"
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

          {/* Quick Prompt Suggestion Chips (Rounded-Full Luxury Sand/White Pills) */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-6">
            {PROMPT_SUGGESTIONS.map((sug, idx) => {
              const Icon = sug.icon;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleChipClick(sug.text)}
                  className="group px-4 py-2 rounded-full bg-white/85 hover:bg-white border border-black/10 hover:border-black/25 text-xs text-neutral-700 hover:text-black font-sf font-sf-light hover:font-sf-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm hover:scale-[1.02]"
                >
                  <Icon className="w-3.5 h-3.5 text-[#FF751F] group-hover:scale-110 transition-transform flex-shrink-0" />
                  <span className="truncate max-w-[280px] sm:max-w-none">{sug.text}</span>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* ══════════════════════════════════════════════════════════
          BOTTOM TRUST & METRICS STRIP (Rounded Island Proof Bar)
          ══════════════════════════════════════════════════════════ */}
      <div className="relative z-20 w-full px-6 pb-6">
        <div className="max-w-5xl mx-auto rounded-[2rem] bg-white/80 backdrop-blur-md border border-black/10 py-4 px-8 shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs text-neutral-700 font-sf font-sf-light">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-black font-sf font-sf-bold">66 Discovered Leads</span>
            <span className="text-neutral-500">· Ready in Austin Metro</span>
          </div>

          <div className="flex items-center gap-6 sm:gap-8">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#FF751F]" />
              <span>TCPA Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#FF751F]" />
              <span>5-Axis Radar Scoring</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#FF751F]" />
              <span>Zero-Latency Audio</span>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}
