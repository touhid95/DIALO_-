"use client";

import React, { useState } from "react";
import {
  MessageSquarePlus,
  Lock,
  Copy,
  Trash2,
  MoreHorizontal,
  Briefcase,
  ChevronDown,
  Calendar,
  Sparkles,
  Shield,
  Layers,
  Bot,
  Send,
  Loader2,
  FileText,
} from "lucide-react";

interface RulesInspectorProps {
  activeTab?: "rules" | "copilot";
  onTabChange?: (tab: "rules" | "copilot") => void;
  projectName?: string;
  onProjectNameChange?: (name: string) => void;
  onTriggerDiscovery?: () => void;
  // Copilot pass-through props
  copilotMessages?: Array<{ role: "assistant" | "user"; text: string; thinking?: string }>;
  copilotInput?: string;
  onCopilotInputChange?: (text: string) => void;
  onSendCopilotMessage?: () => void;
  isCopilotStreaming?: boolean;
  theme?: "dark" | "light";
  className?: string;
}

export function RulesInspector({
  activeTab = "rules",
  onTabChange,
  projectName = "Healthcare AI Voice Agent",
  onProjectNameChange,
  onTriggerDiscovery,
  copilotMessages = [],
  copilotInput = "",
  onCopilotInputChange,
  onSendCopilotMessage,
  isCopilotStreaming = false,
  theme = "dark",
  className = "",
}: RulesInspectorProps) {
  const isLight = theme === "light";
  const [tab, setTab] = useState<"rules" | "copilot">(activeTab);

  // Accordion open/close state matching the reference mockup
  const [isIcpOpen, setIsIcpOpen] = useState(true);
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isLogOpen, setIsLogOpen] = useState(false);

  const handleTabToggle = (newTab: "rules" | "copilot") => {
    setTab(newTab);
    if (onTabChange) onTabChange(newTab);
  };

  return (
    <div
      className={`flex flex-col h-full rounded-3xl p-4 transition-all duration-300 ${
        isLight
          ? "bg-white/95 border border-slate-200 shadow-sm"
          : "bg-[#0d0d0d]/85 border border-white/[0.08] backdrop-blur-xl"
      } ${className}`}
    >
      {/* 1. Top iOS Segmented Pill Header */}
      <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-black/5 dark:border-white/10">
        <div
          className={`flex p-1 rounded-full border ${
            isLight
              ? "bg-slate-100 border-slate-200"
              : "bg-black/50 border-white/10"
          }`}
        >
          <button
            onClick={() => handleTabToggle("rules")}
            className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
              tab === "rules"
                ? isLight
                  ? "bg-white text-slate-900 shadow-sm"
                  : "bg-[#00FFFF] text-black shadow-md shadow-[#00FFFF]/20"
                : isLight
                ? "text-slate-600 hover:text-slate-900"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Campaign Rules
          </button>
          <button
            onClick={() => handleTabToggle("copilot")}
            className={`px-3 py-1 text-xs font-semibold rounded-full transition-all flex items-center gap-1.5 ${
              tab === "copilot"
                ? isLight
                  ? "bg-white text-slate-900 shadow-sm"
                  : "bg-[#00FFFF] text-black shadow-md shadow-[#00FFFF]/20"
                : isLight
                ? "text-slate-600 hover:text-slate-900"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            AI Copilot
          </button>
        </div>

        {/* Action Toolbar Icons (Matching Reference Mockup Top Bar) */}
        <div
          className={`flex items-center gap-1 px-2 py-1 rounded-full border ${
            isLight
              ? "bg-slate-50 border-slate-200 text-slate-600"
              : "bg-white/5 border-white/10 text-neutral-400"
          }`}
        >
          <button
            title="Add Context"
            className="p-1 hover:text-indigo-600 dark:hover:text-[#00FFFF] transition-colors"
          >
            <MessageSquarePlus className="w-3.5 h-3.5" />
          </button>
          <button
            title="Lock Rules"
            className="p-1 hover:text-indigo-600 dark:hover:text-[#00FFFF] transition-colors"
          >
            <Lock className="w-3.5 h-3.5" />
          </button>
          <button
            title="Duplicate Campaign"
            className="p-1 hover:text-indigo-600 dark:hover:text-[#00FFFF] transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            title="Reset"
            className="p-1 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button title="More" className="p-1 hover:text-white transition-colors">
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Content Area */}
      {tab === "rules" ? (
        <div className="flex-1 flex flex-col justify-between overflow-y-auto pr-1 space-y-3.5 scrollbar-thin">
          <div className="space-y-3">
            {/* Task Group Card */}
            <div
              className={`p-3 rounded-2xl border flex items-center justify-between ${
                isLight
                  ? "bg-slate-50/80 border-slate-200"
                  : "bg-white/[0.03] border-white/10"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-pink-500/10 text-pink-500 border border-pink-500/20 flex items-center justify-center">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <span
                    className={`text-[10px] font-mono uppercase tracking-wider block ${
                      isLight ? "text-slate-500" : "text-neutral-400"
                    }`}
                  >
                    Task Group
                  </span>
                  <span
                    className={`text-xs font-semibold block ${
                      isLight ? "text-slate-800" : "text-neutral-200"
                    }`}
                  >
                    Enterprise Outreach
                  </span>
                </div>
              </div>
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                M
              </div>
            </div>

            {/* Project Name Card */}
            <div
              className={`p-3 rounded-2xl border ${
                isLight
                  ? "bg-slate-50/80 border-slate-200"
                  : "bg-white/[0.03] border-white/10"
              }`}
            >
              <label
                className={`text-[10px] font-mono uppercase tracking-wider block mb-1 ${
                  isLight ? "text-slate-500" : "text-neutral-400"
                }`}
              >
                Project Name
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) =>
                  onProjectNameChange && onProjectNameChange(e.target.value)
                }
                className={`w-full text-xs font-semibold bg-transparent focus:outline-none ${
                  isLight ? "text-slate-900" : "text-white"
                }`}
              />
            </div>

            {/* Description Card */}
            <div
              className={`p-3.5 rounded-2xl border ${
                isLight
                  ? "bg-slate-50/80 border-slate-200"
                  : "bg-white/[0.03] border-white/10"
              }`}
            >
              <span
                className={`text-[10px] font-mono uppercase tracking-wider block mb-1.5 ${
                  isLight ? "text-slate-500" : "text-neutral-400"
                }`}
              >
                Campaign Description
              </span>
              <p
                className={`text-xs leading-relaxed ${
                  isLight ? "text-slate-600" : "text-neutral-300"
                }`}
              >
                Automated phone qualification for clinical dental centers.
                Resolves direct reception telephone lines, evaluates high-volume
                missed call signals, and orchestrates autonomous CALL-E voice
                qualification for 14-day trial appointments.
              </p>
            </div>

            {/* Accordion 1: ICP RULE */}
            <div
              className={`rounded-2xl border overflow-hidden transition-all ${
                isLight
                  ? "bg-slate-50/80 border-slate-200"
                  : "bg-white/[0.03] border-white/10"
              }`}
            >
              <button
                onClick={() => setIsIcpOpen(!isIcpOpen)}
                className="w-full p-3 flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <Calendar className="w-3.5 h-3.5" />
                  </div>
                  <span
                    className={`text-xs font-semibold ${
                      isLight ? "text-slate-800" : "text-neutral-200"
                    }`}
                  >
                    ICP RULE
                  </span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    isIcpOpen ? "rotate-180" : ""
                  } ${isLight ? "text-slate-500" : "text-neutral-400"}`}
                />
              </button>

              {isIcpOpen && (
                <div
                  className={`px-3 pb-3 pt-1 border-t text-[11px] space-y-1.5 ${
                    isLight
                      ? "border-slate-200 text-slate-600"
                      : "border-white/5 text-neutral-400"
                  }`}
                >
                  <div className="flex justify-between">
                    <span className="font-mono">Target Metro:</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      Austin, TX (15mi radius)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-mono">Industry:</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      Dentistry, Orthodontics
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-mono">Headcount:</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      10 - 45 employees
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-mono">Min Phone Score:</span>
                    <span className="font-medium text-teal-600 dark:text-[#00FFFF]">
                      &gt; 70% NANP Verified
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Accordion 2: Product Idea Rules */}
            <div
              className={`rounded-2xl border overflow-hidden transition-all ${
                isLight
                  ? "bg-slate-50/80 border-slate-200"
                  : "bg-white/[0.03] border-white/10"
              }`}
            >
              <button
                onClick={() => setIsRulesOpen(!isRulesOpen)}
                className="w-full p-3 flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <Shield className="w-3.5 h-3.5" />
                  </div>
                  <span
                    className={`text-xs font-semibold ${
                      isLight ? "text-slate-800" : "text-neutral-200"
                    }`}
                  >
                    Product Idea Rules
                  </span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    isRulesOpen ? "rotate-180" : ""
                  } ${isLight ? "text-slate-500" : "text-neutral-400"}`}
                />
              </button>

              {isRulesOpen && (
                <div
                  className={`px-3 pb-3 pt-1 border-t text-[11px] space-y-1.5 ${
                    isLight
                      ? "border-slate-200 text-slate-600"
                      : "border-white/5 text-neutral-400"
                  }`}
                >
                  <div className="flex justify-between">
                    <span className="font-mono">Primary Pitch:</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      7-day automated callback trial
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-mono">Forbidden Topic:</span>
                    <span className="font-medium text-rose-500 font-mono">
                      No fixed monthly pricing
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-mono">Disqualifier:</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      Single-practitioner / No reception
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Accordion 3: Agent Log */}
            <div
              className={`rounded-2xl border overflow-hidden transition-all ${
                isLight
                  ? "bg-slate-50/80 border-slate-200"
                  : "bg-white/[0.03] border-white/10"
              }`}
            >
              <button
                onClick={() => setIsLogOpen(!isLogOpen)}
                className="w-full p-3 flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Layers className="w-3.5 h-3.5" />
                  </div>
                  <span
                    className={`text-xs font-semibold ${
                      isLight ? "text-slate-800" : "text-neutral-200"
                    }`}
                  >
                    Agent Log
                  </span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    isLogOpen ? "rotate-180" : ""
                  } ${isLight ? "text-slate-500" : "text-neutral-400"}`}
                />
              </button>

              {isLogOpen && (
                <div
                  className={`px-3 pb-3 pt-1 border-t text-[10px] font-mono space-y-1 ${
                    isLight
                      ? "border-slate-200 text-slate-600"
                      : "border-white/5 text-neutral-400"
                  }`}
                >
                  <p className="text-emerald-500 font-semibold">
                    ✓ Socratic criteria converged (100%)
                  </p>
                  <p>✓ 66 leads qualified &gt; 70 score</p>
                  <p>✓ TCPA 08:00-20:00 checks active</p>
                  <p>✓ CALL-E webhook connected</p>
                </div>
              )}
            </div>
          </div>

          {/* Primary Action Button (Matching Reference Mockup Bottom Button) */}
          <button
            onClick={() => onTriggerDiscovery && onTriggerDiscovery()}
            className={`w-full py-3.5 rounded-2xl text-xs font-semibold tracking-wide uppercase transition-all shadow-lg active:scale-[0.99] ${
              isLight
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-95 shadow-indigo-500/20"
                : "bg-gradient-to-r from-[#00FFFF] to-teal-400 text-black hover:opacity-95 shadow-[#00FFFF]/20 font-bold"
            }`}
          >
            Deploy Outreach Pipeline
          </button>
        </div>
      ) : (
        /* Copilot Chat View */
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin mb-3">
            {copilotMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-2xl text-xs leading-relaxed ${
                  msg.role === "assistant"
                    ? isLight
                      ? "bg-slate-100 text-slate-800 border border-slate-200"
                      : "bg-white/[0.04] text-neutral-200 border border-white/10"
                    : isLight
                    ? "bg-indigo-600 text-white ml-6"
                    : "bg-[#00FFFF]/20 text-[#00FFFF] border border-[#00FFFF]/30 ml-6"
                }`}
              >
                {msg.thinking && (
                  <div className="mb-2 p-2 rounded-xl bg-black/10 dark:bg-black/40 text-[10px] font-mono opacity-80 border border-black/5 dark:border-white/5">
                    <span className="font-semibold block mb-0.5 text-amber-500">
                      Reasoning Trace:
                    </span>
                    {msg.thinking}
                  </div>
                )}
                <div className="whitespace-pre-wrap">{msg.text}</div>
              </div>
            ))}
            {isCopilotStreaming && (
              <div className="flex items-center gap-2 p-3 text-xs text-neutral-400 animate-pulse">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#00FFFF]" />
                Generating reasoning & qualification guidance...
              </div>
            )}
          </div>

          {/* Chat Input Bar */}
          <div
            className={`flex items-center gap-2 p-2 rounded-2xl border ${
              isLight
                ? "bg-slate-100 border-slate-300"
                : "bg-black/60 border-white/10"
            }`}
          >
            <input
              type="text"
              placeholder="Ask Copilot or update ICP criteria..."
              value={copilotInput}
              onChange={(e) =>
                onCopilotInputChange && onCopilotInputChange(e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (onSendCopilotMessage) onSendCopilotMessage();
                }
              }}
              className={`flex-1 bg-transparent px-2 text-xs focus:outline-none ${
                isLight ? "text-slate-900" : "text-white"
              }`}
            />
            <button
              onClick={() => onSendCopilotMessage && onSendCopilotMessage()}
              disabled={!copilotInput.trim() || isCopilotStreaming}
              className={`p-2 rounded-xl transition-all disabled:opacity-40 ${
                isLight
                  ? "bg-indigo-600 text-white hover:bg-indigo-700"
                  : "bg-[#00FFFF] text-black hover:bg-[#00FFFF]/80 font-bold"
              }`}
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
