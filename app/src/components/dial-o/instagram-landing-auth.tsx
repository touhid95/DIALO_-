"use client";

import React, { useState } from "react";
import {
  PhoneCall,
  ShieldCheck,
  Sparkles,
  Lock,
  Mail,
  User,
  Building2,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  Activity,
  Zap,
} from "lucide-react";
import { DialOLogo } from "./dial-o-logo";

interface InstagramLandingAuthProps {
  onAuthenticated: (email: string) => void;
  isAuthenticated?: boolean;
}

export function InstagramLandingAuth({
  onAuthenticated,
  isAuthenticated = false,
}: InstagramLandingAuthProps) {
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [emailOrUser, setEmailOrUser] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState("");

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    if (!emailOrUser.trim() || !password.trim()) {
      setAuthError("Please enter your email/username and password.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onAuthenticated(emailOrUser.trim());
    }, 450);
  };

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    if (!emailOrUser.trim() || !password.trim()) {
      setAuthError("Please complete all required fields.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onAuthenticated(emailOrUser.trim());
    }, 450);
  };

  const handleQuickDemo = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onAuthenticated("founder@dial-o.ai");
    }, 350);
  };

  return (
    <section
      id="auth-section"
      className="relative w-full min-h-screen bg-black text-white flex items-center justify-center border-t border-neutral-800 selection:bg-[#00FFFF] selection:text-black overflow-hidden font-sf"
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "SF Pro", sans-serif',
      }}
    >
      {/* Ambient background glow accents */}
      <div className="absolute top-1/4 left-1/4 w-[480px] h-[480px] bg-gradient-to-br from-[#FF751F]/15 via-transparent to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[440px] h-[440px] bg-gradient-to-tr from-[#00FFFF]/10 via-transparent to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Main 50/50 Split Grid (Centered Instagram-Style Layout) */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 py-12 lg:py-16 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center min-h-[85vh]">
        
        {/* ══════════════════════════════════════════════════════════
            LEFT 50% (6 Cols): IPHONE SHOWCASE & BRAND STATEMENT
            ══════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-left space-y-7">
          
          {/* Brand Logo & Tag */}
          <div className="flex items-center gap-3">
            <DialOLogo size="md" variant="hero" />
            <span className="px-2.5 py-1 rounded-full text-[11px] font-[300] tracking-wider uppercase bg-white/10 text-white/80 border border-white/15 hover:font-[700] hover:text-white transition-all duration-200">
              Autonomous Intelligence
            </span>
          </div>

          {/* Bold Instagram-Style Headline with SF Pro Hierarchy */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-[700] tracking-tight leading-[1.12] text-white">
            See autonomous voice intelligence for{" "}
            <span className="bg-gradient-to-r from-[#EFCD5E] via-[#FF751F] to-[#00FFFF] bg-clip-text text-transparent">
              verified pipeline
            </span>
            .
          </h1>

          {/* Ambient Subtitle with strict 100 -> 300 hover */}
          <p className="text-base sm:text-lg text-neutral-400 font-[100] hover:font-[300] transition-all duration-200 max-w-lg leading-relaxed">
            CALL-E conducts real-time telephone verification with decision makers, testing hypotheses and converting raw leads into high-conviction pipeline.
          </p>

          {/* ══════════════════════════════════════════════════════════
              SMARTPHONE FRAME SHOWCASE (Instagram-style stack)
              ══════════════════════════════════════════════════════════ */}
          <div className="relative pt-4 pb-2 w-full flex justify-center lg:justify-start">
            
            {/* Ambient Shadow / Reflection behind Phone */}
            <div className="relative w-[300px] sm:w-[330px] rounded-[48px] p-3 bg-gradient-to-b from-neutral-700 via-neutral-900 to-neutral-950 shadow-2xl border border-neutral-700/60 ring-1 ring-white/10">
              
              {/* iPhone Inner Screen Frame */}
              <div className="relative w-full rounded-[40px] overflow-hidden bg-neutral-950 border border-neutral-800 p-4 space-y-3.5 shadow-inner">
                
                {/* Dynamic Island */}
                <div className="flex justify-between items-center px-2 pt-0.5 pb-1 text-[11px] text-neutral-400 font-[100]">
                  <span>09:41</span>
                  <div className="w-20 h-4 bg-black rounded-full border border-neutral-800/80 mx-auto" />
                  <span className="flex items-center gap-1 font-[300]">5G 100%</span>
                </div>

                {/* Simulated CALL-E Active Header */}
                <div className="flex items-center justify-between bg-white/[0.04] p-2.5 rounded-2xl border border-white/10">
                  <div className="flex items-center gap-2.5">
                    <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-tr from-[#FF751F] to-[#EFCD5E] text-black font-[700] text-xs shadow-md">
                      <PhoneCall className="w-4 h-4 text-black animate-pulse" />
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-[700] text-white">CALL-E Active</div>
                      <div className="text-[10px] text-emerald-400 font-[100] hover:font-[300] transition-all flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        Live Verification · 01:42
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-[700] text-black bg-[#00FFFF] px-2 py-0.5 rounded-full">
                    Tier A
                  </span>
                </div>

                {/* Lead Contact Target Card */}
                <div className="bg-gradient-to-b from-neutral-900/90 to-neutral-900/40 p-3 rounded-2xl border border-neutral-800 space-y-1.5 text-left">
                  <div className="flex justify-between items-start">
                    <div className="text-sm font-[700] text-white">Austin Smile Center</div>
                    <span className="text-[10px] font-[700] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      94 Score
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 font-[300] leading-snug">
                    Spoke with Dr. Sarah Mitchell (Owner). Confirmed reception overload from 8AM to 11AM.
                  </p>
                </div>

                {/* Live Speech Waveform Visualization */}
                <div className="p-2.5 rounded-2xl bg-black/60 border border-white/5 space-y-2">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-neutral-400 font-[100] hover:font-[300] transition-all">Voice Waveform Stream</span>
                    <span className="text-[#00FFFF] font-[300] font-mono">16kHz PCM</span>
                  </div>
                  <div className="flex items-center justify-center gap-1 h-7">
                    {[18, 35, 60, 25, 75, 95, 45, 80, 50, 65, 30, 85, 40, 20, 55, 70, 30, 45].map((h, idx) => (
                      <span
                        key={idx}
                        className="w-1 bg-gradient-to-t from-[#FF751F] to-[#00FFFF] rounded-full transition-all duration-300"
                        style={{
                          height: `${Math.max(15, (h * (idx % 2 === 0 ? 1 : 0.8)) % 100)}%`,
                          animation: `pulse 1.2s ease-in-out ${idx * 0.08}s infinite alternate`,
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Radar Intelligence Preview Badge */}
                <div className="flex items-center justify-between bg-white/[0.03] p-2 rounded-xl text-left border border-white/5">
                  <div className="flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-[#EFCD5E]" />
                    <span className="text-[10px] text-neutral-300 font-[300]">5-Axis Signal Confidence</span>
                  </div>
                  <span className="text-[10px] font-[700] text-[#00FFFF]">92% Match</span>
                </div>
              </div>
            </div>

            {/* Floating Glass Badge 1 (Top Right Overlay) */}
            <div className="hidden sm:flex absolute -top-2 right-4 lg:right-6 bg-neutral-900/90 backdrop-blur-xl border border-white/15 p-2.5 rounded-2xl shadow-xl items-center gap-2.5 text-left transform translate-x-2 -translate-y-2 animate-bounce-slow">
              <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] font-[700] text-white">66 Leads Discovered</div>
                <div className="text-[10px] font-[100] hover:font-[300] text-neutral-400 transition-all">
                  Autonomous Web Scraped
                </div>
              </div>
            </div>

            {/* Floating Glass Badge 2 (Bottom Left Overlay) */}
            <div className="hidden sm:flex absolute -bottom-4 -left-4 bg-neutral-900/90 backdrop-blur-xl border border-white/15 p-2.5 rounded-2xl shadow-xl items-center gap-2.5 text-left transform -translate-x-2 translate-y-2">
              <div className="w-7 h-7 rounded-xl bg-[#FF751F]/20 text-[#FF751F] flex items-center justify-center">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] font-[700] text-white">Hypothesis Verified</div>
                <div className="text-[10px] font-[100] hover:font-[300] text-neutral-400 transition-all">
                  Dr. Sarah Mitchell · Trial Booked
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* ══════════════════════════════════════════════════════════
            RIGHT 50% (6 Cols): INSTAGRAM-STYLE AUTHENTICATION CARD
            ══════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-6 flex justify-center lg:justify-end">
          <div className="w-full max-w-md bg-neutral-950/80 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl p-7 sm:p-8 space-y-6">
            
            {/* Header / Brand Title */}
            <div className="text-center space-y-2">
              <div className="inline-flex justify-center mb-1">
                <DialOLogo size="sm" variant="hero" />
              </div>
              <h2 className="text-2xl font-[700] text-white tracking-tight">
                {authMode === "login" ? "Log into DIAL-O" : "Create your Account"}
              </h2>
              <p className="text-xs text-neutral-400 font-[100] hover:font-[300] transition-all">
                {authMode === "login"
                  ? "Enter your credentials or launch 1-click instant demo"
                  : "Start finding and verifying high-conviction leads with CALL-E"}
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 p-1 bg-white/[0.04] rounded-2xl border border-white/5">
              <button
                type="button"
                onClick={() => {
                  setAuthMode("login");
                  setAuthError("");
                }}
                className={`py-2 text-xs rounded-xl transition-all ${
                  authMode === "login"
                    ? "bg-white text-black font-[700] shadow-sm"
                    : "text-neutral-400 font-[300] hover:font-[700] hover:text-white"
                }`}
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode("signup");
                  setAuthError("");
                }}
                className={`py-2 text-xs rounded-xl transition-all ${
                  authMode === "signup"
                    ? "bg-white text-black font-[700] shadow-sm"
                    : "text-neutral-400 font-[300] hover:font-[700] hover:text-white"
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Error Message */}
            {authError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-[300]">
                {authError}
              </div>
            )}

            {/* Form */}
            {authMode === "login" ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {/* Email / Username Field */}
                <div className="space-y-1.5 text-left">
                  <label className="text-xs text-neutral-300 font-[300] hover:font-[700] transition-all">
                    Email, Phone, or Username
                  </label>
                  <div className="relative flex items-center">
                    <input
                      id="login-username"
                      type="text"
                      value={emailOrUser}
                      onChange={(e) => setEmailOrUser(e.target.value)}
                      placeholder="e.g. founder@company.com"
                      className="w-full bg-neutral-900/90 border border-white/10 rounded-xl px-3.5 py-3 text-sm text-white placeholder:text-neutral-600 font-[300] focus:font-[700] focus:outline-none focus:border-[#FF751F] focus:ring-1 focus:ring-[#FF751F] transition-all"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-1.5 text-left">
                  <div className="flex justify-between items-center">
                    <label className="text-xs text-neutral-300 font-[300] hover:font-[700] transition-all">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => alert("Password reset link will be sent to your registered email.")}
                      className="text-[11px] text-neutral-400 font-[100] hover:font-[300] hover:text-[#00FFFF] transition-all"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative flex items-center">
                    <input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-neutral-900/90 border border-white/10 rounded-xl px-3.5 py-3 text-sm text-white placeholder:text-neutral-600 font-[300] focus:font-[700] focus:outline-none focus:border-[#FF751F] focus:ring-1 focus:ring-[#FF751F] transition-all pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Primary Pill Log In Button */}
                <button
                  id="btn-login-submit"
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 rounded-full bg-gradient-to-r from-[#FF751F] via-[#EFCD5E] to-[#00FFFF] text-black font-[700] text-sm shadow-lg hover:shadow-orange-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <span className="inline-flex items-center gap-2 font-[700]">
                      <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      Authenticating...
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 font-[700]">
                      Log in
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleSignUpSubmit} className="space-y-3.5">
                {/* Full Name */}
                <div className="space-y-1 text-left">
                  <label className="text-xs text-neutral-300 font-[300] hover:font-[700] transition-all">
                    Full Name
                  </label>
                  <input
                    id="signup-fullname"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Alex Rivera"
                    className="w-full bg-neutral-900/90 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-neutral-600 font-[300] focus:font-[700] focus:outline-none focus:border-[#00FFFF] transition-all"
                  />
                </div>

                {/* Company Name */}
                <div className="space-y-1 text-left">
                  <label className="text-xs text-neutral-300 font-[300] hover:font-[700] transition-all">
                    Company / Organization
                  </label>
                  <input
                    id="signup-company"
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Growth Labs Inc."
                    className="w-full bg-neutral-900/90 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-neutral-600 font-[300] focus:font-[700] focus:outline-none focus:border-[#00FFFF] transition-all"
                  />
                </div>

                {/* Work Email */}
                <div className="space-y-1 text-left">
                  <label className="text-xs text-neutral-300 font-[300] hover:font-[700] transition-all">
                    Work Email
                  </label>
                  <input
                    id="signup-email"
                    type="email"
                    value={emailOrUser}
                    onChange={(e) => setEmailOrUser(e.target.value)}
                    placeholder="alex@growthlabs.io"
                    className="w-full bg-neutral-900/90 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-neutral-600 font-[300] focus:font-[700] focus:outline-none focus:border-[#00FFFF] transition-all"
                  />
                </div>

                {/* Password */}
                <div className="space-y-1 text-left">
                  <label className="text-xs text-neutral-300 font-[300] hover:font-[700] transition-all">
                    Password
                  </label>
                  <input
                    id="signup-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-neutral-900/90 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-neutral-600 font-[300] focus:font-[700] focus:outline-none focus:border-[#00FFFF] transition-all"
                  />
                </div>

                {/* Submit Sign Up */}
                <button
                  id="btn-signup-submit"
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 rounded-full bg-white text-black font-[700] text-sm hover:bg-neutral-200 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? "Creating Workspace..." : "Create Account & Launch"}
                </button>
              </form>
            )}

            {/* Divider "OR" */}
            <div className="relative flex items-center justify-center my-2">
              <div className="border-t border-neutral-800 w-full" />
              <span className="bg-neutral-950 px-3 text-[11px] text-neutral-500 font-[100] hover:font-[300] uppercase tracking-widest transition-all">
                OR
              </span>
              <div className="border-t border-neutral-800 w-full" />
            </div>

            {/* Instant 1-Click Demo Login Button */}
            <button
              id="btn-quick-demo-login"
              type="button"
              onClick={handleQuickDemo}
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-full bg-white/[0.08] hover:bg-white/[0.14] border border-white/15 text-white font-[700] text-xs transition-all flex items-center justify-center gap-2 cursor-pointer group shadow-sm active:scale-[0.99]"
            >
              <Zap className="w-3.5 h-3.5 text-[#00FFFF] group-hover:scale-110 transition-transform" />
              <span>⚡ Instant Demo Access (Growth Lead)</span>
            </button>

            {/* Footer Bottom Caption */}
            <div className="pt-2 text-center text-[10px] text-neutral-500 font-[100] hover:font-[300] transition-all">
              DIAL-O Intelligence Labs · Voice Copilot System
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
