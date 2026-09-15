"use client";

import React, { useState } from "react";
import {
  Mail,
  ArrowRight,
  Zap,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  X,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { DialOLogo } from "./dial-o-logo";

interface InstagramLandingAuthProps {
  onAuthenticated: (email: string) => void;
  isAuthenticated?: boolean;
}

// ─── Official Social Brand Icons ────────────────────────────────
function GoogleIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg className="w-4 h-4 shrink-0 fill-current text-white" viewBox="0 0 24 24">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg className="w-4 h-4 shrink-0 fill-current text-white" viewBox="0 0 24 24">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.38c.64-.78 1.08-1.87.96-2.96-.93.04-2.07.62-2.74 1.4-.59.68-1.11 1.79-.97 2.85 1.04.08 2.1-.51 2.75-1.29z" />
    </svg>
  );
}

// ─── Shared Lovable Auth Card Inner ──────────────────────────────
interface AuthCardProps {
  onAuthenticated: (email: string) => void;
  onClose?: () => void;
  isModal?: boolean;
}

export function LovableAuthCard({ onAuthenticated, onClose, isModal = false }: AuthCardProps) {
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState("");

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    if (!email.trim() || !email.includes("@")) {
      setAuthError("Please enter a valid work email.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onAuthenticated(email.trim());
      if (onClose) onClose();
    }, 450);
  };

  const handleSocialAuth = (providerName: string) => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onAuthenticated(`user@${providerName.toLowerCase()}.com`);
      if (onClose) onClose();
    }, 350);
  };

  const handleQuickDemo = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onAuthenticated("founder@dial-o.ai");
      if (onClose) onClose();
    }, 300);
  };

  return (
    <div className="relative w-full max-w-md bg-neutral-950/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-7 sm:p-9 shadow-2xl font-app text-left">
      
      {/* Optional Close Button for modal */}
      {isModal && onClose && (
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/15 text-neutral-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          aria-label="Close Auth Modal"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* Brand Header */}
      <div className="flex flex-col items-center text-center space-y-2 mb-7">
        <div className="inline-flex justify-center mb-1">
          <DialOLogo size="sm" variant="hero" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/[0.05] border border-white/10 text-[10px] font-sf-thin text-neutral-400 uppercase tracking-widest">
          <Sparkles className="w-3 h-3 text-[#FF751F]" />
          <span>Autonomous Voice Copilot</span>
        </div>
        <h2 className="text-2xl font-sf-bold text-white tracking-tight">
          {authMode === "login" ? "Log in to DIAL-O" : "Create your account"}
        </h2>
        <p className="text-xs text-neutral-400 font-sf-light max-w-xs">
          {authMode === "login"
            ? "Sign in to access discovered leads & launch CALL-E voice verification."
            : "Start uncovering high-conviction decision makers with AI telephony."}
        </p>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="grid grid-cols-2 p-1 bg-white/[0.04] rounded-xl border border-white/10 mb-6">
        <button
          type="button"
          onClick={() => {
            setAuthMode("login");
            setAuthError("");
          }}
          className={`py-2 text-xs uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
            authMode === "login"
              ? "bg-white text-black font-sf-bold shadow-md"
              : "text-neutral-400 font-sf-light hover:text-white hover:font-sf-bold"
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => {
            setAuthMode("signup");
            setAuthError("");
          }}
          className={`py-2 text-xs uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
            authMode === "signup"
              ? "bg-white text-black font-sf-bold shadow-md"
              : "text-neutral-400 font-sf-light hover:text-white hover:font-sf-bold"
          }`}
        >
          Sign Up
        </button>
      </div>

      {/* Error Message */}
      {authError && (
        <div className="p-3 mb-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-sf-light">
          {authError}
        </div>
      )}

      {/* ─── Social OAuth Pills (Lovable format) ─── */}
      <div className="space-y-2.5 mb-5">
        <button
          type="button"
          onClick={() => handleSocialAuth("Google")}
          disabled={isSubmitting}
          className="w-full py-2.5 px-4 rounded-xl bg-white/[0.05] hover:bg-white/10 border border-white/10 text-white font-sf-light hover:font-sf-bold text-xs transition-all flex items-center justify-center gap-3 cursor-pointer shadow-sm active:scale-98"
        >
          <GoogleIcon />
          <span>Continue with Google</span>
        </button>

        <button
          type="button"
          onClick={() => handleSocialAuth("GitHub")}
          disabled={isSubmitting}
          className="w-full py-2.5 px-4 rounded-xl bg-white/[0.05] hover:bg-white/10 border border-white/10 text-white font-sf-light hover:font-sf-bold text-xs transition-all flex items-center justify-center gap-3 cursor-pointer shadow-sm active:scale-98"
        >
          <GitHubIcon />
          <span>Continue with GitHub</span>
        </button>

        <button
          type="button"
          onClick={() => handleSocialAuth("Apple")}
          disabled={isSubmitting}
          className="w-full py-2.5 px-4 rounded-xl bg-white/[0.05] hover:bg-white/10 border border-white/10 text-white font-sf-light hover:font-sf-bold text-xs transition-all flex items-center justify-center gap-3 cursor-pointer shadow-sm active:scale-98"
        >
          <AppleIcon />
          <span>Continue with Apple</span>
        </button>
      </div>

      {/* High-Contrast Divider */}
      <div className="relative flex items-center justify-center my-4">
        <div className="border-t border-white/10 w-full" />
        <span className="bg-neutral-950 px-3 text-[10px] text-neutral-500 font-sf-thin uppercase tracking-widest">
          OR WORK EMAIL
        </span>
        <div className="border-t border-white/10 w-full" />
      </div>

      {/* Email Form */}
      <form onSubmit={handleEmailSubmit} className="space-y-3.5">
        <div className="space-y-1">
          <input
            id="auth-work-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.com"
            className="w-full bg-neutral-900 border border-white/15 focus:border-[#FF751F] focus:ring-1 focus:ring-[#FF751F] rounded-xl px-4 py-3 text-sm text-white placeholder:text-neutral-500 font-sf-light focus:font-sf-bold focus:outline-none transition-all"
          />
        </div>

        <button
          id="btn-auth-email-submit"
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-neutral-200 text-black font-sf-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-98 disabled:opacity-60"
        >
          {isSubmitting ? (
            <span className="inline-flex items-center gap-2">
              <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              Authenticating...
            </span>
          ) : (
            <span className="inline-flex items-center gap-2">
              <span>{authMode === "login" ? "Continue with Email" : "Create Account & Launch"}</span>
              <ArrowRight className="w-4 h-4" />
            </span>
          )}
        </button>
      </form>

      {/* ─── 1-Click Instant Demo Launch ─── */}
      <div className="pt-4 border-t border-white/10 mt-5">
        <button
          id="btn-quick-demo-login"
          type="button"
          onClick={handleQuickDemo}
          disabled={isSubmitting}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#FF751F]/15 via-[#EFCD5E]/15 to-[#00FFFF]/15 hover:from-[#FF751F]/25 hover:via-[#EFCD5E]/25 hover:to-[#00FFFF]/25 border border-white/15 text-[#EFCD5E] hover:text-white font-sf-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-98"
        >
          <Zap className="w-3.5 h-3.5 text-[#00FFFF]" />
          <span>⚡ Instant Demo Access (founder@dial-o.ai)</span>
        </button>
        <div className="text-[10px] text-neutral-500 font-sf-thin text-center mt-2">
          One-click access unlocks the full 66-lead autonomous console instantly
        </div>
      </div>

    </div>
  );
}

// ─── Modal Wrapper Component (Popup) ────────────────────────────
interface LovableAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated: (email: string) => void;
}

export function LovableAuthModal({
  isOpen,
  onClose,
  onAuthenticated,
}: LovableAuthModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative z-10 w-full max-w-md">
        <LovableAuthCard
          onAuthenticated={onAuthenticated}
          onClose={onClose}
          isModal={true}
        />
      </div>
      <div
        className="absolute inset-0 z-0"
        onClick={onClose}
        aria-hidden="true"
      />
    </div>
  );
}

// ─── Page 2 Section Component (Standalone on scroll) ────────────
export function InstagramLandingAuth({
  onAuthenticated,
  isAuthenticated = false,
}: InstagramLandingAuthProps) {
  return (
    <section
      id="auth-section"
      className="relative w-full min-h-screen bg-[#07090E] text-white flex items-center justify-center py-20 px-6 font-app overflow-hidden selection:bg-[#00FFFF] selection:text-black"
    >
      {/* Ambient Mesh Aura */}
      <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] bg-gradient-to-tr from-[#FF751F]/10 via-[#00FFFF]/10 to-transparent blur-[140px] pointer-events-none rounded-full" />

      <div className="relative z-10 w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left 6 Cols: Brand statement & trust items */}
        <div className="lg:col-span-6 space-y-6 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-xs font-sf-thin text-neutral-400 uppercase tracking-widest">
            <ShieldCheck className="w-3.5 h-3.5 text-[#00FFFF]" />
            <span>Autonomous Workspace Gateway</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-sf-bold text-white tracking-tight leading-[1.15]">
            Access the autonomous voice intelligence platform.
          </h2>

          <p className="text-base text-neutral-400 font-sf-light leading-relaxed max-w-lg">
            Connect your criteria, explore real-time 5-axis radar qualification, and deploy CALL-E conversational telephony with complete TCPA compliance.
          </p>

          <div className="space-y-3 pt-2">
            {[
              "66 Verified B2B Prospects Ready for Live Outreach",
              "Sub-500ms Conversational Voice Response Latency",
              "Autonomous Hypothesis Testing Before Phone Rings",
              "Structured JSON Opportunity & Transcript Extraction",
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3 text-xs sm:text-sm text-neutral-300 font-sf-light">
                <CheckCircle2 className="w-4 h-4 text-[#FF751F] shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right 6 Cols: The Lovable Auth Card */}
        <div className="lg:col-span-6 flex justify-center lg:justify-end">
          <LovableAuthCard onAuthenticated={onAuthenticated} />
        </div>

      </div>
    </section>
  );
}
