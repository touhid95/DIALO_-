"use client";

import React from "react";
import { Phone, Clock, ShieldCheck, CheckCircle2 } from "lucide-react";

export interface ScheduledLeadSlot {
  id: string;
  time: string;
  leadId: string;
  businessName: string;
  category: string;
  phone: string;
  timezone: string;
  status: "SCHEDULED" | "CALLING" | "COMPLETED" | "VERIFIED";
  avatars: string[];
  tintColor?: "sage" | "mint" | "lavender" | "peach";
}

interface TcpaTimelineProps {
  slots?: ScheduledLeadSlot[];
  selectedLeadId?: string | null;
  onSelectLead?: (leadId: string) => void;
  onHoverLead?: (leadId: string | null) => void;
  onTriggerCall?: (leadId: string) => void;
  theme?: "dark" | "light";
  className?: string;
}

const DEFAULT_SLOTS: ScheduledLeadSlot[] = [
  {
    id: "slot-1",
    time: "09:30 AM",
    leadId: "lead-austin-1",
    businessName: "Austin Smile Center",
    category: "Cosmetic & General Dentistry",
    phone: "+1 (512) 555-1001",
    timezone: "CST (UTC-6)",
    status: "VERIFIED",
    avatars: [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop&crop=faces",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=faces",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&fit=crop&crop=faces",
    ],
    tintColor: "sage",
  },
  {
    id: "slot-2",
    time: "10:30 AM",
    leadId: "lead-austin-2",
    businessName: "Lone Star Emergency Dental",
    category: "Emergency Dental Clinic",
    phone: "+1 (512) 555-1007",
    timezone: "CST (UTC-6)",
    status: "SCHEDULED",
    avatars: [
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=64&h=64&fit=crop&crop=faces",
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=64&h=64&fit=crop&crop=faces",
    ],
    tintColor: "mint",
  },
  {
    id: "slot-3",
    time: "11:30 AM",
    leadId: "lead-mockup-1",
    businessName: "Scholar's IT Limited",
    category: "Educational Institution",
    phone: "01707-172825",
    timezone: "BST (UTC+6)",
    status: "SCHEDULED",
    avatars: [
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=faces",
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=64&h=64&fit=crop&crop=faces",
    ],
    tintColor: "lavender",
  },
  {
    id: "slot-4",
    time: "01:00 PM",
    leadId: "lead-mockup-2",
    businessName: "Board of Education, Dhaka",
    category: "Public Education Entity",
    phone: "029660015",
    timezone: "BST (UTC+6)",
    status: "SCHEDULED",
    avatars: [
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=64&h=64&fit=crop&crop=faces",
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=64&h=64&fit=crop&crop=faces",
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=64&h=64&fit=crop&crop=faces",
    ],
    tintColor: "peach",
  },
];

export function TcpaTimeline({
  slots = DEFAULT_SLOTS,
  selectedLeadId,
  onSelectLead,
  onHoverLead,
  onTriggerCall,
  theme = "dark",
  className = "",
}: TcpaTimelineProps) {
  const isLight = theme === "light";

  // Editorial Sand & Orange card tints (matching the architectural reference)
  const getCardStyle = (tint?: string, isSelected?: boolean) => {
    if (isLight) {
      const baseBorder = isSelected
        ? "border-[#FF5722] ring-2 ring-[#FF5722]/25 shadow-md"
        : "border-black/10 hover:border-[#FF5722]/50";
      switch (tint) {
        case "sage":
          return `bg-[#FAF7F0] ${baseBorder} text-neutral-900`;
        case "mint":
          return `bg-[#F5F8F6] ${baseBorder} text-neutral-900`;
        case "lavender":
          return `bg-[#F8F5FA] ${baseBorder} text-neutral-900`;
        case "peach":
          return `bg-[#FFF5ED] ${baseBorder} text-neutral-900`;
        default:
          return `bg-[#FAF7F2] ${baseBorder} text-neutral-900`;
      }
    } else {
      const baseBorder = isSelected
        ? "border-[#FF751F] ring-1 ring-[#FF751F]/40 shadow-lg shadow-[#FF751F]/10"
        : "border-white/[0.08]";
      switch (tint) {
        case "sage":
          return `bg-gradient-to-br from-neutral-900 to-black/80 ${baseBorder} text-neutral-200`;
        case "mint":
          return `bg-gradient-to-br from-neutral-900 to-black/80 ${baseBorder} text-neutral-200`;
        case "lavender":
          return `bg-gradient-to-br from-neutral-900 to-black/80 ${baseBorder} text-neutral-200`;
        case "peach":
          return `bg-gradient-to-br from-neutral-900 to-black/80 ${baseBorder} text-neutral-200`;
        default:
          return `bg-black/60 ${baseBorder} text-neutral-200`;
      }
    }
  };

  return (
    <div
      className={`flex flex-col h-full min-h-0 p-3.5 sm:p-4 rounded-3xl transition-all duration-300 ${
        isLight
          ? "bg-[#FFFDF9] border border-black/10 shadow-sm"
          : "bg-[#0d0d0d]/80 border border-white/[0.08] backdrop-blur-xl"
      } ${className}`}
    >
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between mb-3 px-1">
        <div>
          <h3
            className={`text-sm font-sf-bold tracking-tight ${
              isLight ? "text-neutral-900" : "text-white"
            }`}
          >
            Call Queue
          </h3>
          <p
            className={`text-[11px] font-sf-light flex items-center gap-1 mt-0.5 ${
              isLight ? "text-neutral-600" : "text-neutral-400"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#FF5722]" />
            TCPA 08:00-20:00 Window
          </p>
        </div>
        <span
          className={`text-[10px] px-2.5 py-0.5 rounded-full font-sf-bold ${
            isLight
              ? "bg-[#FF751F]/15 text-[#FF5722] border border-[#FF5722]/30"
              : "bg-[#FF751F]/20 text-[#FF751F] border border-[#FF751F]/40"
          }`}
        >
          {slots.length} Ready
        </span>
      </div>

      {/* Schedule Items Feed (Scrollable within column) */}
      <div className="flex-1 min-h-0 space-y-3 overflow-y-auto overflow-x-hidden pr-1 scrollbar-thin">
        {slots.map((slot) => {
          const isSelected = selectedLeadId === slot.leadId;

          return (
            <div key={slot.id} className="flex items-start gap-3 group">
              {/* Left Timestamp */}
              <div className="w-16 shrink-0 pt-2 text-right">
                <span
                  className={`text-[11px] block leading-none interactive-weight ${
                    isSelected
                      ? "font-sf-bold text-[#FF5722] dark:text-[#FF751F]"
                      : isLight
                      ? "font-sf-light text-neutral-600 group-hover:font-sf-bold group-hover:text-black"
                      : "font-sf-light text-neutral-400 group-hover:font-sf-bold group-hover:text-white"
                  }`}
                >
                  {slot.time}
                </span>
                <span className="text-[9px] font-sf-bold text-emerald-600 dark:text-emerald-400 block mt-1">
                  Open
                </span>
              </div>

              {/* iOS Squircle Schedule Card */}
              <div
                onClick={() => onSelectLead && onSelectLead(slot.leadId)}
                onMouseEnter={() => onHoverLead && onHoverLead(slot.leadId)}
                onMouseLeave={() => onHoverLead && onHoverLead(null)}
                className={`flex-1 p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer ${getCardStyle(
                  slot.tintColor,
                  isSelected
                )} hover:scale-[1.01] active:scale-[0.99]`}
              >
                <div className="flex items-center justify-between mb-2">
                  {/* Overlapping Avatar Stack */}
                  <div className="flex -space-x-1.5 overflow-hidden">
                    {slot.avatars.map((av, idx) => (
                      <img
                        key={idx}
                        src={av}
                        alt="Contact"
                        className="inline-block h-5 w-5 rounded-full ring-1 ring-white/20 object-cover"
                      />
                    ))}
                  </div>

                  {/* Trigger Call CTA Icon */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onTriggerCall && onTriggerCall(slot.leadId);
                    }}
                    title="Initiate Live CALL-E Speech Verification"
                    className={`p-1.5 rounded-xl border transition-all ${
                      isLight
                        ? "bg-[#FF751F] hover:bg-[#ff893b] text-black border-black/10 shadow-sm"
                        : "bg-white/10 hover:bg-[#FF751F] hover:text-black border-white/20"
                    }`}
                  >
                    <Phone className="w-3 h-3 text-black dark:text-white" />
                  </button>
                </div>

                {/* Business Title & Details */}
                <h4
                  className={`text-xs tracking-tight line-clamp-1 interactive-weight ${
                    isSelected
                      ? isLight ? "font-sf-bold text-slate-900" : "font-sf-bold text-white"
                      : isLight ? "font-sf-light text-slate-800 group-hover:font-sf-bold" : "font-sf-light text-neutral-200 group-hover:font-sf-bold"
                  }`}
                >
                  {slot.businessName}
                </h4>

                <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-black/5 dark:border-white/5 text-[10px]">
                  <span
                    className={`truncate max-w-[130px] interactive-weight ${
                      isSelected ? "font-sf-light" : "font-sf-thin group-hover:font-sf-light"
                    } ${
                      isLight ? "text-slate-600" : "text-neutral-400"
                    }`}
                  >
                    {slot.category}
                  </span>
                  {slot.status === "VERIFIED" ? (
                    <span className="flex items-center gap-1 font-sf-bold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-3 h-3" />
                      Verified
                    </span>
                  ) : (
                    <span className="font-sf-light text-neutral-500">
                      {slot.timezone}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Footer Note */}
      <div className="shrink-0 mt-3 pt-2.5 border-t border-black/5 dark:border-white/10 flex items-center justify-between px-1">
        <span
          className={`text-[10px] font-sf-thin ${
            isLight ? "text-slate-500" : "text-neutral-400"
          }`}
        >
          Auto-pacing: 1 call / 3m
        </span>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span
            className={`text-[10px] font-sf-bold ${
              isLight ? "text-slate-700" : "text-neutral-300"
            }`}
          >
            CALL-E Agent Live
          </span>
        </div>
      </div>
    </div>
  );
}
