"use client";

import React, { useState, useRef } from "react";
import {
  MessageSquarePlus,
  Lock,
  Copy,
  Trash2,
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
  Paperclip,
  X,
  UploadCloud,
  CheckCircle2,
} from "lucide-react";

export interface DynamicIcpRules {
  projectName: string;
  taskGroup?: string;
  description?: string;
  targetMetro?: string;
  industry?: string;
  headcount?: string;
  minPhoneScore?: string;
  primaryPitch?: string;
  forbiddenTopic?: string;
  disqualifier?: string;
  documentName?: string;
  activityLogs?: Array<{ text: string; time?: string; type?: "info" | "success" | "warning" }>;
}

export interface RulesInspectorProps {
  activeTab?: "rules" | "copilot";
  onTabChange?: (tab: "rules" | "copilot") => void;
  rules?: DynamicIcpRules | null;
  onRulesChange?: (rules: DynamicIcpRules) => void;
  projectName?: string;
  onProjectNameChange?: (name: string) => void;
  onTriggerDiscovery?: () => void;
  // Copilot pass-through props
  copilotMessages?: Array<{ role: "assistant" | "user"; text: string; thinking?: string }>;
  copilotInput?: string;
  onCopilotInputChange?: (text: string) => void;
  onSendCopilotMessage?: (file?: File | null) => void;
  isCopilotStreaming?: boolean;
  theme?: "dark" | "light";
  className?: string;
  // Direct file attachment support
  onAttachFile?: (file: File) => void;
  attachedFile?: File | null;
  onRemoveAttachedFile?: () => void;
}

export function RulesInspector({
  activeTab = "rules",
  onTabChange,
  rules = null,
  projectName = "",
  onProjectNameChange,
  onTriggerDiscovery,
  copilotMessages = [],
  copilotInput = "",
  onCopilotInputChange,
  onSendCopilotMessage,
  isCopilotStreaming = false,
  theme = "dark",
  className = "",
  onAttachFile,
  attachedFile = null,
  onRemoveAttachedFile,
}: RulesInspectorProps) {
  const isLight = theme === "light";
  const [tab, setTab] = useState<"rules" | "copilot">(activeTab);

  // Subtle on-click activity status drawer state
  const [isRulesDrawerOpen, setIsRulesDrawerOpen] = useState(false);

  // Drag-and-drop state
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Accordion state for the full rules tab
  const [isIcpOpen, setIsIcpOpen] = useState(true);
  const [isRulesOpen, setIsRulesOpen] = useState(true);
  const [isLogOpen, setIsLogOpen] = useState(false);

  const handleTabToggle = (newTab: "rules" | "copilot") => {
    setTab(newTab);
    if (onTabChange) onTabChange(newTab);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onAttachFile) {
      onAttachFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && onAttachFile) {
      onAttachFile(file);
    }
  };

  const hasActiveRules = Boolean(rules?.industry || rules?.projectName);

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col h-full min-h-0 rounded-3xl p-3.5 sm:p-4 transition-all duration-300 relative ${
        isLight
          ? "bg-white/95 border border-slate-200 shadow-sm"
          : "bg-[#0d0d0d]/85 border border-white/[0.08] backdrop-blur-xl"
      } ${isDragging ? "ring-2 ring-[#00FFFF] bg-[#00FFFF]/5" : ""} ${className}`}
    >
      {/* Hidden File Input for Attachments */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept=".pdf,.docx,.txt,.png,.jpg,.jpeg,.webp"
        className="hidden"
      />

      {/* 1. Top iOS Segmented Pill Header */}
      <div className="shrink-0 flex items-center justify-between gap-2 mb-2.5 pb-2.5 border-b border-black/5 dark:border-white/10">
        <div
          className={`flex p-1 rounded-full border ${
            isLight
              ? "bg-slate-100 border-slate-200"
              : "bg-black/50 border-white/10"
          }`}
        >
          <button
            onClick={() => handleTabToggle("rules")}
            className={`px-3 py-1 text-xs rounded-full transition-all interactive-weight ${
              tab === "rules"
                ? isLight
                  ? "bg-white text-slate-900 shadow-sm font-sf-bold"
                  : "bg-[#00FFFF] text-black shadow-md shadow-[#00FFFF]/20 font-sf-bold"
                : isLight
                ? "text-slate-600 hover:text-slate-900 font-sf-light"
                : "text-neutral-400 hover:text-white font-sf-light"
            }`}
          >
            Campaign Rules
          </button>
          <button
            onClick={() => handleTabToggle("copilot")}
            className={`px-3 py-1 text-xs rounded-full transition-all flex items-center gap-1.5 interactive-weight ${
              tab === "copilot"
                ? isLight
                  ? "bg-white text-slate-900 shadow-sm font-sf-bold"
                  : "bg-[#00FFFF] text-black shadow-md shadow-[#00FFFF]/20 font-sf-bold"
                : isLight
                ? "text-slate-600 hover:text-slate-900 font-sf-light"
                : "text-neutral-400 hover:text-white font-sf-light"
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            AI Copilot
          </button>
        </div>

        {/* Action Toolbar */}
        <div
          className={`flex items-center gap-1 px-2 py-1 rounded-full border ${
            isLight
              ? "bg-slate-50 border-slate-200 text-slate-600"
              : "bg-white/5 border-white/10 text-neutral-400"
          }`}
        >
          <button
            onClick={() => fileInputRef.current?.click()}
            title="Upload Business Deck or Lead Doc"
            className="p-1 hover:text-indigo-600 dark:hover:text-[#00FFFF] transition-colors"
          >
            <Paperclip className="w-3.5 h-3.5" />
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
            title="Reset to Clean State"
            className="p-1 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Subtle On-Click Rules Activity Status Pill */}
      <div className="shrink-0 mb-2.5">
        <button
          onClick={() => setIsRulesDrawerOpen(!isRulesDrawerOpen)}
          className={`w-full px-3 py-2 rounded-xl border flex items-center justify-between transition-all group interactive-weight ${
            isLight
              ? "bg-slate-50 hover:bg-slate-100/90 border-slate-200 text-slate-700"
              : "bg-white/[0.03] hover:bg-white/[0.06] border-white/10 text-neutral-300"
          }`}
        >
          <div className="flex items-center gap-2 truncate">
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                isCopilotStreaming
                  ? "bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(0,255,255,0.8)]"
                  : hasActiveRules
                  ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"
                  : "bg-amber-400/80"
              }`}
            />
            <span className="text-[11px] font-sf-light group-hover:font-sf-bold truncate">
              {isCopilotStreaming
                ? "Parsing Document & Evaluating ICP Rules..."
                : hasActiveRules
                ? `Rules Active: ${rules?.industry || "Custom ICP"} · ${rules?.targetMetro || "Target Metro"}`
                : "Awaiting Business Document or Offer Prompt"}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 pl-2">
            <span className="text-[10px] font-sf-thin group-hover:font-sf-light text-neutral-400">
              {isRulesDrawerOpen ? "Hide" : "Inspect"}
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                isRulesDrawerOpen ? "rotate-180" : ""
              }`}
            />
          </div>
        </button>

        {/* Subtle Collapsible Glass Inspection Drawer */}
        {isRulesDrawerOpen && (
          <div
            className={`mt-2 p-3.5 rounded-2xl border text-xs space-y-3 animate-in fade-in zoom-in-95 duration-200 ${
              isLight
                ? "bg-white/95 border-slate-200 shadow-md text-slate-800"
                : "bg-black/90 border-white/15 shadow-2xl text-neutral-200 backdrop-blur-xl"
            }`}
          >
            {/* Header / Source Info */}
            <div className="flex items-center justify-between pb-2 border-b border-black/5 dark:border-white/10">
              <div className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-500 dark:text-[#00FFFF]" />
                <span className="font-sf-bold text-xs truncate max-w-[180px]">
                  {rules?.documentName ? rules.documentName : "Dynamic Ingestion Source"}
                </span>
              </div>
              <span className="text-[10px] font-sf-thin px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-sf-bold">
                {hasActiveRules ? "Active" : "Pending"}
              </span>
            </div>

            {hasActiveRules ? (
              <div className="space-y-2 text-[11px]">
                <div className="flex justify-between">
                  <span className="font-sf-light text-neutral-400">Industry:</span>
                  <span className="font-sf-bold text-right truncate max-w-[160px]">
                    {rules?.industry || "Unspecified"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-sf-light text-neutral-400">Target Metro:</span>
                  <span className="font-sf-bold text-right truncate max-w-[160px]">
                    {rules?.targetMetro || "Any Geography"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-sf-light text-neutral-400">Headcount:</span>
                  <span className="font-sf-bold text-right truncate max-w-[160px]">
                    {rules?.headcount || "10+"}
                  </span>
                </div>
                {rules?.primaryPitch && (
                  <div className="pt-1 border-t border-black/5 dark:border-white/5">
                    <span className="font-sf-light text-[10px] text-neutral-400 block mb-0.5">
                      Core Pitch:
                    </span>
                    <span className="font-sf-light text-[11px] block leading-snug">
                      {rules.primaryPitch}
                    </span>
                  </div>
                )}
                {rules?.disqualifier && (
                  <div className="pt-1 border-t border-black/5 dark:border-white/5">
                    <span className="font-sf-light text-[10px] text-rose-400 block mb-0.5">
                      Disqualifier:
                    </span>
                    <span className="font-sf-light text-[11px] text-rose-500 block leading-snug">
                      {rules.disqualifier}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-2 space-y-2">
                <p className="font-sf-light text-[11px] text-neutral-400">
                  No criteria extracted yet. Upload your business deck or type your offer in Copilot to generate live rules.
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-xl text-[11px] font-sf-bold bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-[#00FFFF] dark:text-black transition-all"
                >
                  Attach Document
                </button>
              </div>
            )}

            {/* Micro Activity Audit Log */}
            {rules?.activityLogs && rules.activityLogs.length > 0 && (
              <div className="pt-2 border-t border-black/5 dark:border-white/10 space-y-1">
                <span className="text-[10px] font-sf-thin uppercase tracking-wider text-neutral-400 block">
                  Activity Audit
                </span>
                {rules.activityLogs.slice(-3).map((log, i) => (
                  <p key={i} className="text-[10px] font-sf-light text-neutral-400 flex items-center gap-1 truncate">
                    <span className="text-emerald-500 font-sf-bold">✓</span>
                    <span>{log.text}</span>
                  </p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. Main Content Panel */}
      {tab === "rules" ? (
        <div className="flex-1 min-h-0 flex flex-col justify-between overflow-y-auto pr-1 space-y-3 scrollbar-thin">
          {!rules || !hasActiveRules ? (
            /* Clean Empty Ingestion Workspace when not prefilled */
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-4 my-auto">
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`w-16 h-16 rounded-3xl flex items-center justify-center cursor-pointer transition-all ${
                  isLight
                    ? "bg-slate-100 hover:bg-slate-200 text-indigo-600"
                    : "bg-white/5 hover:bg-white/10 text-[#00FFFF] border border-white/10"
                }`}
              >
                <UploadCloud className="w-8 h-8" />
              </div>

              <div className="space-y-1.5 max-w-xs">
                <h4 className="text-sm font-sf-bold">
                  No Rules Configured Yet
                </h4>
                <p className="text-xs font-sf-light text-neutral-400 leading-relaxed">
                  Upload your business deck, product one-pager, or lead document. AI will extract your ICP rules and locate matching prospects.
                </p>
              </div>

              <div className="flex flex-col gap-2 w-full max-w-xs pt-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full py-2.5 rounded-2xl text-xs font-sf-bold flex items-center justify-center gap-2 transition-all ${
                    isLight
                      ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20"
                      : "bg-[#00FFFF] hover:bg-[#00FFFF]/90 text-black font-sf-bold shadow-md shadow-[#00FFFF]/20"
                  }`}
                >
                  <Paperclip className="w-3.5 h-3.5" />
                  Select Business Document
                </button>
                <button
                  onClick={() => handleTabToggle("copilot")}
                  className={`w-full py-2 rounded-2xl text-xs font-sf-light transition-all ${
                    isLight
                      ? "text-slate-600 hover:text-slate-900"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  Or describe your offer in AI Copilot →
                </button>
              </div>
            </div>
          ) : (
            /* Active Dynamic Rules View */
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
                      className={`text-[10px] font-sf-light uppercase tracking-wider block ${
                        isLight ? "text-slate-500" : "text-neutral-400"
                      }`}
                    >
                      Task Group
                    </span>
                    <span
                      className={`text-xs font-sf-bold block ${
                        isLight ? "text-slate-800" : "text-neutral-200"
                      }`}
                    >
                      {rules.taskGroup || "Autonomous Lead Discovery"}
                    </span>
                  </div>
                </div>
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 text-white font-sf-bold text-xs flex items-center justify-center shadow-sm">
                  {(rules.projectName || "A").charAt(0).toUpperCase()}
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
                  className={`text-[10px] font-sf-light uppercase tracking-wider block mb-1 ${
                    isLight ? "text-slate-500" : "text-neutral-400"
                  }`}
                >
                  Project / Campaign
                </label>
                <input
                  type="text"
                  value={projectName || rules.projectName || ""}
                  onChange={(e) =>
                    onProjectNameChange && onProjectNameChange(e.target.value)
                  }
                  className={`w-full text-xs font-sf-bold bg-transparent focus:outline-none ${
                    isLight ? "text-slate-900" : "text-white"
                  }`}
                  placeholder="Campaign name..."
                />
              </div>

              {/* Description Card */}
              {rules.description && (
                <div
                  className={`p-3.5 rounded-2xl border ${
                    isLight
                      ? "bg-slate-50/80 border-slate-200"
                      : "bg-white/[0.03] border-white/10"
                  }`}
                >
                  <span
                    className={`text-[10px] font-sf-light uppercase tracking-wider block mb-1.5 ${
                      isLight ? "text-slate-500" : "text-neutral-400"
                    }`}
                  >
                    Campaign Description
                  </span>
                  <p
                    className={`text-xs font-sf-light leading-relaxed ${
                      isLight ? "text-slate-600" : "text-neutral-300"
                    }`}
                  >
                    {rules.description}
                  </p>
                </div>
              )}

              {/* Dynamic ICP Rules Accordion */}
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
                      className={`text-xs font-sf-bold ${
                        isLight ? "text-slate-800" : "text-neutral-200"
                      }`}
                    >
                      ICP Criteria
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
                      <span className="font-sf-light">Target Metro:</span>
                      <span className="font-sf-bold text-slate-900 dark:text-white">
                        {rules.targetMetro || "National / Unrestricted"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-sf-light">Industry:</span>
                      <span className="font-sf-bold text-slate-900 dark:text-white">
                        {rules.industry || "General"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-sf-light">Headcount:</span>
                      <span className="font-sf-bold text-slate-900 dark:text-white">
                        {rules.headcount || "10+ employees"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-sf-light">Min Phone Score:</span>
                      <span className="font-sf-bold text-teal-600 dark:text-[#00FFFF]">
                        {rules.minPhoneScore || "> 70% NANP Verified"}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Pitch & Disqualifier Accordion */}
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
                      className={`text-xs font-sf-bold ${
                        isLight ? "text-slate-800" : "text-neutral-200"
                      }`}
                    >
                      Strategy & Constraints
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
                      <span className="font-sf-light">Primary Pitch:</span>
                      <span className="font-sf-bold text-slate-900 dark:text-white truncate max-w-[180px]">
                        {rules.primaryPitch || "Direct Voice Outreach"}
                      </span>
                    </div>
                    {rules.forbiddenTopic && (
                      <div className="flex justify-between">
                        <span className="font-sf-light">Forbidden Topic:</span>
                        <span className="font-sf-bold text-rose-500 truncate max-w-[180px]">
                          {rules.forbiddenTopic}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="font-sf-light">Disqualifier:</span>
                      <span className="font-sf-bold text-slate-900 dark:text-white truncate max-w-[180px]">
                        {rules.disqualifier || "No Direct Telephone"}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Agent Log Accordion */}
              {rules.activityLogs && rules.activityLogs.length > 0 && (
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
                        className={`text-xs font-sf-bold ${
                          isLight ? "text-slate-800" : "text-neutral-200"
                        }`}
                      >
                        Agent Audit Log
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
                      className={`px-3 pb-3 pt-1 border-t text-[10px] space-y-1 ${
                        isLight
                          ? "border-slate-200 text-slate-600"
                          : "border-white/5 text-neutral-400"
                      }`}
                    >
                      {rules.activityLogs.map((log, idx) => (
                        <p key={idx} className="font-sf-light flex items-center gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                          <span>{log.text}</span>
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Primary Action Button */}
              <button
                onClick={() => onTriggerDiscovery && onTriggerDiscovery()}
                className={`w-full py-3.5 rounded-2xl text-xs font-sf-bold tracking-wide uppercase transition-all shadow-lg active:scale-[0.99] ${
                  isLight
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-95 shadow-indigo-500/20"
                    : "bg-gradient-to-r from-[#00FFFF] to-teal-400 text-black hover:opacity-95 shadow-[#00FFFF]/20"
                }`}
              >
                Find Qualified Leads Now
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Copilot Chat View */
        <div className="flex-1 min-h-0 flex flex-col h-full overflow-hidden">
          {/* Chat Messages */}
          <div className="flex-1 min-h-0 overflow-y-auto space-y-3 pr-1 scrollbar-thin mb-2.5">
            {copilotMessages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center p-4 text-neutral-400 space-y-2.5 my-auto">
                <Bot className="w-8 h-8 text-indigo-500 dark:text-[#00FFFF] opacity-80" />
                <h4 className="text-xs font-sf-bold text-slate-800 dark:text-neutral-200">
                  AI Lead Copilot Ready
                </h4>
                <p className="text-[11px] font-sf-light leading-relaxed max-w-xs">
                  Upload your pitch deck or state what you sell. I will extract your ideal customer profile, enforce constraints, and surface matching leads.
                </p>
              </div>
            )}

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
                  <div className="mb-2 p-2 rounded-xl bg-black/10 dark:bg-black/40 text-[10px] font-sf-light opacity-80 border border-black/5 dark:border-white/5">
                    <span className="font-sf-bold block mb-0.5 text-amber-500">
                      Reasoning Trace:
                    </span>
                    {msg.thinking}
                  </div>
                )}
                <div className="whitespace-pre-wrap font-sf-light">{msg.text}</div>
              </div>
            ))}

            {isCopilotStreaming && (
              <div className="flex items-center gap-2 p-3 text-xs text-neutral-400 animate-pulse font-sf-light">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#00FFFF]" />
                Parsing context & discovering matching leads...
              </div>
            )}
          </div>

          {/* Staged File Chip */}
          {attachedFile && (
            <div className="mb-2 px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs flex items-center justify-between animate-in fade-in">
              <div className="flex items-center gap-2 truncate">
                <FileText className="w-3.5 h-3.5 text-indigo-500 dark:text-[#00FFFF]" />
                <span className="font-sf-light text-[11px] truncate">{attachedFile.name}</span>
                <span className="font-sf-thin text-[10px] text-neutral-400">
                  ({(attachedFile.size / 1024).toFixed(0)} KB)
                </span>
              </div>
              <button
                onClick={onRemoveAttachedFile}
                className="p-1 hover:text-rose-500 transition-colors"
                title="Remove attachment"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Chat Input Bar with File Attachment Button */}
          <div
            className={`flex items-center gap-2 p-2 rounded-2xl border ${
              isLight
                ? "bg-slate-100 border-slate-300"
                : "bg-black/60 border-white/10"
            }`}
          >
            <button
              onClick={() => fileInputRef.current?.click()}
              title="Attach business deck or document"
              className={`p-1.5 rounded-xl transition-colors ${
                attachedFile
                  ? "text-[#00FFFF]"
                  : isLight
                  ? "text-slate-500 hover:text-slate-900"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <Paperclip className="w-4 h-4" />
            </button>

            <input
              type="text"
              placeholder={
                attachedFile
                  ? "Add instructions or press Enter to analyze..."
                  : "Drop file or state your business/offering..."
              }
              value={copilotInput}
              onChange={(e) =>
                onCopilotInputChange && onCopilotInputChange(e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (onSendCopilotMessage) onSendCopilotMessage(attachedFile);
                }
              }}
              className={`flex-1 bg-transparent px-2 text-xs font-sf-light focus:outline-none ${
                isLight
                  ? "text-slate-900 placeholder:text-slate-400"
                  : "text-white placeholder:text-neutral-500"
              }`}
            />

            <button
              onClick={() => onSendCopilotMessage && onSendCopilotMessage(attachedFile)}
              disabled={(!copilotInput.trim() && !attachedFile) || isCopilotStreaming}
              className={`p-2 rounded-xl transition-all disabled:opacity-40 font-sf-bold ${
                isLight
                  ? "bg-indigo-600 text-white hover:bg-indigo-700"
                  : "bg-[#00FFFF] text-black hover:bg-[#00FFFF]/80"
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
