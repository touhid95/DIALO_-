"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  Zap,
  ShieldCheck,
  Cpu,
  PhoneCall,
  User,
  Building2,
  Mail,
  KeyRound,
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
      className="relative w-full bg-black text-white font-sf border-t-2 border-b-2 border-black"
    >
      {/* 2-Column Split Matching Page 1 Design Principle */}
      <div className="grid grid-cols-1 lg:grid-cols-2">

        {/* ══════════════════════════════════════════════════════════
            LEFT COLUMN: ACCESS / LOGIN HERO (Warm Sand #F7EAD8)
            ══════════════════════════════════════════════════════════ */}
        <div
          className="bg-[#F7EAD8] text-black flex flex-col justify-between border-b lg:border-b-0 lg:border-r-2 border-black font-sf p-8 sm:p-12 lg:p-16"
        >
          <div>
            {/* Header Tag */}
            <div className="flex items-center gap-3 mb-6">
              <DialOLogo size="md" variant="hero" />
              <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[11px] font-sf-thin hover:font-sf-light text-neutral-600 border border-neutral-400 uppercase tracking-wider transition-all">
                Authentication & Gateways
              </span>
            </div>

            {/* Giant Title: LOGIN @ 144px */}
            <h2
              className="font-sf font-sf-bold uppercase text-[#FF751F]"
              style={{
                fontSize: "clamp(72px, 8.5vw, 140px)",
                letterSpacing: "0.08em",
                lineHeight: 0.9,
                marginBottom: "36px",
              }}
            >
              LOGIN
            </h2>

            {/* Core Mission Headline @ 54px */}
            <div
              className="font-sf font-sf-bold uppercase tracking-[0.04em] leading-tight text-black"
              style={{
                fontSize: "clamp(28px, 3.2vw, 54px)",
                marginBottom: "36px",
              }}
            >
              ENTERPRISE AGENT ACCESS & LIVE SPEECH ENGINE.
            </div>

            {/* Credibility / Capability Cards */}
            <div className="space-y-3 mb-8">
              {[
                { label: "AUTONOMOUS LEAD QUALIFICATION", sub: "Web signal discovery & ICP scoring" },
                { label: "CALL-E REAL-TIME VOICE COPILOT", sub: "Zero-latency conversational telephony" },
                { label: "5-AXIS RADAR FIT VERIFICATION", sub: "Hypothesis testing before live outreach" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-4 bg-white/80 border-l-4 border-[#FF751F] shadow-sm p-4 sm:p-5 transition-all hover:bg-white hover:translate-x-1"
                >
                  <CheckCircle2 className="w-6 h-6 sm:w-7 sm:h-7 text-[#FF751F] shrink-0" />
                  <div>
                    <div
                      className="font-sf font-sf-bold uppercase text-neutral-900 tracking-[0.04em]"
                      style={{ fontSize: "clamp(15px, 1.4vw, 22px)" }}
                    >
                      {item.label}
                    </div>
                    <div className="text-xs text-neutral-600 font-sf-thin hover:font-sf-light transition-all">
                      {item.sub}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Explanatory Body */}
            <p
              className="font-sf font-sf-light tracking-wide text-neutral-700 leading-relaxed max-w-xl"
              style={{ fontSize: "clamp(16px, 1.2vw, 24px)" }}
            >
              Evidence before outreach. Autonomous agents qualify decision-makers and conduct live telephone verification to turn raw prospect data into high-conviction pipeline.
            </p>
          </div>

          {/* Bottom Black Box: AUTHENTICATION GATEWAY */}
          <div className="mt-12">
            <div
              className="bg-black text-white flex items-center justify-between border-2 border-black font-sf p-6 sm:p-7 shadow-[0_10px_0_rgba(0,0,0,0.15)]"
            >
              <span
                className="font-sf font-sf-bold uppercase tracking-[0.16em]"
                style={{ fontSize: "clamp(20px, 1.8vw, 36px)" }}
              >
                ACCESS GATEWAY
              </span>
              <span
                className="font-sf font-sf-light tracking-widest text-[#00FFFF] uppercase"
                style={{ fontSize: "clamp(11px, 0.9vw, 18px)" }}
              >
                INTELLIGENCE LABS
              </span>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
            RIGHT COLUMN: CREDENTIALS & SIGN IN (Orange #FF751F)
            ══════════════════════════════════════════════════════════ */}
        <div
          className="bg-[#FF751F] text-black flex flex-col justify-between dial-grid-orange font-sf p-6 sm:p-10 lg:p-14"
        >
          <div>
            {/* Header — CREDENTIALS */}
            <h2
              className="font-sf font-sf-bold uppercase text-black"
              style={{
                fontSize: "clamp(34px, 5.1vw, 120px)",
                letterSpacing: "0.02em",
                lineHeight: 0.9,
                marginBottom: "28px",
                whiteSpace: "nowrap",
              }}
            >
              CREDENTIALS
            </h2>

            {/* Top Black Box: SECURE ACCESS */}
            <div
              className="bg-black text-white border-2 border-black p-5 sm:p-6 mb-6 flex items-center justify-between"
            >
              <div
                className="font-sf font-sf-bold uppercase tracking-[0.16em] text-[#EFCD5E]"
                style={{ fontSize: "clamp(20px, 1.8vw, 36px)" }}
              >
                SECURE SIGN IN
              </div>
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-sf-thin">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Online
              </span>
            </div>

            {/* Main Black Authentication Console Box */}
            <div className="bg-black text-white border-2 border-black p-6 sm:p-8 shadow-[0_8px_0_#000000] mb-6 font-sf">
              
              {/* Segmented Capsule Tabs (SF Pro 700 active / 300 resting) */}
              <div className="grid grid-cols-2 p-1.5 bg-neutral-900 border border-neutral-800 rounded-xl mb-6">
                <button
                  type="button"
                  id="tab-btn-signin"
                  onClick={() => {
                    setAuthMode("login");
                    setAuthError("");
                  }}
                  className={`py-2.5 text-xs uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                    authMode === "login"
                      ? "bg-[#EFCD5E] text-black font-sf-bold shadow-md"
                      : "text-neutral-400 font-sf-light hover:text-white hover:font-sf-bold"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  id="tab-btn-signup"
                  onClick={() => {
                    setAuthMode("signup");
                    setAuthError("");
                  }}
                  className={`py-2.5 text-xs uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                    authMode === "signup"
                      ? "bg-[#00FFFF] text-black font-sf-bold shadow-md"
                      : "text-neutral-400 font-sf-light hover:text-white hover:font-sf-bold"
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Error Message */}
              {authError && (
                <div className="p-3 mb-4 rounded-lg bg-rose-500/20 border border-rose-500 text-rose-300 text-xs font-sf-light">
                  {authError}
                </div>
              )}

              {/* Form Body */}
              {authMode === "login" ? (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  {/* Email / Username Field */}
                  <div className="space-y-1.5 text-left">
                    <label className="text-xs text-neutral-300 font-sf-light hover:font-sf-bold uppercase tracking-wider transition-all flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-[#EFCD5E]" />
                      <span>Work Email or Username</span>
                    </label>
                    <input
                      id="login-username"
                      type="text"
                      value={emailOrUser}
                      onChange={(e) => setEmailOrUser(e.target.value)}
                      placeholder="e.g. founder@dial-o.ai"
                      className="w-full bg-neutral-900 border-2 border-neutral-700 rounded-lg px-4 py-3 text-sm text-white placeholder:text-neutral-600 font-sf-light focus:font-sf-bold focus:outline-none focus:border-[#EFCD5E] transition-all"
                    />
                  </div>

                  {/* Password Field */}
                  <div className="space-y-1.5 text-left">
                    <div className="flex justify-between items-center">
                      <label className="text-xs text-neutral-300 font-sf-light hover:font-sf-bold uppercase tracking-wider transition-all flex items-center gap-1.5">
                        <KeyRound className="w-3.5 h-3.5 text-[#00FFFF]" />
                        <span>Password</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => alert("Password reset link will be sent to your registered email.")}
                        className="text-[11px] text-neutral-500 font-sf-thin hover:font-sf-light hover:text-[#00FFFF] transition-all"
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
                        className="w-full bg-neutral-900 border-2 border-neutral-700 rounded-lg px-4 py-3 text-sm text-white placeholder:text-neutral-600 font-sf-light focus:font-sf-bold focus:outline-none focus:border-[#00FFFF] transition-all pr-11"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Primary Submit Button */}
                  <button
                    id="btn-login-submit"
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-5 bg-[#EFCD5E] hover:bg-[#ffe380] text-black font-sf-bold text-xs uppercase tracking-widest border-2 border-black transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 shadow-md mt-2 disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <span className="inline-flex items-center gap-2 font-sf-bold">
                        <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        Authenticating...
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 font-sf-bold">
                        <span>Enter Console</span>
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleSignUpSubmit} className="space-y-3.5">
                  {/* Full Name */}
                  <div className="space-y-1 text-left">
                    <label className="text-xs text-neutral-300 font-sf-light hover:font-sf-bold uppercase tracking-wider transition-all">
                      Full Name
                    </label>
                    <input
                      id="signup-fullname"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Dr. Alex Vance"
                      className="w-full bg-neutral-900 border-2 border-neutral-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-neutral-600 font-sf-light focus:font-sf-bold focus:outline-none focus:border-[#00FFFF] transition-all"
                    />
                  </div>

                  {/* Company */}
                  <div className="space-y-1 text-left">
                    <label className="text-xs text-neutral-300 font-sf-light hover:font-sf-bold uppercase tracking-wider transition-all">
                      Organization
                    </label>
                    <input
                      id="signup-company"
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Autonomous Labs"
                      className="w-full bg-neutral-900 border-2 border-neutral-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-neutral-600 font-sf-light focus:font-sf-bold focus:outline-none focus:border-[#00FFFF] transition-all"
                    />
                  </div>

                  {/* Work Email */}
                  <div className="space-y-1 text-left">
                    <label className="text-xs text-neutral-300 font-sf-light hover:font-sf-bold uppercase tracking-wider transition-all">
                      Work Email
                    </label>
                    <input
                      id="signup-email"
                      type="email"
                      value={emailOrUser}
                      onChange={(e) => setEmailOrUser(e.target.value)}
                      placeholder="alex@autonomouslabs.io"
                      className="w-full bg-neutral-900 border-2 border-neutral-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-neutral-600 font-sf-light focus:font-sf-bold focus:outline-none focus:border-[#00FFFF] transition-all"
                    />
                  </div>

                  {/* Password */}
                  <div className="space-y-1 text-left">
                    <label className="text-xs text-neutral-300 font-sf-light hover:font-sf-bold uppercase tracking-wider transition-all">
                      Password
                    </label>
                    <input
                      id="signup-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-neutral-900 border-2 border-neutral-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-neutral-600 font-sf-light focus:font-sf-bold focus:outline-none focus:border-[#00FFFF] transition-all"
                    />
                  </div>

                  {/* Submit Sign Up */}
                  <button
                    id="btn-signup-submit"
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-5 bg-[#00FFFF] hover:bg-[#66ffff] text-black font-sf-bold text-xs uppercase tracking-widest border-2 border-black transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 shadow-md mt-2 disabled:opacity-60"
                  >
                    {isSubmitting ? "Creating Workspace..." : "Create Workspace & Launch"}
                  </button>
                </form>
              )}

              {/* High Contrast Divider */}
              <div className="relative flex items-center justify-center my-4">
                <div className="border-t border-neutral-800 w-full" />
                <span className="bg-black px-3 text-[10px] text-neutral-500 font-sf-thin uppercase tracking-widest">
                  OR DIRECT LAUNCH
                </span>
                <div className="border-t border-neutral-800 w-full" />
              </div>

              {/* 1-Click Instant Demo Button */}
              <button
                id="btn-quick-demo-login"
                type="button"
                onClick={handleQuickDemo}
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-neutral-900 hover:bg-neutral-800 border-2 border-[#FF751F] text-[#FF751F] hover:text-white font-sf-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <Zap className="w-4 h-4 text-[#FF751F]" />
                <span>⚡ Instant Demo Access (founder@dial-o.ai)</span>
              </button>

              <div className="mt-3 text-center text-[10px] text-neutral-500 font-sf-thin">
                1-Click access opens the full 66-lead autonomous console instantly
              </div>
            </div>

            {/* Bottom Tan/Cream Capabilities Flow Container matching PDF Page 4 */}
            <div
              className="bg-[#F7EAD8] text-black border-2 border-black font-sf font-sf-bold uppercase p-5 sm:p-6"
              style={{
                fontSize: "clamp(13px, 1.1vw, 20px)",
                letterSpacing: "0.08em",
                lineHeight: 1.6,
              }}
            >
              <div className="flex items-center gap-3 mb-2.5">
                <span className="rounded-full bg-[#FF751F] w-2.5 h-2.5 shrink-0 inline-block" />
                <span>66 AUTONOMOUSLY DISCOVERED B2B PROSPECTS</span>
              </div>
              <div className="flex items-center gap-3 mb-2.5">
                <span className="rounded-full bg-black w-2.5 h-2.5 shrink-0 inline-block" />
                <span>5-AXIS RADAR QUALIFICATION MATRIX SCORING</span>
              </div>
              <div className="flex items-center gap-3 mb-2.5">
                <span className="rounded-full bg-[#FF751F] w-2.5 h-2.5 shrink-0 inline-block" />
                <span>1-CLICK LIVE CALL-E AUDIO VOICE COPILOT</span>
              </div>
              <div className="flex items-center gap-3 font-sf-bold text-black">
                <span className="rounded-full bg-[#00FFFF] border border-black w-2.5 h-2.5 shrink-0 inline-block" />
                <span>TCPA COMPLIANT TELEPHONY WITH FULL TRANSCRIPTS</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
